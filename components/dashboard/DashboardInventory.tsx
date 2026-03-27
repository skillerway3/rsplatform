import * as React from 'react';
import { Settings, ChevronRight, Package } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency } from '@/lib/utils';

interface Listing {
  id: string;
  title: string;
  gameId: string;
  price: number;
}

interface DashboardInventoryProps {
  listings: Listing[];
}

export function DashboardInventory({ listings }: DashboardInventoryProps) {
  return (
    <Card className="premium-card overflow-hidden">
      <div className="p-10 border-b border-white/5 flex items-center justify-between">
        <div className="space-y-1">
          <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight">Inventory</h3>
          <p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Manage your active marketplace listings</p>
        </div>
        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100">
          View Inventory
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-white/5">
              <th className="px-10 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Item</th>
              <th className="px-10 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Status</th>
              <th className="px-10 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Price</th>
              <th className="px-10 py-6 text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {listings.map((listing) => (
              <tr key={listing.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="px-10 py-8">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 rounded-xl bg-zinc-900 overflow-hidden border border-white/5 shrink-0 relative">
                      <div className="w-full h-full flex items-center justify-center bg-zinc-800">
                        <Package className="w-6 h-6 text-zinc-600" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-black text-zinc-100 uppercase tracking-widest">{listing.title}</div>
                      <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{listing.gameId}</div>
                    </div>
                  </div>
                </td>
                <td className="px-10 py-8">
                  <Badge variant="success" className="text-[8px] font-black uppercase tracking-widest">Active</Badge>
                </td>
                <td className="px-10 py-8 text-sm font-black text-zinc-100 tracking-tighter">
                  {formatCurrency(listing.price)}
                </td>
                <td className="px-10 py-8">
                  <Button variant="ghost" size="icon" className="rounded-xl border border-zinc-800 h-10 w-10">
                    <Settings className="w-4 h-4 text-zinc-600 group-hover:text-zinc-100 transition-colors" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
