'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/Button';
import { GAMES, CATEGORIES } from '@/data/mock';
import { SectionId } from '@/types';
import { SellProgress } from './SellProgress';
import { SellPreview } from './SellPreview';
import { SellStepCategory } from './SellStepCategory';
import { SellStepDetails } from './SellStepDetails';
import { SellStepAccountDetails } from './SellStepAccountDetails';
import { SellStepPricing } from './SellStepPricing';
import { SellStepReview } from './SellStepReview';
import { ChevronLeft, ChevronRight, CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';

import { useAuth } from '@/components/auth/AuthProvider';
import { useRouter } from 'next/navigation';

export function SellForm() {
  const { user, isVerifiedSeller, loading: authLoading } = useAuth();
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [formData, setFormData] = React.useState({
    gameId: '',
    sectionId: '' as SectionId | '',
    categoryId: '',
    title: '',
    description: '',
    price: '',
    stock: '1',
    deliveryTime: 'Instant',
    deliveryMethod: 'Face-to-Face',
    images: [] as string[],
    accountMetadata: {
      build: '',
      type: '',
      loginMethod: '',
      totalLevel: '',
      deliveryTime: '',
      tags: [] as string[],
      highlights: [] as string[],
      notes: ''
    }
  });

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isVerifiedSeller) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20 bg-zinc-900/40 border border-zinc-800/50 rounded-[3rem] p-12 backdrop-blur-xl">
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-amber-500/20">
          <ShieldCheck className="w-10 h-10 text-amber-500" />
        </div>
        <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">Verification Required</h2>
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs mb-10 leading-relaxed">
          You must verify your identity before you can list services or items on RSPlatform. This helps us maintain a safe and professional marketplace.
        </p>
        <Button 
          variant="gold" 
          className="px-12 h-16 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px]"
          onClick={() => router.push('/sell/verify')}
        >
          Verify Identity
        </Button>
      </div>
    );
  }

  const isAccount = formData.categoryId === 'accounts';
  const steps = isAccount 
    ? ['Category', 'Details', 'Account Specs', 'Pricing', 'Review']
    : ['Category', 'Details', 'Pricing', 'Review'];
  
  const totalSteps = steps.length;

  const updateFormData = (data: Partial<typeof formData>) => {
    if (data.categoryId) {
      // Automatically set sectionId based on categoryId
      let sectionId: SectionId = 'items';
      if (data.categoryId === 'gold') sectionId = 'currency';
      else if (data.categoryId === 'accounts') sectionId = 'accounts';
      else if (data.categoryId === 'services') sectionId = 'boosting';
      
      setFormData(prev => ({ ...prev, ...data, sectionId }));
    } else {
      setFormData(prev => ({ ...prev, ...data }));
    }
  };

  const isStepValid = () => {
    if (isAccount) {
      switch (step) {
        case 1: return formData.gameId && formData.categoryId;
        case 2: return formData.title.length >= 5 && formData.description.length >= 20;
        case 3: return formData.accountMetadata.build && formData.accountMetadata.type && formData.accountMetadata.loginMethod;
        case 4: return parseFloat(formData.price) > 0 && parseInt(formData.stock) > 0;
        case 5: return true;
        default: return false;
      }
    } else {
      switch (step) {
        case 1: return formData.gameId && formData.categoryId;
        case 2: return formData.title.length >= 5 && formData.description.length >= 20;
        case 3: return parseFloat(formData.price) > 0 && parseInt(formData.stock) > 0;
        case 4: return true;
        default: return false;
      }
    }
  };

  const nextStep = () => {
    if (isStepValid()) {
      setStep(prev => Math.min(prev + 1, totalSteps));
    }
  };

  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleSubmit = async () => {
    if (!isStepValid()) return;
    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsSuccess(true);
  };

  const selectedGame = GAMES.find(g => g.id === formData.gameId);
  const selectedCategory = CATEGORIES.find(c => c.id === formData.categoryId);

  if (isSuccess) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-20"
      >
        <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle2 className="w-12 h-12 text-emerald-500" />
        </div>
        <h2 className="text-4xl font-light mb-4">Listing <span className="italic serif text-amber-500">Published</span></h2>
        <p className="text-zinc-400 mb-10 text-lg">Your asset is now live on the marketplace. We&apos;ll notify you as soon as someone makes a purchase or sends an inquiry.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-10">
            View Listing
          </Button>
          <Button size="lg" variant="outline" className="border-zinc-800 hover:bg-zinc-900 px-10">
            Go to Dashboard
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
      <div className="lg:col-span-8">
        <SellProgress currentStep={step} steps={steps} />
        
        <div className="min-h-[500px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {step === 1 && (
                <SellStepCategory formData={formData} updateFormData={updateFormData} />
              )}
              {step === 2 && (
                <SellStepDetails formData={formData} updateFormData={updateFormData} />
              )}
              {isAccount ? (
                <>
                  {step === 3 && (
                    <SellStepAccountDetails formData={formData} updateFormData={updateFormData} />
                  )}
                  {step === 4 && (
                    <SellStepPricing formData={formData} updateFormData={updateFormData} />
                  )}
                  {step === 5 && (
                    <SellStepReview 
                      formData={formData} 
                      gameName={selectedGame?.name} 
                      categoryName={selectedCategory?.name} 
                    />
                  )}
                </>
              ) : (
                <>
                  {step === 3 && (
                    <SellStepPricing formData={formData} updateFormData={updateFormData} />
                  )}
                  {step === 4 && (
                    <SellStepReview 
                      formData={formData} 
                      gameName={selectedGame?.name} 
                      categoryName={selectedCategory?.name} 
                    />
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={prevStep}
            disabled={step === 1}
            className="text-zinc-500 hover:text-white disabled:opacity-0"
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          {step < totalSteps ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="bg-white hover:bg-zinc-200 text-black font-bold px-8 h-12"
            >
              Continue
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-12 h-12 shadow-[0_0_20px_rgba(245,158,11,0.3)]"
            >
              {isSubmitting ? 'Publishing...' : 'Publish Listing'}
            </Button>
          )}
        </div>
      </div>

      <div className="lg:col-span-4 hidden lg:block">
        <SellPreview 
          formData={formData} 
          gameName={selectedGame?.name} 
          categoryName={selectedCategory?.name} 
        />
      </div>
    </div>
  );
}
