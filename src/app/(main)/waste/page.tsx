'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/lib/types';
import { Trash2, Loader2, Save, Plus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function WastePage() {
  const router = useRouter();
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [items, setItems] = useState([{ id: Date.now(), item_name: '', quantity: '', unit_price: '' }]);

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

  const addItem = () => {
    setItems([...items, { id: Date.now(), item_name: '', quantity: '', unit_price: '' }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: string) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const grandTotal = items.reduce((acc, item) => {
    const q = Number(item.quantity) || 0;
    const p = Number(item.unit_price) || 0;
    return acc + (q * p);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranchId || items.length === 0) return;

    setSaving(true);
    try {
      // 1. Create waste entry
      const { data: entryData, error: entryError } = await supabase
        .from('waste_entries')
        .insert([{ branch_id: selectedBranchId, date }])
        .select()
        .single();

      if (entryError) throw entryError;

      // 2. Create waste items
      const validItems = items.filter(item => item.item_name && item.quantity && item.unit_price);
      
      if (validItems.length > 0) {
        const itemsToInsert = validItems.map(item => ({
          waste_entry_id: entryData.id,
          item_name: item.item_name,
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price)
        }));

        const { error: itemsError } = await supabase.from('waste_items').insert(itemsToInsert);
        if (itemsError) throw itemsError;
      }
      
      alert('Waste recorded successfully!');
      setItems([{ id: Date.now(), item_name: '', quantity: '', unit_price: '' }]);
      router.refresh();
      
    } catch (err: any) {
      alert(err.message || 'Failed to record waste');
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
        <h2 className="text-3xl font-bold tracking-tight text-foreground">Waste Management</h2>
        <p className="text-gray-400 mt-1">Record food and material waste</p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card title="Record Waste Entry">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 border-b border-border pb-6">
            <Select 
              label="Select Branch" 
              value={selectedBranchId}
              onChange={(e) => setSelectedBranchId(e.target.value)}
              options={branches.map(b => ({ value: b.id, label: b.name }))}
              required
            />
            <Input 
              label="Date" 
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-semibold tracking-wider text-gray-400 uppercase flex items-center gap-2 mb-4">
              <Trash2 size={16} /> Waste Items list
            </h4>

            {items.map((item, index) => (
              <div key={item.id} className="grid grid-cols-[1fr_120px_120px_100px_40px] gap-4 items-end bg-surface/50 p-4 rounded-lg border border-border">
                <Input 
                  label="Item Name" 
                  value={item.item_name}
                  onChange={(e) => updateItem(item.id, 'item_name', e.target.value)}
                  placeholder="e.g. Potatoes, Beef"
                  required
                />
                <Input 
                  label="Quantity" 
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                  placeholder="0"
                  required
                />
                <Input 
                  label="Unit Price" 
                  type="number"
                  min="0"
                  value={item.unit_price}
                  onChange={(e) => updateItem(item.id, 'unit_price', e.target.value)}
                  placeholder="0"
                  required
                />
                <div className="pb-3 text-right">
                  <span className="block text-xs text-gray-500 mb-1">Total Cost</span>
                  <span className="font-semibold text-gold">
                    {((Number(item.quantity) || 0) * (Number(item.unit_price) || 0)).toLocaleString()}
                  </span>
                </div>
                <div className="pb-2">
                  <button 
                    type="button" 
                    onClick={() => removeItem(item.id)}
                    className="p-2 text-gray-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <button 
              type="button" 
              onClick={addItem}
              className="btn-secondary text-sm py-2"
            >
              <Plus size={16} /> Add Another Item
            </button>
          </div>

          <div className="mt-8 p-4 bg-background border border-gold/30 rounded-lg flex justify-between items-center">
            <span className="text-lg font-medium text-gray-300">Grand Total Value</span>
            <span className="text-3xl font-bold text-red-400">
              KES {grandTotal.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-end mt-6">
            <button 
              type="submit" 
              className="btn-primary min-w-[200px]"
              disabled={saving || !selectedBranchId || grandTotal === 0}
            >
              {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {saving ? 'Recording...' : 'Submit Entry'}
            </button>
          </div>
        </Card>
      </form>
    </div>
  );
}
