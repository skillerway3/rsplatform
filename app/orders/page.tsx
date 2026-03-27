'use client';

import * as React from 'react';
import { 
  Package, 
  Search, 
  Filter, 
  ChevronRight, 
  Clock, 
  ShieldCheck, 
  ArrowRight, 
  Zap,
  CheckCircle2,
  AlertCircle,
  Truck,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { motion } from 'motion/react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import Link from 'next/link';

const STATUS_CONFIG = {
  pending: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  completed: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  cancelled: { color: 'text-red-500', bg: 'bg-red-500/10', icon: AlertCircle },
  processing: { color: 'text-blue-500', bg: 'bg-blue-500/10', icon: Truck },
  delivered: { color: 'text-emerald-500', bg: 'bg-emerald-500/10', icon: CheckCircle2 },
  open: { color: 'text-amber-500', bg: 'bg-amber-500/10', icon: Clock },
  closed: { color: 'text-zinc-500', bg: 'bg-zinc-500/10', icon: CheckCircle2 },
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = React.useState('orders');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [orders, setOrders] = React.useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sellingOrders, setSellingOrders] = React.useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch orders where user is buyer
        const { data: ordersData } = await supabase
          .from('orders')
          .select('id, total_price, status, created_at, listing_id, listings(id, title)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch orders where user is seller
        const { data: sellingData } = await supabase
          .from('orders')
          .select('id, total_price, status, created_at, listing_id, listings(id, title)')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });

        // Fetch user's buyer requests
        const { data: requestsData } = await supabase
          .from('buyer_requests')
          .select('id, title, status, created_at')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false });

        setOrders(ordersData || []);
        setSellingOrders(sellingData || []);
        setRequests(requestsData || []);
      } catch (err: unknown) {
        console.error('Error fetching orders/requests:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (authLoading || (user && loading)) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Access Denied</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Please log in to view your history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">

      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4">
              <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Transaction History</div>
              <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Activity</h1>
              <div className="flex items-center space-x-4">
                <div className="h-px w-12 bg-amber-500" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Verified Records</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 bg-zinc-900/50 border border-zinc-800/50 p-1.5 rounded-2xl">
              {[
                { id: 'orders', label: 'Buying' },
                { id: 'selling', label: 'Selling' },
                { id: 'requests', label: 'Requests' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    "px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab.id ? "bg-amber-500 text-zinc-950 shadow-lg shadow-amber-500/20" : "text-zinc-500 hover:text-zinc-100"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          {/* Search & Filter */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search history..."
                className="w-full h-14 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl pl-12 pr-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
              />
            </div>
            <Button variant="ghost" className="h-14 px-8 rounded-2xl border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100">
              <Filter className="w-4 h-4 mr-2" />
              Advanced Filters
            </Button>
          </div>

          {/* List */}
          <div className="space-y-4">
            {activeTab === 'orders' && (
              orders.length === 0 ? (
                <div className="text-center py-32 space-y-8">
                  <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                    <Package className="w-10 h-10 text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">No Orders Found</h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">You haven&apos;t placed any orders yet</p>
                  </div>
                  <Link href="/browse">
                    <Button variant="gold" className="px-10 rounded-xl font-black uppercase tracking-widest text-[10px] h-14">
                      Explore Marketplace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                orders.map((order) => {
                  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Card className="premium-card p-8 group hover:border-zinc-700 transition-all overflow-hidden relative">
                          <div className={cn("absolute top-0 left-0 w-1 h-full", status.color.replace('text-', 'bg-'))} />
                          
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-start space-x-8">
                              <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 shrink-0 relative">
                                <Package className="w-8 h-8 text-zinc-800" />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                  <div className={cn(
                                    "flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                    status.bg, status.color
                                  )}>
                                    <StatusIcon className="w-3 h-3 mr-1.5" />
                                    {order.status}
                                  </div>
                                </div>
                                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight line-clamp-1">
                                  {order.listings?.title || 'Marketplace Order'}
                                </h3>
                                <div className="flex items-center space-x-6 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1.5" /> {formatDate(order.created_at)}</span>
                                  <span className="flex items-center"><Zap className="w-3 h-3 mr-1.5 text-amber-500" /> Instant Delivery</span>
                                  <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1.5 text-emerald-500" /> Escrow Secured</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                              <div className="text-right space-y-1">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Amount</div>
                                <div className="text-2xl font-black text-zinc-100 tracking-tighter">{formatCurrency(order.total_price)}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="gold" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
                                  View Details
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })
              )
            )}

            {activeTab === 'selling' && (
              sellingOrders.length === 0 ? (
                <div className="text-center py-32 space-y-8">
                  <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                    <Package className="w-10 h-10 text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">No Sales Found</h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">You haven&apos;t sold anything yet</p>
                  </div>
                  <Link href="/sell">
                    <Button variant="gold" className="px-10 rounded-xl font-black uppercase tracking-widest text-[10px] h-14">
                      Start Selling
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                sellingOrders.map((order) => {
                  const status = STATUS_CONFIG[order.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link href={`/orders/${order.id}`}>
                        <Card className="premium-card p-8 group hover:border-zinc-700 transition-all overflow-hidden relative">
                          <div className={cn("absolute top-0 left-0 w-1 h-full", status.color.replace('text-', 'bg-'))} />
                          
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-start space-x-8">
                              <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 shrink-0 relative">
                                <Package className="w-8 h-8 text-zinc-800" />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">#{order.id.slice(0, 8)}</span>
                                  <div className={cn(
                                    "flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                    status.bg, status.color
                                  )}>
                                    <StatusIcon className="w-3 h-3 mr-1.5" />
                                    {order.status}
                                  </div>
                                </div>
                                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight line-clamp-1">
                                  {order.listings?.title || 'Marketplace Sale'}
                                </h3>
                                <div className="flex items-center space-x-6 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1.5" /> {formatDate(order.created_at)}</span>
                                  <span className="flex items-center"><Zap className="w-3 h-3 mr-1.5 text-amber-500" /> Sale</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                              <div className="text-right space-y-1">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Total Earnings</div>
                                <div className="text-2xl font-black text-zinc-100 tracking-tighter">{formatCurrency(order.total_price)}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="gold" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
                                  Manage Delivery
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })
              )
            )}

            {activeTab === 'requests' && (
              requests.length === 0 ? (
                <div className="text-center py-32 space-y-8">
                  <div className="w-24 h-24 bg-zinc-900 rounded-[2.5rem] flex items-center justify-center mx-auto border border-white/5">
                    <Zap className="w-10 h-10 text-zinc-800" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-zinc-100 uppercase tracking-tight">No Requests Found</h3>
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">You haven&apos;t posted any requests yet</p>
                  </div>
                  <Link href="/marketplace/submit">
                    <Button variant="gold" className="px-10 rounded-xl font-black uppercase tracking-widest text-[10px] h-14">
                      Submit Request
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              ) : (
                requests.map((request) => {
                  const status = STATUS_CONFIG[request.status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
                  const StatusIcon = status.icon;

                  return (
                    <motion.div
                      key={request.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <Link href={`/orders/${request.id}`}>
                        <Card className="premium-card p-8 group hover:border-zinc-700 transition-all overflow-hidden relative">
                          <div className={cn("absolute top-0 left-0 w-1 h-full", status.color.replace('text-', 'bg-'))} />
                          
                          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                            <div className="flex items-start space-x-8">
                              <div className="w-20 h-20 rounded-2xl bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 shrink-0 relative">
                                <Zap className="w-8 h-8 text-amber-500" />
                              </div>
                              <div className="space-y-3">
                                <div className="flex items-center space-x-3">
                                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">#{request.id.slice(0, 8)}</span>
                                  <div className={cn(
                                    "flex items-center px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest",
                                    status.bg, status.color
                                  )}>
                                    <StatusIcon className="w-3 h-3 mr-1.5" />
                                    {request.status}
                                  </div>
                                </div>
                                <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight line-clamp-1">
                                  {request.title}
                                </h3>
                                <div className="flex items-center space-x-6 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                  <span className="flex items-center"><Clock className="w-3 h-3 mr-1.5" /> {formatDate(request.created_at)}</span>
                                  <span className="flex items-center"><Zap className="w-3 h-3 mr-1.5 text-amber-500" /> {request.game}</span>
                                  <span className="flex items-center"><ShieldCheck className="w-3 h-3 mr-1.5 text-emerald-500" /> {request.category}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between lg:justify-end gap-12 pt-6 lg:pt-0 border-t lg:border-t-0 border-white/5">
                              <div className="text-right space-y-1">
                                <div className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status</div>
                                <div className="text-2xl font-black text-zinc-100 tracking-tighter uppercase">{request.status}</div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="gold" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
                                  Manage Request
                                  <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </Link>
                    </motion.div>
                  );
                })
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
