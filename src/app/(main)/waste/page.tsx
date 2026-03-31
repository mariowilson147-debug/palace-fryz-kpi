'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function WastePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Waste Entry & Tracking</h1>
        <p className="text-slate-500">Log spoiled, damaged, or lost inventory items.</p>
      </div>

      <Card className="p-6 max-w-md">
        <h2 className="text-lg font-bold text-slate-900 mb-6">New Waste Entry</h2>
        <form className="space-y-4">
          <Input label="Date" type="date" />
          <Input label="Item Name" placeholder="e.g. Seafood" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" />
            <Input label="Unit Price" type="number" prefixStr="$" />
          </div>
          <Button className="w-full mt-6" variant="danger">
            Add Item
          </Button>
        </form>
      </Card>
    </div>
  );
}
