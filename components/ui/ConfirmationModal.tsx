'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
}

export function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger'
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl"
        >
          <div className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  variant === 'danger' ? 'bg-red-500/10 text-red-500' : 
                  variant === 'warning' ? 'bg-amber-500/10 text-amber-500' : 
                  'bg-blue-500/10 text-blue-500'
                }`}>
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tighter text-white">{title}</h3>
              </div>
              <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X className="w-5 h-5 text-zinc-500" />
              </button>
            </div>

            <p className="text-zinc-400 text-sm font-medium leading-relaxed mb-8">
              {message}
            </p>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-12 rounded-xl border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
              >
                {cancelText}
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 h-12 rounded-xl font-black uppercase tracking-widest text-[10px] ${
                  variant === 'danger' ? 'bg-red-500 hover:bg-red-600 text-white' : 
                  variant === 'warning' ? 'bg-amber-500 hover:bg-amber-600 text-zinc-950' : 
                  'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {confirmText}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
