'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Calendar, 
  Edit3, 
  Loader2, 
  ArrowLeft,
  Camera,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatDate, cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface Profile {
  id: string;
  username: string;
  avatar_url: string;
  is_verified_seller: boolean;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [updating, setUpdating] = React.useState(false);
  const [username, setUsername] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState(false);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        setProfile(data);
        setUsername(data.username || '');
      } catch (err: any) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, authLoading, router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setUpdating(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          username,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;
      setSuccess(true);
      setProfile(prev => prev ? ({ ...prev, username }) : null);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Username might be taken.');
    } finally {
      setUpdating(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    setError(null);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('verifications') // Reusing verifications bucket for simplicity or create a new one
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('verifications')
        .getPublicUrl(filePath);

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setProfile(prev => prev ? ({ ...prev, avatar_url: publicUrl }) : null);
      setSuccess(true);
    } catch (err: any) {
      console.error('Error uploading avatar:', err);
      setError('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

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
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Dashboard
          </Link>

          <header className="mb-16">
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Account Settings</div>
            <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Profile</h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Avatar & Status */}
            <div className="space-y-8">
              <Card className="premium-card p-8 flex flex-col items-center text-center">
                <div className="relative group mb-6">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 relative">
                    {uploading ? (
                      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                    ) : profile?.avatar_url ? (
                      <Image 
                        src={profile.avatar_url} 
                        alt="Avatar" 
                        fill 
                        className="object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <User className="w-12 h-12 text-zinc-800" />
                    )}
                  </div>
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute bottom-0 right-0 w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 hover:scale-110 transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Camera className="w-5 h-5 text-zinc-950" />
                  </button>
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">{profile?.username || 'Member'}</h2>
                  <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">{user?.email}</p>
                </div>

                <div className="w-full h-px bg-white/5 my-8" />

                <div className="w-full space-y-4">
                  <div className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className={cn("w-4 h-4", profile?.is_verified_seller ? "text-emerald-500" : "text-zinc-600")} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Seller Status</span>
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                      profile?.is_verified_seller ? "bg-emerald-500/10 text-emerald-500" : "bg-zinc-800 text-zinc-500"
                    )}>
                      {profile?.is_verified_seller ? 'Verified' : 'Unverified'}
                    </span>
                  </div>
                  {!profile?.is_verified_seller && (
                    <Link href="/sell/verify" className="block">
                      <Button variant="gold" className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest">
                        Verify Now
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>

              <Card className="premium-card p-8 space-y-6">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Account Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5">
                      <Calendar className="w-4 h-4 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Joined On</p>
                      <p className="text-[11px] font-bold text-zinc-100">{profile?.created_at ? formatDate(profile.created_at) : 'N/A'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5">
                      <Mail className="w-4 h-4 text-zinc-600" />
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Email Address</p>
                      <p className="text-[11px] font-bold text-zinc-100 truncate max-w-[150px]">{user?.email}</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Edit Profile */}
            <div className="lg:col-span-2">
              <Card className="premium-card p-10">
                <form onSubmit={handleUpdateProfile} className="space-y-10">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                      <Edit3 className="w-5 h-5 text-amber-500" />
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Edit Profile</h3>
                  </div>

                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                      <ShieldAlert className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-3 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                      <CheckCircle2 className="w-4 h-4" />
                      Profile updated successfully!
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Username</label>
                      <input 
                        type="text" 
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter username"
                        className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                      />
                      <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-1">
                        This is your public display name.
                      </p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Email (Read Only)</label>
                      <input 
                        type="email" 
                        disabled
                        value={user?.email || ''}
                        className="w-full bg-zinc-950/30 border border-zinc-800/50 rounded-2xl px-6 h-14 text-sm font-bold text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button 
                      type="submit"
                      disabled={updating}
                      variant="gold" 
                      className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10 group"
                    >
                      {updating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          Save Changes
                          <CheckCircle2 className="w-4 h-4 ml-3 group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
