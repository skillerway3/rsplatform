'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { DashboardStats } from '@/components/dashboard/DashboardStats';
import { DashboardRevenueChart } from '@/components/dashboard/DashboardRevenueChart';
import { DashboardRecentActivity } from '@/components/dashboard/DashboardRecentActivity';
import { DashboardInventory } from '@/components/dashboard/DashboardInventory';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
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

  useEffect(() => {
    if (!user) return;

    const fetchDashboardData = async () => {
      try {
        // Fetch user's listings (if they are a seller)
        const { data: listings } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', user.id);
        
        // Fetch user's orders (as buyer)
        const { data: orders } = await supabase
          .from('orders')
          .select('*, listings(*)')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        // Fetch user's sales (as seller) for revenue and pending count
        const { data: sales } = await supabase
          .from('orders')
          .select('*, listings(*)')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        const completedSales = sales?.filter(s => s.status === 'completed') || [];
        const pendingSales = sales?.filter(s => s.status === 'pending' || s.status === 'processing').length || 0;

        // Merge and sort activities
        const allActivities = [
          ...(orders || []).map((order: any) => ({
            id: order.id,
            createdAt: order.created_at,
            type: 'purchase' as const,
            amount: order.total_price,
            title: order.listings?.title || 'Purchase'
          })),
          ...(sales || []).map((sale: any) => ({
            id: sale.id,
            createdAt: sale.created_at,
            type: 'sale' as const,
            amount: sale.total_price,
            title: sale.listings?.title || 'Sale'
          }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5);

        setRecentOrders(allActivities);
        
        // Fetch user's requests
        const { data: requests } = await supabase
          .from('buyer_requests')
          .select('*')
          .eq('buyer_id', user.id);

        setUserListings(listings || []);
        
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
          unreadMessages: 0 // Feature not fully implemented yet
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
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
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Please log in to view your dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <DashboardHeader username={user.email?.split('@')[0] || 'User'} />
          
          <DashboardStats 
            listingCount={stats.listingCount} 
            orderCount={stats.orderCount} 
            totalRevenue={stats.totalRevenue}
            pendingOrders={stats.pendingOrders}
            unreadMessages={stats.unreadMessages}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DashboardRevenueChart data={revenueData} />
            <DashboardRecentActivity activities={recentOrders} />
          </div>

          <DashboardInventory listings={userListings} />
        </div>
      </div>
    </div>
  );
}
