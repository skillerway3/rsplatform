'use client';

import React from 'react';
import { 
  Search, 
  Calendar,
  MessageSquare,
  Star
} from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface UserProfile {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
  email_verified: boolean;
  is_suspended: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = React.useState<UserProfile[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'verified' | 'trusted' | 'suspended' | 'email_unverified'>('all');

  React.useEffect(() => {
    const supabase = createClient();
    async function fetchUsers() {
      try {
        let query = supabase.from('profiles').select('id, username, full_name, avatar_url, role, is_verified_seller, is_trusted_seller, email_verified, is_suspended, average_rating, review_count, created_at').order('created_at', { ascending: false });

        if (filter === 'verified') query = query.eq('is_verified_seller', true);
        if (filter === 'trusted') query = query.eq('is_trusted_seller', true);
        if (filter === 'suspended') query = query.eq('is_suspended', true);
        if (filter === 'email_unverified') query = query.eq('email_verified', false);

        const { data, error } = await query;
        if (error) throw error;
        setUsers((data as UserProfile[]) || []);
      } catch (error: unknown) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, [filter]);

  const filteredUsers = users.filter(user => 
    user.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">User Management</h1>
          <p className="text-zinc-500 text-sm font-medium">Manage platform users, sellers, and moderation status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <div className="flex bg-zinc-900 border border-white/5 rounded-xl p-1">
            {(['all', 'verified', 'trusted', 'suspended', 'email_unverified'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all",
                  filter === f ? "bg-amber-500 text-zinc-950" : "text-zinc-500 hover:text-white"
                )}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-950/50 border-b border-white/5">
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">User</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Stats</th>
                <th className="px-6 py-4 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Joined</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <p className="text-zinc-500 text-xs font-medium">No users found matching your criteria.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-white/10 bg-zinc-950">
                          <Image 
                            src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`}
                            alt={user.username}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-white uppercase tracking-widest mb-0.5">{user.username}</p>
                          <p className="text-[9px] font-medium text-zinc-500 uppercase tracking-widest">{user.full_name || 'No Full Name'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.role === 'admin' && (
                          <span className="px-2 py-0.5 bg-purple-500/10 text-purple-500 border border-purple-500/20 rounded text-[8px] font-black uppercase tracking-widest">Admin</span>
                        )}
                        {user.is_verified_seller && (
                          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded text-[8px] font-black uppercase tracking-widest">Verified</span>
                        )}
                        {user.is_trusted_seller && (
                          <span className="px-2 py-0.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded text-[8px] font-black uppercase tracking-widest">Trusted</span>
                        )}
                        {user.email_verified && (
                          <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded text-[8px] font-black uppercase tracking-widest">Verified Email</span>
                        )}
                        {user.is_suspended && (
                          <span className="px-2 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[8px] font-black uppercase tracking-widest">Suspended</span>
                        )}
                        {!user.is_verified_seller && !user.is_suspended && user.role !== 'admin' && (
                          <span className="px-2 py-0.5 bg-zinc-800 text-zinc-500 border border-white/5 rounded text-[8px] font-black uppercase tracking-widest">User</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          <span className="text-[10px] font-black text-white">{user.average_rating || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageSquare className="w-3 h-3 text-zinc-500" />
                          <span className="text-[10px] font-black text-white">{user.review_count || 0}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2 text-zinc-500">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[9px] font-medium uppercase tracking-widest">{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/admin/users/${user.id}`}>
                        <Button variant="outline" size="sm" className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-white/5 group-hover:border-amber-500/30">
                          Manage
                        </Button>
                      </Link>
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
