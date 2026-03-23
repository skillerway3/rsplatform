'use client';

import React from 'react';
import { X, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'motion/react';

interface ContactFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'email' | 'ticket';
}

export function ContactFormModal({ isOpen, onClose, type }: ContactFormModalProps) {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      subject: formData.get('subject'),
      message: formData.get('message'),
      type: type === 'email' ? 'support_email' : 'support_ticket',
    };

    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || 'Failed to send message');
      }

      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
      />
      
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-[#141416] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-12">
          <button 
            onClick={onClose}
            className="absolute top-8 right-8 p-2 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          <div className="mb-10">
            <div className="inline-flex items-center space-x-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
              <ShieldCheck className="w-4 h-4" />
              <span>{type === 'email' ? 'Email Support' : 'Submit Ticket'}</span>
            </div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">
              {type === 'email' ? 'Send us a message' : 'Open a support ticket'}
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <Send className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Message Sent!</h3>
                <p className="text-zinc-500 text-sm font-medium leading-relaxed mb-8">
                  Thank you for reaching out. Our team has received your inquiry and will get back to you within 15 minutes.
                </p>
                <Button variant="outline" onClick={onClose} className="rounded-xl px-8">
                  Close Window
                </Button>
              </motion.div>
            ) : (
              <motion.form
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Full Name</label>
                    <input 
                      required
                      name="name"
                      type="text" 
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Email Address</label>
                    <input 
                      required
                      name="email"
                      type="email" 
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Subject</label>
                  <input 
                    required
                    name="subject"
                    type="text" 
                    className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                    placeholder={type === 'email' ? 'General Inquiry' : 'Order Issue #12345'}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Message</label>
                  <textarea 
                    required
                    name="message"
                    className="w-full h-40 bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                    placeholder="How can we help you today?"
                  />
                </div>

                {error && (
                  <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{error}</p>
                )}

                <Button 
                  type="submit"
                  disabled={isSubmitting}
                  variant="gold" 
                  className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/10"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </>
                  )}
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
