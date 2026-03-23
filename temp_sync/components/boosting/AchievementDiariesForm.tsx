'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, Info, Upload, FileText, Trash2 } from 'lucide-react';
import { OSRS_DIARY_REGIONS, OSRS_DIARY_DIFFICULTIES } from '@/data/boosting/osrs-diaries';
import { AccountTypeSelector } from './AccountTypeSelector';

interface AchievementDiariesFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

export function AchievementDiariesForm({ onUpdate }: AchievementDiariesFormProps) {
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState(OSRS_DIARY_DIFFICULTIES[0].id);
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const selectedRegionLabels = OSRS_DIARY_REGIONS
      .filter(r => selectedRegions.includes(r.id))
      .map(r => r.label);

    const details = [
      `Regions: ${selectedRegionLabels.length > 0 ? selectedRegionLabels.slice(0, 2).join(', ') + (selectedRegionLabels.length > 2 ? ` (+${selectedRegionLabels.length - 2})` : '') : 'None'}`,
      `Difficulty: ${OSRS_DIARY_DIFFICULTIES.find(d => d.id === selectedDifficulty)?.label}`,
      `Account: ${accountType.replace('_', ' ')}`,
    ];
    if (additionalInfo) details.push(`Notes: ${additionalInfo.substring(0, 30)}...`);

    onUpdate({
      service: 'Achievement Diaries',
      details,
    });
  }, [selectedRegions, selectedDifficulty, accountType, additionalInfo, files, onUpdate]);

  const toggleRegion = (id: string) => {
    setSelectedRegions(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const clearAllRegions = () => {
    setSelectedRegions([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        {/* Regions Selection */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Select Regions</label>
              <div className="flex items-center gap-3">
                {selectedRegions.length > 0 && (
                  <button
                    onClick={clearAllRegions}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors group/clear"
                  >
                    <Trash2 className="w-3 h-3 text-red-500 group-hover/clear:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">Clear All</span>
                  </button>
                )}
                {selectedRegions.length > 0 && (
                  <div className="px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                    <span className="text-[10px] font-bold text-amber-500">{selectedRegions.length} Selected</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Choose the regions you want us to complete diaries for.</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {OSRS_DIARY_REGIONS.map((region) => (
              <button
                key={region.id}
                onClick={() => toggleRegion(region.id)}
                className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 text-left group/item relative overflow-hidden",
                  selectedRegions.includes(region.id)
                    ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_15px_30px_rgba(245,158,11,0.15)] scale-[1.02] z-10"
                    : "bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50"
                )}
              >
                {selectedRegions.includes(region.id) ? (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                )}
                <span className={cn(
                  "text-[14px] font-black tracking-tight relative z-10 leading-tight uppercase",
                  selectedRegions.includes(region.id) ? "text-zinc-950" : "text-zinc-100"
                )}>{region.label}</span>
                <div className={cn(
                  "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-500 relative z-10 shrink-0 ml-4",
                  selectedRegions.includes(region.id)
                    ? "bg-zinc-950 border-zinc-950 shadow-lg"
                    : "border-zinc-700 group-hover/item:border-zinc-500"
                )}>
                  {selectedRegions.includes(region.id) && <Check className="w-4 h-4 text-amber-500 stroke-[3]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Select Difficulty</label>
            <p className="text-[11px] text-zinc-500 font-medium">Select the highest tier of diary completion required.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {OSRS_DIARY_DIFFICULTIES.map((difficulty) => (
              <button
                key={difficulty.id}
                onClick={() => setSelectedDifficulty(difficulty.id)}
                className={cn(
                  "flex flex-col items-center justify-center p-6 rounded-2xl border transition-all duration-500 group/item relative overflow-hidden",
                  selectedDifficulty === difficulty.id
                    ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_15px_30px_rgba(245,158,11,0.15)] scale-[1.05] z-10"
                    : "bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50"
                )}
              >
                {selectedDifficulty === difficulty.id ? (
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                )}
                <span className={cn(
                  "text-[14px] font-black tracking-tight relative z-10 leading-tight uppercase mb-4",
                  selectedDifficulty === difficulty.id ? "text-zinc-950" : "text-zinc-100"
                )}>{difficulty.label}</span>
                <div className={cn(
                  "w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-500 relative z-10 shadow-sm",
                  selectedDifficulty === difficulty.id
                    ? "bg-zinc-950 border-zinc-950"
                    : "border-zinc-700 group-hover/item:border-zinc-500"
                )}>
                  {selectedDifficulty === difficulty.id && <Check className="w-4 h-4 text-amber-500 stroke-[3]" />}
                </div>
              </button>
            ))}
          </div>
        </div>

        <AccountTypeSelector value={accountType} onChange={setAccountType} />

        {/* Evidence & Gear */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Evidence & Gear</label>
            <p className="text-[11px] text-zinc-500 font-medium">Upload screenshots of your current diary progress and available gear.</p>
          </div>
          
          <div className="relative group">
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className={cn(
              "w-full min-h-[200px] bg-zinc-900/40 border-2 border-dashed border-zinc-800/50 rounded-[2.5rem] flex flex-col items-center justify-center p-8 transition-all duration-500 group-hover:border-amber-500/30 group-hover:bg-zinc-900/60",
              files.length > 0 && "border-amber-500/30 bg-amber-500/5"
            )}>
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-amber-500/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="relative w-20 h-20 rounded-3xl bg-zinc-800/50 flex items-center justify-center border border-zinc-700 group-hover:scale-110 group-hover:border-amber-500/50 transition-all duration-500 shadow-2xl">
                  {files.length > 0 ? (
                    <FileText className="w-10 h-10 text-amber-500" />
                  ) : (
                    <Upload className="w-10 h-10 text-zinc-500 group-hover:text-amber-500 transition-colors" />
                  )}
                </div>
                {files.length > 0 && (
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-zinc-950 font-black text-xs shadow-lg animate-in zoom-in duration-300">
                    {files.length}
                  </div>
                )}
              </div>
              
              <div className="text-center space-y-2">
                <p className="text-[14px] font-black text-zinc-100 uppercase tracking-[0.2em]">
                  {files.length > 0 ? 'Files Ready for Upload' : 'Drop Evidence Here'}
                </p>
                <p className="text-[12px] text-zinc-500 font-medium max-w-[280px] leading-relaxed">
                  {files.length > 0 
                    ? 'Your screenshots have been attached to the request.' 
                    : 'Drag and drop your levels, equipment, and inventory screenshots here.'}
                </p>
              </div>

              {files.length > 0 && (
                <div className="mt-6 flex flex-wrap justify-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-[10px] text-zinc-300 font-bold tracking-tight">
                      <FileText className="w-3 h-3 text-amber-500/70" />
                      {file.name.length > 20 ? file.name.substring(0, 17) + '...' : file.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Requirements */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Additional Requirements</label>
            <p className="text-[11px] text-zinc-500 font-medium">List any specific requirements, gear availability, or time constraints.</p>
          </div>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="List any specific requirements, gear availability, or time constraints..."
            className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-zinc-700 shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
