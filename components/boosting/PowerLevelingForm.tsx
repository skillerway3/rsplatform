'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Plus, Trash2, ChevronDown, Info, Upload, FileText } from 'lucide-react';
import { OSRS_SKILLS } from '@/data/boosting/osrs-skills';
import { AccountTypeSelector } from './AccountTypeSelector';
import * as Icons from 'lucide-react';

interface SkillRow {
  id: string;
  skillId: string;
  currentLevel: number;
  desiredLevel: number;
}

interface PowerLevelingFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

export function PowerLevelingForm({ onUpdate }: PowerLevelingFormProps) {
  const [rows, setRows] = useState<SkillRow[]>([
    { id: Math.random().toString(), skillId: 'attack', currentLevel: 1, desiredLevel: 99 },
  ]);
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const updateRow = (id: string, field: keyof SkillRow, value: any) => {
    let finalValue = value;
    if (field === 'currentLevel' || field === 'desiredLevel') {
      finalValue = Math.max(1, Math.min(99, value || 1));
    }
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: finalValue } : r)));
  };

  const getRowError = (row: SkillRow) => {
    if (row.currentLevel >= row.desiredLevel) {
      return "Target level must be higher than current level";
    }
    return null;
  };

  const orderSummary = useMemo(() => {
    const details = rows.map((row) => {
      const skill = OSRS_SKILLS.find((s) => s.id === row.skillId);
      const error = getRowError(row);
      return `${skill?.label}: ${row.currentLevel} → ${row.desiredLevel}${error ? ' (Invalid Range)' : ''}`;
    });

    details.push(`Account: ${accountType.replace('_', ' ')}`);
    if (additionalInfo) details.push(`Notes: ${additionalInfo.substring(0, 30)}...`);
    if (files.length > 0) details.push(`Files: ${files.length} attached`);

    return {
      service: 'Power Leveling',
      details,
    };
  }, [rows, accountType, additionalInfo, files]);

  useEffect(() => {
    onUpdate(orderSummary);
  }, [orderSummary, onUpdate]);

  const addRow = () => {
    setRows((prev) => [...prev, { id: Math.random().toString(), skillId: 'strength', currentLevel: 1, desiredLevel: 99 }]);
  };

  const removeRow = (id: string) => {
    if (rows.length > 1) {
      setRows((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Skill Configuration</label>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Specify the skills and target levels you want us to achieve.</p>
          </div>

          <div className="space-y-4">
            {rows.map((row) => {
              const error = getRowError(row);
              const skill = OSRS_SKILLS.find(s => s.id === row.skillId);
              const IconComponent = (Icons as any)[skill?.icon || 'Sword'];

              return (
                <div key={row.id} className="group relative space-y-2">
                  <div className={cn(
                    "grid grid-cols-1 sm:grid-cols-12 gap-4 items-end p-5 rounded-2xl transition-all duration-300 relative overflow-hidden",
                    error 
                      ? "bg-red-500/[0.02] border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]" 
                      : "bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/50"
                  )}>
                    {/* Skill Selector */}
                    <div className="sm:col-span-5 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Select Skill</label>
                      <div className="relative group/select">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 group-focus-within/select:border-amber-500/30 transition-colors z-10">
                          {IconComponent && <IconComponent className="w-4 h-4 text-amber-500" />}
                        </div>
                        <select
                          value={row.skillId}
                          onChange={(e) => updateRow(row.id, 'skillId', e.target.value)}
                          className="w-full h-12 bg-zinc-950/50 border border-zinc-800 rounded-xl pl-14 pr-10 text-[13px] font-bold text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all appearance-none shadow-inner cursor-pointer"
                        >
                          {OSRS_SKILLS.map((skill) => (
                            <option key={skill.id} value={skill.id}>{skill.label}</option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none group-hover/select:text-zinc-400 transition-colors" />
                      </div>
                    </div>

                    {/* Levels */}
                    <div className="sm:col-span-3 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Current</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={row.currentLevel}
                          onChange={(e) => updateRow(row.id, 'currentLevel', parseInt(e.target.value))}
                          className={cn(
                            "w-full h-12 bg-zinc-950/50 border rounded-xl px-4 text-[13px] font-bold transition-all shadow-inner",
                            !error ? "border-zinc-800 focus:border-amber-500/50 text-amber-500" : "border-red-500/30 focus:border-red-500/50 text-red-500"
                          )}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">Target</label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={row.desiredLevel}
                          onChange={(e) => updateRow(row.id, 'desiredLevel', parseInt(e.target.value))}
                          className={cn(
                            "w-full h-12 bg-zinc-950/50 border rounded-xl px-4 text-[13px] font-bold transition-all shadow-inner",
                            !error ? "border-zinc-800 focus:border-amber-500/50 text-amber-500" : "border-red-500/30 focus:border-red-500/50 text-red-500"
                          )}
                          placeholder="99"
                        />
                      </div>
                    </div>

                    {/* Remove Button */}
                    <div className="sm:col-span-1 flex justify-center pb-1">
                      {rows.length > 1 && (
                        <button
                          onClick={() => removeRow(row.id)}
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-zinc-600 hover:text-red-500 hover:bg-red-500/10 transition-all group/remove"
                          title="Remove Skill"
                        >
                          <Trash2 className="w-4 h-4 group-hover/remove:scale-110 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  {error && (
                    <div className="flex items-center gap-2 px-4 text-red-500/80 animate-in fade-in slide-in-from-top-1 duration-300">
                      <Info className="w-3 h-3" />
                      <span className="text-[9px] font-black uppercase tracking-widest">{error}</span>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              onClick={addRow}
              className="w-full h-14 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-500/30 hover:bg-amber-500/[0.02] flex items-center justify-center gap-3 transition-all group mt-4"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">Add another skill to request</span>
            </button>
          </div>
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

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Additional Requirements</label>
          <p className="text-[11px] text-zinc-500 font-medium">List any specific requirements, gear availability, or time constraints.</p>
        </div>
        <textarea
          value={additionalInfo}
          onChange={(e) => setAdditionalInfo(e.target.value)}
          placeholder="List any specific requirements, gear availability, or time constraints..."
          className="w-full h-32 bg-zinc-950/50 border border-zinc-800 rounded-2xl p-5 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-colors resize-none placeholder:text-zinc-700 shadow-inner"
        />
      </div>
    </div>
  );
}
