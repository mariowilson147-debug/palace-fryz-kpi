'use client';

import React from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Expenses Management</h1>
        <p className="text-slate-500">Portfolio auditing and operational loss mitigation</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-6">Expense Register</h2>
            <Button className="font-bold shadow-sm">
              Upload Google Sheet
            </Button>
          </Card>

          <Card className="p-0 overflow-hidden text-sm">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900">Recent Transactions</h2>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction Details</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Premium Linen Supply</TableCell>
                  <TableCell>$3,240.00</TableCell>
                  <TableCell><Badge variant="success">Verified</Badge></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </div>
  );
}
