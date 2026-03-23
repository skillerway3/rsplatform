'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Filter, 
  Clock, 
  DollarSign, 
  ChevronRight, 
  ShieldCheck, 
  AlertCircle,
  CheckCircle2,
  XCircle,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';

interface BuyerRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  game: string;
  budget_min: number;
  budget_max: number;
  created_at: string;
  expires_at: string;
  buyer: {
    username: string;
    avatar_url: string;
  };
  offers_count: number;
}

export default function SellerOffersPage() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<BuyerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isVerified, setIsVerified] = useState(false);

  const checkVerification = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('is_verified_seller')
      .eq('id', user.id)
      .single();
    setIsVerified(data?.is_verified_seller || false);
  }, [user]);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('buyer_requests')
        .select(`
          *,
          buyer:profiles!buyer_id(username, avatar_url),
          offers:buyer_request_offers(count)
        `)
        .eq('status', 'open')
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedData = data.map((req: any) => ({
        ...req,
        offers_count: req.offers[0]?.count || 0
      }));

      setRequests(formattedData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkVerification();
    fetchRequests();
  }, [checkVerification, fetchRequests]);

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         req.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (!user) {
    return (
      <div className="min-h-screen pt-32 pb-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-tighter mb-4">Please Sign In</h1>
          <p className="text-zinc-400 mb-8">You need to be logged in to view marketplace requests.</p>
          <Link href="/auth/login" className="px-8 py-4 bg-amber-500 text-zinc-950 font-black uppercase tracking-widest rounded-xl hover:bg-amber-400 transition-all">
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center">
                <Search className="text-amber-500 w-6 h-6" />
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter">Marketplace <span className="text-amber-500">Requests</span></h1>
            </div>
            <p className="text-zinc-400 max-w-2xl">
              Browse open requests from buyers and submit your best offers. Filter by category or search for specific items and services.
            </p>
          </div>

          {!isVerified && (
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-6 flex items-start space-x-4 max-w-md">
              <AlertCircle className="text-amber-500 w-6 h-6 shrink-0 mt-1" />
              <div>
                <h3 className="text-sm font-black uppercase tracking-widest text-amber-500 mb-1">Verification Required</h3>
                <p className="text-xs text-zinc-400 leading-relaxed mb-4">
                  Only verified sellers can submit offers. Complete your verification to start earning.
                </p>
                <Link href="/sell/verify" className="text-[10px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400 flex items-center space-x-2">
                  <span>Verify Now</span>
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Filters & Search */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <input
              type="text"
              placeholder="Search requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-amber-500/50 transition-all"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 w-5 h-5" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-sm focus:outline-none focus:border-amber-500/50 transition-all appearance-none"
            >
              <option value="All">All Categories</option>
              <option value="Currency">Currency</option>
              <option value="Accounts">Accounts</option>
              <option value="Items">Items</option>
              <option value="Boosting">Boosting</option>
            </select>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-xs font-black uppercase tracking-widest text-zinc-500">
              {filteredRequests.length} Requests Found
            </span>
          </div>
        </div>

        {/* Requests Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-zinc-900/50 rounded-3xl animate-pulse border border-white/5" />
            ))}
          </div>
        ) : filteredRequests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((req) => (
              <motion.div
                key={req.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="group bg-zinc-900/30 border border-white/5 rounded-3xl p-8 hover:bg-zinc-900/50 hover:border-amber-500/20 transition-all duration-500 flex flex-col"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10">
                      <Image
                        src={req.buyer.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.buyer.username}`}
                        alt={req.buyer.username}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest text-white">{req.buyer.username}</h4>
                      <div className="flex items-center space-x-1 text-[10px] text-zinc-500 font-black uppercase tracking-tighter">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(req.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/5">
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{req.category}</span>
                  </div>
                </div>

                <h3 className="text-lg font-black uppercase tracking-tighter mb-3 group-hover:text-amber-500 transition-colors">
                  {req.title}
                </h3>
                <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                  {req.description}
                </p>

                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5">
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Budget</span>
                    <span className="text-sm font-black text-white">
                      ${req.budget_min} - ${req.budget_max}
                    </span>
                  </div>
                  <div className="bg-zinc-950/50 rounded-2xl p-4 border border-white/5">
                    <span className="block text-[9px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-1">Offers</span>
                    <span className="text-sm font-black text-white">
                      {req.offers_count} Submitted
                    </span>
                  </div>
                </div>

                <Link
                  href={`/marketplace/requests/${req.id}`}
                  className={cn(
                    "w-full py-4 rounded-xl font-black uppercase tracking-widest text-[11px] flex items-center justify-center space-x-2 transition-all duration-300",
                    isVerified 
                      ? "bg-amber-500 text-zinc-950 hover:bg-amber-400 shadow-lg shadow-amber-500/10" 
                      : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                  )}
                >
                  <span>{isVerified ? 'Submit Offer' : 'Verification Required'}</span>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-dashed border-white/10">
            <Search className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-xl font-black uppercase tracking-tighter mb-2">No Requests Found</h3>
            <p className="text-zinc-500">Try adjusting your search or filters to find more opportunities.</p>
          </div>
        )}
      </div>
    </div>
  );
}
