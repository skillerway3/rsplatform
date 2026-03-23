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
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Marketplace</h4>
            <ul className="space-y-4 text-[11px] text-zinc-500 font-black uppercase tracking-widest">
              <li><Link href="/browse?section=currency" className="hover:text-amber-500 transition-colors">Currency</Link></li>
              <li><Link href="/browse?section=items" className="hover:text-amber-500 transition-colors">Items</Link></li>
              <li><Link href="/browse?section=accounts" className="hover:text-amber-500 transition-colors">Accounts</Link></li>
              <li><Link href="/browse?section=boosting" className="hover:text-amber-500 transition-colors">Boosting</Link></li>
            </ul>
          </div>

          <div className="md:col-span-2">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Support</h4>
            <ul className="space-y-4 text-[11px] text-zinc-500 font-black uppercase tracking-widest">
              <li><Link href="/support" className="hover:text-amber-500 transition-colors">Help Center</Link></li>
              <li><Link href="/support/contact" className="hover:text-amber-500 transition-colors">Contact Us</Link></li>
              <li><Link href="/sell/verify" className="hover:text-amber-500 transition-colors">Verification</Link></li>
              <li><Link href="/support/safety" className="hover:text-amber-500 transition-colors">Safety Tips</Link></li>
            </ul>
          </div>

          <div className="md:col-span-4">
            <h4 className="text-white font-black mb-8 uppercase text-[10px] tracking-[0.3em]">Platform</h4>
            <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose mb-6 opacity-70">
              RSPlatform is a secure intermediary for digital asset trading. We ensure both parties are protected throughout the transaction process.
            </p>
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
