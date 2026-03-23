import { ShieldCheck, Headphones } from 'lucide-react';
import { Card } from '@/components/ui/Card';

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Money-Back Guarantee',
    desc: 'Receive your order or get a refund. Trade with confidence under full platform protection.',
  },
  {
    icon: Headphones,
    title: '24/7 Live Support',
    desc: 'RSPlatform is available around the clock. Contact support anytime for help with orders, payments, or account issues.',
  },
];

export function Features() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto text-center mb-24">
          <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Trust & Safety</div>
          <h2 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase mb-8">Secure Trading</h2>
          <p className="text-zinc-500 text-lg font-medium leading-relaxed">
            We&apos;ve engineered the most advanced trading environment in the gaming industry. 
            Security isn&apos;t a feature—it&apos;s the foundation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
          {FEATURES.map((feature, i) => (
            <Card key={i} className="bg-zinc-900/30 border-zinc-800/50 p-10 rounded-[2.5rem] hover:border-amber-500/30 transition-all duration-500">
              <div className="w-16 h-16 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-8">
                <feature.icon className="text-amber-500 w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-100 tracking-tight uppercase mb-4">{feature.title}</h3>
              <p className="text-zinc-500 text-sm font-medium leading-relaxed">{feature.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
