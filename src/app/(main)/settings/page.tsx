'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Save, UploadCloud, Link as LinkIcon, FileSpreadsheet } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500">Manage property details and cloud integrations.</p>
      </div>

      <div className="space-y-6">
        {/* Properties Configuration */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center gap-3 bg-slate-50">
            <Building2 className="text-[#059669]" size={20} />
            <h2 className="text-lg font-bold text-slate-900">Property Configuration</h2>
          </div>
          <div className="p-6 space-y-8">
            {/* Property 1 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-3 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-3 cursor-pointer hover:bg-slate-50 hover:border-[#059669] transition-all group">
                  <div className="text-center p-2">
                    <UploadCloud className="mx-auto text-slate-400 group-hover:text-[#059669] mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Logo A</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-9 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Property A Name" defaultValue="Grand Plaza Heights" />
                  <Input label="Shift Type" defaultValue="Dual (Day/Night)" disabled />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Z Sales Projected Offset (%)" defaultValue="0" />
                  <Input label="Expense Rate Target (%)" defaultValue="25" />
                </div>
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Property 2 */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              <div className="md:col-span-3 flex flex-col items-center">
                <div className="w-24 h-24 bg-slate-100 rounded-xl border-2 border-dashed border-slate-300 flex items-center justify-center mb-3 cursor-pointer hover:bg-slate-50 hover:border-[#059669] transition-all group">
                  <div className="text-center p-2">
                    <UploadCloud className="mx-auto text-slate-400 group-hover:text-[#059669] mb-1" size={20} />
                    <span className="text-[10px] font-bold text-slate-500 uppercase">Logo B</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-9 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Property B Name" defaultValue="Urban Loft Executive" />
                  <Input label="Shift Type" defaultValue="Single" disabled />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Z Sales Projected Offset (%)" defaultValue="-5" />
                  <Input label="Expense Rate Target (%)" defaultValue="35" />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button className="font-bold">
                <Save size={16} className="mr-2" /> Save Property Settings
              </Button>
            </div>
          </div>
        </Card>

        {/* Cloud Integrity */}
        <Card className="p-0 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <div className="flex items-center gap-3">
              <LinkIcon className="text-[#059669]" size={20} />
              <h2 className="text-lg font-bold text-slate-900">Cloud Data Integrity</h2>
            </div>
            <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-widest">Connected</Badge>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-600 mb-6 max-w-2xl">
              Previously processed Google Sheets from the Expense Register module are archived here for historical parity mapping. No manual intervention is typically needed.
            </p>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-[#059669] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-[#059669]" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#059669]">HOTELMAIN_Q2.xlsx</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Parsed 14 May 2023 &bull; 412 Rows</p>
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-500 font-bold border-none text-[10px] uppercase">Archive</Badge>
              </div>

              <div className="flex justify-between items-center p-4 bg-white border border-slate-200 rounded-lg hover:border-[#059669] transition-colors cursor-pointer group">
                <div className="flex items-center gap-3">
                  <FileSpreadsheet className="text-[#059669]" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#059669]">HOTELMAIN_Q1.xlsx</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Parsed 02 Jan 2023 &bull; 564 Rows</p>
                  </div>
                </div>
                <Badge className="bg-slate-100 text-slate-500 font-bold border-none text-[10px] uppercase">Archive</Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
