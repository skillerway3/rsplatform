'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  Flag, 
  Loader2, 
  ArrowLeft,
  Search,
  ExternalLink
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  reason: string;
  details: string;
  evidence_urls: string[];
  status: string;
  created_at: string;
  reporter: { username: string };
  reported_user: { username: string };
}

export default function AdminReportsPage() {
  const { user: adminUser, loading: authLoading } = useAuth();
  const router = useRouter();
  const [reports, setReports] = React.useState<UserReport[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filter, setFilter] = React.useState('pending');
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    if (authLoading) return;
    if (!adminUser) {
      router.push('/login');
      return;
    }

    const fetchReports = async () => {
      try {
        const { data, error } = await supabase
          .from('user_reports')
          .select(`
            *,
            reporter:reporter_id(username),
            reported_user:reported_user_id(username)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setReports(data || []);
      } catch (err: unknown) {
        console.error('Error fetching reports:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [adminUser, authLoading, router]);

  const handleUpdateStatus = async (reportId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('user_reports')
        .update({ 
          status: newStatus,
          reviewed_by: adminUser?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', reportId);

      if (error) throw error;
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r));
    } catch (err: unknown) {
      console.error('Error updating report status:', err);
      alert('Failed to update status');
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesFilter = filter === 'all' || r.status === filter;
    const matchesSearch = 
      r.reporter?.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.reported_user?.username?.toLowerCase().includes(search.toLowerCase()) ||
      r.reason.toLowerCase().includes(search.toLowerCase());
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
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <Link href="/admin" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Admin
          </Link>

          <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div>
              <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Moderation Queue</div>
              <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">User Reports</h1>
            </div>
            <div className="flex flex-wrap gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
                <input 
                  type="text"
                  placeholder="Search reports..."
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
                <option value="pending">Pending</option>
                <option value="reviewing">Reviewing</option>
                <option value="resolved">Resolved</option>
                <option value="dismissed">Dismissed</option>
              </select>
            </div>
          </header>

          {filteredReports.length > 0 ? (
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="premium-card p-8 group hover:border-amber-500/20 transition-all">
                  <div className="flex flex-col lg:flex-row gap-8">
                    {/* Report Header */}
                    <div className="lg:w-1/4 space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                          <Flag className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Report Reason</p>
                          <p className="text-sm font-black text-white uppercase tracking-tight">{report.reason.replace('_', ' ')}</p>
                        </div>
                      </div>
                      <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5 space-y-3">
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Reporter</p>
                          <p className="text-[10px] font-bold text-zinc-300 truncate">{report.reporter?.username || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Reported User</p>
                          <p className="text-[10px] font-bold text-zinc-300 truncate">{report.reported_user?.username || 'Unknown'}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Date</p>
                          <p className="text-[10px] font-bold text-zinc-300">{formatDate(report.created_at)}</p>
                        </div>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="lg:flex-1 space-y-6">
                      <div className="space-y-2">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Details</p>
                        <p className="text-xs font-bold text-zinc-400 leading-relaxed bg-zinc-950/50 p-6 rounded-2xl border border-white/5">
                          {report.details || 'No additional details provided.'}
                        </p>
                      </div>

                      {report.evidence_urls && report.evidence_urls.length > 0 && (
                        <div className="space-y-3">
                          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Evidence</p>
                          <div className="flex flex-wrap gap-4">
                            {report.evidence_urls.map((url, i) => (
                              <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden relative group/img">
                                <Image src={url} alt="Evidence" fill className="object-cover group-hover/img:scale-110 transition-transform" />
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                                  <ExternalLink className="w-4 h-4 text-white" />
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="lg:w-1/5 flex flex-col justify-between gap-6">
                      <div className="space-y-3">
                        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</p>
                        <div className={cn(
                          "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-center border",
                          report.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                          report.status === 'resolved' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                          "bg-zinc-800 border-white/5 text-zinc-500"
                        )}>
                          {report.status}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Button 
                          onClick={() => handleUpdateStatus(report.id, 'resolved')}
                          variant="gold" 
                          className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest"
                          disabled={report.status === 'resolved'}
                        >
                          Resolve
                        </Button>
                        <Button 
                          onClick={() => handleUpdateStatus(report.id, 'dismissed')}
                          variant="outline" 
                          className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/5"
                          disabled={report.status === 'dismissed'}
                        >
                          Dismiss
                        </Button>
                        <Link href={`/admin/users/${report.reported_user_id}`} className="block">
                          <Button variant="outline" className="w-full h-10 rounded-xl text-[9px] font-black uppercase tracking-widest border-white/5">
                            View User
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
                <Flag className="w-8 h-8 text-zinc-800" />
              </div>
              <h4 className="text-xl font-black text-zinc-500 uppercase tracking-tight mb-2">No Reports Found</h4>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-[200px]">The moderation queue is currently empty.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
