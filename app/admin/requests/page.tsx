'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  AlertTriangle,
  Loader2,
  Tag
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface Request {
  id: string;
  title: string;
  description: string;
  budget: number;
  status: 'open' | 'fulfilled' | 'closed';
  created_at: string;
  user_id: string;
  user?: {
    username: string;
  };
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('requests')
        .select(`
          *,
          user:profiles!requests_user_id_fkey(username)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, newStatus: Request['status']) => {
    setIsUpdating(id);
    try {
      const { error } = await supabase
        .from('requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      
      setRequests(requests.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredRequests = requests.filter(r => 
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.user?.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">User Requests</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Manage and moderate marketplace requests</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search requests..."
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
            <option value="fulfilled">Fulfilled</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>

      {/* Requests Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loading Requests...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredRequests.map((request) => (
            <motion.div 
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden hover:border-amber-500/20 transition-all group"
            >
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center space-x-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5 group-hover:border-amber-500/20 transition-all">
                    <HelpCircle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{request.title}</h3>
                      <span className={cn(
                        "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest",
                        request.status === 'open' ? "bg-green-500/10 text-green-500 border border-green-500/20" :
                        request.status === 'fulfilled' ? "bg-blue-500/10 text-blue-500 border border-blue-500/20" :
                        "bg-zinc-500/10 text-zinc-500 border border-zinc-500/20"
                      )}>
                        {request.status}
                      </span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{request.user?.username}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          {new Date(request.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Tag className="w-3 h-3 text-amber-500" />
                        <span className="text-[11px] font-black text-white uppercase tracking-widest">Budget: ${request.budget}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-white/5 text-red-500 hover:bg-red-500/10 hover:border-red-500/20 text-[9px] font-black uppercase tracking-widest h-9"
                    onClick={() => handleUpdateStatus(request.id, 'closed')}
                    disabled={isUpdating === request.id}
                  >
                    {isUpdating === request.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5 mr-2" />}
                    Close
                  </Button>
                  <Button 
                    variant="gold" 
                    size="sm" 
                    className="rounded-xl text-[9px] font-black uppercase tracking-widest h-9"
                  >
                    <MessageSquare className="w-3.5 h-3.5 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredRequests.length === 0 && (
            <div className="bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl py-24 flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-zinc-700" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No requests found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
