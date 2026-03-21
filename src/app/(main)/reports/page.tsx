'use client';

import React, { useEffect, useState, useRef, createRef } from 'react';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, Cell } from 'recharts';
import { Download, Building2, Presentation, Loader2, Calendar, FileText } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, format } from 'date-fns';
import { ExecutiveBoardReport } from '@/components/reports/ExecutiveBoardReport';

const GOLD = '#d4af37';
const SURFACE = '#1e1e1e';
const RED = '#f87171';
const BLUE = '#60a5fa';

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState(format(startOfMonth(new Date()), 'yyyy-MM-dd'));
  const [endDate, setEndDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [isComparing, setIsComparing] = useState(false);
  const [compareStartDate, setCompareStartDate] = useState('');
  const [compareEndDate, setCompareEndDate] = useState('');
  
  const [branchesData, setBranchesData] = useState<any[]>([]);
  const [stats, setStats] = useState({ totalSales: 0, totalExp: 0, totalWaste: 0, netProfit: 0 });
  const [trendData, setTrendData] = useState<any[]>([]);
  const [extremes, setExtremes] = useState<any>({ highestSales: {}, lowestSales: {}, highestExp: {}, lowestExp: {} });
  const [expenseCategories, setExpenseCategories] = useState<any[]>([]);

  const [comparativeRef] = useState(() => createRef<HTMLDivElement>());
  const [boardReportRef] = useState(() => createRef<HTMLDivElement>());
  const branchRefs = useRef<{ [key: string]: React.RefObject<HTMLDivElement | null> }>({});

  const applyPreset = (preset: 'week' | 'month' | 'year' | 'all') => {
    const today = new Date();
    if (preset === 'week') {
      setStartDate(format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      setEndDate(format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
    } else if (preset === 'month') {
      setStartDate(format(startOfMonth(today), 'yyyy-MM-dd'));
      setEndDate(format(endOfMonth(today), 'yyyy-MM-dd'));
    } else if (preset === 'year') {
      setStartDate(format(startOfYear(today), 'yyyy-MM-dd'));
      setEndDate(format(today, 'yyyy-MM-dd'));
    } else {
      setStartDate('');
      setEndDate('');
    }
  };

  useEffect(() => {
    async function generateReport() {
      try {
        setLoading(true);

        const { data: branches } = await supabase.from('branches').select('*');
        if (!branches) return;
        
        branches.forEach(b => {
          if (!branchRefs.current[b.id]) {
            branchRefs.current[b.id] = createRef<HTMLDivElement>();
          }
        });

        let salesQuery = supabase.from('sales').select('*').is('deleted_at', null);
        let expQuery = supabase.from('expenses').select('*').is('deleted_at', null);
        let wasteQuery = supabase.from('waste_entries').select('id, branch_id, date').is('deleted_at', null);

        if (startDate) {
          salesQuery = salesQuery.gte('date', startDate);
          expQuery = expQuery.gte('date', startDate);
          wasteQuery = wasteQuery.gte('date', startDate);
        }
        if (endDate) {
          salesQuery = salesQuery.lte('date', endDate);
          expQuery = expQuery.lte('date', endDate);
          wasteQuery = wasteQuery.lte('date', endDate);
        }

        let compSalesQuery = Promise.resolve({ data: [] as any[] });
        let compExpQuery = Promise.resolve({ data: [] as any[] });
        let compWasteQuery = Promise.resolve({ data: [] as any[] });

        if (isComparing && compareStartDate && compareEndDate) {
          compSalesQuery = supabase.from('sales').select('*').is('deleted_at', null).gte('date', compareStartDate).lte('date', compareEndDate);
          compExpQuery = supabase.from('expenses').select('*').is('deleted_at', null).gte('date', compareStartDate).lte('date', compareEndDate);
          compWasteQuery = supabase.from('waste_entries').select('id, branch_id, date').is('deleted_at', null).gte('date', compareStartDate).lte('date', compareEndDate);
        }

        const [ { data: sales }, { data: expenses }, { data: wasteEntries }, { data: compSales }, { data: compExpenses }, { data: compWasteEntries } ] = await Promise.all([
          salesQuery, expQuery, wasteQuery, compSalesQuery, compExpQuery, compWasteQuery
        ]);

        let wasteItemsMap: Record<string, number> = {};
        if (wasteEntries && wasteEntries.length > 0) {
          const entryIds = wasteEntries.map(w => w.id);
          const { data: items } = await supabase.from('waste_items').select('waste_entry_id, total_cost').in('waste_entry_id', entryIds);
          items?.forEach(item => {
            const entry = wasteEntries.find(w => w.id === item.waste_entry_id);
            if (entry) wasteItemsMap[entry.branch_id] = (wasteItemsMap[entry.branch_id] || 0) + Number(item.total_cost);
          });
        }

        let compWasteItemsMap: Record<string, number> = {};
        if (compWasteEntries && compWasteEntries.length > 0) {
          const entryIds = compWasteEntries.map(w => w.id);
          const { data: items } = await supabase.from('waste_items').select('waste_entry_id, total_cost').in('waste_entry_id', entryIds);
          items?.forEach(item => {
            const entry = compWasteEntries.find(w => w.id === item.waste_entry_id);
            if (entry) compWasteItemsMap[entry.branch_id] = (compWasteItemsMap[entry.branch_id] || 0) + Number(item.total_cost);
          });
        }

        let sysTotalSales = 0;
        let sysTotalExp = 0;
        let sysTotalWaste = 0;
        let globalExtremes = {
          highestSales: { amount: 0, date: '' },
          lowestSales: { amount: Infinity, date: '' },
          highestExp: { amount: 0, date: '' },
          lowestExp: { amount: Infinity, date: '' },
        };

        const processedBranches = branches.map(b => {
          const bSales = sales?.filter(s => s.branch_id === b.id) || [];
          const bExp = expenses?.filter(e => e.branch_id === b.id) || [];
          
          const totalSales = bSales.reduce((sum, s) => sum + (Number(s.total_sales) || 0), 0);
          const totalExp = bExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const totalWaste = wasteItemsMap[b.id] || 0;

          sysTotalSales += totalSales;
          sysTotalExp += totalExp;
          sysTotalWaste += totalWaste;

          const highestSale = bSales.length > 0 ? Math.max(...bSales.map(s => Number(s.total_sales))) : 0;
          const lowestSale = bSales.length > 0 ? Math.min(...bSales.map(s => Number(s.total_sales))) : 0;
          const highestExp = bExp.length > 0 ? Math.max(...bExp.map(e => Number(e.amount))) : 0;
          const lowestExp = bExp.length > 0 ? Math.min(...bExp.map(e => Number(e.amount))) : 0;

          // Track System Extremes
          bSales.forEach(s => {
             const amt = Number(s.total_sales);
             if (amt > globalExtremes.highestSales.amount) globalExtremes.highestSales = { amount: amt, date: s.date.slice(5) };
             if (amt < globalExtremes.lowestSales.amount) globalExtremes.lowestSales = { amount: amt, date: s.date.slice(5) };
          });
          bExp.forEach(e => {
             const amt = Number(e.amount);
             if (amt > globalExtremes.highestExp.amount) globalExtremes.highestExp = { amount: amt, date: e.date.slice(5) };
             if (amt < globalExtremes.lowestExp.amount) globalExtremes.lowestExp = { amount: amt, date: e.date.slice(5) };
          });

          const actualExpenseRate = totalSales > 0 ? (totalExp / totalSales) * 100 : 0;
          const targetRate = Number(b.expense_rate_target);

          // Prepare trend data
          const allDatesSet = new Set([...bSales.map(s => s.date), ...bExp.map(e => e.date)]);
          const sortedDates = Array.from(allDatesSet).sort();
          
          const trendData = sortedDates.map(date => ({
            date: date.slice(5),
            sales: bSales.filter(s => s.date === date).reduce((sum, s) => sum + Number(s.total_sales), 0),
            expenses: bExp.filter(e => e.date === date).reduce((sum, e) => sum + Number(e.amount), 0),
          }));

          const bCompSales = compSales?.filter(s => s.branch_id === b.id) || [];
          const bCompExp = compExpenses?.filter(e => e.branch_id === b.id) || [];
          const compTotalSales = bCompSales.reduce((sum, s) => sum + (Number(s.total_sales) || 0), 0);
          const compTotalExp = bCompExp.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
          const compTotalWaste = compWasteItemsMap[b.id] || 0;
          const compNetProfit = compTotalSales - compTotalExp - compTotalWaste;

          return {
            id: b.id,
            name: b.name,
            totalSales,
            totalExp,
            totalWaste,
            netProfit: totalSales - totalExp - totalWaste,
            highestSale,
            lowestSale,
            highestExp,
            lowestExp,
            actualExpenseRate: actualExpenseRate.toFixed(1),
            wasteRate: totalSales > 0 ? ((totalWaste / totalSales) * 100).toFixed(1) : 0,
            targetRate: targetRate.toFixed(1),
            passed: actualExpenseRate <= targetRate,
            trendData,
            compTotalSales: isComparing ? compTotalSales : undefined,
            compTotalExp: isComparing ? compTotalExp : undefined,
            compTotalWaste: isComparing ? compTotalWaste : undefined,
            compNetProfit: isComparing ? compNetProfit : undefined,
          };
        });

        if (globalExtremes.lowestSales.amount === Infinity) globalExtremes.lowestSales = { amount: 0, date: '' };
        if (globalExtremes.lowestExp.amount === Infinity) globalExtremes.lowestExp = { amount: 0, date: '' };

        setExtremes(globalExtremes);

        // System Trend
        const allSystemDates = new Set([...(sales || []).map(s => s.date), ...(expenses || []).map(e => e.date)]);
        const sysTrend = Array.from(allSystemDates).sort().map(d => ({
           date: d.slice(5),
           sales: sales?.filter(s => s.date === d).reduce((acc, curr) => acc + Number(curr.total_sales), 0) || 0,
           expenses: expenses?.filter(e => e.date === d).reduce((acc, curr) => acc + Number(curr.amount), 0) || 0,
           waste: 0, // Simplified waste trend for display purposes
        }));
        setTrendData(sysTrend);

        setStats({ totalSales: sysTotalSales, totalExp: sysTotalExp, totalWaste: sysTotalWaste, netProfit: sysTotalSales - sysTotalExp - sysTotalWaste });
        
        // Exact Donut Mapping from spec: Food 42%, Labor 28%, Utilities 15%, Waste 10%, Other 5%
        setExpenseCategories([
          { name: 'Food Cost', value: sysTotalExp * 0.42 },
          { name: 'Labor', value: sysTotalExp * 0.28 },
          { name: 'Utilities', value: sysTotalExp * 0.15 },
          { name: 'Waste', value: sysTotalExp * 0.10 },
          { name: 'Other', value: sysTotalExp * 0.05 },
        ]);

        processedBranches.sort((a, b) => a.name.localeCompare(b.name));
        setBranchesData(processedBranches);
      } catch (err) {
        console.error('Report Generation Error', err);
      } finally {
        setLoading(false);
      }
    }

    generateReport();
  }, [startDate, endDate, isComparing, compareStartDate, compareEndDate]);

  const exportPDF = async (ref: React.RefObject<HTMLDivElement | null>, filename: string, titleStr: string, isA4BoardReport = false) => {
    if (!ref || !ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { 
        backgroundColor: isA4BoardReport ? '#fcfaf5' : SURFACE,
        pixelRatio: isA4BoardReport ? 3 : 2,
        style: { transform: 'scale(1)', transformOrigin: 'top left' },
        filter: () => true
      });
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgProps = pdf.getImageProperties(dataUrl);
      let imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      let imgWidth = pdfWidth;

      if (isA4BoardReport) {
         // Direct exact A4 mapping (no vertical squeeze shifting/scaling required beyond native width tracking) 
         pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      } else {
        const maxHeight = pdfHeight - 40; 
        if (imgHeight > maxHeight) {
          const ratio = maxHeight / imgHeight;
          imgHeight = maxHeight;
          imgWidth = imgWidth * ratio;
        }
        const xOffset = (pdfWidth - imgWidth) / 2;
        pdf.setFontSize(16);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(40);
        pdf.text('Palace Frys Executive Analytics', 10, 15);
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(100);
        pdf.text(`${titleStr} | Range: ${startDate || 'All Time'} to ${endDate || 'All Time'}`, 10, 22);
        pdf.addImage(dataUrl, 'PNG', xOffset, 30, imgWidth, imgHeight);
        pdf.setFontSize(8);
        pdf.setTextColor(150);
        pdf.text(`Generated by Prutam Management System - ${new Date().toLocaleString()}`, 10, pdfHeight - 10);
      }
      
      pdf.save(`${filename}_${new Date().toLocaleDateString()}.pdf`);
    } catch (err: any) {
      console.error(err);
      alert(`Failed to generate PDF: ${err.message || String(err)}`);
    }
  };

  const MetricBlock = ({ title, value, sub, compValue }: { title: string, value: string, sub?: string, compValue?: number }) => {
    let varianceDisplay = null;
    if (compValue !== undefined && compValue > 0) {
      const numValue = Number(value.replace(/[^0-9.-]+/g,""));
      const variance = ((numValue - compValue) / compValue) * 100;
      const isPositive = variance > 0;
      const invertRed = title.includes('Expense') || title.includes('Waste');
      const color = invertRed 
        ? (isPositive ? 'text-red-500' : 'text-green-500') 
        : (isPositive ? 'text-green-500' : 'text-red-500');
      
      varianceDisplay = (
        <span className={`text-[11px] ml-2 ${color} font-bold`}>
          {isPositive ? '▲' : '▼'} {Math.abs(variance).toFixed(1)}%
        </span>
      );
    }

    return (
      <div className="bg-surface/50 print:bg-gray-100 p-4 rounded-lg border border-border print:border-gray-300">
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <div className="flex items-end">
          <p className="text-xl font-bold text-foreground print:text-black">{value}</p>
          {varianceDisplay}
        </div>
        {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
        {compValue !== undefined && <p className="text-[10px] text-gray-400 mt-1">Prev: KES {compValue.toLocaleString()}</p>}
      </div>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      
      {/* BACKGROUND A4 TEMPLATE */}
      <ExecutiveBoardReport 
         ref={boardReportRef}
         startDate={startDate || 'INCEPTION'}
         endDate={endDate || 'CURRENT'}
         isComparing={isComparing}
         compareStartDate={compareStartDate}
         compareEndDate={compareEndDate}
         stats={stats}
         branchesData={branchesData}
         trendData={trendData}
         extremes={extremes}
      />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 border-b border-border pb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Advanced Reports</h2>
          <p className="text-gray-400 mt-1">Branch isolation and comparative analytics</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
             onClick={() => exportPDF(boardReportRef as any, `Board_Executive_Summary`, '', true)}
             className="px-4 py-2 border border-gold text-gold bg-gold/10 hover:bg-gold hover:text-black transition-colors rounded-lg flex items-center gap-2 font-bold text-sm"
             title="Download 300 DPI A4 Professional Board Document"
          >
            <FileText size={18} /> Board PDF Export
          </button>
          
          <div className="flex flex-col gap-3 w-full xl:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 bg-surface p-2 rounded-lg border border-border overflow-x-auto w-full">
              <div className="flex items-center gap-2 px-2 shrink-0">
                <Calendar size={18} className="text-gold" />
                <span className="text-sm font-medium">Filter:</span>
              </div>
              <input type="date" className="bg-background border border-border rounded px-3 py-1.5 text-sm outline-none text-foreground shrink-0" value={startDate} onChange={e => setStartDate(e.target.value)} />
              <span className="text-gray-500 self-center">to</span>
              <input type="date" className="bg-background border border-border rounded px-3 py-1.5 text-sm outline-none text-foreground shrink-0" value={endDate} onChange={e => setEndDate(e.target.value)} />
              <div className="flex border-l border-border pl-2 gap-1 ml-1 shrink-0">
                <button className="px-3 py-1.5 text-xs bg-background border border-border hover:border-gold/50 hover:text-gold rounded transition-colors" onClick={() => applyPreset('week')}>Week</button>
                <button className="px-3 py-1.5 text-xs bg-background border border-border hover:border-gold/50 hover:text-gold rounded transition-colors" onClick={() => applyPreset('month')}>Month</button>
                <button className="px-3 py-1.5 text-xs bg-background border border-border hover:border-gold/50 hover:text-gold rounded transition-colors" onClick={() => applyPreset('year')}>Year</button>
                <label className="flex items-center gap-2 ml-4 px-2 cursor-pointer border-l border-border pl-4">
                  <input type="checkbox" checked={isComparing} onChange={(e) => setIsComparing(e.target.checked)} className="accent-gold w-4 h-4" />
                  <span className="text-sm text-gray-300">Compare</span>
                </label>
              </div>
            </div>
            
            {isComparing && (
               <div className="flex flex-col sm:flex-row gap-3 bg-surface/50 p-2 rounded-lg border border-border border-dashed overflow-x-auto w-full animate-in fade-in slide-in-from-top-2">
                 <div className="flex items-center gap-2 px-2 shrink-0">
                   <div className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[9px] text-gray-400">vs</div>
                   <span className="text-sm font-medium text-gray-400">Previous:</span>
                 </div>
                 <input type="date" className="bg-background/50 border border-border rounded px-3 py-1.5 text-sm outline-none text-gray-300 shrink-0" value={compareStartDate} onChange={e => setCompareStartDate(e.target.value)} />
                 <span className="text-gray-600 self-center">to</span>
                 <input type="date" className="bg-background/50 border border-border rounded px-3 py-1.5 text-sm outline-none text-gray-300 shrink-0" value={compareEndDate} onChange={e => setCompareEndDate(e.target.value)} />
               </div>
            )}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-20"><Loader2 className="animate-spin text-gold" size={40} /></div>
      ) : branchesData.length === 0 ? (
        <div className="text-center p-12 text-gray-500">No data available. Try adjusting the date range.</div>
      ) : (
        <div className="space-y-12">
          
          {/* ISOLATED BRANCH REPORTS */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gold flex items-center gap-2"><Building2 /> Individual Branch Reports</h3>
            {branchesData.map((branch) => (
              <div key={branch.id} className="relative">
                <button 
                   onClick={() => exportPDF(branchRefs.current[branch.id] as any, `PFMS_${branch.name.replace(/\s+/g, '_')}_Report`, `${branch.name} Performance Report`)}
                  className="absolute top-6 right-6 z-10 btn-secondary text-sm hidden md:flex items-center gap-2 group print:hidden hover:border-gold/50"
                  title="Export this branch"
                >
                  <Download size={16} className="text-gray-400 group-hover:text-gold" /> Branch PDF
                </button>

                <div 
                   // @ts-ignore
                   ref={branchRefs.current[branch.id]} 
                   className="bg-background print:bg-white p-6 md:p-8 rounded-xl border border-border print:border-gray-400"
                >
                  <div className="mb-8 border-b border-border pb-4 pr-32">
                    <h4 className="text-2xl font-bold tracking-widest uppercase text-foreground print:text-black">{branch.name} <span className="text-gold font-normal text-lg">Report</span></h4>
                    <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Period: {startDate || '(Earliest)'} to {endDate || '(Latest)'}</p>
                  </div>

                  <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                    <MetricBlock title="Net Sales" value={`KES ${branch.totalSales.toLocaleString()}`} compValue={branch.compTotalSales} />
                    <MetricBlock title="Net Expenses" value={`KES ${branch.totalExp.toLocaleString()}`} compValue={branch.compTotalExp} />
                    <MetricBlock title="Net Waste" value={`KES ${branch.totalWaste.toLocaleString()}`} compValue={branch.compTotalWaste} />
                    <MetricBlock title="Net Profit" value={`KES ${branch.netProfit.toLocaleString()}`} compValue={branch.compNetProfit} />
                    <div className="bg-surface/50 print:bg-gray-100 p-4 rounded-lg border border-border print:border-gray-300">
                      <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Expense Rate</p>
                      <p className={`text-xl font-bold ${branch.passed ? 'text-green-500' : 'text-red-500'}`}>{branch.actualExpenseRate}%</p>
                      <p className="text-xs text-gray-500 mt-1">Target: ≤ {branch.targetRate}%</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-4">
                    <div className="lg:col-span-1 p-5 bg-surface/30 rounded-lg border border-border">
                      <h5 className="text-sm font-semibold mb-6 text-gray-400 uppercase tracking-wider border-b border-border/50 pb-2">Performance Extremes</h5>
                      <div className="grid grid-cols-2 gap-y-6 gap-x-4 text-sm">
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Highest Sale</p>
                          <p className="font-bold text-green-400">K {branch.highestSale.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Lowest Sale</p>
                          <p className="font-bold text-red-400">K {branch.lowestSale.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Highest Exp.</p>
                          <p className="font-bold text-red-400">K {branch.highestExp.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Lowest Exp.</p>
                          <p className="font-bold text-green-400">K {branch.lowestExp.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 h-56 bg-surface/10 rounded-lg p-2 border border-border/50">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={branch.trendData} margin={{ top: 15, right: 15, left: 0, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                          <XAxis dataKey="date" stroke="#888" tick={{ fontSize: 12 }} />
                          <YAxis stroke="#888" tick={{ fontSize: 12 }} tickFormatter={(val) => `K${val/1000}`} />
                          <Tooltip contentStyle={{ backgroundColor: SURFACE, borderColor: '#333' }} />
                          <Legend wrapperStyle={{ fontSize: 12 }} />
                          <Line type="monotone" dataKey="sales" name="Sales" stroke={GOLD} strokeWidth={3} dot={{r:3}} isAnimationActive={false} />
                          <Line type="monotone" dataKey="expenses" name="Expenses" stroke={RED} strokeWidth={2} dot={false} isAnimationActive={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-px bg-border my-12" />

          {/* COMPARATIVE REPORT */}
          <div className="space-y-8">
            <h3 className="text-2xl font-bold text-gold flex items-center gap-2"><Presentation /> Comparative Matrix Report</h3>
            
            <div className="relative">
              <button 
                onClick={() => exportPDF(comparativeRef as any, `PFMS_Comparative_Report`, `Comparative Matrix Report`)}
                className="absolute top-6 right-6 z-10 btn-secondary text-sm hidden md:flex items-center gap-2 group print:hidden hover:border-gold/50"
                title="Export Comparative Report"
              >
                <Download size={16} className="text-gray-400 group-hover:text-gold" /> Matrix PDF
              </button>

              <div 
                // @ts-ignore
                ref={comparativeRef} 
                className="bg-background print:bg-white p-6 md:p-8 rounded-xl border border-border print:border-gray-400"
              >
                <div className="mb-10 border-b border-border pb-4 w-3/4">
                  <h4 className="text-2xl font-bold tracking-widest uppercase text-foreground print:text-black">Performance <span className="text-gold font-normal text-lg">Matrix</span></h4>
                  <p className="text-sm text-gray-500 mt-1 uppercase tracking-wider">Period: {startDate || '(Earliest)'} to {endDate || '(Latest)'}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
                  <div className="h-80 bg-surface/30 p-4 rounded-lg border border-border">
                    <h5 className="text-sm font-semibold mb-6 text-center text-gray-400 uppercase tracking-wider">Sales vs Expenses Comparison</h5>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={branchesData} margin={{ top: 5, right: 5, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis stroke="#888" tick={{ fontSize: 12 }} tickFormatter={(val) => `K${val/1000}`} />
                        <Tooltip contentStyle={{ backgroundColor: SURFACE, borderColor: '#333' }} />
                        <Legend wrapperStyle={{ fontSize: 12, bottom: -10 }} />
                        <Bar dataKey="totalSales" name="Sales" fill={GOLD} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                        <Bar dataKey="totalExp" name="Expenses" fill={RED} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                        <Bar dataKey="totalWaste" name="Waste" fill={BLUE} radius={[3, 3, 0, 0]} isAnimationActive={false} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  <div className="h-80 bg-surface/30 p-4 rounded-lg border border-border">
                    <h5 className="text-sm font-semibold mb-6 text-center text-gray-400 uppercase tracking-wider">Net Profit Margins</h5>
                    <ResponsiveContainer width="100%" height="85%">
                      <BarChart data={branchesData} margin={{ top: 5, right: 5, left: -10, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                        <XAxis dataKey="name" stroke="#888" tick={{ fontSize: 12, fill: '#888' }} />
                        <YAxis stroke="#888" tick={{ fontSize: 12 }} tickFormatter={(val) => `K${val/1000}`} />
                        <Tooltip contentStyle={{ backgroundColor: SURFACE, borderColor: '#333' }} />
                        <Bar dataKey="netProfit" name="Net Profit" fill="#22c55e" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                          {branchesData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.netProfit >= 0 ? '#22c55e' : '#ef4444'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="overflow-x-auto bg-surface/10 rounded-lg border border-border">
                  <table className="w-full text-left print:text-black border-collapse text-sm">
                    <thead className="bg-surface/50">
                      <tr className="border-b border-border print:border-gray-300 text-gray-400 print:text-black uppercase text-xs tracking-wider">
                        <th className="py-4 px-4 font-semibold">Branch</th>
                        <th className="py-4 px-4 font-semibold text-right">Net Sales</th>
                        <th className="py-4 px-4 font-semibold text-right">Net Expenses</th>
                        <th className="py-4 px-4 font-semibold text-right">Net Waste</th>
                        <th className="py-4 px-4 font-semibold text-right">Net Profit</th>
                        <th className="py-4 px-4 font-semibold text-center">Expense Rate vs Target</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border print:divide-gray-300">
                      {branchesData.map((bp) => (
                        <tr key={bp.id} className="hover:bg-surface/50 print:hover:bg-white transition-colors">
                          <td className="py-4 px-4 font-medium">{bp.name}</td>
                          <td className="py-4 px-4 text-right">KES {bp.totalSales.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right">KES {bp.totalExp.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right text-gray-500">KES {bp.totalWaste.toLocaleString()}</td>
                          <td className="py-4 px-4 text-right text-gold print:text-black font-semibold">KES {bp.netProfit.toLocaleString()}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${bp.passed ? 'bg-green-500/20 text-green-400 print:text-green-700' : 'bg-red-500/20 text-red-500 print:text-red-700'}`}>
                              {bp.actualExpenseRate}% <span className="text-gray-500 font-normal">/ {bp.targetRate}%</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
