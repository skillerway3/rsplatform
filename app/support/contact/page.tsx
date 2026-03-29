'use client';

import React, { useState } from 'react';
import { 
  Mail, 
  MessageSquare, 
  Clock, 
  Send, 
  ShieldCheck, 
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'email' | 'ticket' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleOpenModal = (type: 'email' | 'ticket') => {
    setModalType(type);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          type: modalType
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }
      
      setIsSuccess(true);
      setTimeout(() => {
        setIsModalOpen(false);
        setIsSuccess(false);
        setFormData({ name: '', email: '', subject: '', message: '' });
      }, 3000);
    } catch (error: unknown) {
  console.error("Support error:", error);

  const message =
    error instanceof Error
      ? error.message
      : "Failed to send message. Please try again.";

  setError(message);
} finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-32 pb-20 bg-zinc-950">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">
              Contact <span className="text-amber-500">Support</span>
            </h1>
            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">
              We&apos;re here to help you with any issues or questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Support Options */}
            <div className="space-y-6">
              <button 
                onClick={() => handleOpenModal('email')}
                className="w-full p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem] text-left group hover:border-amber-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Mail className="w-6 h-6 text-amber-500" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Email Support</h3>
                <p className="text-zinc-500 text-sm mb-6">Send us an email directly for detailed inquiries and technical support.</p>
                <div className="flex items-center text-amber-500 text-[10px] font-black uppercase tracking-widest">
                  Send Email <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>

              <button 
                onClick={() => handleOpenModal('ticket')}
                className="w-full p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem] text-left group hover:border-amber-500/20 transition-all"
              >
                <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Send className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Submit Ticket</h3>
                <p className="text-zinc-500 text-sm mb-6">Open a support ticket to track the progress of your request.</p>
                <div className="flex items-center text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                  Open Ticket <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </button>
            </div>

            <div className="space-y-6">
              <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem]">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6">
                  <MessageSquare className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Live Chat</h3>
                <p className="text-zinc-500 text-sm mb-6">Chat with our support team in real-time for quick assistance.</p>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl w-fit">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-500">Available Now</span>
                </div>
              </div>

              <div className="p-8 bg-zinc-900/30 border border-white/5 rounded-[2rem]">
                <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center mb-6">
                  <Clock className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Response Time</h3>
                <p className="text-zinc-500 text-sm mb-6">Our average response time for all support channels.</p>
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Average</p>
                    <p className="text-xl font-black text-white">&lt; 2 Hours</p>
                  </div>
                  <div className="w-px h-8 bg-white/5" />
                  <div>
                    <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Max</p>
                    <p className="text-xl font-black text-white">24 Hours</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 p-10 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/10 rounded-[3rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Safe & Secure</span>
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-2">Need immediate help?</h3>
              <p className="text-zinc-500 text-sm">Check our FAQ or start a live chat session with our support agents.</p>
            </div>
            <Button variant="gold" className="px-10 py-6 rounded-2xl font-black uppercase tracking-widest text-xs">
              Open FAQ
            </Button>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-zinc-900 border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 md:p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight text-white">
                      {modalType === 'email' ? 'Email Support' : 'Submit Ticket'}
                    </h2>
                    <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest mt-1">
                      {modalType === 'email' ? 'Send us a message' : 'Open a new support ticket'}
                    </p>
                  </div>
                  <button 
                    onClick={() => {
                      setIsModalOpen(false);
                      setError(null);
                    }}
                    className="p-2 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <X className="w-6 h-6 text-zinc-500" />
                  </button>
                </div>

                {error && (
                  <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                {isSuccess ? (
                  <div className="py-12 text-center">
                    <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight text-white mb-2">Message Sent!</h3>
                    <p className="text-zinc-500 text-sm">We&apos;ve received your request and will get back to you shortly.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          required
                          value={formData.name}
                          onChange={(e) => {
                            setFormData({ ...formData, name: e.target.value });
                            setError(null);
                          }}
                          className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-sm focus:border-amber-500/50 transition-all outline-none"
                          placeholder="John Doe"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => {
                            setFormData({ ...formData, email: e.target.value });
                            setError(null);
                          }}
                          className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-sm focus:border-amber-500/50 transition-all outline-none"
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</label>
                      <input 
                        required
                        value={formData.subject}
                        onChange={(e) => {
                          setFormData({ ...formData, subject: e.target.value });
                          setError(null);
                        }}
                        className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-sm focus:border-amber-500/50 transition-all outline-none"
                        placeholder="How can we help?"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message</label>
                      <textarea 
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => {
                          setFormData({ ...formData, message: e.target.value });
                          setError(null);
                        }}
                        className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-sm focus:border-amber-500/50 transition-all outline-none resize-none"
                        placeholder="Tell us more about your issue..."
                      />
                    </div>

                    <Button 
                      disabled={isSubmitting}
                      className="w-full py-7 rounded-2xl font-black uppercase tracking-widest text-xs"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message'}
                    </Button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
