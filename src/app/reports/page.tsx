'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, StatCard } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Download, Building2, TrendingUp, Presentation, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const GOLD = '#d4af37';
const SURFACE = '#1e1e1e';
const RED = '#f87171';
const BLUE = '#60a5fa';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function generateReport() {
      try {
        setLoading(true);

        const { data: branches } = await supabase.from('branches').select('*');
        const { data: sales } = await supabase.from('sales').select('*, branches(name)').is('deleted_at', null);
        const { data: expenses } = await supabase.from('expenses').select('*, branches(name)').is('deleted_at', null);

        // Fetch waste
        const { data: wasteEntries } = await supabase.from('waste_entries').select('id, branch_id').is('deleted_at', null);
        let totalWasteValue = 0;
        
        if (wasteEntries && wasteEntries.length > 0) {
          const entryIds = wasteEntries.map(w => w.id);
          const { data: wasteItems } = await supabase.from('waste_items').select('total_cost').in('waste_entry_id', entryIds);
          totalWasteValue = wasteItems?.reduce((sum, item) => sum + (Number(item.total_cost) || 0), 0) || 0;
        }

        const totalSales = sales?.reduce((sum, sale) => sum + (Number(sale.total_sales) || 0), 0) || 0;
        const totalExpenses = expenses?.reduce((sum, exp) => sum + (Number(exp.amount) || 0), 0) || 0;
        
        // Payment methods
        const cashTotal = sales?.reduce((sum, sale) => sum + (Number(sale.cash) || 0), 0) || 0;
        const mpesaTotal = sales?.reduce((sum, sale) => sum + (Number(sale.mpesa) || 0), 0) || 0;
        const creditTotal = sales?.reduce((sum, sale) => sum + (Number(sale.credit) || 0), 0) || 0;

        // Branch Performance
        const branchPerformance = branches?.map(b => {
          const bSales = sales?.filter(s => s.branch_id === b.id).reduce((sum, s) => sum + (Number(s.total_sales) || 0), 0) || 0;
          const bExp = expenses?.filter(e => e.branch_id === b.id).reduce((sum, e) => sum + (Number(e.amount) || 0), 0) || 0;
          const targetAchievement = b.monthly_target > 0 ? (bSales / b.monthly_target) * 100 : 0;
          return {
            name: b.name,
            sales: bSales,
            expenses: bExp,
            profit: bSales - bExp,
            achievement: targetAchievement.toFixed(1)
          };
        }) || [];

        // Daily Trend (last 7 days simplified)
        const dates = [...new Set(sales?.map(s => s.date))].sort().slice(-7);
        const trendData = dates.map(date => {
          const daySales = sales?.filter(s => s.date === date).reduce((sum, s) => sum + (Number(s.total_sales) || 0), 0) || 0;
          return { date: date.slice(5), sales: daySales };
        });

        setReportData({
          totalSales,
          totalExpenses,
          totalWaste: totalWasteValue,
          netProfit: totalSales - totalExpenses - totalWasteValue,
          paymentMethods: [
            { name: 'Cash', value: cashTotal },
            { name: 'M-Pesa', value: mpesaTotal },
            { name: 'Credit', value: creditTotal },
          ].filter(p => p.value > 0),
          branchPerformance,
          trendData
        });
        
      } catch (err) {
        console.error('Report Generation Error', err);
      } finally {
        setLoading(false);
      }
    }

    generateReport();
  }, []);

  const exportPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#0a0a0a' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`PFMS_Executive_Report_${new Date().toLocaleDateString()}.pdf`);
    } catch (err) {
      alert('Failed to generate PDF');
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-gold" size={32} /></div>;
  if (!reportData) return <div className="text-center p-12 text-gray-500">No data available for reporting.</div>;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Executive Reports</h2>
          <p className="text-gray-400 mt-1">High-level analytics and exportable PDFs</p>
        </div>
        <button className="btn-primary" onClick={exportPDF}>
          <Download size={20} /> Export PDF Report
        </button>
      </div>

      <div ref={reportRef} className="bg-background print:bg-white text-foreground print:text-black p-2 md:p-8 rounded-xl">
        <div className="text-center mb-12 border-b border-border print:border-gray-300 pb-8">
          <h1 className="text-4xl font-bold tracking-wider mb-2">
            PALACE <span className="text-gold print:text-black">FRYS</span>
          </h1>
          <p className="text-xl tracking-widest uppercase text-gray-400 print:text-gray-600 mb-6">Executive Summary Report</p>
          <p className="text-sm text-gray-500">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-surface print:bg-gray-100 rounded-lg border border-border print:border-gray-300 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-2xl font-bold text-gold print:text-black">KES {reportData.totalSales.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-surface print:bg-gray-100 rounded-lg border border-border print:border-gray-300 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Total Expenses</p>
            <p className="text-2xl font-bold text-red-400 print:text-black">KES {reportData.totalExpenses.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-surface print:bg-gray-100 rounded-lg border border-border print:border-gray-300 text-center">
            <p className="text-sm text-gray-400 uppercase tracking-wider mb-2">Waste Cost</p>
            <p className="text-2xl font-bold text-red-400 print:text-black">KES {reportData.totalWaste.toLocaleString()}</p>
          </div>
          <div className="p-6 bg-gold/10 print:bg-black print:text-white rounded-lg border border-gold/30 print:border-black text-center">
            <p className="text-sm text-gold print:text-gray-300 uppercase tracking-wider mb-2">Net Profit</p>
            <p className="text-2xl font-bold text-gold print:text-white">KES {reportData.netProfit.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div className="bg-surface print:bg-white p-6 rounded-lg border border-border print:border-gray-300">
            <h3 className="text-lg font-semibold tracking-wide mb-6 flex items-center gap-2">
              <Building2 size={20} className="text-gold" /> Branch Performance (Sales vs Expenses)
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportData.branchPerformance} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis stroke="#888" tick={{ fill: '#888' }} tickFormatter={(val) => `K${val/1000}`} />
                  <Tooltip contentStyle={{ backgroundColor: SURFACE, borderColor: '#333' }} />
                  <Bar dataKey="sales" name="Sales" fill={GOLD} radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill={RED} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-surface print:bg-white p-6 rounded-lg border border-border print:border-gray-300">
            <h3 className="text-lg font-semibold tracking-wide mb-6 flex items-center gap-2">
              <TrendingUp size={20} className="text-gold" /> Recent Daily Sales Trend
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportData.trendData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <XAxis dataKey="date" stroke="#888" tick={{ fill: '#888' }} />
                  <YAxis stroke="#888" tick={{ fill: '#888' }} tickFormatter={(val) => `K${val/1000}`} />
                  <Tooltip contentStyle={{ backgroundColor: SURFACE, borderColor: '#333' }} />
                  <Line type="monotone" dataKey="sales" stroke={GOLD} strokeWidth={3} dot={{ r: 6, fill: GOLD }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {reportData.branchPerformance.length > 0 && (
          <div className="bg-surface print:bg-white p-6 rounded-lg border border-border print:border-gray-300 mb-12">
            <h3 className="text-lg font-semibold tracking-wide mb-6 flex items-center gap-2">
              <Presentation size={20} className="text-gold" /> Branches Achievement Matrix
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left print:text-black border-collapse">
                <thead>
                  <tr className="border-b border-border print:border-gray-300 text-gray-400 print:text-black uppercase text-xs tracking-wider">
                    <th className="py-3 px-4 font-semibold w-1/4">Branch</th>
                    <th className="py-3 px-4 font-semibold text-right">Revenue</th>
                    <th className="py-3 px-4 font-semibold text-right">Net Profit</th>
                    <th className="py-3 px-4 font-semibold text-right">Target Achievement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-gray-300">
                  {reportData.branchPerformance.map((bp: any, idx: number) => (
                    <tr key={idx} className="hover:bg-background/50 print:hover:bg-white transition-colors">
                      <td className="py-4 px-4 font-medium">{bp.name}</td>
                      <td className="py-4 px-4 text-right">KES {bp.sales.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right text-gold print:text-black font-semibold">KES {bp.profit.toLocaleString()}</td>
                      <td className="py-4 px-4 text-right">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${Number(bp.achievement) >= 100 ? 'bg-green-500/20 text-green-400 print:text-green-700' : 'bg-red-500/20 text-red-400 print:text-red-700'}`}>
                          {bp.achievement}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="text-center pt-8 border-t border-border print:border-gray-300 text-xs text-gray-500 print:text-gray-500">
          <p>This document is highly confidential and intended only for the exclusive use of Palace Frys Management.</p>
          <p className="mt-1">System Version 1.0.0 &copy; {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
