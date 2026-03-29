'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  Check,
  ShieldCheck,
  Tag,
  Sparkles,
  Info,
  ChevronDown,
  LayoutGrid,
  Settings,
  LogIn,
  Trophy,
} from 'lucide-react';

const BUILDS = [
  'Pure',
  'Ironman',
  'Main',
  'Infernal',
  'Skiller',
  'Max',
  'Hardcore',
  'Obby',
  'Slayer',
  'Quiver',
  'Pet',
  '99',
];

const TYPES = [
  'Regular',
  'Ironman',
  'Hardcore',
  'Group Ironman',
  'Pure',
  'Main',
  'Skiller',
];

const LOGIN_METHODS = [
  'Jagex Launcher',
  'Legacy Login',
  'Email Login',
  'Manual Transfer',
];

const TOTAL_LEVELS = [
  '3-31',
  '32-499',
  '500-999',
  '1000-1499',
  '1500-1999',
  '2000+',
];

const TAGS = [
  'tutorial completed',
  'trade ready',
  'email set',
  'clean',
  'rested',
  'rare items',
  'quested',
];

interface SellStepAccountDetailsProps {
  formData: Record<string, unknown>;
  updateFormData: (data: Partial<Record<string, unknown>>) => void;
}

type AccountMetadata = {
  build: string;
  type: string;
  loginMethod: string;
  totalLevel: string;
  deliveryTime: string;
  tags: string[];
  highlights: string[];
  notes: string;
};

function normalizeAccountMetadata(value: unknown): AccountMetadata {
  const source =
    value && typeof value === 'object'
      ? (value as Partial<AccountMetadata>)
      : {};

  return {
    build: typeof source.build === 'string' ? source.build : '',
    type: typeof source.type === 'string' ? source.type : '',
    loginMethod:
      typeof source.loginMethod === 'string' ? source.loginMethod : '',
    totalLevel: typeof source.totalLevel === 'string' ? source.totalLevel : '',
    deliveryTime:
      typeof source.deliveryTime === 'string' ? source.deliveryTime : '',
    tags: Array.isArray(source.tags)
      ? source.tags.filter((tag): tag is string => typeof tag === 'string')
      : [],
    highlights: Array.isArray(source.highlights)
      ? source.highlights.filter(
          (highlight): highlight is string => typeof highlight === 'string'
        )
      : [],
    notes: typeof source.notes === 'string' ? source.notes : '',
  };
}

export function SellStepAccountDetails({
  formData,
  updateFormData,
}: SellStepAccountDetailsProps) {
  const accountMetadata: AccountMetadata = normalizeAccountMetadata(
    formData.accountMetadata
  );

  const updateMetadata = (data: Partial<AccountMetadata>) => {
    updateFormData({
      accountMetadata: {
        ...accountMetadata,
        ...data,
      },
    });
  };

  const toggleTag = (tag: string) => {
    const tags: string[] = Array.isArray(accountMetadata.tags)
      ? accountMetadata.tags
      : [];

    const newTags = tags.includes(tag)
      ? tags.filter((t) => t !== tag)
      : [...tags, tag];

    updateMetadata({ tags: newTags });
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
            <Settings className="w-5 h-5 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-zinc-100">
              Account Specifications
            </h2>
            <p className="text-sm text-zinc-500">
              Define the core attributes of your account
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5" />
                Account Build
              </label>
              <button className="text-[10px] text-zinc-600 hover:text-amber-500 transition-colors flex items-center gap-1">
                <Info className="w-3 h-3" />
                What&apos;s this?
              </button>
            </div>
            <div className="relative group">
              <select
                value={accountMetadata.build}
                onChange={(e) => updateMetadata({ build: e.target.value })}
                className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl h-12 px-4 focus:outline-none focus:border-amber-500/50 focus:bg-zinc-900/60 transition-all text-zinc-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Build
                </option>
                {BUILDS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              Account Type
            </label>
            <div className="relative group">
              <select
                value={accountMetadata.type}
                onChange={(e) => updateMetadata({ type: e.target.value })}
                className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl h-12 px-4 focus:outline-none focus:border-amber-500/50 focus:bg-zinc-900/60 transition-all text-zinc-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Type
                </option>
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <LogIn className="w-3.5 h-3.5" />
              Login Method
            </label>
            <div className="relative group">
              <select
                value={accountMetadata.loginMethod}
                onChange={(e) =>
                  updateMetadata({ loginMethod: e.target.value })
                }
                className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl h-12 px-4 focus:outline-none focus:border-amber-500/50 focus:bg-zinc-900/60 transition-all text-zinc-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Login Method
                </option>
                {LOGIN_METHODS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              <Trophy className="w-3.5 h-3.5" />
              Total Level Range
            </label>
            <div className="relative group">
              <select
                value={accountMetadata.totalLevel}
                onChange={(e) => updateMetadata({ totalLevel: e.target.value })}
                className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-xl h-12 px-4 focus:outline-none focus:border-amber-500/50 focus:bg-zinc-900/60 transition-all text-zinc-200 appearance-none cursor-pointer"
              >
                <option value="" disabled>
                  Select Total Level
                </option>
                {TOTAL_LEVELS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-focus-within:text-amber-500 transition-colors" />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
            <Tag className="w-5 h-5 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-zinc-100">Account Tags</h2>
            <p className="text-sm text-zinc-500">
              Quickly highlight key features for buyers
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2.5">
          {TAGS.map((tag) => {
            const isSelected = accountMetadata.tags.includes(tag);

            return (
              <button
                key={tag}
                type="button"
                onClick={() => toggleTag(tag)}
                className={cn(
                  'px-4 py-2.5 rounded-xl border text-sm font-medium transition-all flex items-center gap-2.5 group',
                  isSelected
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                    : 'bg-zinc-900/40 border-zinc-800/80 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded-md border flex items-center justify-center transition-all',
                    isSelected
                      ? 'bg-emerald-500 border-emerald-500'
                      : 'border-zinc-700 group-hover:border-zinc-600'
                  )}
                >
                  {isSelected && (
                    <Check className="w-3 h-3 text-zinc-900 stroke-[3]" />
                  )}
                </div>
                <span className="capitalize">{tag}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-3 pb-2 border-b border-zinc-800/50">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
            <Sparkles className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h2 className="text-xl font-medium text-zinc-100">
              Account Highlights
            </h2>
            <p className="text-sm text-zinc-500">
              List the most valuable features of your account
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              Key Selling Points
            </label>
            <textarea
              placeholder={
                "Enter key highlights (one per line)...\ne.g. Infernal Cape\n99 Slayer\nAll Diaries Done"
              }
              value={accountMetadata.highlights.join('\n')}
              onChange={(e) =>
                updateMetadata({
                  highlights: e.target.value
                    .split('\n')
                    .map((line) => line.trim())
                    .filter(Boolean),
                })
              }
              className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-h-[160px] focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/60 transition-all text-zinc-300 placeholder:text-zinc-700 leading-relaxed"
            />
            <p className="text-[10px] text-zinc-600 italic">
              Tip: Be specific. High-value items and achievements sell accounts
              faster.
            </p>
          </div>

          <div className="space-y-2.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
              Additional Seller Notes
            </label>
            <textarea
              placeholder="Any other details the buyer should know... (e.g. original owner status, recovery info availability)"
              value={accountMetadata.notes}
              onChange={(e) => updateMetadata({ notes: e.target.value })}
              className="w-full bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 min-h-[120px] focus:outline-none focus:border-blue-500/50 focus:bg-zinc-900/60 transition-all text-zinc-300 placeholder:text-zinc-700 leading-relaxed"
            />
          </div>
        </div>
      </section>
    </div>
  );
}