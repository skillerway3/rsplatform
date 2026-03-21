import * as React from 'react';
import { Coins, Package, CreditCard, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  listingCount: number;
  orderCount: number;
}

export function DashboardStats({ listingCount, orderCount }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="premium-card p-8 group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +12.5%
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Revenue</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">{formatCurrency(12450.00)}</div>
        </div>
      </Card>

      <Card className="premium-card p-8 group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            +4
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Active Listings</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">{listingCount}</div>
        </div>
      </Card>

      <Card className="premium-card p-8 group hover:border-blue-500/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex items-center text-zinc-500 text-[9px] font-black uppercase tracking-widest">
            0 Pending
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Orders</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">{orderCount}</div>
        </div>
      </Card>

      <Card className="premium-card p-8 group hover:border-zinc-100/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-zinc-100/10 rounded-xl flex items-center justify-center">
            <MessageSquare className="w-5 h-5 text-zinc-100" />
          </div>
          <div className="flex items-center text-amber-500 text-[9px] font-black uppercase tracking-widest">
            2 New
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Unread Messages</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">12</div>
        </div>
      </Card>
    </div>
  );
}
