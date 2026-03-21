'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { BoostingTabs } from './BoostingTabs';
import { ServiceFormLayout } from './ServiceFormLayout';
import { PowerLevelingForm } from './PowerLevelingForm';
import { QuestingForm } from './QuestingForm';
import { FireCapeForm } from './FireCapeForm';
import { MinigamesForm } from './MinigamesForm';
import { PvMForm } from './PvMForm';
import { QuiverForm } from './QuiverForm';
import { IronmanGatheringForm } from './IronmanGatheringForm';
import { CombatAchievementsForm } from './CombatAchievementsForm';
import { BloodTorvaForm } from './BloodTorvaForm';
import { YamaContractsForm } from './YamaContractsForm';
import { RaidsForm } from './RaidsForm';
import { AchievementDiariesForm } from './AchievementDiariesForm';
import { CustomRequestForm } from './CustomRequestForm';
import { BOOSTING_SERVICES } from '@/data/boosting/services';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';

function BoostingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const serviceParam = searchParams.get('service');
  const gameParam = searchParams.get('game');

  const [activeTab, setActiveTab] = useState(serviceParam || 'power-leveling');
  const [orderSummary, setOrderSummary] = useState<{ service: string; details: string[] }>({
    service: 'Power Leveling',
    details: [],
  });

  const [options, setOptions] = useState({
    stream: false,
    offlineMode: true,
    remoteParsec: false,
    useVPN: true,
    jagexAccount: false,
  });

  // Sync active tab with URL parameter
  useEffect(() => {
    if (serviceParam && serviceParam !== activeTab) {
      const isValidService = BOOSTING_SERVICES.some(s => s.id === serviceParam);
      if (isValidService) {
        setActiveTab(serviceParam);
      }
    }
  }, [serviceParam, activeTab]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const params = new URLSearchParams(searchParams.toString());
    params.set('service', tabId);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleOptionChange = (key: string, value: boolean) => {
    setOptions(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdateOrder = useCallback((summary: { service: string; details: string[] }) => {
    setOrderSummary((prev) => {
      const sameService = prev.service === summary.service;
      const sameLength = prev.details.length === summary.details.length;
      const sameDetails = sameLength && prev.details.every((detail, index) => detail === summary.details[index]);

      if (sameService && sameDetails) {
        return prev;
      }

      return summary;
    });
  }, []);

  const isOSRS = !gameParam || gameParam.toUpperCase() === 'OSRS';

  if (!isOSRS) {
    return (
      <div className="py-24 text-center space-y-8 bg-zinc-900/40 border border-white/5 rounded-[2.5rem] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 blur-[80px] rounded-full -mr-32 -mt-32" />
        <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20">
          <Zap className="w-10 h-10 text-amber-500" />
        </div>
        <div className="space-y-4 max-w-md mx-auto relative z-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">Boosting Coming Soon</h2>
          <p className="text-zinc-500 text-sm font-medium leading-relaxed">
            We are currently expanding our professional boosting services to {gameParam?.toUpperCase()}. 
            Stay tuned for high-quality power leveling, questing, and bossing services.
          </p>
          <div className="pt-4">
            <Button variant="outline" className="rounded-xl px-8 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800">
              Notify Me
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const renderForm = () => {
    switch (activeTab) {
      case 'power-leveling':
        return <PowerLevelingForm onUpdate={handleUpdateOrder} />;
      case 'questing':
        return <QuestingForm onUpdate={handleUpdateOrder} />;
      case 'fire-cape':
        return <FireCapeForm onUpdate={handleUpdateOrder} />;
      case 'minigames':
        return <MinigamesForm onUpdate={handleUpdateOrder} />;
      case 'pvm':
        return <PvMForm onUpdate={handleUpdateOrder} />;
      case 'quiver':
        return <QuiverForm onUpdate={handleUpdateOrder} />;
      case 'ironman-gathering':
        return <IronmanGatheringForm onUpdate={handleUpdateOrder} />;
      case 'combat-achievements':
        return <CombatAchievementsForm onUpdate={handleUpdateOrder} />;
      case 'blood-torva':
        return <BloodTorvaForm onUpdate={handleUpdateOrder} />;
      case 'yama-contracts':
        return <YamaContractsForm onUpdate={handleUpdateOrder} />;
      case 'raids':
        return <RaidsForm onUpdate={handleUpdateOrder} />;
      case 'achievement-diaries':
        return <AchievementDiariesForm onUpdate={handleUpdateOrder} />;
      case 'custom-request':
        return <CustomRequestForm onUpdate={handleUpdateOrder} />;
      default:
        return <PowerLevelingForm onUpdate={handleUpdateOrder} />;
    }
  };

  const getServiceInfo = () => {
    switch (activeTab) {
      case 'power-leveling': return { title: 'Power Leveling', description: 'Professional skill training tailored to your goals. Fast, efficient, and secure.' };
      case 'questing': return { title: 'Questing Services', description: 'Complete any quest or quest line. From novice to grandmaster, we handle it all.' };
      case 'fire-cape': return { title: 'Fire Cape & Jad', description: 'Guaranteed Fire Cape completion. Our experts handle the waves so you don\'t have to.' };
      case 'minigames': return { title: 'Minigames & Rewards', description: 'Unlock powerful gear and rewards from OSRS\'s most challenging minigames.' };
      case 'pvm': return { title: 'PvM & Bossing', description: 'Expert boss killing and monster hunting for rare drops and pets.' };
      case 'quiver': return { title: 'Fortis Colosseum', description: 'Master the Colosseum and earn your Dizana\'s Quiver with our expert help.' };
      case 'ironman-gathering': return { title: 'Ironman Gathering', description: 'Specialized resource gathering for Ironman accounts. We do the grind for you.' };
      case 'combat-achievements': return { title: 'Combat Achievements', description: 'Complete challenging combat tasks and unlock prestigious rewards.' };
      case 'blood-torva': return { title: 'Blood Torva', description: 'Unlock the ultimate cosmetic upgrade for your Torva armor.' };
      case 'yama-contracts': return { title: 'Yama Contracts', description: 'Professional completion of Yama contracts for exclusive rewards.' };
      case 'raids': return { title: 'Raids & CoX/ToB/ToA', description: 'Expert raid completion and teaching. High-tier loot awaits.' };
      case 'achievement-diaries': return { title: 'Achievement Diaries', description: 'Complete any diary tier in any region for powerful utility rewards.' };
      case 'custom-request': return { title: 'Custom Request', description: 'Need something unique? Describe your request and we\'ll make it happen.' };
      default: return { title: 'Boosting Services', description: 'Professional OSRS services tailored to your needs.' };
    }
  };

  const serviceInfo = getServiceInfo();

  return (
    <div className="space-y-16">
      <BoostingTabs activeTab={activeTab} onTabChange={handleTabChange} />
      
      <ServiceFormLayout 
        title={serviceInfo.title}
        description={serviceInfo.description}
        options={options}
        onOptionChange={handleOptionChange}
        summary={orderSummary}
      >
        {renderForm()}
      </ServiceFormLayout>
    </div>
  );
}

export function BoostingSection() {
  return (
    <Suspense fallback={<div className="h-96 flex items-center justify-center"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <BoostingContent />
    </Suspense>
  );
}
