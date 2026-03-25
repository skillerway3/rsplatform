'use client';

import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Search, 
  Save, 
  RefreshCw, 
  FileText, 
  Settings,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { motion } from 'motion/react';

interface SEOConfig {
  id: string;
  page_path: string;
  title: string;
  description: string;
  keywords: string[];
  og_image: string | null;
  updated_at: string;
}

export default function AdminSEOPage() {
  const [configs, setConfigs] = useState<SEOConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('seo_config')
        .select('*')
        .order('page_path', { ascending: true });

      if (error) throw error;
      setConfigs(data || []);
    } catch (error) {
      console.error('Error fetching SEO configs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateConfig = async (id: string, updates: Partial<SEOConfig>) => {
    setSaving(id);
    try {
      const { error } = await supabase
        .from('seo_config')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      setConfigs(configs.map(c => c.id === id ? { ...c, ...updates } : c));
    } catch (error) {
      console.error('Error updating SEO config:', error);
    } finally {
      setSaving(null);
    }
  };

  const filteredConfigs = configs.filter(c => 
    c.page_path.toLowerCase().includes(search.toLowerCase()) ||
    c.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">SEO Management</h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Configure meta tags and search visibility</p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input 
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border border-white/5 rounded-xl pl-10 pr-4 py-2 text-[11px] font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all w-64"
            />
          </div>
          <Button 
            variant="outline" 
            className="rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest"
            onClick={fetchConfigs}
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* SEO Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Loading SEO Data...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredConfigs.map((config) => (
            <motion.div 
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden"
            >
              <div className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center border border-white/5">
                      <Globe className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">{config.page_path}</h3>
                      <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Last updated: {new Date(config.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="rounded-xl border-white/5 text-[9px] font-black uppercase tracking-widest h-9"
                    asChild
                  >
                    <a href={config.page_path} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3.5 h-3.5 mr-2" />
                      Preview Page
                    </a>
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Meta Title</label>
                      <input 
                        type="text"
                        value={config.title}
                        onChange={(e) => setConfigs(configs.map(c => c.id === config.id ? { ...c, title: e.target.value } : c))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Meta Description</label>
                      <textarea 
                        rows={3}
                        value={config.description}
                        onChange={(e) => setConfigs(configs.map(c => c.id === config.id ? { ...c, description: e.target.value } : c))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all resize-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Keywords (Comma separated)</label>
                      <input 
                        type="text"
                        value={config.keywords.join(', ')}
                        onChange={(e) => setConfigs(configs.map(c => c.id === config.id ? { ...c, keywords: e.target.value.split(',').map(k => k.trim()) } : c))}
                        className="w-full bg-zinc-950 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                      />
                    </div>
                    <div className="flex items-end h-full pb-1">
                      <Button 
                        variant="gold" 
                        className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleUpdateConfig(config.id, { 
                          title: config.title, 
                          description: config.description, 
                          keywords: config.keywords 
                        })}
                        disabled={saving === config.id}
                      >
                        {saving === config.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Changes
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}

          {filteredConfigs.length === 0 && (
            <div className="bg-zinc-900/50 border border-dashed border-white/10 rounded-2xl py-24 flex flex-col items-center justify-center space-y-4">
              <AlertTriangle className="w-8 h-8 text-zinc-700" />
              <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">No SEO configs found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
