'use client';

import React from 'react';
import { 
  History, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  Calendar,
  User,
  ShieldCheck,
  CreditCard,
  AlertCircle,
  Clock,
  Tag,
  ArrowRight,
  ExternalLink,
  Activity,
  DollarSign
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export default function AdminLogsPage() {
  const supabase = createClient();
  const [logs, setLogs] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [logType, setLogType] = React.useState<'admin' | 'transaction'>('admin');

  React.useEffect(() => {
    async function fetchLogs() {
      try {
        let query;
        if (logType === 'admin') {
          query = supabase.from('admin_activity_logs').select(`
            *,
            admin:profiles!admin_activity_logs_admin_id_fkey(username, avatar_url)
          `).order('created_at', { ascending: false });
        } else {
          query = supabase.from('wallet_transactions').select(`
            *,
            user:profiles!wallet_transactions_user_id_fkey(username, avatar_url)
          `).order('created_at', { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        setLogs(data || []);
      } catch (error) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [logType]);

  const filteredLogs = logs.filter(log => 
    log.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (logType === 'admin' ? log.action_type : log.type)?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (logType === 'admin' ? log.admin?.username : log.user?.username)?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">System Logs</h1>
          <p className="text-zinc-500 text-sm font-medium">Audit platform activity, administrative actions, and financial transactions.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            <button
              onClick={() => setLogType('admin')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                logType === 'admin' ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white"
              )}
            >
              Admin Activity
            </button>
            <button
              onClick={() => setLogType('transaction')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                logType === 'transaction' ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white"
              )}
            >
              Transactions
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Event</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-zinc-500 text-xs font-medium">No logs found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center border",
                          logType === 'admin' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        )}>
                          {logType === 'admin' ? <ShieldCheck className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">
                          {(logType === 'admin' ? log.action_type : log.type).replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-950">
                          <Image 
                            src={(logType === 'admin' ? log.admin : log.user)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${logType === 'admin' ? log.admin_id : log.user_id}`}
                            alt={(logType === 'admin' ? log.admin : log.user)?.username}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                          {(logType === 'admin' ? log.admin : log.user)?.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest truncate">
                          {logType === 'admin' ? `Target: ${log.target_type} (${log.target_id?.substr(0, 8)})` : `Ref: ${log.reference_id?.substr(0, 8) || log.external_id?.substr(0, 8) || 'N/A'} | Amount: $${Math.abs(log.amount)}`}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col space-y-0.5">
                        <span className="text-[9px] font-black text-white uppercase tracking-widest">{new Date(log.created_at).toLocaleDateString()}</span>
                        <span className="text-[8px] font-medium text-zinc-500 uppercase tracking-widest">{new Date(log.created_at).toLocaleTimeString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/5 group-hover:border-amber-500/30">
                        View JSON
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
