'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Building2, Calendar, TrendingUp, Sparkles, AlertTriangle, CreditCard, ArrowRight, Download, Archive, Printer, Share2 } from 'lucide-react';

const mockSalesData = [
  { name: 'MON', actual: 4000, predicted: 3800 },
  { name: 'TUE', actual: 3000, predicted: 3200 },
  { name: 'WED', actual: 4500, predicted: 4100 },
  { name: 'THU', actual: 6500, predicted: 5800 },
  { name: 'FRI', actual: 7800, predicted: 7000 },
  { name: 'SAT', actual: 6800, predicted: 6500 },
  { name: 'SUN', actual: 5000, predicted: 5500 },
];

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Sales & Variance Analysis</h1>
          <p className="text-slate-500">Global Operations / London Flagship</p>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-lg border border-slate-200">
          <div className="flex items-center gap-2 border-r border-slate-200 pr-4">
            <span className="text-sm font-semibold text-slate-700">London Central Flagship</span>
          </div>
          <div className="flex items-center gap-2 pl-2">
            <span className="text-sm text-slate-600">Oct 01 - Oct 31, 2023</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-[#059669]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Total Sales</h3>
          <p className="text-3xl font-bold text-slate-900 pb-1">£142,850.00</p>
        </Card>
        <Card className="border-l-4 border-l-slate-300">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Predicted Total</h3>
          <p className="text-3xl font-bold text-slate-900 pb-1">£138,400.00</p>
        </Card>
        <Card className="border-2 border-red-500 bg-red-50/30">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-wider">Net Variance</h3>
            <Badge variant="danger" className="text-[10px] uppercase font-black">Alert</Badge>
          </div>
          <p className="text-3xl font-bold text-red-600 pb-1">+£4,450.00</p>
        </Card>
        <Card className="border-l-4 border-l-[#d4af37]">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Credit Control</h3>
          <p className="text-3xl font-bold text-slate-900 pb-1">98.2%</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 h-full min-h-[400px] flex flex-col">
          <h2 className="text-lg font-bold text-slate-900 mb-6">Actual vs Predicted Sales by Shift</h2>
          <div className="flex-1 min-h-[250px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockSalesData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                <Tooltip />
                <Line type="monotone" dataKey="actual" stroke="#059669" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="predicted" stroke="#e2e8f0" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <div className="space-y-6 flex flex-col">
          <Card className="bg-[#047857] text-white border-none p-6">
            <h2 className="text-lg font-bold mb-3">Afternoon Spike Detected</h2>
            <p className="text-sm text-emerald-50 mb-6 opacity-90">
              Historical data indicates an 18% increase in beverage sales during peak afternoon shifts.
            </p>
            <button className="w-full py-2.5 px-4 bg-[#059669] hover:bg-[#065f46] border border-white/20 font-bold rounded-lg transition-colors text-sm">
              Review Staffing Plan
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
