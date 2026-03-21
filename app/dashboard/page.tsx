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
  const [stats, setStats] = useState({ listingCount: 0, orderCount: 0, requestCount: 0 });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [userListings, setUserListings] = useState<any[]>([]);
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
          .select('*')
          .eq('buyer_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Fetch user's requests
        const { data: requests } = await supabase
          .from('buyer_requests')
          .select('*')
          .eq('buyer_id', user.id);

        setUserListings(listings || []);
        setRecentOrders(orders || []);
        setStats({
          listingCount: listings?.length || 0,
          orderCount: orders?.length || 0,
          requestCount: requests?.length || 0
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
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <DashboardRevenueChart />
            <DashboardRecentActivity activities={recentOrders} />
          </div>

          <DashboardInventory listings={userListings} />
        </div>
      </div>
    </div>
  );
}
