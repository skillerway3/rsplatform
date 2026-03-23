import * as React from 'react';
import { Settings, Plus, ShieldCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  username: string;
  isVerified?: boolean;
  isTrusted?: boolean;
}

export function DashboardHeader({ username, isVerified, isTrusted }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <div className="space-y-4">
        <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Account Overview</div>
        <div className="flex items-center gap-4">
          <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Dashboard</h1>
          <div className="flex items-center gap-2 mt-2">
            {isVerified && (
              <div className="bg-emerald-500/10 text-emerald-500 p-1.5 rounded-xl border border-emerald-500/20" title="Verified Seller">
                <ShieldCheck className="w-5 h-5" />
              </div>
            )}
            {isTrusted && (
              <div className="bg-amber-500/10 text-amber-500 p-1.5 rounded-xl border border-amber-500/20" title="Trusted Seller">
                <Zap className="w-5 h-5 fill-amber-500" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-px w-12 bg-amber-500" />
          <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Welcome back, {username}</span>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" className="rounded-xl border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100">
          <Settings className="w-4 h-4 mr-2" />
          Settings
        </Button>
        <Button variant="gold" className="px-8 rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
          <Plus className="w-4 h-4 mr-2" />
          New Listing
        </Button>
      </div>
    </header>
  );
}
