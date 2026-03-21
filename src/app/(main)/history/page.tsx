'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/lib/types';
import { History as HistoryIcon, Download, Loader2, Edit2, Trash2 } from 'lucide-react';

type RecordType = 'sales' | 'expenses' | 'waste_entries';

export default function HistoryPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [dataType, setDataType] = useState<RecordType>('sales');
  const [branchId, setBranchId] = useState<string>('all');
  const [records, setRecords] = useState<any[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitial() {
      const { data } = await supabase.from('branches').select('*').order('name');
      if (data) setBranches(data);
      fetchData('sales', 'all');
    }
    loadInitial();
  }, []);

  const fetchData = async (type: RecordType, bId: string) => {
    setLoading(true);
    try {
      let query = supabase.from(type).select('*, branches(name)').is('deleted_at', null).order('date', { ascending: false });
      
      if (bId !== 'all') {
        query = query.eq('branch_id', bId);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      // If waste entries, fetch items too
      if (type === 'waste_entries' && data && data.length > 0) {
        const entryIds = data.map(d => d.id);
        const { data: itemsData } = await supabase.from('waste_items').select('*').in('waste_entry_id', entryIds);
        
        const enhancedData = data.map(entry => {
          const items = itemsData?.filter(i => i.waste_entry_id === entry.id) || [];
          const totalCost = items.reduce((acc, curr) => acc + (Number(curr.total_cost) || 0), 0);
          return { ...entry, items, totalCost };
        });
        setRecords(enhancedData);
      } else {
        setRecords(data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dataType, branchId);
  }, [dataType, branchId]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    try {
      const { error } = await supabase
        .from(dataType)
        .update({ deleted_at: new Date().toISOString() }) // Soft delete
        .eq('id', id);
        
      if (error) throw error;
      fetchData(dataType, branchId);
    } catch (err) {
      alert('Failed to delete record');
    }
  };

  const exportCSV = () => {
    if (records.length === 0) return alert('No data to export');

    const headers = Object.keys(records[0])
      .filter(k => !['id', 'branch_id', 'created_at', 'updated_at', 'deleted_at', 'branches', 'items'].includes(k));
    
    headers.unshift('Branch Name');

    const csvRows = [headers.join(',')];

    records.forEach(row => {
      const values = headers.map(header => {
        if (header === 'Branch Name') return `"${row.branches?.name || ''}"`;
        const val = row[header];
        return `"${val !== null && val !== undefined ? val : ''}"`;
      });
      csvRows.push(values.join(','));
    });

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PFMS_${dataType}_Export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Activity History</h2>
          <p className="text-gray-400 mt-1">Review, export, and manage historical records</p>
        </div>
        <button className="btn-secondary" onClick={exportCSV}>
          <Download size={20} /> Export CSV
        </button>
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Select 
            label="Record Type"
            value={dataType}
            onChange={(e) => setDataType(e.target.value as RecordType)}
            options={[
              { value: 'sales', label: 'Sales Records' },
              { value: 'expenses', label: 'Expense Records' },
              { value: 'waste_entries', label: 'Waste Records' }
            ]}
          />
          <Select 
            label="Filter by Branch"
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            options={[{ value: 'all', label: 'All Branches' }, ...branches.map(b => ({ value: b.id, label: b.name }))]}
          />
        </div>

        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gold" size={32} /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg text-gray-400">
            <HistoryIcon className="mx-auto mb-3 opacity-50" size={40} />
            <p>No records found for the selected criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-left bg-surface/30">
              <thead className="bg-surface">
                <tr className="text-gray-400 text-sm tracking-wider uppercase border-b border-border">
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Branch</th>
                  
                  {dataType === 'sales' && (
                    <>
                      <th className="p-4 font-medium">Shift</th>
                      <th className="p-4 font-medium text-right">Cash</th>
                      <th className="p-4 font-medium text-right">M-Pesa</th>
                      <th className="p-4 font-medium text-right">Credit</th>
                      <th className="p-4 font-medium text-right text-gold">Total Sales</th>
                    </>
                  )}
                  
                  {dataType === 'expenses' && (
                    <>
                      <th className="p-4 font-medium text-right text-red-400">Amount</th>
                    </>
                  )}

                  {dataType === 'waste_entries' && (
                    <>
                      <th className="p-4 font-medium">Items Count</th>
                      <th className="p-4 font-medium text-right text-red-400">Total Valuation</th>
                    </>
                  )}
                  
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {records.map((record) => (
                  <React.Fragment key={record.id}>
                    <tr 
                      className={`transition-colors ${dataType === 'waste_entries' ? 'cursor-pointer hover:bg-surface/80' : 'hover:bg-surface/60'}`}
                      onClick={() => {
                        if (dataType === 'waste_entries') {
                          setExpandedId(expandedId === record.id ? null : record.id);
                        }
                      }}
                    >
                      <td className="p-4 font-medium">{new Date(record.date).toLocaleDateString()}</td>
                    <td className="p-4">{record.branches?.name}</td>
                    
                    {dataType === 'sales' && (
                      <>
                        <td className="p-4 capitalize">{record.shift || '-'}</td>
                        <td className="p-4 text-right">{(record.cash || 0).toLocaleString()}</td>
                        <td className="p-4 text-right">{(record.mpesa || 0).toLocaleString()}</td>
                        <td className="p-4 text-right">{(record.credit || 0).toLocaleString()}</td>
                        <td className="p-4 text-right font-bold text-gold">{(record.total_sales || 0).toLocaleString()}</td>
                      </>
                    )}

                    {dataType === 'expenses' && (
                      <>
                        <td className="p-4 text-right font-bold">{(record.amount || 0).toLocaleString()}</td>
                      </>
                    )}

                    {dataType === 'waste_entries' && (
                      <>
                        <td className="p-4">{(record.items?.length || 0)} items</td>
                        <td className="p-4 text-right font-bold">{(record.totalCost || 0).toLocaleString()}</td>
                      </>
                    )}

                    <td className="p-4 text-right">
                      {dataType === 'waste_entries' && (
                         <span className="text-xs text-gold/50 mr-4 font-semibold uppercase tracking-widest hidden md:inline">Tap to view</span>
                      )}
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(record.id); }}
                        className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors"
                        title="Delete (Soft)"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                    </tr>
                    {dataType === 'waste_entries' && expandedId === record.id && (
                      <tr className="bg-surface/20 border-b border-border">
                        <td colSpan={5} className="p-4">
                           <div className="bg-background rounded-lg p-5 border border-border/50 shadow-inner overflow-x-auto">
                              <h4 className="text-sm font-semibold mb-4 text-gold tracking-wide">Waste Items Detail Breakdown</h4>
                              <table className="w-full text-sm text-left">
                                <thead className="text-gray-400 border-b border-border/50">
                                  <tr>
                                    <th className="pb-3 font-medium">Item Name</th>
                                    <th className="pb-3 font-medium text-right">Qty</th>
                                    <th className="pb-3 font-medium text-right">Unit Cost (KES)</th>
                                    <th className="pb-3 font-medium text-right">Total (KES)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-border/30">
                                  {record.items?.map((item: any, idx: number) => (
                                    <tr key={idx} className="hover:bg-surface/30">
                                      <td className="py-3 text-gray-300 font-medium">{item.item_name}</td>
                                      <td className="py-3 text-right">{item.quantity} <span className="text-gray-500 text-xs ml-0.5">{item.unit}</span></td>
                                      <td className="py-3 text-right text-gray-400">{Number(item.unit_cost).toLocaleString()}</td>
                                      <td className="py-3 text-right text-red-400 font-semibold">{Number(item.total_cost).toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                           </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
