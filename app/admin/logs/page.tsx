'use client';

import React from 'react';
import { 
  Search, 
  ShieldCheck, 
  DollarSign
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface AdminLog {
  id: string;
  admin_id: string;
  action_type: string;
  target_type: string;
  target_id: string;
  created_at: string;
  admin?: {
    username: string;
    avatar_url: string | null;
  };
}

interface TransactionLog {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  reference_id?: string;
  external_id?: string;
  created_at: string;
  user?: {
    username: string;
    avatar_url: string | null;
  };
}

export default function AdminLogsPage() {
  const [logs, setLogs] = React.useState<(AdminLog | TransactionLog)[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [logType, setLogType] = React.useState<'admin' | 'transaction'>('admin');

  React.useEffect(() => {
    const supabase = createClient();
    async function fetchLogs() {
      try {
        setLoading(true);
        if (logType === 'admin') {
          const { data: adminLogs, error: logsError } = await supabase
            .from('admin_activity_logs')
            .select('id, created_at, admin_id, action_type, target_type, target_id, details')
            .order('created_at', { ascending: false });
          
          if (logsError) throw logsError;

          if (adminLogs && adminLogs.length > 0) {
            const adminIds = Array.from(new Set(adminLogs.map(l => l.admin_id)));
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', adminIds);
            
            const profileMap = (profiles || []).reduce((acc: Record<string, { username: string; avatar_url: string | null }>, p) => {
              acc[p.id] = p;
              return acc;
            }, {});

            setLogs(adminLogs.map(l => ({
              ...l,
              admin: profileMap[l.admin_id]
            })));
          } else {
            setLogs([]);
          }
        } else {
          const { data: txLogs, error: logsError } = await supabase
            .from('wallet_transactions')
            .select('id, created_at, user_id, type, amount, reference_id, external_id, status, metadata')
            .order('created_at', { ascending: false });
          
          if (logsError) throw logsError;

          if (txLogs && txLogs.length > 0) {
            const userIds = Array.from(new Set(txLogs.map(l => l.user_id)));
            const { data: profiles } = await supabase
              .from('profiles')
              .select('id, username, avatar_url')
              .in('id', userIds);
            
            const profileMap = (profiles || []).reduce((acc: Record<string, { username: string; avatar_url: string | null }>, p) => {
              acc[p.id] = p;
              return acc;
            }, {});

            setLogs(txLogs.map(l => ({
              ...l,
              user: profileMap[l.user_id]
            })));
          } else {
            setLogs([]);
          }
        }
      } catch (error: unknown) {
        console.error('Error fetching logs:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [logType]);

  const filteredLogs = logs.filter(log => {
    const idMatch = log.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (logType === 'admin') {
      const adminLog = log as AdminLog;
      return idMatch || 
             adminLog.action_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
             adminLog.admin?.username.toLowerCase().includes(searchQuery.toLowerCase());
    } else {
      const txLog = log as TransactionLog;
      return idMatch || 
             txLog.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
             txLog.user?.username.toLowerCase().includes(searchQuery.toLowerCase());
    }
  });

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
                          {(logType === 'admin' ? (log as AdminLog).action_type : (log as TransactionLog).type).replace(/_/g, ' ')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/10 bg-zinc-950">
                          <Image 
                            src={(logType === 'admin' ? (log as AdminLog).admin : (log as TransactionLog).user)?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${logType === 'admin' ? (log as AdminLog).admin_id : (log as TransactionLog).user_id}`}
                            alt={(logType === 'admin' ? (log as AdminLog).admin : (log as TransactionLog).user)?.username || 'User'}
                            width={24}
                            height={24}
                            className="object-cover"
                          />
                        </div>
                        <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">
                          {(logType === 'admin' ? (log as AdminLog).admin : (log as TransactionLog).user)?.username}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[250px]">
                        <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest truncate">
                          {logType === 'admin' 
                            ? `Target: ${(log as AdminLog).target_type} (${(log as AdminLog).target_id?.substr(0, 8)})` 
                            : `Ref: ${(log as TransactionLog).reference_id?.substr(0, 8) || (log as TransactionLog).external_id?.substr(0, 8) || 'N/A'} | Amount: $${Math.abs((log as TransactionLog).amount)}`}
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
