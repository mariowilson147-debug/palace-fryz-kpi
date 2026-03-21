'use client';

import { useEffect, useState } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { Building2, Wallet, Receipt, Trash2, Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    branches: 0,
    sales: 0,
    expenses: 0,
    waste: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        // Using approximate fast counts or sum aggregations for the dashboard
        
        const [
          { count: branchCount },
          { data: salesData },
          { data: expenseData },
          { data: wasteData }
        ] = await Promise.all([
          supabase.from('branches').select('*', { count: 'exact', head: true }),
          supabase.from('sales').select('total_sales').is('deleted_at', null),
          supabase.from('expenses').select('amount').is('deleted_at', null),
          supabase.from('waste_items').select('total_cost')
        ]);
        
        const totalSales = salesData?.reduce((acc, curr) => acc + (Number(curr.total_sales) || 0), 0) || 0;
        const totalExpenses = expenseData?.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0) || 0;
        const totalWaste = wasteData?.reduce((acc, curr) => acc + (Number(curr.total_cost) || 0), 0) || 0;

        setStats({
          branches: branchCount || 0,
          sales: totalSales,
          expenses: totalExpenses,
          waste: totalWaste,
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (val: number) => `KES ${val.toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Overview</h2>
          <p className="text-gray-400 mt-1">Real-time performance metrics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Branches" 
          value={stats.branches} 
          icon={Building2} 
        />
        <StatCard 
          title="Total Sales" 
          value={formatCurrency(stats.sales)} 
          icon={Wallet} 
          trend="12%" 
          trendUp={true}
        />
        <StatCard 
          title="Total Expenses" 
          value={formatCurrency(stats.expenses)} 
          icon={Receipt} 
        />
        <StatCard 
          title="Total Waste" 
          value={formatCurrency(stats.waste)} 
          icon={Trash2} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-4">
            <a href="/sales" className="btn-secondary h-24 flex flex-col justify-center">
              <Wallet size={24} />
              <span>Record Sales</span>
            </a>
            <a href="/expenses" className="btn-secondary h-24 flex flex-col justify-center">
              <Receipt size={24} />
              <span>Log Expense</span>
            </a>
            <a href="/waste" className="btn-secondary h-24 flex flex-col justify-center">
              <Trash2 size={24} />
              <span>Record Waste</span>
            </a>
            <a href="/reports" className="btn-secondary h-24 flex flex-col justify-center border-gold/50 bg-gold/5">
              <Building2 size={24} />
              <span>View KPIs</span>
            </a>
          </div>
        </Card>

        <Card title="System Alerts" subtitle="Recent notifications">
          <div className="flex flex-col gap-4 text-sm">
            <div className="flex gap-3 items-start p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-red-400 shrink-0"></div>
              <div>
                <p className="font-semibold text-red-200">Missing Action</p>
                <p className="text-red-300 text-xs mt-1">You have no branches setup. Please visit Settings to add your first branch.</p>
              </div>
            </div>
            <div className="flex gap-3 items-start p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="w-2 h-2 mt-1.5 rounded-full bg-blue-400 shrink-0"></div>
              <div>
                <p className="font-semibold text-blue-200">System Ready</p>
                <p className="text-blue-300 text-xs mt-1">Supabase database is connected successfully.</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
