'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  User, 
  Headphones, 
  ChevronRight, 
  HelpCircle,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useAuth } from '@/components/auth/AuthProvider';

interface Message {
  id: string;
  sender_id: string;
  content: string;
  sender_type: 'user' | 'admin' | 'system';
  is_read: boolean;
  created_at: string;
  sender?: {
    username: string;
    avatar_url: string;
  };
}

type ChatStep = 'initial' | 'buyer' | 'seller' | 'faq' | 'chat' | 'success' | 'guest_form';

interface FAQItem {
  question: string;
  answer: string;
}

const BUYER_FAQS: Record<string, FAQItem[]> = {
  order_process: [
    { question: 'Question about order', answer: 'For questions about an active order, please visit your Order Details page and use the "Message Seller" button for direct communication. If you have a dispute, you can use the "Open Dispute" button after delivery.' },
  ],
  verification: [
    { question: 'Questions about verification process', answer: 'Verification is required for all sellers to ensure marketplace safety. You can track your verification status in your Seller Dashboard. Most reviews are completed within 24-48 hours.' },
  ],
  security: [
    { question: 'Account and security questions', answer: 'To keep your account secure, never share your password or click on suspicious links. You can update your security settings and enable 2FA in your profile settings.' },
  ],
  violations: [
    { question: 'I want to report a violation', answer: 'We take marketplace integrity seriously. Please provide the Order ID or Username of the person you are reporting, along with evidence, and our safety team will investigate.' },
  ],
  wallet: [
    { question: 'Withdraw money from my wallet', answer: 'Note that all withdrawals are made to your original payment method. Due to payment provider processing time it may take up to 3 business days for money to reach you.' },
  ],
};

const SELLER_FAQS: Record<string, FAQItem[]> = {
  disputes: [
    { question: 'Questions about offers and disputes', answer: 'If a buyer opens a dispute, provide all evidence of delivery in the order chat. Our moderators will review the evidence and make a final decision within 72 hours. For offer questions, ensure your terms are clear in the message.' },
  ],
  verification: [
    { question: 'Questions about seller verification', answer: 'To become a verified seller, you must provide valid government ID and a selfie. Once submitted, our team will review your application within 48 hours. This is mandatory for all sellers.' },
  ],
  feedback: [
    { question: 'I want to report abusive feedback', answer: 'If you believe a review is abusive or violates our terms, please report it to our support team with the Order ID. We will investigate and remove it if it meets our removal criteria.' },
  ],
  violations: [
    { question: 'I want to report a violation', answer: 'Marketplace integrity is our priority. Report any suspicious behavior, off-platform payment requests, or harassment immediately with evidence.' },
  ],
  delete_account: [
    { question: 'I want to delete my account', answer: 'To delete your account, ensure all active orders are completed and your balance is zero. Contact support to initiate the permanent deletion process.' },
  ],
};

export function LiveChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<ChatStep>('initial');
  const [parentStep, setParentStep] = useState<'buyer' | 'seller' | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, step]);

  // Subscribe to messages if thread exists
  useEffect(() => {
    if (!threadId || step !== 'chat') return;

    const channel = supabase
      .channel(`support_thread_${threadId}`)
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'support_messages',
        filter: `thread_id=eq.${threadId}`
      }, async (payload) => {
        const { data: newMessage } = await supabase
          .from('support_messages')
          .select(`*, sender:profiles!support_messages_sender_id_fkey(username, avatar_url)`)
          .eq('id', payload.new.id)
          .single();
        
        if (newMessage) {
          setMessages(prev => {
            if (prev.find(m => m.id === newMessage.id)) return prev;
            return [...prev, newMessage];
          });
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [threadId, step]);

  const resetChat = () => {
    setStep('initial');
    setCategory(null);
    setInputText('');
  };

  const [guestInfo, setGuestInfo] = useState({ name: '', email: '' });

  const handleLiveAgentRequest = async (topic?: string) => {
    if (!user && (!guestInfo.name || !guestInfo.email)) {
      setStep('guest_form');
      return;
    }

    setLoading(true);
    try {
      // Check for existing open thread
      let query = supabase
        .from('support_threads')
        .select('id')
        .eq('status', 'open');
      
      if (user) {
        query = query.eq('user_id', user.id);
      } else {
        query = query.eq('guest_email', guestInfo.email);
      }

      const { data: existingThread } = await query
        .order('last_message_at', { ascending: false })
        .limit(1)
        .single();

      let currentThreadId = existingThread?.id;

      if (!currentThreadId) {
        const { data: newThread, error: threadError } = await supabase
          .from('support_threads')
          .insert({
            user_id: user?.id || null,
            guest_name: user ? null : guestInfo.name,
            guest_email: user ? null : guestInfo.email,
            guest_session_id: user ? null : guestSessionId,
            subject: topic || 'Live Agent Support Request',
            priority: 'medium',
            status: 'open'
          })
          .select()
          .single();

        if (threadError) throw threadError;
        currentThreadId = newThread.id;
      }

      setThreadId(currentThreadId);
      
      // Fetch messages
      const { data: msgs } = await supabase
        .from('support_messages')
        .select(`*, sender:profiles!support_messages_sender_id_fkey(username, avatar_url)`)
        .eq('thread_id', currentThreadId)
        .order('created_at', { ascending: true });

      setMessages(msgs || []);
      setStep('chat');
    } catch (error) {
      console.error('Error starting chat:', error);
    } finally {
      setLoading(false);
    }
  };

  const [guestSessionId, setGuestSessionId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      let gid = localStorage.getItem('rs_guest_session_id');
      if (!gid) {
        gid = crypto.randomUUID();
        localStorage.setItem('rs_guest_session_id', gid);
      }
      setGuestSessionId(gid);
    }
  }, [user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !threadId || isSending) return;

    setIsSending(true);
    const content = inputText;
    setInputText('');

    try {
      if (user) {
        const { error } = await supabase.from('support_messages').insert({
          thread_id: threadId,
          sender_id: user.id,
          content,
          sender_type: 'user',
          is_read: false
        });

        if (error) throw error;

        await supabase.from('support_threads').update({ 
          last_message_at: new Date().toISOString() 
        }).eq('id', threadId);
      } else {
        // Guest message via API
        const response = await fetch('/api/support/guest-message', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            threadId,
            guestSessionId,
            content
          })
        });

        if (!response.ok) throw new Error('Failed to send guest message');
      }

    } catch (error) {
      console.error('Error sending message:', error);
      setInputText(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 md:bottom-8 md:right-8 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute bottom-20 right-0 w-[calc(100vw-2rem)] sm:w-[380px] bg-[#141416] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] sm:max-h-[600px]"
          >
            {/* Header */}
            <div className="p-6 bg-zinc-900/50 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/20">
                  <ShieldCheck className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">RS Support</h3>
                  <div className="flex items-center space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                {step === 'initial' && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-4"
                  >
                    <p className="text-zinc-400 text-xs font-medium leading-relaxed mb-6">
                      Hello! Pick an option below so we can assist you.
                    </p>
                    <button 
                      onClick={() => {
                        setParentStep('buyer');
                        setStep('buyer');
                      }}
                      className="w-full p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">I am a Buyer</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </button>
                    <button 
                      onClick={() => {
                        setParentStep('seller');
                        setStep('seller');
                      }}
                      className="w-full p-4 bg-zinc-900/50 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-amber-500/30 transition-all"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-zinc-500 group-hover:text-amber-500 transition-colors">
                          <Headphones className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">I am a Seller</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors" />
                    </button>
                  </motion.div>
                )}

                {(step === 'buyer' || step === 'seller') && (
                  <motion.div
                    key="options"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-3"
                  >
                    <button 
                      onClick={resetChat}
                      className="flex items-center space-x-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>
                    
                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      {step === 'buyer' ? 'Buyer Support' : 'Seller Support'}
                    </p>

                    {(step === 'buyer' ? [
                      { id: 'order_process', label: 'Question about order', icon: HelpCircle },
                      { id: 'verification', label: 'Questions about verification process', icon: ShieldCheck },
                      { id: 'security', label: 'Account and security questions', icon: AlertCircle },
                      { id: 'wallet', label: 'Withdraw money from my wallet', icon: HelpCircle },
                      { id: 'violations', label: 'I want to report a violation', icon: AlertCircle },
                      { id: 'live_agent', label: 'Talk to Live Agent', icon: Headphones, primary: true },
                    ] : [
                      { id: 'disputes', label: 'Questions about offers and disputes', icon: AlertCircle },
                      { id: 'verification', label: 'Questions about seller verification', icon: ShieldCheck },
                      { id: 'feedback', label: 'I want to report abusive feedback', icon: HelpCircle },
                      { id: 'violations', label: 'I want to report a violation', icon: AlertCircle },
                      { id: 'delete_account', label: 'I want to delete my account', icon: User },
                      { id: 'live_agent', label: 'Talk to Live Agent', icon: Headphones, primary: true },
                    ]).map((opt) => (
                      <button 
                        key={opt.id}
                        onClick={() => {
                          if (opt.id === 'live_agent') {
                            handleLiveAgentRequest();
                          } else {
                            setCategory(opt.id);
                            setStep('faq');
                          }
                        }}
                        className={cn(
                          "w-full p-4 rounded-2xl flex items-center justify-between group transition-all border",
                          opt.primary 
                            ? "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20" 
                            : "bg-zinc-900/50 border-white/5 hover:border-amber-500/30"
                        )}
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                            opt.primary ? "text-amber-500" : "text-zinc-500 group-hover:text-amber-500"
                          )}>
                            <opt.icon className="w-4 h-4" />
                          </div>
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            opt.primary ? "text-amber-500" : "text-white"
                          )}>{opt.label}</span>
                        </div>
                        <ChevronRight className={cn(
                          "w-3 h-3 transition-colors",
                          opt.primary ? "text-amber-500" : "text-zinc-600 group-hover:text-amber-500"
                        )} />
                      </button>
                    ))}
                  </motion.div>
                )}

                {step === 'faq' && category && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-4"
                  >
                    <button 
                      onClick={() => setStep(parentStep || 'initial')}
                      className="flex items-center space-x-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>

                    <p className="text-zinc-400 text-[10px] font-black uppercase tracking-widest mb-4">Frequently Asked Questions</p>

                    <div className="space-y-3">
                      {(parentStep === 'buyer' ? BUYER_FAQS[category] : SELLER_FAQS[category])?.map((faq, i) => (
                        <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-2xl p-4">
                          <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-2">{faq.question}</h4>
                          <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">{faq.answer}</p>
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest text-center mb-4">Still need help?</p>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5"
                        onClick={() => handleLiveAgentRequest(`FAQ: ${category}`)}
                        disabled={loading}
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Talk to Live Agent'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 'guest_form' && (
                  <motion.div
                    key="guest_form"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 space-y-6"
                  >
                    <button 
                      onClick={() => setStep(parentStep || 'initial')}
                      className="flex items-center space-x-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>

                    <div className="space-y-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Guest Support</h3>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        Please provide your details so we can assist you better.
                      </p>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                        <input 
                          type="text"
                          placeholder="Your Name"
                          value={guestInfo.name}
                          onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                        <input 
                          type="email"
                          placeholder="your@email.com"
                          value={guestInfo.email}
                          onChange={(e) => setGuestInfo({ ...guestInfo, email: e.target.value })}
                          className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                        />
                      </div>
                    </div>

                    <Button 
                      variant="gold" 
                      className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      onClick={() => handleLiveAgentRequest()}
                      disabled={!guestInfo.name || !guestInfo.email || loading}
                    >
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Start Chat'}
                    </Button>
                  </motion.div>
                )}

                {step === 'chat' && (
                  <motion.div
                    key="chat"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex-1 flex flex-col min-h-0"
                  >
                    <div className="p-4 border-b border-white/5 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button onClick={() => setStep(parentStep || 'initial')} className="p-2 text-zinc-500 hover:text-white">
                          <ChevronRight className="w-4 h-4 rotate-180" />
                        </button>
                        <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Support Chat</span>
                      </div>
                      <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">ID: {threadId?.substr(0, 8)}</span>
                    </div>
                    
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 scroll-smooth custom-scrollbar">
                      {messages.length === 0 && (
                        <div className="text-center py-12 space-y-4">
                          <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center border border-white/5 mx-auto">
                            <MessageSquare className="w-6 h-6 text-zinc-700" />
                          </div>
                          <p className="text-[11px] text-zinc-500 font-medium max-w-[200px] mx-auto">
                            Send a message to start your conversation with an agent.
                          </p>
                        </div>
                      )}
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className={cn(
                            "flex flex-col space-y-1 max-w-[85%]",
                            msg.sender_type === 'admin' ? "items-start" : "items-end ml-auto"
                          )}
                        >
                          <div className={cn(
                            "px-4 py-3 rounded-2xl text-[11px] font-medium leading-relaxed shadow-sm",
                            msg.sender_type === 'admin' 
                              ? "bg-zinc-950 text-zinc-300 border border-white/5 rounded-tl-none" 
                              : "bg-amber-500 text-zinc-950 rounded-tr-none"
                          )}>
                            {msg.content}
                          </div>
                          <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest px-1">
                            {msg.sender_type === 'admin' ? 'Support Agent' : (msg.sender?.username || (user ? 'You' : 'Guest'))} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="p-4 bg-zinc-950/50 border-t border-white/5 flex items-center space-x-3">
                      <input 
                        type="text"
                        placeholder="Type your message..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 bg-zinc-900 border border-white/5 rounded-xl px-4 py-3 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all"
                      />
                      <button 
                        type="submit"
                        disabled={isSending || !inputText.trim()}
                        className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-zinc-950 disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                      >
                        {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 bg-zinc-950/50 border-t border-white/5 text-center">
              <p className="text-[8px] font-black text-zinc-600 uppercase tracking-[0.3em]">
                Powered by RSPlatform Secure Support
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        id="live-chat-trigger"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-500 group relative",
          isOpen 
            ? "bg-zinc-900 border border-white/10 rotate-90" 
            : "bg-amber-500 border border-amber-400/50 hover:scale-110 hover:-translate-y-1"
        )}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <>
            <MessageSquare className="w-6 h-6 text-zinc-950 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-zinc-950 animate-pulse" />
          </>
        )}
      </button>
    </div>
  );
}
