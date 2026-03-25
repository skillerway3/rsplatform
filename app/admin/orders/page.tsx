'use client';

import React from 'react';
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  Calendar,
  DollarSign,
  Package,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ExternalLink,
  Tag
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminOrdersPage() {
  const supabase = createClient();
  const [orders, setOrders] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'pending' | 'completed' | 'cancelled' | 'disputed'>('all');

  React.useEffect(() => {
    async function fetchOrders() {
      try {
        let query = supabase.from('orders').select(`
          *,
          buyer:profiles!orders_buyer_id_fkey(username, avatar_url),
          seller:profiles!orders_seller_id_fkey(username, avatar_url),
          listing:listings(title, price, image_url)
        `).order('created_at', { ascending: false });

        if (filter === 'pending') query = query.eq('status', 'pending');
        if (filter === 'completed') query = query.eq('status', 'completed');
        if (filter === 'cancelled') query = query.eq('status', 'cancelled');
        if (filter === 'disputed') query = query.eq('status', 'disputed');

        const { data, error } = await query;
        if (error) throw error;
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, [filter]);

  const filteredOrders = orders.filter(order => 
    order.order_code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.buyer?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.seller?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.listing?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'pending': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'disputed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      default: return 'bg-zinc-800 text-zinc-500 border-white/5';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Order Management</h1>
          <p className="text-zinc-500 text-sm font-medium">Monitor transactions, handle disputes, and track order status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            {(['all', 'pending', 'completed', 'cancelled', 'disputed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Order Code</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Listing</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Parties</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Total</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <p className="text-zinc-500 text-xs font-medium">No orders found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">{order.order_code || 'N/A'}</span>
                        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{new Date(order.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-zinc-950">
                          <Image 
                            src={order.listing?.image_url || 'https://picsum.photos/seed/listing/100/100'}
                            alt={order.listing?.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="max-w-[150px]">
                          <p className="text-[10px] font-black text-white uppercase tracking-widest truncate">{order.listing?.title}</p>
                          <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">ID: {order.listing_id.substr(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-950 mb-1">
                            <Image 
                              src={order.buyer?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.buyer_id}`}
                              alt={order.buyer?.username}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          </div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{order.buyer?.username}</span>
                        </div>
                        <ArrowRight className="w-3 h-3 text-zinc-700" />
                        <div className="flex flex-col items-center">
                          <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-950 mb-1">
                            <Image 
                              src={order.seller?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${order.seller_id}`}
                              alt={order.seller?.username}
                              width={24}
                              height={24}
                              className="object-cover"
                            />
                          </div>
                          <span className="text-[8px] font-black text-zinc-500 uppercase tracking-widest">{order.seller?.username}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <DollarSign className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] font-black text-white">{order.total_price}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-0.5 border rounded text-[8px] font-black uppercase tracking-widest",
                        getStatusColor(order.status)
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/orders/${order.id}`}>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/5 group-hover:border-amber-500/30">
                          Details
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
