'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Mail, 
  ArrowRight, 
  Github, 
  Chrome, 
  ChevronLeft,
  Zap,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { motion } from 'motion/react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSocialLogin = async (provider: 'google') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `Failed to sign in with ${provider}`);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      router.push('/sell');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md space-y-12">
          {/* Logo/Back */}
          <div className="flex items-center justify-between">
            <Link href="/" className="group flex items-center text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] hover:text-zinc-100 transition-colors">
              <ChevronLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Go Back
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
                <ShieldCheck className="w-5 h-5 text-zinc-950" />
              </div>
              <span className="text-xl font-black text-zinc-100 tracking-tighter uppercase">RSPlatform</span>
            </div>
          </div>

          <div className="space-y-4 text-center">
            <h1 className="text-5xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Sign In</h1>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">Welcome back to RSPlatform</p>
          </div>

          <Card className="premium-card p-10 space-y-8">
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-6">
                <Input 
                  label="Email Address" 
                  placeholder="user@example.com"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Password</label>
                    <Link href="/support" className="text-[9px] font-black uppercase tracking-widest text-amber-500 hover:text-amber-400">Recovery</Link>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
                    <input 
                      type="password"
                      placeholder="••••••••"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 bg-black/40 border border-zinc-800/50 rounded-xl pl-12 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                  <p className="text-[10px] font-black text-red-500 uppercase tracking-widest text-center">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <Button 
                  type="submit"
                  disabled={loading}
                  variant="gold" 
                  className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-amber-500/20"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
                <Link href="/signup" className="block">
                  <Button 
                    type="button"
                    variant="ghost" 
                    className="w-full h-14 rounded-xl font-black uppercase tracking-widest text-[10px] border border-zinc-800 text-zinc-400 hover:text-zinc-100"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/5" /></div>
              <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest">
                <span className="bg-zinc-900 px-4 text-zinc-600">Social Login</span>
              </div>
            </div>

            <div className="space-y-4">
              <Button 
                variant="ghost" 
                onClick={() => handleSocialLogin('google')}
                className="w-full h-12 rounded-xl border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100"
              >
                <Chrome className="w-4 h-4 mr-2" />
                Continue with Google
              </Button>
            </div>
          </Card>

          <p className="text-center text-[10px] font-black text-zinc-600 uppercase tracking-widest">
            New to RSPlatform? <Link href="/signup" className="text-amber-500 hover:text-amber-400">Sign Up</Link>
          </p>

          {/* Security Badges */}
          <div className="flex items-center justify-center space-x-8 pt-8 border-t border-white/5">
            <div className="flex items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 mr-2 text-emerald-500" />
              SSL Secured
            </div>
            <div className="flex items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest">
              <Zap className="w-3 h-3 mr-2 text-amber-500" />
              2FA Ready
            </div>
            <div className="flex items-center text-[8px] font-black text-zinc-700 uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3 mr-2 text-blue-500" />
              GDPR Compliant
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
