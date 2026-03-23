'use client';

import * as React from 'react';
import { 
  ShieldCheck, 
  MessageCircle, 
  HelpCircle, 
  BookOpen, 
  Search, 
  ChevronRight, 
  Mail, 
  Globe, 
  Clock,
  ArrowRight,
  ExternalLink,
  LifeBuoy,
  Lock,
  Zap,
  X,
  Send,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

const FAQ_CATEGORIES = [
  { id: 'buying', name: 'Buying Assets', icon: Globe },
  { id: 'selling', name: 'Selling Assets', icon: Zap },
  { id: 'security', name: 'Security', icon: ShieldCheck },
  { id: 'payments', name: 'Payments & Fees', icon: Lock },
];

const FAQS = [
  {
    q: "How does the escrow system work?",
    a: "Our secure escrow system holds funds until both parties verify delivery. This ensures total security for both buyers and sellers.",
    cat: 'security'
  },
  {
    q: "What are the merchant fees?",
    a: "We charge a flat 5% service fee on all successful transactions. There are no hidden costs or listing fees.",
    cat: 'selling'
  },
  {
    q: "How fast are payouts processed?",
    a: "Payouts are initialized immediately after delivery verification. Depending on your withdrawal method, funds arrive within 1-24 hours.",
    cat: 'payments'
  },
  {
    q: "Is my account information safe?",
    a: "We use advanced encryption and never store sensitive credentials. All communication is secure and private.",
    cat: 'security'
  }
];

export default function SupportPage() {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [selectedCategory, setSelectedCategory] = React.useState('buying');
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitSuccess, setSubmitSuccess] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    type: 'support'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '', type: 'support' });
        setTimeout(() => {
          setSubmitSuccess(false);
          setIsFormOpen(false);
        }, 3000);
      } else {
        setSubmitError(result.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Failed to send support request:', error);
      setSubmitError('A network error occurred. Please check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-zinc-100/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-24">
          {/* Hero Section */}
          <header className="text-center space-y-8">
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Contact Us</div>
            <h1 className="text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Contact <span className="text-gradient-gold">Us</span></h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Have a question or need assistance? Our team is here to help you 24/7.
              Choose your preferred way to get in touch.
            </p>
            
            <div className="max-w-2xl mx-auto relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-600 group-focus-within:text-amber-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-16 bg-zinc-900/50 border border-zinc-800/50 rounded-2xl pl-16 pr-8 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-zinc-700"
              />
            </div>
          </header>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="premium-card p-10 group hover:border-amber-500/30 transition-all">
              <div className="w-14 h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-7 h-7 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight mb-4">Live Support</h3>
              <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed mb-8">
                Connect with a human agent for real-time resolution.
              </p>
              <Button 
                variant="gold" 
                className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12"
                onClick={() => {
                  const widget = document.getElementById('live-chat-trigger');
                  if (widget) widget.click();
                }}
              >
                Start Chat
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="premium-card p-10 group hover:border-emerald-500/30 transition-all">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <Mail className="w-7 h-7 text-emerald-500" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight mb-4">Submit Ticket</h3>
              <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed mb-8">
                Submit a request for complex technical issues.
              </p>
              <Button 
                variant="secondary" 
                className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12"
                onClick={() => setIsFormOpen(true)}
              >
                Open Ticket
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Card>

            <Card className="premium-card p-10 group hover:border-zinc-100/30 transition-all">
              <div className="w-14 h-14 bg-zinc-100/10 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <BookOpen className="w-7 h-7 text-zinc-100" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 uppercase tracking-tight mb-4">Documentation</h3>
              <p className="text-zinc-500 text-[11px] font-medium uppercase tracking-widest leading-relaxed mb-8">
                Detailed guides on platform mechanics.
              </p>
              <Button 
                variant="ghost" 
                className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12 border border-zinc-800"
                onClick={() => {
                  const el = document.getElementById('faq-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Browse Guides
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

          {/* Direct Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="premium-card p-8 bg-zinc-900/30 border-white/5">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Direct Email</p>
                  <a href="mailto:admin@rsplatform.gg" className="text-lg font-black text-white hover:text-amber-500 transition-colors tracking-tight">admin@rsplatform.gg</a>
                </div>
              </div>
            </Card>

            <Card className="premium-card p-8 bg-zinc-900/30 border-white/5">
              <div className="flex items-center space-x-6">
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-1">Response Time</p>
                  <p className="text-lg font-black text-white tracking-tight">Under 15 Minutes <span className="text-zinc-500 text-sm font-medium ml-2 uppercase tracking-widest">(24/7)</span></p>
                </div>
              </div>
            </Card>
          </div>

          {/* Support Form Modal */}
          <AnimatePresence>
            {isFormOpen && (
              <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setIsFormOpen(false)}
                  className="absolute inset-0 bg-zinc-950/80 backdrop-blur-sm"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  className="relative w-full max-w-lg bg-[#141416] border border-white/10 rounded-[2.5rem] p-10 shadow-2xl"
                >
                  <button 
                    onClick={() => setIsFormOpen(false)}
                    className="absolute top-8 right-8 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>

                  {submitSuccess ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                        <Send className="w-8 h-8 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-4">Message Sent</h3>
                      <p className="text-zinc-500 text-sm font-medium leading-relaxed">
                        Thank you for contacting us. We will get back to you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="mb-8">
                        <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Open Ticket</h3>
                        <p className="text-zinc-500 text-xs font-medium">Fill out the form below and we&apos;ll get back to you.</p>
                      </div>

                      {submitError && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-500 text-xs font-bold uppercase tracking-widest">
                          <AlertCircle className="w-4 h-4" />
                          {submitError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Name</label>
                          <input 
                            required
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email</label>
                          <input 
                            required
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Subject</label>
                        <input 
                          required
                          type="text"
                          value={formData.subject}
                          onChange={(e) => setFormData({...formData, subject: e.target.value})}
                          className="w-full bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Message</label>
                        <textarea 
                          required
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                          className="w-full h-32 bg-zinc-950/50 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all resize-none"
                        />
                      </div>

                      <Button 
                        type="submit"
                        variant="gold" 
                        className="w-full h-14 rounded-xl text-[11px] font-black uppercase tracking-widest"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Message'}
                      </Button>
                    </form>
                  )}
                </motion.div>
              </div>
            )}
          </AnimatePresence>

          {/* FAQ Section */}
          <div id="faq-section" className="space-y-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">Knowledge Base</h2>
                <div className="flex items-center space-x-4">
                  <div className="h-px w-12 bg-amber-500" />
                  <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Common Questions</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {FAQ_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      "px-6 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all flex items-center space-x-2",
                      selectedCategory === cat.id ? "bg-amber-500 text-zinc-950 border-amber-500 shadow-lg shadow-amber-500/20" : "bg-zinc-900/50 border-zinc-800 text-zinc-500 hover:border-zinc-700"
                    )}
                  >
                    <cat.icon className="w-3 h-3" />
                    <span>{cat.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-24">
              {FAQS.filter(f => f.cat === selectedCategory).map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="premium-card p-8 h-full">
                    <h4 className="text-sm font-black text-zinc-100 uppercase tracking-widest mb-4 flex items-start">
                      <HelpCircle className="w-4 h-4 text-amber-500 mr-3 mt-0.5 shrink-0" />
                      {faq.q}
                    </h4>
                    <p className="text-zinc-500 text-[11px] font-medium leading-relaxed pl-7">
                      {faq.a}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
