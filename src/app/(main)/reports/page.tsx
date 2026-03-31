'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Download, FileText, FileSpreadsheet, Layers, Filter } from 'lucide-react';

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports generator</h1>
          <p className="text-slate-500">Generate, preview, and download comprehensive audits.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Report Configuration */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6 text-slate-900">
            <Filter size={18} className="text-[#059669]" /> 
            <h2 className="text-lg font-bold">Report Configuration</h2>
          </div>
          
          <form className="space-y-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Property</label>
              <select className="w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#059669]/20 focus:border-[#059669]">
                <option value="all">All Properties (Portfolio Overview)</option>
                <option value="a">Grand Plaza Heights</option>
                <option value="b">Urban Loft Executive</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Date Range (Last 3 Months default)</label>
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" />
                <Input type="date" />
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <label className="text-sm font-bold text-slate-900 mb-1">Modules to Include</label>
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-[#059669]" defaultChecked />
                <span className="text-sm text-slate-700">Dashboard KPIs & Trends</span>
              </label>
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-[#059669]" defaultChecked />
                <span className="text-sm text-slate-700">Sales Variances & Shift Data</span>
              </label>
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-[#059669]" defaultChecked />
                <span className="text-sm text-slate-700">Expense Allocation Breakdown</span>
              </label>
              <label className="flex items-center gap-3 select-none">
                <input type="checkbox" className="w-4 h-4 text-[#059669] rounded border-slate-300 focus:ring-[#059669]" defaultChecked />
                <span className="text-sm text-slate-700">Waste Top Items</span>
              </label>
            </div>

            <div className="pt-6 border-t border-slate-100 flex gap-3">
              <Button type="button" variant="outline" className="flex-1 border-[#059669] text-[#059669] hover:bg-emerald-50">
                <FileSpreadsheet size={16} className="mr-2" /> CSV
              </Button>
              <Button type="button" className="flex-[2] shadow-md shadow-[#059669]/20 font-bold">
                <FileText size={16} className="mr-2" /> Generate PDF
              </Button>
            </div>
          </form>
        </Card>

        {/* Report Preview */}
        <Card className="lg:col-span-2 p-0 bg-slate-100 border-none overflow-hidden relative min-h-[500px] flex flex-col items-center justify-center shadow-inner">
          <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-10">
            <Badge className="bg-white/80 backdrop-blur border text-xs font-bold px-3 py-1">A4 Preview</Badge>
            <button className="w-8 h-8 rounded-full bg-white/80 backdrop-blur flex items-center justify-center text-slate-600 hover:text-slate-900 border overflow-hidden shadow-sm transition-all hover:scale-105">
              <Layers size={14} />
            </button>
          </div>
          
          {/* Mock PDF Paper */}
          <div className="w-[80%] max-w-[400px] aspect-[1/1.414] bg-white rounded shadow-xl mt-12 mb-4 p-8 relative flex flex-col">
            <div className="h-4 w-1/2 bg-slate-200 rounded mb-6"></div>
            <div className="flex gap-4 mb-6">
              <div className="flex-1 h-12 bg-emerald-50 rounded"></div>
              <div className="flex-1 h-12 bg-amber-50 rounded"></div>
              <div className="flex-1 h-12 bg-red-50 rounded"></div>
            </div>
            <div className="h-32 w-full bg-slate-50 rounded mb-6 border border-slate-100"></div>
            <div className="h-4 w-1/3 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-2 flex-1">
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-full bg-slate-100 rounded"></div>
              <div className="h-2 w-[80%] bg-slate-100 rounded"></div>
            </div>
            <div className="h-8 flex justify-between items-end border-t border-slate-100 pt-2 mt-auto">
               <div className="h-2 w-16 bg-slate-200 rounded"></div>
               <div className="h-2 w-8 bg-slate-200 rounded"></div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
