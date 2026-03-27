'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  AlertCircle,
  CheckCircle2,
  Loader2,
  Package,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface Order {
  id: string;
  total_price: number;
  platform_fee: number;
  seller_payout: number;
  status: string;
  created_at: string;
  buyer_id: string;
  listing_id: string | null;
  request_id: string | null;
  buyer: {
    username: string;
    avatar_url: string;
  };
  listing?: {
    title: string;
    category: string;
  };
  request?: {
    title: string;
    category: string;
  };
}

export default function SellerSalesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSales = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Corrected query: Use total_price, platform_fee, seller_payout, and request_id
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('id, total_price, platform_fee, seller_payout, status, created_at, buyer_id, listing_id, request_id')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;
      if (!ordersData || ordersData.length === 0) {
        setOrders([]);
        return;
      }

      // Fetch related data in parallel
      const buyerIds = Array.from(new Set(ordersData.map(o => o.buyer_id).filter(Boolean)));
      const listingIds = Array.from(new Set(ordersData.map(o => o.listing_id).filter(Boolean)));

      const [
        { data: buyers },
        { data: listings }
      ] = await Promise.all([
        supabase.from('profiles').select('id, username, avatar_url').in('id', buyerIds),
        supabase.from('listings').select('id, title, category').in('id', listingIds)
      ]);

      // Map related data back to orders
      const enrichedOrders = ordersData.map(order => ({
        ...order,
        buyer: buyers?.find(b => b.id === order.buyer_id) || { username: 'Unknown', avatar_url: '' },
        listing: listings?.find(l => l.id === order.listing_id)
      }));

      setOrders(enrichedOrders as Order[]);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch sales');
    } finally {
      setLoading(false);
    }
  }, [user]);


  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchSales();
  }, [user, authLoading, fetchSales, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-6">
        <div className="text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto" />
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Sales Error</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button 
            onClick={() => fetchSales()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const activeSales = orders.filter(o => ['pending', 'processing', 'delivered'].includes(o.status));
  const completedSales = orders.filter(o => ['completed', 'resolved'].includes(o.status));

  const totalEarnings = orders.reduce((acc, o) => acc + (o.status === 'completed' ? (o.seller_payout || (o.total_price * 0.95)) : 0), 0);
  const pendingEarnings = orders.reduce((acc, o) => acc + (['processing', 'delivered'].includes(o.status) ? (o.seller_payout || (o.total_price * 0.95)) : 0), 0);

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glows - Simplified for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>
      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tighter mb-2">My <span className="text-amber-500">Sales</span></h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Manage your active orders and track your earnings</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-3 flex-1 sm:min-w-[140px]">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Total Payout</span>
              <span className="text-lg font-black text-white">${totalEarnings.toFixed(2)}</span>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl px-6 py-3 flex-1 sm:min-w-[140px]">
              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest block mb-1">Pending Payout</span>
              <span className="text-lg font-black text-amber-500">${pendingEarnings.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-zinc-900/50 rounded-3xl animate-pulse" />
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-12">
            {/* Active Sales */}
            {activeSales.length > 0 && (
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Active Orders ({activeSales.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {activeSales.map((order) => (
                    <Link 
                      key={order.id} 
                      href={`/orders/${order.id}`}
                      className="group bg-zinc-900/30 border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/50 hover:border-amber-500/20 transition-all duration-500"
                    >
                      <div className="flex items-center gap-4 md:gap-6">
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                          <Package className="w-6 h-6 md:w-7 md:h-7 text-amber-500" />
                        </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="text-base md:text-lg font-black uppercase tracking-tighter text-white truncate">
                                {Array.isArray(order.listing) ? order.listing[0]?.title : order.listing?.title || (Array.isArray(order.request) ? order.request[0]?.title : order.request?.title) || 'Custom Order'}
                              </h4>
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                order.status === 'processing' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              )}>
                                {order.status}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                              <span>Buyer: {Array.isArray(order.buyer) ? order.buyer[0]?.username : order.buyer?.username}</span>
                              <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-800" />
                              <span>{new Date(order.created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                      </div>

                      <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 pt-4 md:border-0 md:pt-0">
                        <div className="text-left md:text-right">
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Total Price</p>
                          <p className="text-xs font-bold text-zinc-400 line-through mb-1">${order.total_price.toFixed(2)}</p>
                          <p className="text-xl font-black text-white">${(order.seller_payout || (order.total_price * 0.95)).toFixed(2)}</p>
                          <p className="text-[8px] font-black text-amber-500/50 uppercase tracking-widest">Net Payout</p>
                        </div>
                        <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-amber-500 group-hover:text-zinc-950 transition-all">
                          <ArrowRight className="w-5 h-5" />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Completed Sales */}
            {completedSales.length > 0 && (
              <section>
                <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-6">
                  Completed Sales ({completedSales.length})
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {completedSales.map((order) => (
                    <Link 
                      key={order.id} 
                      href={`/orders/${order.id}`}
                      className="bg-zinc-900/10 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/20 transition-all opacity-70 hover:opacity-100"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                          <CheckCircle2 className="w-6 h-6 text-zinc-600" />
                        </div>
                        <div>
                          <h4 className="text-md font-black uppercase tracking-tighter text-zinc-300">
                            {Array.isArray(order.listing) ? order.listing[0]?.title : order.listing?.title || (Array.isArray(order.request) ? order.request[0]?.title : order.request?.title) || 'Custom Order'}
                          </h4>
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                            Completed on {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Earned</p>
                        <p className="text-lg font-black text-zinc-400">${(order.seller_payout || (order.total_price * 0.95)).toFixed(2)}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
            <Package className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Sales Yet</h3>
            <p className="text-zinc-500 mb-10 max-w-md mx-auto">You haven&apos;t made any sales yet. Make sure your listings are active and check the marketplace for open requests.</p>
            <Link href="/marketplace/offers" className="px-10 py-5 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
              Browse Requests
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
