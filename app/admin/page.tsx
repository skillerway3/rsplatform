'use client';

import React from 'react';
import { 
  Users, 
  ShoppingBag, 
  List, 
  MessageSquare, 
  ShieldCheck, 
  AlertCircle, 
  TrendingUp, 
  CreditCard,
  UserCheck,
  ChevronRight,
  ArrowUpRight,
  Clock,
  Activity,
  Flag,
  AlertTriangle
} from 'lucide-react';
import { motion } from 'motion/react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecentTransaction {
  id: string;
  order_code?: string;
  type: string;
  amount: number;
  created_at: string;
}

interface RecentActivity {
  id: string;
  action: string;
  entity_type: string;
  created_at: string;
}

interface DashboardStats {
  totalUsers: number;
  verifiedSellers: number;
  trustedSellers: number;
  activeListings: number;
  openRequests: number;
  activeOrders: number;
  completedOrders: number;
  disputedOrders: number;
  pendingVerifications: number;
  openSupportThreads: number;
  userReports: number;
  platformIssues: number;
  platformRevenue: number;
  recentTransactions: RecentTransaction[];
  recentActivity: RecentActivity[];
}

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchStats() {
      try {
        const [
          { count: usersCount },
          { count: verifiedSellersCount },
          { count: trustedSellersCount },
          { count: listingsCount },
          { count: requestsCount },
          { count: activeOrdersCount },
          { count: completedOrdersCount },
          { count: disputedOrdersCount },
          { count: verificationsCount },
          { count: supportCount },
          { count: userReportsCount },
          { count: platformIssuesCount },
          { data: revenueData },
          { data: transactions },
          { data: activity }
        ] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact', head: true }),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_verified_seller', true),
          supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_trusted_seller', true),
          supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
          supabase.from('buyer_requests').select('id', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('orders').select('id', { count: 'exact', head: true }).in('status', ['pending', 'processing', 'delivered']),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'disputed'),
          supabase.from('seller_verifications').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('support_threads').select('id', { count: 'exact', head: true }).eq('status', 'open'),
          supabase.from('user_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('platform_reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('total_price').eq('status', 'completed'),
          supabase.from('transaction_logs').select('id, amount, type, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('admin_activity_logs').select('id, action, entity_type, created_at, admin_id').order('created_at', { ascending: false }).limit(5)
        ]);

        const totalRevenue = revenueData?.reduce((acc, curr) => acc + (Number(curr.total_price) * 0.1 || 0), 0) || 0;

        setStats({
          totalUsers: usersCount || 0,
          verifiedSellers: verifiedSellersCount || 0,
          trustedSellers: trustedSellersCount || 0,
          activeListings: listingsCount || 0,
          openRequests: requestsCount || 0,
          activeOrders: activeOrdersCount || 0,
          completedOrders: completedOrdersCount || 0,
          disputedOrders: disputedOrdersCount || 0,
          pendingVerifications: verificationsCount || 0,
          openSupportThreads: supportCount || 0,
          userReports: userReportsCount || 0,
          platformIssues: platformIssuesCount || 0,
          platformRevenue: totalRevenue,
          recentTransactions: (transactions as RecentTransaction[]) || [],
          recentActivity: (activity as RecentActivity[]) || []
        });
      } catch (error: unknown) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { label: 'Verified Sellers', value: stats?.verifiedSellers, icon: UserCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { label: 'Platform Revenue', value: `$${stats?.platformRevenue.toFixed(2)}`, icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/20' },
    { label: 'Active Orders', value: stats?.activeOrders, icon: ShoppingBag, color: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/20' },
    { label: 'Pending Verifications', value: stats?.pendingVerifications, icon: ShieldCheck, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Open Support', value: stats?.openSupportThreads, icon: MessageSquare, color: 'text-sky-500', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
    { label: 'User Reports', value: stats?.userReports, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
    { label: 'Platform Issues', value: stats?.platformIssues, icon: Activity, color: 'text-orange-500', bg: 'bg-orange-500/10', border: 'border-orange-500/20' },
    { label: 'Active Listings', value: stats?.activeListings, icon: List, color: 'text-pink-500', bg: 'bg-pink-500/10', border: 'border-pink-500/20' },
    { label: 'Disputed Orders', value: stats?.disputedOrders, icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Admin Overview</h1>
        <p className="text-zinc-500 text-sm font-medium">Real-time platform performance and operational metrics.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className={cn("p-6 rounded-2xl bg-zinc-900 border flex flex-col space-y-4", stat.border)}
          >
            <div className="flex items-center justify-between">
              <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.bg)}>
                <stat.icon className={cn("w-5 h-5", stat.color)} />
              </div>
              <div className="flex items-center space-x-1 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                <ArrowUpRight className="w-3 h-3" />
                <span>Live</span>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">{stat.label}</p>
              <h3 className="text-2xl font-black text-white tracking-tight">{stat.value}</h3>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Transactions */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-500/10 rounded-lg flex items-center justify-center border border-amber-500/20">
                <CreditCard className="w-4 h-4 text-amber-500" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Recent Transactions</h3>
            </div>
            <Link href="/admin/logs">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/5">View All</Button>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentTransactions.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-xs font-medium">No recent transactions found.</p>
              </div>
            ) : (
              stats?.recentTransactions.map((tx) => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                      <ShoppingBag className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{tx.order_code || 'Order Log'}</p>
                      <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{tx.type.replace(/_/g, ' ')}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-white tracking-tight mb-0.5">${tx.amount?.toFixed(2) || '0.00'}</p>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Admin Activity */}
        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-500/10 rounded-lg flex items-center justify-center border border-purple-500/20">
                <Activity className="w-4 h-4 text-purple-500" />
              </div>
              <h3 className="text-xs font-black text-white uppercase tracking-widest">Admin Activity</h3>
            </div>
            <Link href="/admin/logs">
              <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/5">View All</Button>
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {stats?.recentActivity.length === 0 ? (
              <div className="p-12 text-center">
                <p className="text-zinc-500 text-xs font-medium">No recent admin activity.</p>
              </div>
            ) : (
              stats?.recentActivity.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                      <ShieldCheck className="w-4 h-4 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-white uppercase tracking-widest mb-0.5">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">Target: {log.entity_type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center space-x-1 text-[9px] font-medium text-zinc-500 uppercase tracking-widest mb-0.5">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(log.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          { label: 'Moderate Listings', href: '/admin/listings', icon: List },
          { label: 'Review Verifications', href: '/admin/verifications', icon: UserCheck },
          { label: 'Support Threads', href: '/admin/support/threads', icon: MessageSquare },
          { label: 'User Reports', href: '/admin/reports', icon: Flag },
          { label: 'Platform Issues', href: '/admin/support', icon: AlertTriangle },
          { label: 'Dispute Center', href: '/admin/disputes', icon: AlertCircle },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <button className="w-full p-4 bg-zinc-900 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                  <link.icon className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-black text-white uppercase tracking-widest">{link.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
