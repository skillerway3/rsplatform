'use client';

import React from 'react';
import { MessageSquare, X, ChevronRight, ShieldCheck, Headphones, AlertCircle, HelpCircle, ArrowLeft, Send, Loader2, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/components/auth/AuthProvider';

type ChatStep = 'initial' | 'buyer' | 'seller' | 'faq' | 'live_agent' | 'success';

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
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<ChatStep>('initial');
  const [parentStep, setParentStep] = React.useState<'buyer' | 'seller' | null>(null);
  const [category, setCategory] = React.useState<string | null>(null);
  const [selectedFaq, setSelectedFaq] = React.useState<FAQItem | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [chatMessage, setChatMessage] = React.useState('');

  const resetChat = () => {
    setStep('initial');
    setCategory(null);
    setSelectedFaq(null);
    setChatMessage('');
  };

  const handleLiveAgentRequest = async (topic?: string) => {
    setIsSubmitting(true);
    try {
      await fetch('/api/notify-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'live_agent_request',
          email: user?.email || 'Guest',
          category: parentStep === 'buyer' ? 'Buyer' : 'Seller',
          topic: topic || chatMessage || 'General Support',
        }),
      });
      setStep('success');
    } catch (error) {
      console.error('Failed to notify admin:', error);
    } finally {
      setIsSubmitting(false);
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
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
              <AnimatePresence mode="wait">
                {step === 'initial' && (
                  <motion.div
                    key="initial"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
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
                    className="space-y-3"
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
                      { id: 'close', label: 'Close conversation', icon: X },
                    ]).map((opt) => (
                      <button 
                        key={opt.id}
                        onClick={() => {
                          if (opt.id === 'close') {
                            setIsOpen(false);
                          } else if (opt.id === 'live_agent') {
                            setStep('live_agent');
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

                {step === 'live_agent' && (
                  <motion.div
                    key="live_agent"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <button 
                      onClick={() => setStep(parentStep || 'initial')}
                      className="flex items-center space-x-2 text-[9px] font-black text-zinc-500 uppercase tracking-widest hover:text-white transition-colors mb-4"
                    >
                      <ArrowLeft className="w-3 h-3" />
                      <span>Back</span>
                    </button>

                    <div className="space-y-4">
                      <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center border border-amber-500/20">
                        <Headphones className="w-6 h-6 text-amber-500" />
                      </div>
                      <h3 className="text-sm font-black text-white uppercase tracking-widest">Connect with Agent</h3>
                      <p className="text-zinc-500 text-[10px] font-medium leading-relaxed">
                        Please describe your issue briefly so we can connect you with the right specialist.
                      </p>
                      
                      <textarea
                        value={chatMessage}
                        onChange={(e) => setChatMessage(e.target.value)}
                        placeholder="Type your message here..."
                        className="w-full h-32 bg-zinc-900/50 border border-white/5 rounded-2xl p-4 text-xs font-medium text-white focus:outline-none focus:border-amber-500/30 transition-all resize-none"
                      />

                      <Button 
                        variant="gold" 
                        className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                        onClick={() => handleLiveAgentRequest()}
                        disabled={isSubmitting || !chatMessage.trim()}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Send Request'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 'faq' && category && (
                  <motion.div
                    key="faq"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
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
                          {category === 'wallet' && parentStep === 'buyer' && (
                            <Button 
                              variant="gold" 
                              className="w-full mt-4 rounded-xl text-[9px] font-black uppercase tracking-widest"
                              onClick={() => {
                                setChatMessage("I would like to proceed with a withdrawal request.");
                                handleLiveAgentRequest("Withdrawal Request");
                              }}
                            >
                              Proceed
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="pt-6 border-t border-white/5">
                      <p className="text-zinc-500 text-[9px] font-black uppercase tracking-widest text-center mb-4">Still need help?</p>
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl text-[9px] font-black uppercase tracking-widest border-white/5 hover:bg-white/5"
                        onClick={() => handleLiveAgentRequest(`FAQ: ${category}`)}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Talk to Live Agent'}
                      </Button>
                    </div>
                  </motion.div>
                )}

                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-12"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                      <Send className="w-8 h-8 text-emerald-500" />
                    </div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight mb-4">Request Sent</h3>
                    <p className="text-zinc-500 text-[10px] font-medium leading-relaxed mb-8">
                      A support agent has been notified. We will contact you via email or platform message within 15 minutes.
                    </p>
                    <Button variant="outline" onClick={resetChat} className="rounded-xl px-8 text-[9px] font-black uppercase tracking-widest">
                      Start New Inquiry
                    </Button>
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

function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
