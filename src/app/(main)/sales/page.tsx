'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/lib/types';
import { Wallet, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function SalesPage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Selection
  // Selection
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const selectedBranch = branches.find(b => b.id === selectedBranchId);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Amounts Day or Single
  const [cash, setCash] = useState('');
  const [mpesa, setMpesa] = useState('');
  const [credit, setCredit] = useState('');

  // Amounts Night
  const [nightCash, setNightCash] = useState('');
  const [nightMpesa, setNightMpesa] = useState('');
  const [nightCredit, setNightCredit] = useState('');

  const total = (Number(cash) || 0) + (Number(mpesa) || 0) + (Number(credit) || 0) + 
                (selectedBranch?.shift_type === 'dual' ? (Number(nightCash) || 0) + (Number(nightMpesa) || 0) + (Number(nightCredit) || 0) : 0);

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
    if (!selectedBranchId) return;

    setSaving(true);
    try {
      const inserts = [];
      if (selectedBranch?.shift_type === 'dual') {
        const dayTotal = (Number(cash) || 0) + (Number(mpesa) || 0) + (Number(credit) || 0);
        if (dayTotal > 0) {
          inserts.push({
            branch_id: selectedBranchId,
            date,
            shift: 'day',
            cash: Number(cash) || 0,
            mpesa: Number(mpesa) || 0,
            credit: Number(credit) || 0,
          });
        }
        
        const nightTotal = (Number(nightCash) || 0) + (Number(nightMpesa) || 0) + (Number(nightCredit) || 0);
        if (nightTotal > 0) {
          inserts.push({
            branch_id: selectedBranchId,
            date,
            shift: 'night',
            cash: Number(nightCash) || 0,
            mpesa: Number(nightMpesa) || 0,
            credit: Number(nightCredit) || 0,
          });
        }
      } else {
        inserts.push({
          branch_id: selectedBranchId,
          date,
          shift: null,
          cash: Number(cash) || 0,
          mpesa: Number(mpesa) || 0,
          credit: Number(credit) || 0,
        });
      }

      if (inserts.length === 0) {
        throw new Error("Please enter at least one sales value.");
      }

      const { error } = await supabase.from('sales').insert(inserts);

      if (error) throw error;
      
      alert('Sales recorded successfully!');
      // Reset form amounts
      setCash('');
      setMpesa('');
      setCredit('');
      setNightCash('');
      setNightMpesa('');
      setNightCredit('');
      router.refresh();
      
    } catch (err: any) {
      alert(err.message || 'Failed to record sales');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Sales Registry</h2>
        <p className="text-gray-400 mt-1">Record daily revenue across payment methods</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="New Sales Record">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Select 
              label="Select Branch" 
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              required
            />
            
            <Input 
              label="Recording Date" 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          {selectedBranch?.shift_type === 'dual' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-surface/50 border border-border p-6 rounded-lg">
                <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <Wallet size={16} /> Day Shift (KES)
                </h4>
                
                <div className="space-y-4">
                  <Input 
                    label="Cash" 
                    type="number"
                    min="0"
                    value={cash}
                    onChange={(e) => setCash(e.target.value)}
                    placeholder="0"
                  />
                  <Input 
                    label="M-Pesa" 
                    type="number"
                    min="0"
                    value={mpesa}
                    onChange={(e) => setMpesa(e.target.value)}
                    placeholder="0"
                  />
                  <Input 
                    label="Credit" 
                    type="number"
                    min="0"
                    value={credit}
                    onChange={(e) => setCredit(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="bg-surface/50 border border-border p-6 rounded-lg">
                <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                  <Wallet size={16} /> Night Shift (KES)
                </h4>
                
                <div className="space-y-4">
                  <Input 
                    label="Cash" 
                    type="number"
                    min="0"
                    value={nightCash}
                    onChange={(e) => setNightCash(e.target.value)}
                    placeholder="0"
                  />
                  <Input 
                    label="M-Pesa" 
                    type="number"
                    min="0"
                    value={nightMpesa}
                    onChange={(e) => setNightMpesa(e.target.value)}
                    placeholder="0"
                  />
                  <Input 
                    label="Credit" 
                    type="number"
                    min="0"
                    value={nightCredit}
                    onChange={(e) => setNightCredit(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-surface/50 border border-border p-6 rounded-lg mb-8">
              <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase mb-4 flex items-center gap-2">
                <Wallet size={16} /> Payment Breakdown (KES)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Input 
                  label="Cash" 
                  type="number"
                  min="0"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="0"
                />
                <Input 
                  label="M-Pesa" 
                  type="number"
                  min="0"
                  value={mpesa}
                  onChange={(e) => setMpesa(e.target.value)}
                  placeholder="0"
                />
                <Input 
                  label="Credit" 
                  type="number"
                  min="0"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          )}

          <div className="bg-surface/50 border border-border p-6 rounded-lg mb-8">
            <div className="p-4 bg-background border border-gold/30 rounded-lg flex justify-between items-center">
              <span className="text-lg font-medium text-gray-300">Total Sales</span>
              <span className="text-3xl font-bold text-gold">
                KES {total.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="submit" 
              className="btn-primary min-w-[200px]"
              disabled={saving || !selectedBranchId || total === 0}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Recording...' : 'Submit Sales'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
