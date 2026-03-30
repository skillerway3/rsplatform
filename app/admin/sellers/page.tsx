'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Search,
  User,
  Star,
  Loader2,
  ChevronLeft,
  ShieldAlert,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { cn, isAdmin } from '@/lib/utils';

interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string;
  avatar_url: string;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
  manual_trusted_override: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

export default function AdminSellersPage() {
  const router = useRouter();
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isUserAdmin, setIsUserAdmin] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [processingId, setProcessingId] = React.useState<string | null>(null);

  const fetchProfiles = React.useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      });

      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setProfiles(data);
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error fetching admin profiles:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAdmin = React.useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (isAdmin(user, profile)) {
      setIsUserAdmin(true);
      fetchProfiles();
    } else {
      router.push('/');
    }
  }, [router, fetchProfiles]);

  React.useEffect(() => {
    checkAdmin();
  }, [checkAdmin]);

  const toggleTrustedOverride = async (id: string, currentOverride: boolean) => {
    setProcessingId(id);
    try {
      const response = await fetch('/api/admin/sellers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          sellerId: id, 
          manualTrustedOverride: !currentOverride 
        })
      });

      if (!response.ok) throw new Error('Failed to update trusted status');

      setProfiles(prev => prev.map(p => 
        p.id === id ? { 
          ...p, 
          manual_trusted_override: !currentOverride,
          is_trusted_seller: !currentOverride || (p.average_rating >= 4.5 && p.review_count >= 10)
        } : p
      ));
    } catch (err: unknown) {
      console.error('Error toggling trusted override:', err);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isUserAdmin) return null;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8 pt-32">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-black uppercase tracking-tighter flex items-center">
              <ShieldCheck className="w-8 h-8 mr-3 text-amber-500" />
              Seller Management
            </h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Manage trusted status and overrides</p>
          </div>
          <Button variant="ghost" onClick={() => router.push('/admin/verifications')} className="text-zinc-500 hover:text-zinc-100">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Verifications
          </Button>
        </div>

        <div className="relative group max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
          <input 
            type="text"
            placeholder="Search by username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-12 bg-zinc-900/50 border border-white/5 rounded-xl pl-12 pr-4 text-xs font-medium focus:outline-none focus:border-amber-500/30 transition-all"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredProfiles.map((profile) => (
              <Card key={profile.id} className="premium-card p-6 flex items-center justify-between group hover:border-white/10 transition-all">
                <div className="flex items-center space-x-6">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-zinc-800 shrink-0">
                    <Image 
                      src={profile.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`} 
                      alt={profile.username} 
                      width={48} 
                      height={48}
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-black uppercase tracking-widest text-sm">{profile.username}</h3>
                      <span className="text-[10px] text-zinc-500 font-medium lowercase tracking-normal">({profile.email})</span>
                      {profile.is_verified_seller && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                          <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                          <span className="text-[7px] font-black text-emerald-500 uppercase tracking-widest">Verified</span>
                        </div>
                      )}
                      {profile.is_trusted_seller && (
                        <div className="flex items-center gap-1 px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded-md">
                          <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                          <span className="text-[7px] font-black text-amber-500 uppercase tracking-widest">Trusted</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-[9px] font-black uppercase tracking-widest text-zinc-500">
                      <span className="flex items-center gap-1"><User className="w-3 h-3" /> {profile.id.slice(0, 8)}...</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {profile.average_rating} ({profile.review_count} reviews)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right mr-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-zinc-600 mb-1">Manual Override</p>
                    <div className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      profile.manual_trusted_override ? "text-amber-500" : "text-zinc-500"
                    )}>
                      {profile.manual_trusted_override ? 'Enabled' : 'Disabled'}
                    </div>
                  </div>
                  <Button
                    variant={profile.manual_trusted_override ? "outline" : "gold"}
                    size="sm"
                    className="rounded-xl px-6 font-black uppercase tracking-widest text-[9px] h-10 border-white/5"
                    onClick={() => toggleTrustedOverride(profile.id, profile.manual_trusted_override)}
                    disabled={processingId === profile.id}
                  >
                    {processingId === profile.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : profile.manual_trusted_override ? (
                      <><ShieldAlert className="w-3 h-3 mr-2" /> Remove Trust</>
                    ) : (
                      <><Shield className="w-3 h-3 mr-2" /> Grant Trust</>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
