'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { BOOSTING_SERVICES } from '@/data/boosting/services';

interface BoostingTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export function BoostingTabs({ activeTab, onTabChange, className }: BoostingTabsProps) {
  return (
    <div className={cn("w-full overflow-x-auto no-scrollbar pb-6 -mx-6 px-6 md:mx-0 md:px-0", className)}>
      <div className="flex items-center gap-3 min-w-max">
        {BOOSTING_SERVICES.map((service) => (
          <button
            key={service.id}
            onClick={() => onTabChange(service.id)}
            className={cn(
              "relative px-8 py-4 text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl border transition-all duration-700 group overflow-hidden",
              activeTab === service.id
                ? "bg-gradient-to-br from-amber-400 to-amber-600 text-zinc-950 border-amber-400 shadow-[0_20px_40px_rgba(245,158,11,0.3)] scale-[1.05] z-10"
                : "bg-zinc-900/40 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/60"
            )}
          >
            {/* Active Glow Effect */}
            {activeTab === service.id ? (
              <>
                <div className="absolute inset-0 bg-gradient-to-tr from-white/30 to-transparent opacity-50" />
                <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-12 h-1 bg-zinc-950 rounded-full blur-[1px]" />
              </>
            ) : (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
            )}
            
            <span className="relative z-10">{service.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
