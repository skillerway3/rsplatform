"use client";

import { logSupabaseError } from '@/lib/error-utils';

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/components/auth/AuthProvider";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardRevenueChart } from "@/components/dashboard/DashboardRevenueChart";
import { DashboardRecentActivity } from "@/components/dashboard/DashboardRecentActivity";
import { DashboardInventory } from "@/components/dashboard/DashboardInventory";
import {
  Loader2,
  ChevronRight,
  Plus,
  Zap,
  DollarSign,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";

interface DashboardStatsData {
  listingCount: number;
  orderCount: number;
  requestCount: number;
  totalRevenue: number;
  pendingOrders: number;
  unreadMessages: number;
}

interface Activity {
  id: string;
  createdAt: string;
  type: "purchase" | "sale";
  amount: number;
  title: string;
}

interface ListingSummary {
  id: string;
  title: string;
  price: number;
  status: string;
  gameId: string;
}

interface DashboardProfile {
  id: string;
  username: string | null;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
}

interface ListingRow {
  id: string;
  title: string | null;
  price: number | null;
  status: string | null;
  game: string | null;
}

interface OrderRow {
  id: string;
  total_price?: number | null;
  amount?: number | null;
  created_at: string;
  status: string | null;
  listing_id: string | null;
}

interface RequestRow {
  id: string;
}

interface ListingTitleRow {
  id: string;
  title: string | null;
}

function normalizeDashboardProfile(value: unknown): DashboardProfile | null {
  if (!value || typeof value !== "object") return null;

  const source = value as Record<string, unknown>;

  if (typeof source.id !== "string") return null;

  return {
    id: source.id,
    username: typeof source.username === "string" ? source.username : null,
    is_verified_seller: Boolean(source.is_verified_seller),
    is_trusted_seller: Boolean(source.is_trusted_seller),
  };
}

export default function DashboardPage() {
  const { user, profile: authProfile, loading: authLoading } = useAuth();

  const [stats, setStats] = useState<DashboardStatsData>({
    listingCount: 0,
    orderCount: 0,
    requestCount: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    unreadMessages: 0,
  });
  const [recentOrders, setRecentOrders] = useState<Activity[]>([]);
  const [userListings, setUserListings] = useState<ListingSummary[]>([]);
  const [revenueData, setRevenueData] = useState<
    { name: string; value: number }[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('[DashboardPage] useEffect triggered:', { authLoading, userId: user?.id, authProfileId: authProfile?.id });
    
    if (authLoading) return;

    if (!user) {
      console.log('[DashboardPage] No user, stopping loading');
      setLoading(false);
      return;
    }

    const fetchDashboardData = async (): Promise<void> => {
      console.log('[DashboardPage] Fetching dashboard data...');
      try {
        setLoading(true);
        setError(null);

        let currentProfile: DashboardProfile | null =
          normalizeDashboardProfile(authProfile);

        if (!currentProfile) {
          console.log('[DashboardPage] Profile not in AuthProvider, fetching manually...');
          const { data: pData, error: pError } = await supabase
            .from("profiles")
            .select("id, username, is_verified_seller, is_trusted_seller")
            .eq("id", user.id)
            .maybeSingle();

          if (pError) throw pError;

          if (!pData) {
            throw new Error("Profile not found");
          }

          currentProfile = normalizeDashboardProfile(pData);
        }

        setProfile(currentProfile);
        console.log('[DashboardPage] Profile loaded:', currentProfile?.username);

        const [
          { data: listings, error: lErr },
          { data: orders, error: oErr },
          { data: sales, error: sErr },
          { data: requests, error: rErr },
        ] = await Promise.all([
          supabase
            .from("listings")
            .select("id, title, price, status, game")
            .eq("seller_id", user.id),
          supabase
            .from("orders")
            .select("*")
            .eq("buyer_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("orders")
            .select("*")
            .eq("seller_id", user.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase.from("buyer_requests").select("id").eq("buyer_id", user.id),
        ]);

        if (lErr) console.error("[DashboardPage] Listings fetch error:", lErr);
        if (oErr) console.error("[DashboardPage] Orders fetch error:", oErr);
        if (sErr) console.error("[DashboardPage] Sales fetch error:", sErr);
        if (rErr) console.error("[DashboardPage] Requests fetch error:", rErr);

        if (lErr || oErr || sErr || rErr) {
          const firstErr = lErr || oErr || sErr || rErr;
          throw firstErr;
        }

        const safeListings = ((listings ?? []) as ListingRow[]).map(
          (listing) => ({
            id: listing.id,
            title: listing.title ?? "Untitled Listing",
            price: Number(listing.price ?? 0),
            status: listing.status ?? "unknown",
            gameId: listing.game ?? "unknown",
          })
        );

        setUserListings(safeListings);

        const safeOrders = (orders ?? []) as OrderRow[];
        const safeSales = (sales ?? []) as OrderRow[];
        const safeRequests = (requests ?? []) as RequestRow[];

        const listingIds = Array.from(
          new Set(
            [...safeOrders, ...safeSales]
              .map((row) => row.listing_id)
              .filter((id): id is string => typeof id === "string" && id.length > 0)
          )
        );

        const listingTitles: Record<string, string> = {};

        if (listingIds.length > 0) {
          const { data: titles, error: titlesError } = await supabase
            .from("listings")
            .select("id, title")
            .in("id", listingIds);

          if (titlesError) throw titlesError;

          (titles ?? []).forEach((row) => {
            const titleRow = row as ListingTitleRow;
            listingTitles[titleRow.id] = titleRow.title ?? "Listing";
          });
        }

        const completedSales = safeSales.filter(
          (sale) => sale.status === "completed"
        );

        const pendingSales = safeSales.filter(
          (sale) => sale.status === "pending" || sale.status === "processing"
        ).length;

        const allActivities: Activity[] = [
          ...safeOrders.map((order) => ({
            id: order.id,
            createdAt: order.created_at,
            type: "purchase" as const,
            amount: Number(order.total_price || order.amount || 0),
            title:
              (order.listing_id && listingTitles[order.listing_id]) || "Purchase",
          })),
          ...safeSales.map((sale) => ({
            id: sale.id,
            createdAt: sale.created_at,
            type: "sale" as const,
            amount: Number(sale.total_price || sale.amount || 0),
            title: (sale.listing_id && listingTitles[sale.listing_id]) || "Sale",
          })),
        ]
          .sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setRecentOrders(allActivities);

        const totalRev = completedSales.reduce(
          (acc, sale) => acc + Number(sale.total_price || sale.amount || 0),
          0
        );

        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));

          return {
            name: days[date.getDay()],
            date: date.toISOString().split("T")[0],
            value: 0,
          };
        });

        completedSales.forEach((sale) => {
          const saleDate = new Date(sale.created_at).toISOString().split("T")[0];
          const dayIndex = last7Days.findIndex((day) => day.date === saleDate);

          if (dayIndex !== -1) {
            last7Days[dayIndex].value += Number(sale.total_price || sale.amount || 0);
          }
        });

        setRevenueData(last7Days.map(({ name, value }) => ({ name, value })));

        setStats({
          listingCount: safeListings.length,
          orderCount: safeOrders.length,
          requestCount: safeRequests.length,
          totalRevenue: totalRev,
          pendingOrders: pendingSales,
          unreadMessages: 0,
        });
      } catch (err: unknown) {
        const msg = logSupabaseError('fetchDashboardData', err);
        setError(msg);
      } finally {
        setLoading(false);
      }
    };

    void fetchDashboardData();
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
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            Dashboard Error
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            {error}
          </p>
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
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">
            Access Denied
          </h1>
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
            Please log in to view your dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-5%] left-[-5%] w-[20%] h-[20%] bg-amber-500/5 rounded-full blur-[60px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-7xl mx-auto space-y-16">
          <DashboardHeader
            username={profile?.username || "Member"}
            isVerified={Boolean(profile?.is_verified_seller)}
            isTrusted={Boolean(profile?.is_trusted_seller)}
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
              <div className="bg-zinc-900/40 border border-zinc-800/50 rounded-[2rem] p-8">
                <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] mb-6">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <Link
                    href="/marketplace/submit"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-5 h-5 text-amber-500" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        New Request
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/requests"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Zap className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        My Requests
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                  </Link>

                  <Link
                    href="/dashboard/sales"
                    className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:border-amber-500/20 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                        <DollarSign className="w-5 h-5 text-zinc-400" />
                      </div>
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">
                        My Sales
                      </span>
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