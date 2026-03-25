'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  MessageSquare,
  Zap,
  Loader2,
  Package,
  ExternalLink,
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Order {
  id: string;
  total_price: number;
  status: string;
  created_at: string;
  seller: {
    username: string;
    avatar_url: string;
  };
  listing?: {
    id: string;
    title: string;
    category: string;
    images: string[];
  };
  request?: {
    id: string;
    title: string;
    category: string;
  };
}

export default function BuyerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          seller:profiles!seller_id(username, avatar_url),
          listing:listings(id, title, category, images),
          request:buyer_requests(id, title, category)
        `)
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message);
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
    fetchOrders();
  }, [user, authLoading, fetchOrders, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const activeOrders = orders.filter(o => ['pending', 'accepted', 'processing', 'delivered'].includes(o.status));
  const completedOrders = orders.filter(o => ['completed', 'resolved', 'cancelled'].includes(o.status));

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950 relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-2">My <span className="text-amber-500">Orders</span></h1>
              <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px]">Track your purchases and manage active transactions</p>
            </div>
          </div>

          {orders.length > 0 ? (
            <div className="space-y-12">
              {/* Active Orders */}
              {activeOrders.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-6 flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Active Orders ({activeOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {activeOrders.map((order) => (
                      <Link 
                        key={order.id} 
                        href={`/orders/${order.id}`}
                        className="group bg-zinc-900/30 border border-white/5 rounded-3xl p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/50 hover:border-amber-500/20 transition-all duration-500"
                      >
                        <div className="flex items-center gap-4 md:gap-6">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 shrink-0 group-hover:scale-110 transition-transform duration-500">
                            {order.listing?.images?.[0] ? (
                              <Image 
                                src={order.listing.images[0]} 
                                alt={order.listing.title} 
                                fill 
                                className="object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="w-6 h-6 text-zinc-800" />
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <h4 className="text-base md:text-lg font-black uppercase tracking-tighter text-white truncate">
                                {order.listing?.title || order.request?.title || 'Custom Order'}
                              </h4>
                              <div className={cn(
                                "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                order.status === 'pending' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                order.status === 'delivered' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" :
                                "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              )}>
                                {order.status}
                              </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[9px] md:text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                              <span>Seller: {order.seller.username}</span>
                              <span className="hidden sm:inline w-1 h-1 rounded-full bg-zinc-800" />
                              <span>{formatDate(order.created_at)}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-6 border-t border-white/5 pt-4 md:border-0 md:pt-0">
                          <div className="text-left md:text-right">
                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Price Paid</p>
                            <p className="text-xl font-black text-white">{formatCurrency(order.total_price)}</p>
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

              {/* Completed Orders */}
              {completedOrders.length > 0 && (
                <section>
                  <h3 className="text-xs font-black uppercase tracking-[0.4em] text-zinc-500 mb-6">
                    Order History ({completedOrders.length})
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {completedOrders.map((order) => (
                      <Link 
                        key={order.id} 
                        href={`/orders/${order.id}`}
                        className="bg-zinc-900/10 border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-zinc-900/20 transition-all opacity-70 hover:opacity-100"
                      >
                        <div className="flex items-center gap-6">
                          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                            {order.status === 'completed' ? (
                              <CheckCircle2 className="w-6 h-6 text-zinc-600" />
                            ) : (
                              <XCircle className="w-6 h-6 text-red-500/50" />
                            )}
                          </div>
                          <div>
                            <h4 className="text-md font-black uppercase tracking-tighter text-zinc-300">
                              {order.listing?.title || order.request?.title || 'Custom Order'}
                            </h4>
                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mt-1">
                              {order.status === 'completed' ? 'Completed' : 'Cancelled'} on {formatDate(order.created_at)}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Amount</p>
                          <p className="text-lg font-black text-zinc-400">{formatCurrency(order.total_price)}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          ) : (
            <div className="text-center py-32 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/10">
              <ShoppingBag className="w-16 h-16 text-zinc-800 mx-auto mb-6" />
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">No Orders Found</h3>
              <p className="text-zinc-500 mb-10 max-w-md mx-auto">You haven&apos;t purchased anything yet. Explore the marketplace to find the best deals on RS items and services.</p>
              <Link href="/marketplace" className="px-10 py-5 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-2xl hover:bg-amber-400 transition-all shadow-xl shadow-amber-500/20">
                Start Shopping
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
