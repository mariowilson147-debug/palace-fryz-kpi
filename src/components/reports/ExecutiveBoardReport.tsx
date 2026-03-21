import React, { forwardRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, CartesianGrid, Legend, PieChart, Pie, Cell, ReferenceLine } from 'recharts';

export const ExecutiveBoardReport = forwardRef<HTMLDivElement, any>(({ startDate, endDate, stats, branchesData, trendData, extremes, expenseCategories }, ref) => {
  const fmt = (v: number) => v.toLocaleString();
  const extremeData = [
    { name: `High Sale`, value: extremes.highestSales.amount, fill: '#10b981' }, 
    { name: `Low Sale`, value: extremes.lowestSales.amount, fill: '#ef4444' }, 
    { name: `High Exp`, value: extremes.highestExp.amount, fill: '#e85d04' },
    { name: `Low Exp`, value: extremes.lowestExp.amount, fill: '#0d9488' }
  ];

  return (
    <div ref={ref} className="bg-[#fcfaf5] text-gray-900 absolute top-0 left-0 z-[-50] tracking-wide" style={{ width: '794px', height: '1123px', fontFamily: 'Arial, sans-serif' }}>
      <div className="bg-[#0a192f] text-white px-8 py-5 flex justify-between items-start" style={{ height: '85px' }}>
        <div className="w-6 h-6 border-[1.5px] border-[#d4af37] flex items-center justify-center font-bold text-[#d4af37] text-[10px]">PF</div>
        <div className="text-center"><h1 className="text-[14px] font-extrabold text-[#fdfbf7]">PALACE FRYS MONTHLY BRANCH SALES, EXPENSE & WASTE REPORT</h1><p className="text-[10px] text-[#d4af37] mt-1 uppercase font-semibold">Prepared for Management Review | {startDate} to {endDate}</p></div>
        <div className="text-right text-[8px] text-gray-300">Generated:<br/>{new Date().toLocaleDateString('en-GB')}</div>
      </div>

      <div className="px-8 py-6 space-y-4">
        <div className="grid grid-cols-4 gap-4">
          {[
            { tag: 'TOTAL SALES', val: fmt(stats.totalSales), sub: 'Total Revenue' },
            { tag: 'TOTAL EXPENSES', val: fmt(stats.totalExp), sub: 'Operational Costs' },
            { tag: 'TOTAL WASTE', val: fmt(stats.totalWaste), sub: `${stats.totalSales ? ((stats.totalWaste / stats.totalSales) * 100).toFixed(1) : 0}% of Sales` },
            { tag: 'NET PROFIT', val: fmt(stats.netProfit), sub: 'After Expenses' }
          ].map((kpi, i) => (
            <div key={i} className="bg-white rounded-lg p-3 shadow-sm border-t-[3px] border-[#d4af37]">
              <p className="text-[9px] text-[#0a192f]/60 font-black">{kpi.tag}</p>
              <p className="text-2xl font-bold mt-1 text-[#0a192f]">{kpi.val}</p>
              <p className="text-[8px] text-gray-400 mt-0.5 uppercase">{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4 h-44">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-[9px] font-bold text-[#0a192f] mb-3 uppercase">Sales & Expense by Branch</h3>
            <BarChart width={330} height={120} layout="vertical" data={branchesData} margin={{ left: -10 }}><CartesianGrid strokeDasharray="2 2" horizontal vertical={false} /><XAxis type="number" fontSize={8} tickFormatter={(v)=>`${v/1000}k`} axisLine={false} tickLine={false} /><YAxis dataKey="name" type="category" fontSize={7} axisLine={false} tickLine={false} /><Bar dataKey="totalSales" fill="#e85d04" barSize={6} isAnimationActive={false} /><Bar dataKey="totalExp" fill="#1e3a8a" barSize={6} isAnimationActive={false} /></BarChart>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-3 relative">
            <h3 className="text-[9px] font-bold text-[#0a192f] mb-2 uppercase text-center">Expense Breakdown</h3>
            <div className="absolute inset-0 flex items-center justify-center mt-4"><div className="text-center"><p className="text-[7px] text-gray-400 uppercase">Total Expenses</p><p className="text-xs font-bold text-[#0a192f]">{fmt(stats.totalExp)}</p></div></div>
            <PieChart width={330} height={130}><Pie data={expenseCategories} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="85%" isAnimationActive={false} paddingAngle={2}>{expenseCategories.map((_: any, i: number) => <Cell key={i} fill={['#e85d04', '#0d9488', '#3b82f6', '#d4af37', '#9ca3af'][i % 5]} />)}</Pie><Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{fontSize:7}} iconSize={5} /></PieChart>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-3 h-40">
          <h3 className="text-[9px] font-bold text-[#0a192f] mb-2 uppercase">Monthly Performance Trends</h3>
          <LineChart width={700} height={110} data={trendData} margin={{left: -10}}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="date" fontSize={7} axisLine={false} tickLine={false} /><YAxis fontSize={7} tickFormatter={(v)=>`${v/1000}k`} axisLine={false} tickLine={false} /><Line type="monotone" dataKey="sales" stroke="#e85d04" strokeWidth={2} dot={{ r: 2 }} isAnimationActive={false} /><Line type="monotone" dataKey="expenses" stroke="#1e3a8a" strokeWidth={2} dot={false} isAnimationActive={false} /><Line type="monotone" dataKey="waste" stroke="#ef4444" strokeWidth={1} dot={false} isAnimationActive={false} /></LineChart>
        </div>

        <div className="grid grid-cols-2 gap-4 h-40">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-[9px] font-bold text-[#0a192f] mb-2 uppercase">Highest & Lowest Days</h3>
            <BarChart width={330} height={110} data={extremeData} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={7} axisLine={false} tickLine={false} interval={0} /><YAxis fontSize={7} tickFormatter={(v)=>`${v/1000}k`} axisLine={false} tickLine={false} /><Bar dataKey="value" barSize={12} isAnimationActive={false} label={{ position: 'top', fontSize: 6, formatter: ((v: any) => fmt(Number(v))) as any }}>{extremeData.map((d: any, i: number) => <Cell key={i} fill={d.fill} />)}</Bar></BarChart>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <h3 className="text-[9px] font-bold text-[#0a192f] mb-2 uppercase">Waste % By Branch</h3>
            <BarChart width={330} height={110} data={branchesData} margin={{ left: -20 }}><CartesianGrid strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={7} axisLine={false} tickLine={false} /><YAxis fontSize={7} tickFormatter={(v)=>`${v}%`} axisLine={false} tickLine={false} /><ReferenceLine y={10} stroke="#d4af37" strokeDasharray="3 3" label={{ position: 'top', value: '10% Target', fill: '#d4af37', fontSize: 7, fontWeight: 'bold' }} /><Bar dataKey="wasteRate" fill="#ef4444" barSize={12} isAnimationActive={false} label={{ position: 'top', fill: '#ef4444', fontSize: 7, formatter: (v:any)=>`${v}%` }} /></BarChart>
          </div>
        </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full text-left text-[9px]"><thead className="bg-[#fcfaf5] border-b border-gray-200"><tr className="text-[#0a192f] uppercase"><th className="py-2 px-3">Branch</th><th className="py-2 px-3 text-right">Sales</th><th className="py-2 px-3 text-right">Expenses</th><th className="py-2 px-3 text-right">Waste %</th><th className="py-2 px-3 text-right">Net Profit</th><th className="py-2 px-3 text-center">Expense Rate</th></tr></thead><tbody className="divide-y divide-gray-100">{branchesData.map((b: any, i: number) => (<tr key={i}><td className="py-2 px-3 font-bold">{b.name}</td><td className="py-2 px-3 text-right">{fmt(b.totalSales)}</td><td className="py-2 px-3 text-right">{fmt(b.totalExp)}</td><td className="py-2 px-3 text-right text-red-500">{b.wasteRate}%</td><td className="py-2 px-3 text-right font-bold text-[#0a192f]">{fmt(b.netProfit)}</td><td className="py-2 px-3 text-center text-gray-500">{b.actualExpenseRate}%</td></tr>))}</tbody></table>
        </div>
      </div>

      <div className="absolute bottom-6 left-8 right-8 text-[7px] text-gray-500 uppercase tracking-widest font-semibold">
        <div className="h-[1.5px] bg-[#d4af37] w-full mb-3 opacity-80"></div>
        <div className="flex justify-between"><p className="text-[#ef4444]">Confidential – Internal Use Only</p><p>Page 1 of 1</p><p>Generated by Palace Frys</p></div>
      </div>
    </div>
  );
});
ExecutiveBoardReport.displayName = 'ExecutiveBoardReport';
