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
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { motion } from 'motion/react';
import { SUPPORT_TICKETS } from '@/data/mock';
import { formatDate, cn } from '@/lib/utils';

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
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Support Center</div>
            <h1 className="text-7xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Support Center</h1>
            <p className="text-zinc-500 text-sm font-medium uppercase tracking-widest max-w-2xl mx-auto leading-relaxed">
              Access our comprehensive knowledge base or connect with our support specialists for immediate assistance.
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
              <Button variant="gold" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
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
              <Button variant="secondary" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12">
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
              <Button variant="ghost" className="w-full rounded-xl font-black uppercase tracking-widest text-[10px] h-12 border border-zinc-800">
                Browse Guides
                <ExternalLink className="w-4 h-4 ml-2" />
              </Button>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="space-y-12">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

          {/* Active Tickets */}
          <div className="space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase">Active Tickets</h2>
              <div className="flex items-center space-x-4">
                <div className="h-px w-12 bg-emerald-500" />
                <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em]">Ticket Status</span>
              </div>
            </div>

            <div className="space-y-4">
              {SUPPORT_TICKETS.map((ticket) => (
                <Card key={ticket.id} className="premium-card p-8 group hover:border-zinc-700 transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start space-x-6">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center shrink-0",
                        ticket.status === 'open' ? "bg-amber-500/10 text-amber-500" : "bg-emerald-500/10 text-emerald-500"
                      )}>
                        <LifeBuoy className="w-6 h-6" />
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">#{ticket.id}</span>
                          <Badge variant={ticket.status === 'open' ? 'warning' : 'success'} className="text-[8px] font-black uppercase tracking-widest">
                            {ticket.status}
                          </Badge>
                        </div>
                        <h4 className="text-lg font-black text-zinc-100 uppercase tracking-tight">{ticket.subject}</h4>
                        <div className="flex items-center space-x-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                          <span className="flex items-center"><Clock className="w-3 h-3 mr-1" /> {formatDate(ticket.createdAt)}</span>
                          <span className="flex items-center"><MessageCircle className="w-3 h-3 mr-1" /> {ticket.category}</span>
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-100">
                      View Details
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
