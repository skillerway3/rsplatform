'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Info, Upload, FileText } from 'lucide-react';
import { AccountTypeSelector } from './AccountTypeSelector';

interface QuiverFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

export function QuiverForm({ onUpdate }: QuiverFormProps) {
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const details = [
      `Service: Dizana's Quiver`,
      `Account: ${accountType.replace('_', ' ')}`,
      `Files: ${files.length} attached`,
    ];
    if (additionalInfo) details.push(`Notes: ${additionalInfo.substring(0, 30)}...`);

    onUpdate({
      service: 'Quiver',
      details,
    });
  }, [accountType, additionalInfo, files, onUpdate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  return (
    <div className="space-y-12">
      <div className="space-y-8">
        <div className="p-8 bg-amber-500/5 border border-amber-500/20 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-700" />
          <div className="relative z-10 space-y-2">
            <h3 className="text-lg font-black text-zinc-100 uppercase tracking-tighter italic">Dizana&apos;s Quiver</h3>
            <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-md">
              The ultimate ranged reward from the Fortis Colosseum. Our professional specialists will secure this legendary item for your account with guaranteed success.
            </p>
          </div>
        </div>

        <AccountTypeSelector value={accountType} onChange={setAccountType} />

      {/* Evidence & Gear */}
      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Evidence & Gear</label>
          <p className="text-[11px] text-zinc-500 font-medium">Upload screenshots of your current levels and available equipment.</p>
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
    </div>
  );
}
