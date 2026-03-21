import Link from 'next/link';
import { ShieldCheck, Twitter, Github, Instagram, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-32 pb-16 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none opacity-50"></div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-16 mb-24">
          <div className="md:col-span-4">
            <Link href="/" className="flex items-center space-x-3 mb-8 group">
              <div className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center group-hover:border-amber-500/30 transition-all duration-500">
                <ShieldCheck className="text-amber-500 w-6 h-6" />
              </div>
              <span className="text-xl font-display font-black tracking-tighter text-white uppercase">
                RS<span className="text-amber-500">PLATFORM</span>
              </span>
            </Link>
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose mb-8 max-w-xs opacity-70">
              The premium marketplace for OSRS and RS3 digital assets. 
              Built for traders who demand security, speed, and a premium experience.
            </p>
            <div className="flex space-x-5">
              {[
                { Icon: Twitter, href: 'https://twitter.com' },
                { Icon: Instagram, href: 'https://instagram.com' },
                { Icon: Github, href: 'https://github.com' },
                { Icon: Mail, href: 'mailto:support@rsplatform.com' }
              ].map(({ Icon, href }, i) => (
                <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-zinc-900 border border-white/5 rounded-xl flex items-center justify-center text-zinc-500 hover:text-amber-500 hover:border-amber-500/30 transition-all duration-500">
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Marketplace</h4>
            <ul className="space-y-4 text-[11px] text-zinc-500 font-black uppercase tracking-widest">
              <li><Link href="/browse?section=currency&game=osrs" className="hover:text-amber-500 transition-colors">OSRS Currency</Link></li>
              <li><Link href="/browse?section=items&game=osrs" className="hover:text-amber-500 transition-colors">Rare Items</Link></li>
              <li><Link href="/browse?section=accounts&game=osrs" className="hover:text-amber-500 transition-colors">Premium Accounts</Link></li>
              <li><Link href="/browse?section=boosting&game=osrs" className="hover:text-amber-500 transition-colors">Boosting Services</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Company</h4>
            <ul className="space-y-4 text-[11px] text-zinc-500 font-black uppercase tracking-widest">
              <li><Link href="/support" className="hover:text-amber-500 transition-colors">About Us</Link></li>
              <li><Link href="/sell" className="hover:text-amber-500 transition-colors">Sell With Us</Link></li>
              <li><Link href="/support/contact" className="hover:text-amber-500 transition-colors">Partnerships</Link></li>
              <li><Link href="/support/safety" className="hover:text-amber-500 transition-colors">Trust & Safety</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Newsletter</h4>
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose mb-6 opacity-70">Get the latest market trends and rare item alerts delivered to your inbox.</p>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-zinc-900/50 border border-white/5 rounded-xl px-5 py-3 text-[11px] font-black uppercase tracking-widest flex-1 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500/30 transition-all duration-300 placeholder:text-zinc-700"
              />
              <button className="bg-amber-500 text-zinc-950 rounded-xl px-6 h-11 text-[10px] font-black uppercase tracking-widest hover:bg-amber-400 transition-colors">
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-6 md:space-y-0">
          <p className="text-zinc-600 text-[9px] font-black tracking-[0.2em] uppercase">
            © 2026 RSPLATFORM. ALL RIGHTS RESERVED. NOT AFFILIATED WITH JAGEX LTD.
          </p>
          <div className="flex space-x-8 text-[9px] font-black uppercase tracking-[0.3em] text-zinc-600">
            <Link href="/support/legal" className="hover:text-amber-500 transition-colors">Terms of Service</Link>
            <Link href="/support/legal" className="hover:text-amber-500 transition-colors">Privacy Policy</Link>
            <Link href="/support/legal" className="hover:text-amber-500 transition-colors">Cookie Usage</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
