'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { supabase } from '@/lib/supabase';
import { Branch } from '@/lib/types';
import { Plus, Edit2, Trash2, Building } from 'lucide-react';

export default function SettingsPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [shiftType, setShiftType] = useState<'single' | 'dual'>('single');
  const [expenseRateTarget, setExpenseRateTarget] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('branches')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setBranches(data || []);
    } catch (error) {
      console.error('Error fetching branches:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const openAddModal = () => {
    setIsEditing(false);
    setCurrentBranchId(null);
    setName('');
    setShiftType('single');
    setExpenseRateTarget('');
    setFormError('');
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setIsEditing(true);
    setCurrentBranchId(branch.id);
    setName(branch.name);
    setShiftType(branch.shift_type);
    setExpenseRateTarget(branch.expense_rate_target.toString());
    setFormError('');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this branch?')) return;
    try {
      const { error } = await supabase.from('branches').delete().eq('id', id);
      if (error) throw error;
      fetchBranches();
    } catch (error) {
      alert('Failed to delete branch. It might be referenced by sales or expenses.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !expenseRateTarget) {
      setFormError('Name and Target are required');
      return;
    }
    
    setSubmitting(true);
    setFormError('');
    
    try {
      const branchData = {
        name,
        shift_type: shiftType,
        expense_rate_target: parseFloat(expenseRateTarget)
      };

      if (isEditing && currentBranchId) {
        const { error } = await supabase
          .from('branches')
          .update(branchData)
          .eq('id', currentBranchId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('branches')
          .insert([branchData]);
        if (error) throw error;
      }

      setIsModalOpen(false);
      fetchBranches();
    } catch (error: any) {
      setFormError(error.message || 'Failed to save branch');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Settings</h2>
          <p className="text-gray-400 mt-1">Manage system configurations and branches</p>
        </div>
        <button className="btn-primary" onClick={openAddModal}>
          <Plus size={20} /> Add Branch
        </button>
      </div>

      <Card title="Branches Management" subtitle="Configure branches, shifts, and targets">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading branches...</div>
        ) : branches.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-lg bg-surface/50 text-gray-400">
            <Building className="mx-auto mb-3 opacity-50" size={40} />
            <p>No branches configured yet.</p>
            <button className="btn-secondary mt-4" onClick={openAddModal}>Add First Branch</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border text-gray-400 text-sm tracking-wider uppercase">
                  <th className="pb-3 font-medium">Branch Name</th>
                  <th className="pb-3 font-medium">Shift Type</th>
                  <th className="pb-3 font-medium text-right">Expense Target (%)</th>
                  <th className="pb-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {branches.map((branch) => (
                  <tr key={branch.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 font-medium">{branch.name}</td>
                    <td className="py-4 capitalize">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${branch.shift_type === 'dual' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                        {branch.shift_type}
                      </span>
                    </td>
                    <td className="py-4 text-right">{branch.expense_rate_target}%</td>
                    <td className="py-4 text-right flex justify-end gap-3">
                      <button 
                        onClick={() => openEditModal(branch)} 
                        className="p-1.5 text-gray-400 hover:text-gold transition-colors"
                        title="Edit"
                      >
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(branch.id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 transition-colors"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={isEditing ? 'Edit Branch' : 'Add New Branch'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Branch Name" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="e.g. Kilimani Branch" 
            required
          />
          
          <Select 
            label="Shift Type"
            value={shiftType}
            onChange={(e) => setShiftType(e.target.value as 'single' | 'dual')}
            options={[
              { value: 'single', label: 'Single Shift' },
              { value: 'dual', label: 'Dual Shift (Day & Night)' }
            ]}
          />

          <Input 
            label="Expense Rate Target (%)" 
            type="number"
            min="0"
            max="100"
            step="0.1"
            value={expenseRateTarget} 
            onChange={(e) => setExpenseRateTarget(e.target.value)} 
            placeholder="30.0" 
            required
          />

          {formError && <div className="text-red-400 text-sm p-2 bg-red-500/10 rounded">{formError}</div>}

          <div className="pt-4 flex justify-end gap-3 border-t border-border mt-6">
            <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Branch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
