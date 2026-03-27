'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  AlertCircle, 
  Star, 
  TrendingUp, 
  ShoppingBag, 
  List, 
  MessageSquare, 
  History, 
  ArrowLeft, 
  ShieldAlert, 
  Ban, 
  CheckCircle, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import Image from 'next/image';
import { cn, formatCurrency } from '@/lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  full_name: string | null;
  is_suspended: boolean;
  suspension_reason: string | null;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
  manual_trusted_override: boolean;
  role: string;
  balance: number;
  total_earned: number;
  average_rating: number;
  review_count: number;
  created_at: string;
  username_updated_at: string | null;
  moderation_notes: string | null;
}

interface Review {
  id: string;
  seller_id: string;
  buyer_id: string;
  rating: number;
  review_text: string;
  created_at: string;
}

interface AdminLog {
  id: string;
  admin_id: string;
  target_id: string;
  target_type: string;
  action_type: string;
  old_value: unknown;
  new_value: unknown;
  created_at: string;
  admin?: {
    username: string;
  };
}

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface UserStats {
  listingsCount: number;
  ordersAsBuyerCount: number;
  ordersAsSellerCount: number;
  requestsCount: number;
  offersCount: number;
  reviews: Review[];
  logs: AdminLog[];
  transactions: Transaction[];
}

export default function AdminUserDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [user, setUser] = React.useState<Profile | null>(null);
  const [stats, setStats] = React.useState<UserStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isUpdating, setIsUpdating] = React.useState(false);
  const [confirmAction, setConfirmAction] = React.useState<{ type: string; label: string } | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    async function fetchUserDetail() {
      if (!id) return;
      try {
        const [
          { data: profile, error: profileError },
          { count: listingsCount },
          { count: ordersAsBuyerCount },
          { count: ordersAsSellerCount },
          { count: requestsCount },
          { count: offersCount },
          { data: reviews },
          { data: logs },
          { data: transactions }
        ] = await Promise.all([
          supabase.from('profiles').select('id, username, full_name, avatar_url, is_verified_seller, is_trusted_seller, manual_trusted_override, average_rating, review_count, created_at, role').eq('id', id).single(),
          supabase.from('listings').select('id', { count: 'exact', head: true }).eq('seller_id', id),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('buyer_id', id),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('seller_id', id),
          supabase.from('buyer_requests').select('id', { count: 'exact', head: true }).eq('buyer_id', id),
          supabase.from('buyer_request_offers').select('id', { count: 'exact', head: true }).eq('seller_id', id),
          supabase.from('seller_reviews').select('id, seller_id, buyer_id, rating, review_text, created_at, order_id').eq('seller_id', id).order('created_at', { ascending: false }).limit(5),
          supabase.from('admin_activity_logs').select('*, admin:profiles!admin_activity_logs_admin_id_fkey(username)').eq('target_id', id).order('created_at', { ascending: false }).limit(10),
          supabase.from('wallet_transactions').select('id, user_id, amount, type, status, created_at').eq('user_id', id).order('created_at', { ascending: false }).limit(5)
        ]);

        if (profileError) throw profileError;

        setUser(profile as Profile);
        setStats({
          listingsCount: listingsCount || 0,
          ordersAsBuyerCount: ordersAsBuyerCount || 0,
          ordersAsSellerCount: ordersAsSellerCount || 0,
          requestsCount: requestsCount || 0,
          offersCount: offersCount || 0,
          reviews: reviews || [],
          logs: logs || [],
          transactions: transactions || []
        });
      } catch (error: unknown) {
        console.error('Error fetching user detail:', error);
        router.push('/admin/users');
      } finally {
        setLoading(false);
      }
    }

    fetchUserDetail();
  }, [id, router]);

  const handleUpdateStatus = async (updates: Partial<Profile>) => {
    if (!user) return;
    const supabase = createClient();
    setIsUpdating(true);
    try {
      const { error } = await supabase.from('profiles').update(updates).eq('id', id);
      if (error) throw error;
      
      // Log the action
      const { data: { user: adminUser } } = await supabase.auth.getUser();
      await supabase.from('admin_activity_logs').insert({
        admin_id: adminUser?.id,
        target_id: id,
        target_type: 'user',
        action_type: updates.is_suspended !== undefined ? (updates.is_suspended ? 'user_suspended' : 'user_unsuspended') : 'user_updated',
        old_value: user,
        new_value: { ...user, ...updates }
      });

      setUser({ ...user, ...updates } as Profile);
      setConfirmAction(null);
    } catch (error: unknown) {
      console.error('Error updating user:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading || !user || !stats) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center space-x-6">
          <Link href="/admin/users">
            <button className="p-3 bg-zinc-900/50 border border-white/5 rounded-2xl text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all group">
              <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            </button>
          </Link>
          <div className="flex flex-col space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white uppercase tracking-tighter">User Management</h1>
              {user.is_suspended && (
                <Badge variant="destructive" className="rounded-lg text-[10px] font-black uppercase tracking-widest px-2 py-0.5 animate-pulse">
                  Suspended
                </Badge>
              )}
            </div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <span className="bg-zinc-900 px-2 py-0.5 rounded border border-white/5">ID: {user.id}</span>
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {user.is_suspended ? (
            <Button 
              variant="outline" 
              className="rounded-xl border-emerald-500/20 text-emerald-500 hover:bg-emerald-500/10 h-11"
              onClick={() => setConfirmAction({ type: 'unsuspend', label: 'Unsuspend User' })}
              disabled={isUpdating}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Unsuspend
            </Button>
          ) : (
            <Button 
              variant="outline" 
              className="rounded-xl border-red-500/20 text-red-500 hover:bg-red-500/10 h-11"
              onClick={() => setConfirmAction({ type: 'suspend', label: 'Suspend User' })}
              disabled={isUpdating}
            >
              <Ban className="w-4 h-4 mr-2" />
              Suspend
            </Button>
          )}
          
          <Button 
            variant="outline" 
            className={cn(
              "rounded-xl border-white/5 h-11",
              user.role === 'admin' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "text-zinc-400"
            )}
            onClick={() => setConfirmAction({ type: 'role', label: user.role === 'admin' ? 'Revoke Admin' : 'Make Admin' })}
            disabled={isUpdating}
          >
            <ShieldAlert className="w-4 h-4 mr-2" />
            {user.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
          </Button>

          <Button 
            variant="outline" 
            className={cn(
              "rounded-xl border-white/5 h-11",
              user.manual_trusted_override ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "text-zinc-400"
            )}
            onClick={() => handleUpdateStatus({ manual_trusted_override: !user.manual_trusted_override })}
            disabled={isUpdating}
          >
            <Star className={cn("w-4 h-4 mr-2", user.manual_trusted_override && "fill-amber-500")} />
            {user.manual_trusted_override ? 'Revoke Trust' : 'Grant Trust'}
          </Button>
        </div>
      </div>

      {/* Confirmation Overlay */}
      <AnimatePresence>
        {confirmAction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setConfirmAction(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative bg-zinc-900 border border-white/10 rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl"
            >
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 border border-amber-500/20">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Confirm Action</h3>
              <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">
                Are you sure you want to perform the action: <span className="text-white font-bold">&quot;{confirmAction.label}&quot;</span> on user <span className="text-white font-bold">{user.username}</span>? This action will be logged in the audit trail.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="rounded-2xl h-14" onClick={() => setConfirmAction(null)}>Cancel</Button>
                <Button 
                  variant="gold" 
                  className="rounded-2xl h-14" 
                  onClick={() => {
                    if (confirmAction.type === 'suspend') handleUpdateStatus({ is_suspended: true, suspension_reason: 'Administrative action' });
                    if (confirmAction.type === 'unsuspend') handleUpdateStatus({ is_suspended: false, suspension_reason: null });
                    if (confirmAction.type === 'role') handleUpdateStatus({ role: user.role === 'admin' ? 'user' : 'admin' });
                  }}
                >
                  Confirm
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Profile & Wallet */}
        <div className="lg:col-span-4 space-y-8">
          {/* Profile Card */}
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 flex flex-col items-center text-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="relative w-32 h-32 rounded-[2rem] overflow-hidden border-2 border-white/10 bg-zinc-950 mb-8 shadow-2xl">
              <Image 
                src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                alt={user.username}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">{user.username}</h2>
              <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mb-8">{user.full_name || 'Anonymous User'}</p>
              
              <div className="flex flex-wrap justify-center gap-2 mb-10">
                {user.role === 'admin' && (
                  <Badge className="bg-purple-500/10 text-purple-500 border-purple-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest px-3 py-1">Admin</Badge>
                )}
                {user.is_verified_seller && (
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest px-3 py-1">Verified</Badge>
                )}
                {user.is_trusted_seller && (
                  <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 rounded-lg text-[8px] font-black uppercase tracking-widest px-3 py-1">Trusted</Badge>
                )}
              </div>

              <div className="w-full grid grid-cols-2 gap-8 py-8 border-y border-white/5">
                <div className="text-center">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Reputation</p>
                  <div className="flex items-center justify-center space-x-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className="text-xl font-black text-white tracking-tighter">{user.average_rating || 0}</span>
                  </div>
                </div>
                <div className="text-center border-l border-white/5">
                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-2">Reviews</p>
                  <span className="text-xl font-black text-white tracking-tighter">{user.review_count || 0}</span>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Member Since</span>
                  <span className="text-zinc-300">{new Date(user.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                  <span className="text-zinc-500">Last Activity</span>
                  <span className="text-zinc-300">{new Date(user.username_updated_at || user.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Wallet Card */}
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Wallet className="w-24 h-24 text-white" />
            </div>
            
            <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-8">Financial Overview</h3>
            
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Available Balance</p>
                <h4 className="text-4xl font-black text-emerald-500 tracking-tighter">{formatCurrency(user.balance || 0)}</h4>
              </div>
              
              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
                <div>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Escrow Active</p>
                  <p className="text-lg font-black text-amber-500 tracking-tighter">{formatCurrency(0)}</p>
                </div>
                <div className="border-l border-white/5 pl-6">
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2">Total Earned</p>
                  <p className="text-lg font-black text-white tracking-tighter">{formatCurrency(user.total_earned || 0)}</p>
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-4">
                <h5 className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">Recent Transactions</h5>
                {stats.transactions.length === 0 ? (
                  <p className="text-[10px] text-zinc-500 italic">No recent transactions</p>
                ) : (
                  <div className="space-y-3">
                    {stats.transactions.map((tx) => (
                      <div key={tx.id} className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center",
                            tx.type === 'deposit' || tx.type === 'sale_proceeds' ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                          )}>
                            {tx.type === 'deposit' || tx.type === 'sale_proceeds' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                          </div>
                          <div>
                            <p className="text-[9px] font-black text-white uppercase tracking-widest">{tx.type.replace(/_/g, ' ')}</p>
                            <p className="text-[8px] text-zinc-500 uppercase font-bold">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "text-xs font-black tracking-tighter",
                          tx.type === 'deposit' || tx.type === 'sale_proceeds' ? "text-emerald-500" : "text-red-500"
                        )}>
                          {tx.type === 'deposit' || tx.type === 'sale_proceeds' ? '+' : '-'}{formatCurrency(tx.amount)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Detailed Stats & Logs */}
        <div className="lg:col-span-8 space-y-8">
          {/* Stats Bento Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { label: 'Inventory', value: stats.listingsCount, icon: List, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Purchases', value: stats.ordersAsBuyerCount, icon: ShoppingBag, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Sales', value: stats.ordersAsSellerCount, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
              { label: 'Requests', value: stats.requestsCount, icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-500/10' },
            ].map((stat) => (
              <div key={stat.label} className="bg-zinc-900 border border-white/5 rounded-[2rem] p-8 flex flex-col items-center text-center group hover:border-white/10 transition-all">
                <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110", stat.bg)}>
                  <stat.icon className={cn("w-6 h-6", stat.color)} />
                </div>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">{stat.label}</p>
                <h4 className="text-3xl font-black text-white tracking-tighter">{stat.value}</h4>
              </div>
            ))}
          </div>

          {/* Moderation & Notes */}
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/30">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20">
                  <ShieldAlert className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Moderation Center</h3>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Admin-only internal notes</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="h-10 rounded-xl text-[10px] font-black uppercase tracking-widest border-white/10 hover:bg-white/5"
                onClick={() => {
                  const note = prompt('Enter moderation note:', user.moderation_notes || '');
                  if (note !== null) handleUpdateStatus({ moderation_notes: note });
                }}
              >
                Update Notes
              </Button>
            </div>
            <div className="p-8">
              {user.moderation_notes ? (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-amber-500 rounded-full" />
                  <p className="text-zinc-300 text-sm font-medium leading-relaxed bg-zinc-950/50 p-6 rounded-2xl border border-white/5">
                    {user.moderation_notes}
                  </p>
                </div>
              ) : (
                <div className="text-center py-10 bg-zinc-950/20 rounded-3xl border border-dashed border-white/5">
                  <p className="text-zinc-500 text-xs font-medium italic uppercase tracking-widest">No active moderation notes for this profile.</p>
                </div>
              )}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="bg-zinc-900 border border-white/5 rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-zinc-950/30">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                  <History className="w-5 h-5 text-zinc-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Administrative Audit Trail</h3>
                  <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Logging all platform actions</p>
                </div>
              </div>
            </div>
            <div className="divide-y divide-white/5">
              {stats.logs.length === 0 ? (
                <div className="p-20 text-center">
                  <p className="text-zinc-500 text-xs font-black uppercase tracking-widest">No administrative actions recorded.</p>
                </div>
              ) : (
                stats.logs.map((log) => (
                  <div key={log.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-colors group">
                    <div className="flex items-center space-x-6">
                      <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 transition-colors">
                        <ShieldCheck className="w-5 h-5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                      </div>
                      <div>
                        <p className="text-xs font-black text-white uppercase tracking-widest mb-1">{log.action_type.replace(/_/g, ' ')}</p>
                        <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                          By Admin: <span className="text-zinc-300">{log.admin?.username || log.admin_id.substr(0, 8)}</span>
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                      <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest mt-1">{new Date(log.created_at).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
