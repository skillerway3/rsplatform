'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Search, Check, X, Info, Upload, FileText } from 'lucide-react';
import { OSRS_QUESTS } from '@/data/boosting/osrs-quests';
import { AccountTypeSelector } from './AccountTypeSelector';

interface QuestingFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

export function QuestingForm({ onUpdate }: QuestingFormProps) {
  const [selectedQuests, setSelectedQuests] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const orderSummary = useMemo(() => {
    const selectedQuestNames = OSRS_QUESTS.flatMap((g) => g.quests)
      .filter((q) => selectedQuests.includes(q.id))
      .map((q) => q.label);

    const details = [
      `Quests: ${selectedQuests.length} selected`,
      ...selectedQuestNames.slice(0, 3),
      ...(selectedQuestNames.length > 3 ? [`+ ${selectedQuestNames.length - 3} more`] : []),
      `Account: ${accountType.replace('_', ' ')}`,
    ];

    if (additionalInfo) details.push(`Notes: ${additionalInfo.substring(0, 30)}...`);
    if (files.length > 0) details.push(`Files: ${files.length} attached`);

    return {
      service: 'Questing',
      details,
    };
  }, [selectedQuests, accountType, additionalInfo, files]);

  useEffect(() => {
    onUpdate(orderSummary);
  }, [orderSummary, onUpdate]);

  const toggleQuest = (id: string) => {
    setSelectedQuests(prev =>
      prev.includes(id) ? prev.filter(q => q !== id) : [...prev, id]
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const filteredQuests = OSRS_QUESTS.map(group => ({
    ...group,
    quests: group.quests.filter(q =>
      q.label.toLowerCase().includes(searchQuery.toLowerCase())
    ),
  })).filter(group => group.quests.length > 0);

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Quest Selection</label>
            <p className="text-[11px] text-zinc-500 font-medium">Select the quests you need completed</p>
          </div>
          <div className="flex items-center gap-3">
            {selectedQuests.length > 0 && (
              <button
                onClick={() => setSelectedQuests([])}
                className="text-[9px] font-black text-zinc-600 hover:text-red-500 uppercase tracking-widest transition-colors"
              >
                Clear All
              </button>
            )}
            <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">
                {selectedQuests.length} selected
              </span>
            </div>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-amber-500/5 blur-xl rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-amber-500 transition-colors z-10" />
          <input
            type="text"
            placeholder="Search for a quest..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-14 bg-zinc-950/50 border border-zinc-800 rounded-2xl pl-12 pr-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all placeholder:text-zinc-700 relative z-10 shadow-inner"
          />
        </div>

        <div className="max-h-[500px] overflow-y-auto pr-2 custom-scrollbar space-y-10">
          {filteredQuests.length > 0 ? (
            filteredQuests.map((group) => (
              <div key={group.category} className="space-y-4">
                <div className="flex items-center gap-4 sticky top-0 bg-zinc-950/80 backdrop-blur-md py-2 z-20 -mx-2 px-2 rounded-lg">
                  <h4 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] whitespace-nowrap">
                    {group.category}
                  </h4>
                  <div className="h-px w-full bg-zinc-800/50" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {group.quests.map((quest) => (
                    <button
                      key={quest.id}
                      onClick={() => toggleQuest(quest.id)}
                      className={cn(
                        "flex items-center justify-between p-5 rounded-2xl border transition-all duration-500 text-left group/item relative overflow-hidden",
                        selectedQuests.includes(quest.id)
                          ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-[0_15px_30px_rgba(245,158,11,0.15)] scale-[1.02] z-10"
                          : "bg-zinc-900/30 border-zinc-800/50 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300 hover:bg-zinc-900/50"
                      )}
                    >
                      {selectedQuests.includes(quest.id) ? (
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-50" />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:animate-shimmer pointer-events-none" />
                      )}
                      <div className="space-y-1 relative z-10">
                        <span className={cn(
                          "text-[14px] font-black tracking-tight block leading-tight uppercase",
                          selectedQuests.includes(quest.id) ? "text-zinc-950" : "text-zinc-100"
                        )}>{quest.label}</span>
                        <span className={cn(
                          "text-[9px] font-bold uppercase tracking-widest transition-colors",
                          selectedQuests.includes(quest.id) ? "text-zinc-900/60" : "text-zinc-600 group-hover/item:text-zinc-500"
                        )}>
                          {group.category.replace(' Quests', '')}
                        </span>
                      </div>
                      <div className={cn(
                        "w-6 h-6 rounded-lg border flex items-center justify-center transition-all duration-500 relative z-10 shrink-0 ml-4",
                        selectedQuests.includes(quest.id)
                          ? "bg-zinc-950 border-zinc-950 shadow-lg"
                          : "border-zinc-700 group-hover/item:border-zinc-500"
                      )}>
                        {selectedQuests.includes(quest.id) && <Check className="w-4 h-4 text-amber-500 stroke-[3]" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center space-y-4">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center mx-auto border border-zinc-800">
                <Search className="w-5 h-5 text-zinc-700" />
              </div>
              <p className="text-sm text-zinc-500 font-medium">No quests found matching &quot;{searchQuery}&quot;</p>
            </div>
          )}
        </div>
      </div>

      <AccountTypeSelector value={accountType} onChange={setAccountType} />

      {/* Evidence & Gear */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Evidence & Gear</label>
          <p className="text-[11px] text-zinc-500 font-medium">Upload screenshots of your current levels and available gear.</p>
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

      <div className="space-y-4">
        <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Additional Requirements</label>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="List any specific requirements, gear availability, or time constraints..."
          className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all resize-none placeholder:text-zinc-700"
        />
      </div>
    </div>
  );
}
