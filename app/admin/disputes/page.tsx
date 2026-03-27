'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  AlertTriangle,
  Scale,
  MessageSquare,
  Clock,
  User,
  ExternalLink,
  Loader2,
  ShieldAlert
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface Dispute {
  id: string;
  order_id: string;
  initiator_id: string;
  reason: string;
  description: string;
  status: 'open' | 'resolved' | 'closed';
  resolution: string | null;
  created_at: string;
  initiator?: {
    username: string;
  };
  order?: {
    total_price: number;
    listing?: {
      title: string;
    };
  };
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchDisputes = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from('disputes')
          .select(`
            *,
            initiator:profiles!disputes_raised_by_fkey(username),
            order:orders(
              total_price,
              listing:listings(title)
            )
          `)
          .order('created_at', { ascending: false });

        if (statusFilter !== 'all') {
          query = query.eq('status', statusFilter);
        }

        const { data, error } = await query;
        if (error) throw error;
        setDisputes(data || []);
      } catch (error: unknown) {
        console.error('Error fetching disputes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDisputes();
  }, [statusFilter]);

  const filteredDisputes = disputes.filter(d => 
    d.order?.listing?.title.toLowerCase().includes(search.toLowerCase()) ||
    d.initiator?.username.toLowerCase().includes(search.toLowerCase()) ||
    d.reason.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">Order Disputes</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Mediate and resolve buyer/seller conflicts</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search disputes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[11px] font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-zinc-900 border border-white/5 rounded-xl px-4 py-2 text-[11px] font-black text-white uppercase tracking-widest focus:outline-none focus:border-amber-500/30 transition-all"
          >
            <option value="all">All Status</option>
            <option value="open">Open</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Disputes Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loading Disputes...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredDisputes.map((dispute) => (
            <motion.div 
              key={dispute.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group"
            >
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 transition-all">
                    <Scale className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{dispute.reason}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        dispute.status === 'open' ? "bg-amber-500/10 text-amber-500 border border-amber-500/20" :
                        dispute.status === 'resolved' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                        "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                      )}>
                        {dispute.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">By {dispute.initiator?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {new Date(dispute.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <ShieldAlert className="w-3 h-3 text-amber-500" />
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Order: {dispute.order?.listing?.title}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest h-9"
                    asChild
                  >
                    <a href={`/admin/orders/${dispute.order_id}`}>
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      View Order
                    </a>
                  </Button>
                  <Button 
                    variant="gold" 
                    size="sm" 
                    className="rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-2" />
                    Mediate
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredDisputes.length === 0 && (
            <div className="bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl py-24 flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-zinc-700" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No disputes found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
