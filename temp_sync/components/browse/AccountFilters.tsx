'use client';

import React from 'react';
import { Search, X, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';

const BUILDS = ['Pure', 'Ironman', 'Main', 'Infernal', 'Skiller', 'Max', 'Hardcore', 'Obby', 'Slayer', 'Quiver', 'Pet', '99'];
const TYPES = ['Regular', 'Ironman', 'Hardcore', 'Group Ironman', 'Pure', 'Main', 'Skiller'];
const LOGIN_METHODS = ['Jagex Launcher', 'Legacy Login', 'Email Login', 'Manual Transfer'];
const TOTAL_LEVELS = ['3-31', '32-499', '500-999', '1000-1499', '1500-1999', '2000+'];

interface AccountFiltersProps {
  filters: any;
  setFilters: (filters: any) => void;
  onClear: () => void;
}

export function AccountFilters({ filters, setFilters, onClear }: AccountFiltersProps) {
  const updateFilter = (key: string, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => value && key !== 'search').length;

  return (
    <div className="space-y-10">
      {/* Search & Meta Controls */}
      <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div className="w-full lg:max-w-2xl relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
          <Input 
            placeholder="Search accounts (e.g. Maxed Main, Infernal)..." 
            className="pl-14 bg-zinc-950/50 border-zinc-800/50 focus:border-amber-500/50 h-14 text-base rounded-2xl shadow-inner"
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-4 w-full lg:w-auto">
          <div className="flex items-center bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-1.5 w-full lg:w-auto">
            <Input 
              placeholder="Min" 
              type="number"
              className="w-24 bg-transparent border-none focus:ring-0 h-10 text-center text-sm font-bold placeholder:text-zinc-700"
              value={filters.minPrice || ''}
              onChange={(e) => updateFilter('minPrice', e.target.value)}
            />
            <div className="w-px h-6 bg-zinc-800/50" />
            <Input 
              placeholder="Max" 
              type="number"
              className="w-24 bg-transparent border-none focus:ring-0 h-10 text-center text-sm font-bold placeholder:text-zinc-700"
              value={filters.maxPrice || ''}
              onChange={(e) => updateFilter('maxPrice', e.target.value)}
            />
          </div>
          
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              className="h-14 px-6 text-zinc-500 hover:text-amber-500 transition-colors text-[10px] font-black uppercase tracking-widest"
              onClick={onClear}
            >
              Clear All ({activeFiltersCount})
            </Button>
          )}
        </div>
      </div>

      {/* Structured Selects */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Account Build', key: 'build', options: BUILDS, placeholder: 'All Builds' },
          { label: 'Account Type', key: 'type', options: TYPES, placeholder: 'All Types' },
          { label: 'Login Method', key: 'loginMethod', options: LOGIN_METHODS, placeholder: 'All Methods' },
          { label: 'Total Level', key: 'totalLevel', options: TOTAL_LEVELS, placeholder: 'Any Level' },
        ].map((select) => (
          <div key={select.key} className="space-y-3">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 ml-1 flex items-center">
              <span className={cn("w-1 h-1 rounded-full mr-2", filters[select.key] ? "bg-amber-500" : "bg-zinc-800")} />
              {select.label}
            </label>
            <div className="relative group">
              <select 
                value={filters[select.key] || ''}
                onChange={(e) => updateFilter(select.key, e.target.value)}
                className={cn(
                  "w-full bg-zinc-950/50 border rounded-2xl h-14 px-5 focus:outline-none transition-all text-sm font-bold appearance-none cursor-pointer",
                  filters[select.key] 
                    ? "border-amber-500/50 text-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.05)]" 
                    : "border-zinc-800/50 text-zinc-400 hover:border-zinc-700"
                )}
              >
                <option value="">{select.placeholder}</option>
                {select.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown className={cn(
                "absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-transform",
                filters[select.key] ? "text-amber-500" : "text-zinc-600"
              )} />
            </div>
          </div>
        ))}
      </div>

      {/* Refined Quick Tags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] flex items-center">
            <SlidersHorizontal className="w-3 h-3 mr-2" />
            Quick Build Filters
          </h3>
        </div>
        <div className="flex flex-wrap gap-2.5">
          {BUILDS.map(tag => (
            <button
              key={tag}
              onClick={() => updateFilter('build', filters.build === tag ? '' : tag)}
              className={cn(
                "px-5 py-2.5 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                filters.build === tag
                  ? "bg-amber-500 border-amber-500 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
                  : "bg-zinc-950/50 border-zinc-800/50 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-900/50"
              )}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filter Chips */}
      <AnimatePresence>
        {activeFiltersCount > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-wrap gap-2 pt-6 border-t border-zinc-900/50 overflow-hidden"
          >
            {Object.entries(filters).map(([key, value]) => {
              if (!value || key === 'search') return null;
              return (
                <Badge 
                  key={key} 
                  variant="secondary" 
                  className="bg-zinc-900/80 border-zinc-800 text-zinc-300 px-3 py-1.5 rounded-lg flex items-center gap-2 group"
                >
                  <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">{key}:</span>
                  <span className="text-xs font-bold text-amber-500">{value as string}</span>
                  <button 
                    onClick={() => updateFilter(key, '')}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
