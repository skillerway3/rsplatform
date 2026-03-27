'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface PromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (values: Record<string, string>) => void;
  title: string;
  message: string;
  fields: {
    key: string;
    label: string;
    placeholder?: string;
    type?: string;
    required?: boolean;
  }[];
  confirmText?: string;
  cancelText?: string;
}

export function PromptModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  fields,
  confirmText = 'Submit',
  cancelText = 'Cancel'
}: PromptModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen) {
      setValues({});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(values);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h3>
              </div>
              <button type="button" onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">
              {message}
            </p>

            <div className="space-y-4 mb-8">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">
                    {field.label}
                  </label>
                  <input
                    type={field.type || 'text'}
                    value={values[field.key] || ''}
                    onChange={(e) => setValues(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    required={field.required}
                    className="w-full h-12 bg-zinc-950 border border-white/5 rounded-xl px-4 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  />
                </div>
              ))}
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
              >
                {cancelText}
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 rounded-xl bg-amber-500 hover:bg-amber-600 text-zinc-950 font-black uppercase tracking-widest text-[10px]"
              >
                {confirmText}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
