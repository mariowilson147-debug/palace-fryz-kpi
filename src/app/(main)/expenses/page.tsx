'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/lib/types';
import { Receipt, Loader2, Save } from 'lucide-react';

export default function ExpensesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');

  useEffect(() => {
    async function fetchBranches() {
      try {
        const { data, error } = await supabase.from('branches').select('*').order('name');
        if (error) throw error;
        setBranches(data || []);
        if (data && data.length > 0) setSelectedBranchId(data[0].id);
      } catch (err) {
        console.error('Failed to load branches', err);
      } finally {
        setLoading(false);
      }
    }
    fetchBranches();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || !amount) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('expenses').insert([{
        branch_id: selectedBranchId,
        date,
        amount: Number(amount) || 0
      }]);

      if (error) throw error;
      
      alert('Expense logged successfully!');
      setAmount('');
      
    } catch (err: any) {
      alert(err.message || 'Failed to log expense');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Operating Expenses</h2>
        <p className="text-gray-400 mt-1">Log external and operational expenditures</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Log New Expense">
          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select 
                label="Select Branch" 
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                options={branches.map(b => ({ value: b.id, label: b.name }))}
                required
              />
              <Input 
                label="Expense Date" 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="bg-surface/50 border border-border p-6 rounded-lg space-y-6">
              <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2">
                <Receipt size={16} /> Expenditure Details
              </h4>
              
              <Input 
                label="Total Amount (KES)" 
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn-primary min-w-[200px]"
              disabled={saving || !selectedBranchId || !amount}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Logging...' : 'Save Expense'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
