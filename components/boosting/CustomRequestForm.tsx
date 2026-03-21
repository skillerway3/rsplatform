'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Info, Upload, FileText, Check, X } from 'lucide-react';
import { AccountTypeSelector } from './AccountTypeSelector';

interface CustomRequestFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

export function CustomRequestForm({ onUpdate }: CustomRequestFormProps) {
  const [requestDescription, setRequestDescription] = useState('');
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const details = [];
    
    if (requestDescription) {
      details.push(`Request: ${requestDescription.length > 40 ? requestDescription.substring(0, 40) + '...' : requestDescription}`);
    } else {
      details.push('Custom request pending description');
    }
    
    details.push(`Account: ${accountType.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}`);
    
    if (additionalInfo) {
      details.push(`Notes: ${additionalInfo.length > 30 ? additionalInfo.substring(0, 30) + '...' : additionalInfo}`);
    }

    if (files.length > 0) {
      details.push(`${files.length} attachment(s) included`);
    }

    onUpdate({
      service: 'Custom Request',
      details,
    });
  }, [requestDescription, accountType, additionalInfo, files, onUpdate]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-8">
        {/* Request Description */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">What do you need?</label>
              <div className={cn(
                "px-2 py-1 rounded-md border flex items-center gap-1.5 transition-all duration-500",
                requestDescription.length > 10 
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" 
                  : "bg-zinc-900/50 border-zinc-800/50 text-zinc-500"
              )}>
                {requestDescription.length > 10 ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Info className="w-3 h-3 text-amber-500/70" />
                )}
                <span className="text-[10px] font-bold tracking-tight uppercase">
                  {requestDescription.length > 10 ? 'Validated' : 'Required'}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">Describe your custom boosting request in detail.</p>
          </div>
          <div className="relative group">
            <textarea
              value={requestDescription}
              onChange={(e) => setRequestDescription(e.target.value)}
              placeholder="Describe your custom boosting request in detail (e.g., specific item grinds, unique account goals, or complex service combinations)..."
              className="w-full min-h-[180px] bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10 transition-all resize-none shadow-inner"
            />
            <div className="absolute bottom-4 right-4 text-[10px] text-zinc-600 font-mono opacity-50">
              {requestDescription.length} characters
            </div>
          </div>
        </div>

        {/* Account Type */}
        <AccountTypeSelector value={accountType} onChange={setAccountType} />

        {/* Screenshots Upload */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Evidence & Gear</label>
            <p className="text-[11px] text-zinc-500 font-medium">Upload screenshots of your current progress and available gear.</p>
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
                <div className="mt-6 w-full max-w-md space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  {files.map((file, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-zinc-900/60 border border-zinc-800/50 rounded-xl group/file relative z-20"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-amber-500/70" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-zinc-300 truncate max-w-[150px]">
                            {file.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      </div>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          removeFile(index);
                        }}
                        className="p-1.5 rounded-lg hover:bg-red-500/10 text-zinc-600 hover:text-red-500 transition-all"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        <div className="space-y-6">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Additional Information</label>
            <p className="text-[11px] text-zinc-500 font-medium">Any other specific instructions or timeline requirements.</p>
          </div>
          <textarea
            value={additionalInfo}
            onChange={(e) => setAdditionalInfo(e.target.value)}
            placeholder="Any other specific instructions, preferred contact methods, or timeline requirements..."
            className="w-full min-h-[120px] bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-5 text-sm text-zinc-300 placeholder:text-zinc-600 focus:outline-none focus:border-amber-500/30 focus:ring-1 focus:ring-amber-500/10 transition-all resize-none shadow-inner"
          />
        </div>
      </div>
    </div>
  );
}
