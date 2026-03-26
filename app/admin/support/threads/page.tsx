'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  MessageSquare, 
  Clock, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  ArrowLeft,
  Loader2,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';

interface SupportThread {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  guest_email: string | null;
  subject: string;
  status: string;
  priority: string;
  last_message_at: string;
  created_at: string;
  user?: { username: string } | { username: string }[];
  assigned_admin?: { username: string } | { username: string }[];
}

export default function AdminSupportThreadsPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [threads, setThreads] = React.useState<SupportThread[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('open');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (authLoading) return;
    if (!adminUser) {
      router.push('/login');
      return;
    }

    const fetchThreads = async () => {
      try {
        // Fetch threads first
        const { data: threadsData, error: threadsError } = await supabase
          .from('support_threads')
          .select('id, user_id, guest_name, guest_email, subject, status, priority, last_message_at, created_at, assigned_to')
          .order('last_message_at', { ascending: false });

        if (threadsError) throw threadsError;

        if (threadsData && threadsData.length > 0) {
          // Get unique profile IDs (users and assigned admins)
          const profileIds = Array.from(new Set([
            ...threadsData.map(t => t.user_id).filter(Boolean),
            ...threadsData.map(t => t.assigned_to).filter(Boolean)
          ])) as string[];

          // Fetch profiles in parallel
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username')
            .in('id', profileIds);

          const profileMap = (profilesData || []).reduce((acc, p) => {
            acc[p.id] = p;
            return acc;
          }, {} as Record<string, any>);

          // Map profiles back to threads
          const enrichedThreads = threadsData.map(t => ({
            ...t,
            user: t.user_id ? profileMap[t.user_id] : null,
            assigned_admin: t.assigned_to ? profileMap[t.assigned_to] : null
          }));

          setThreads(enrichedThreads);
        } else {
          setThreads([]);
        }
      } catch (err: any) {
        console.error('Error fetching support threads:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchThreads();
  }, [adminUser, authLoading, router]);

  const filteredThreads = threads.filter(t => {
    const matchesFilter = filter === 'all' || t.status === filter;
    const matchesSearch = 
      (Array.isArray(t.user) ? t.user[0]?.username : t.user?.username || t.guest_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.guest_email || '').toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
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
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Admin
          </Link>

          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Live Support</div>
              <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Support Threads</h1>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  placeholder="Search threads..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-zinc-900 border border-white/5 rounded-xl pl-12 pr-6 h-12 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors w-64"
                />
              </div>
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-zinc-900 border border-white/5 rounded-xl px-6 h-12 text-xs font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
              >
                <option value="all">All Status</option>
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </header>

          {filteredThreads.length > 0 ? (
            <div className="space-y-4">
              {filteredThreads.map((thread) => (
                <Link key={thread.id} href={`/admin/support/${thread.id}`}>
                  <Card className="premium-card p-6 group hover:border-amber-500/20 transition-all cursor-pointer">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-center gap-6">
                        <div className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center border",
                          thread.status === 'open' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          thread.status === 'resolved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          "bg-zinc-800 border-white/5 text-zinc-500"
                        )}>
                          <MessageSquare className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <h4 className="text-sm font-black text-white uppercase tracking-tight">{thread.subject}</h4>
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md",
                              thread.priority === 'high' ? "bg-red-500/10 text-red-500" : "bg-zinc-800 text-zinc-500"
                            )}>
                              {thread.priority}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              <span>{Array.isArray(thread.user) ? thread.user[0]?.username : thread.user?.username || thread.guest_name || 'Guest'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>Last active {formatDate(thread.last_message_at)}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        {thread.assigned_admin && (
                          <div className="text-right hidden md:block">
                            <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Assigned To</p>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-300 uppercase tracking-widest">
                              <ShieldCheck className="w-3 h-3 text-amber-500" />
                              <span>{Array.isArray(thread.assigned_admin) ? thread.assigned_admin[0]?.username : thread.assigned_admin?.username}</span>
                            </div>
                          </div>
                        )}
                        <div className="w-px h-8 bg-white/5 hidden md:block" />
                        <ChevronRight className="w-5 h-5 text-zinc-700 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <div className="p-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
                <MessageSquare className="w-8 h-8 text-zinc-800" />
              </div>
              <h4 className="text-xl font-black text-zinc-500 uppercase tracking-tight mb-2">No Threads Found</h4>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-[200px]">All support requests have been processed.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
