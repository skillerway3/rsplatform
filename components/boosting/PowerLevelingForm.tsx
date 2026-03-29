'use client';

import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import {
  Plus,
  Trash2,
  ChevronDown,
  Info,
  Upload,
  FileText,
  Check,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';
import { OSRS_SKILLS } from '@/data/boosting/osrs-skills';
import { AccountTypeSelector } from './AccountTypeSelector';
import { motion, AnimatePresence } from 'motion/react';

interface SkillRow {
  id: string;
  skillId: string;
  currentLevel: number;
  desiredLevel: number;
}

interface PowerLevelingFormProps {
  onUpdate: (summary: { service: string; details: string[] }) => void;
}

const FALLBACK_ICON: LucideIcon = Icons.Sword;

function getLucideIcon(iconName?: string): LucideIcon {
  if (!iconName) return FALLBACK_ICON;

  const candidate = Icons[iconName as keyof typeof Icons];
  return typeof candidate === 'function'
    ? (candidate as LucideIcon)
    : FALLBACK_ICON;
}

function createRowId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function CustomSkillSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (val: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownContentRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  const updateCoords = () => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    setCoords({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideButton = buttonRef.current?.contains(target);
      const isInsideDropdown = dropdownContentRef.current?.contains(target);

      if (!isInsideButton && !isInsideDropdown) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      updateCoords();
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('resize', updateCoords);
      window.addEventListener('scroll', updateCoords, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updateCoords);
      window.removeEventListener('scroll', updateCoords, true);
    };
  }, [isOpen]);

  const selectedSkill = OSRS_SKILLS.find((s) => s.id === value);
  const IconComponent = getLucideIcon(selectedSkill?.icon);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={cn(
          'w-full h-12 bg-zinc-950/50 border rounded-xl pl-14 pr-10 text-[13px] font-bold text-zinc-100 focus:outline-none transition-all shadow-inner flex items-center justify-between group',
          isOpen
            ? 'border-amber-500/50'
            : 'border-zinc-800 hover:border-zinc-700'
        )}
      >
        <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/30 transition-colors z-10">
          <IconComponent className="w-4 h-4 text-amber-500" />
        </div>

        <span className="truncate">
          {selectedSkill?.label || 'Select Skill'}
        </span>

        <ChevronDown
          className={cn(
            'absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 transition-transform duration-300',
            isOpen
              ? 'rotate-180 text-amber-500'
              : 'group-hover:text-zinc-400'
          )}
        />
      </button>

      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {isOpen && coords && (
              <motion.div
                ref={dropdownContentRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  position: 'fixed',
                  top: coords.top,
                  left: coords.left,
                  width: coords.width,
                  zIndex: 99999,
                }}
                className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar p-1">
                  {OSRS_SKILLS.map((skill) => {
                    const SkillIcon = getLucideIcon(skill.icon);
                    const isSelected = skill.id === value;

                    return (
                      <button
                        key={skill.id}
                        type="button"
                        onClick={() => {
                          onChange(skill.id);
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors',
                          isSelected
                            ? 'bg-amber-500/10 text-amber-500'
                            : 'text-zinc-300 hover:bg-zinc-800 hover:text-white'
                        )}
                      >
                        <div
                          className={cn(
                            'w-6 h-6 rounded flex items-center justify-center border',
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500/30'
                              : 'bg-zinc-950 border-zinc-800'
                          )}
                        >
                          <SkillIcon
                            className={cn(
                              'w-3.5 h-3.5',
                              isSelected
                                ? 'text-amber-500'
                                : 'text-zinc-500'
                            )}
                          />
                        </div>

                        <span className="text-sm font-medium flex-1">
                          {skill.label}
                        </span>

                        {isSelected && (
                          <Check className="w-4 h-4 text-amber-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

export function PowerLevelingForm({ onUpdate }: PowerLevelingFormProps) {
  const [rows, setRows] = useState<SkillRow[]>([
    {
      id: createRowId(),
      skillId: 'attack',
      currentLevel: 1,
      desiredLevel: 99,
    },
  ]);
  const [accountType, setAccountType] = useState('regular');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  const updateRow = (
    id: string,
    field: keyof SkillRow,
    value: string | number
  ) => {
    let finalValue: string | number = value;

    if (field === 'currentLevel' || field === 'desiredLevel') {
      const numericValue =
        typeof value === 'number' ? value : Number.parseInt(value, 10);

      finalValue = Number.isFinite(numericValue)
        ? Math.max(1, Math.min(99, numericValue))
        : 1;
    }

    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [field]: finalValue } : row))
    );
  };

  const getRowError = (row: SkillRow) => {
    if (row.currentLevel >= row.desiredLevel) {
      return 'Target level must be higher than current level';
    }
    return null;
  };

  useEffect(() => {
    const details = rows.map((row) => {
      const skill = OSRS_SKILLS.find((s) => s.id === row.skillId);
      const error = getRowError(row);

      return `${skill?.label}: ${row.currentLevel} → ${row.desiredLevel}${
        error ? ' (Invalid Range)' : ''
      }`;
    });

    details.push(`Account: ${accountType.replace('_', ' ')}`);

    if (additionalInfo) {
      details.push(`Notes: ${additionalInfo.substring(0, 30)}...`);
    }

    onUpdate({
      service: 'Power Leveling',
      details,
    });
  }, [rows, accountType, additionalInfo, files, onUpdate]);

  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        id: createRowId(),
        skillId: 'strength',
        currentLevel: 1,
        desiredLevel: 99,
      },
    ]);
  };

  const removeRow = (id: string) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((row) => row.id !== id);
    });
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
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Skill Configuration
              </label>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              Specify the skills and target levels you want us to achieve.
            </p>
          </div>

          <div className="space-y-4">
            {rows.map((row, index) => {
              const error = getRowError(row);

              return (
                <div
                  key={row.id}
                  className="group relative space-y-2"
                  style={{ zIndex: rows.length - index }}
                >
                  <div
                    className={cn(
                      'grid grid-cols-1 sm:grid-cols-12 gap-4 items-end p-5 rounded-2xl transition-all duration-300 relative',
                      error
                        ? 'bg-red-500/[0.02] border border-red-500/20 shadow-[0_0_20px_rgba(239,68,68,0.05)]'
                        : 'bg-zinc-900/30 border border-zinc-800/50 hover:border-zinc-700/50 hover:bg-zinc-900/50'
                    )}
                  >
                    <div className="sm:col-span-5 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">
                        Select Skill
                      </label>
                      <CustomSkillSelect
                        value={row.skillId}
                        onChange={(val) => updateRow(row.id, 'skillId', val)}
                      />
                    </div>

                    <div className="sm:col-span-3 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">
                        Current
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={row.currentLevel}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              'currentLevel',
                              Number.parseInt(e.target.value, 10)
                            )
                          }
                          className={cn(
                            'w-full h-12 bg-zinc-950/80 border rounded-xl px-4 text-[14px] font-black transition-all duration-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-zinc-900 hover:bg-zinc-900/80 hover:border-zinc-700/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                            !error
                              ? 'border-zinc-800 focus:border-amber-500/50 text-amber-500'
                              : 'border-red-500/30 focus:border-red-500/50 text-red-500 focus:ring-red-500/20'
                          )}
                          placeholder="1"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-3 space-y-2.5">
                      <label className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.2em] ml-1">
                        Target
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={row.desiredLevel}
                          onChange={(e) =>
                            updateRow(
                              row.id,
                              'desiredLevel',
                              Number.parseInt(e.target.value, 10)
                            )
                          }
                          className={cn(
                            'w-full h-12 bg-zinc-950/80 border rounded-xl px-4 text-[14px] font-black transition-all duration-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:bg-zinc-900 hover:bg-zinc-900/80 hover:border-zinc-700/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none',
                            !error
                              ? 'border-zinc-800 focus:border-amber-500/50 text-amber-500'
                              : 'border-red-500/30 focus:border-red-500/50 text-red-500 focus:ring-red-500/20'
                          )}
                          placeholder="99"
                        />
                      </div>
                    </div>

                    <div className="sm:col-span-1 flex justify-center pb-1">
                      {rows.length > 1 && (
                        <button
                          type="button"
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
                      <span className="text-[9px] font-black uppercase tracking-widest">
                        {error}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="button"
              onClick={addRow}
              className="w-full h-14 rounded-2xl border-2 border-dashed border-zinc-800 hover:border-amber-500/30 hover:bg-amber-500/[0.02] flex items-center justify-center gap-3 transition-all group mt-4"
            >
              <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center border border-zinc-800 group-hover:border-amber-500/30 transition-colors">
                <Plus className="w-3.5 h-3.5 text-zinc-500 group-hover:text-amber-500 transition-colors" />
              </div>
              <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] group-hover:text-zinc-300 transition-colors">
                Add another skill to request
              </span>
            </button>
          </div>
        </div>
      </div>

      <AccountTypeSelector value={accountType} onChange={setAccountType} />

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
            Evidence & Gear
          </label>
          <p className="text-[11px] text-zinc-500 font-medium">
            Upload screenshots of your current levels and available gear.
          </p>
        </div>

        <div className="relative group">
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />

          <div
            className={cn(
              'w-full min-h-[200px] bg-zinc-900/40 border-2 border-dashed border-zinc-800/50 rounded-[2.5rem] flex flex-col items-center justify-center p-8 transition-all duration-500 group-hover:border-amber-500/30 group-hover:bg-zinc-900/60',
              files.length > 0 && 'border-amber-500/30 bg-amber-500/5'
            )}
          >
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
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-800/80 border border-zinc-700/50 text-[10px] text-zinc-300 font-bold tracking-tight"
                  >
                    <FileText className="w-3 h-3 text-amber-500/70" />
                    {file.name.length > 20
                      ? `${file.name.substring(0, 17)}...`
                      : file.name}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">
            Additional Requirements
          </label>
          <p className="text-[11px] text-zinc-500 font-medium">
            List any specific requirements, gear availability, or time constraints.
          </p>
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