'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export const ACCOUNT_TYPES = [
  { id: 'regular', label: 'Regular' },
  { id: 'ironman', label: 'Ironman' },
  { id: 'hardcore_ironman', label: 'Hardcore' },
  { id: 'ultimate_ironman', label: 'Ultimate' },
  { id: 'group_ironman', label: 'Group' },
  { id: 'unranked_group_ironman', label: 'Unranked' },
];

interface AccountTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AccountTypeSelector({ value, onChange, className }: AccountTypeSelectorProps) {
  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Account Type</label>
        <p className="text-[11px] text-zinc-500 font-medium tracking-tight">Select your account type to ensure we provide the correct service.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {ACCOUNT_TYPES.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() => onChange(type.id)}
            className={cn(
              "px-4 py-4 text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl border transition-all duration-500 text-center relative overflow-hidden group flex items-center justify-center gap-2",
              value === type.id
                ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_15px_30px_rgba(245,158,11,0.2)] scale-[1.05] z-10"
                : "bg-zinc-950/40 border-zinc-900/50 text-zinc-600 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/60"
            )}
          >
            {value === type.id ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                <Check className="w-3.5 h-3.5 text-zinc-950 animate-in zoom-in duration-500 stroke-[3]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            )}
            <span className="relative z-10">{type.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
