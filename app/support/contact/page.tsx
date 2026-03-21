'use client';

import React from 'react';
import { Mail, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function ContactPage() {
  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-6">
              <ShieldCheck className="w-4 h-4" />
              <span>Support Center</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none mb-8">
              Contact <span className="text-amber-500">Us</span>
            </h1>
            <p className="text-zinc-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Have a question or need assistance? Our premium support team is available 24/7 to help you with any inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Mail className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Email Support</h3>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">support@rsplatform.com</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <MessageSquare className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Live Chat</h3>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Available 24/7</p>
            </div>
            <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-8 text-center space-y-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center mx-auto border border-amber-500/20">
                <Clock className="w-6 h-6 text-amber-500" />
              </div>
              <h3 className="text-white font-black uppercase text-xs tracking-widest">Response Time</h3>
              <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-widest">Under 15 Minutes</p>
            </div>
          </div>

          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-12 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
            
            <form className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Full Name</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Email Address</label>
                <input 
                  type="email" 
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="john@example.com"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Subject</label>
                <input 
                  type="text" 
                  className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="How can we help?"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Message</label>
                <textarea 
                  className="w-full h-48 bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 py-4 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-all resize-none"
                  placeholder="Describe your inquiry in detail..."
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <Button variant="gold" className="w-full h-16 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-amber-500/10">
                  Send Message
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
