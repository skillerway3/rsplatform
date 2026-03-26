'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardRevenueChart } from '@/components/dashboard/DashboardRevenueChart';
import { DashboardRecentActivity } from '@/components/dashboard/DashboardRecentActivity';
import { DashboardInventory } from '@/components/dashboard/DashboardInventory';
import { Loader2, ChevronRight, Plus, Zap, DollarSign, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();
  const [stats, setStats] = useState({ 
    listingCount: 0, 
    orderCount: 0, 
    requestCount: 0, 
    totalRevenue: 0,
    pendingOrders: 0,
    unreadMessages: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
  const [revenueData, setRevenueData] = useState<{ name: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use authProfile if available, otherwise fetch once
        let currentProfile = authProfile;
        if (!currentProfile) {
          const { data: pData, error: pError } = await supabase
            .from('profiles')
            .select('id, username, is_verified_seller, is_trusted_seller')
            .eq('id', user.id)
            .single();
          if (pError) throw pError;
          currentProfile = pData;
        }
        setProfile(currentProfile);

        // Parallelize fetches for better performance
        // Simplified queries to avoid overfetching and complex joins
        const [
          { data: listings, error: lErr },
          { data: orders, error: oErr },
          { data: sales, error: sErr },
          { data: requests, error: rErr }
        ] = await Promise.all([
          supabase.from('listings').select('id, title, price, status').eq('seller_id', user.id),
          supabase.from('orders').select('id, total_price, created_at, status, listing_id').eq('buyer_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('orders').select('id, total_price, created_at, status, listing_id').eq('seller_id', user.id).order('created_at', { ascending: false }).limit(5),
          supabase.from('buyer_requests').select('id').eq('buyer_id', user.id)
        ]);
        
        if (lErr || oErr || sErr || rErr) {
          throw new Error('Failed to fetch dashboard statistics');
        }

        setUserListings(listings || []);

        // Fetch listing titles separately to avoid nested joins if needed, 
        // but for dashboard recent activity, we can just use the IDs or fetch titles in a second step
        const listingIds = Array.from(new Set([
          ...(orders || []).map(o => o.listing_id),
          ...(sales || []).map(s => s.listing_id)
        ].filter(Boolean)));

        let listingTitles: Record<string, string> = {};
        if (listingIds.length > 0) {
          const { data: titles } = await supabase
            .from('listings')
            .select('id, title')
            .in('id', listingIds);
          
          titles?.forEach(t => {
            listingTitles[t.id] = t.title;
          });
        }

        const completedSales = sales?.filter(s => s.status === 'completed') || [];
        const pendingSales = sales?.filter(s => s.status === 'pending' || s.status === 'processing').length || 0;

        // Merge and sort activities
        const allActivities = [
          ...(orders || []).map((order: any) => ({
            id: order.id,
            createdAt: order.created_at,
            type: 'purchase' as const,
            amount: order.total_price,
            title: listingTitles[order.listing_id] || 'Purchase'
          })),
          ...(sales || []).map((sale: any) => ({
            id: sale.id,
            createdAt: sale.created_at,
            type: 'sale' as const,
            amount: sale.total_price,
            title: listingTitles[sale.listing_id] || 'Sale'
          }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

        setRecentOrders(allActivities);
        
        const totalRev = completedSales.reduce((acc, sale) => acc + (sale.total_price || 0), 0) || 0;
        
        // Process revenue data for the last 7 days
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return {
            name: days[d.getDay()],
            date: d.toISOString().split('T')[0],
            value: 0
          };
        });

        completedSales.forEach(sale => {
          const saleDate = new Date(sale.created_at).toISOString().split('T')[0];
          const dayIndex = last7Days.findIndex(d => d.date === saleDate);
          if (dayIndex !== -1) {
            last7Days[dayIndex].value += sale.total_price || 0;
          }
        });

        setRevenueData(last7Days.map(({ name, value }) => ({ name, value })));

        setStats({
          listingCount: listings?.length || 0,
          orderCount: orders?.length || 0,
          requestCount: requests?.length || 0,
          totalRevenue: totalRev,
          pendingOrders: pendingSales,
          unreadMessages: 0
        });
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, authLoading, authProfile]);

  if (authLoading || (user && loading)) {
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
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Dashboard Error</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Access Denied</h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows - Simplified for performance */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <DashboardHeader 
            username={profile?.username || 'Member'} 
            isVerified={profile?.is_verified_seller}
            isTrusted={profile?.is_trusted_seller}
          />
          
          <DashboardStats 
            listingCount={stats.listingCount} 
            orderCount={stats.orderCount} 
            totalRevenue={stats.totalRevenue}
            pendingOrders={stats.pendingOrders}
            unreadMessages={stats.unreadMessages}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <DashboardRevenueChart data={revenueData} />
              <DashboardRecentActivity activities={recentOrders} />
            </div>
            
            <div className="space-y-8">
              {/* Quick Actions */}
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Link href="/marketplace/submit" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">New Request</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  </Link>
                  <Link href="/dashboard/requests" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">My Requests</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  </Link>
                  <Link href="/dashboard/sales" className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">My Sales</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  </Link>
                </div>
              </div>

              <DashboardInventory listings={userListings} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
