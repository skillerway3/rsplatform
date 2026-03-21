import * as React from 'react';
import { Coins, Package, CreditCard, MessageSquare, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  listingCount: number;
  orderCount: number;
  totalRevenue: number;
  unreadMessages?: number;
  pendingOrders?: number;
}

export function DashboardStats({ 
  listingCount, 
  orderCount, 
  totalRevenue, 
  unreadMessages = 0,
  pendingOrders = 0
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="premium-card p-8 group hover:border-amber-500/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center">
            <Coins className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Live
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Revenue</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">{formatCurrency(totalRevenue)}</div>
        </div>
      </Card>

      <Card className="premium-card p-8 group hover:border-emerald-500/30 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center">
            <Package className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="flex items-center text-emerald-500 text-[9px] font-black uppercase tracking-widest">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            Active
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
            {pendingOrders} Pending
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
            {unreadMessages > 0 ? `${unreadMessages} New` : 'No New'}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Unread Messages</div>
          <div className="text-3xl font-black text-zinc-100 tracking-tighter">{unreadMessages}</div>
        </div>
      </Card>
    </div>
  );
}
