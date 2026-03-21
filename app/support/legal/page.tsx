import { Card } from '@/components/ui/Card';
import { ShieldCheck, Lock, Scale } from 'lucide-react';

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-24">
      <div className="container mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Legal Center</div>
          <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase mb-16">Terms & Policies</h1>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
            <Card className="bg-zinc-900/30 border-zinc-800/50 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <Scale className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 tracking-tight uppercase mb-2">Terms of Service</h3>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose opacity-70">
                The rules and guidelines for using our platform.
              </p>
            </Card>
            <Card className="bg-zinc-900/30 border-zinc-800/50 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <Lock className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 tracking-tight uppercase mb-2">Privacy Policy</h3>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose opacity-70">
                How we protect and handle your personal data.
              </p>
            </Card>
            <Card className="bg-zinc-900/30 border-zinc-800/50 p-8 rounded-[2rem]">
              <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="text-amber-500 w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-zinc-100 tracking-tight uppercase mb-2">Cookie Usage</h3>
              <p className="text-zinc-500 text-[11px] font-black uppercase tracking-widest leading-loose opacity-70">
                Information about how we use cookies.
              </p>
            </Card>
          </div>

          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-amber-500 mr-4"></span>
                Terms of Service
              </h2>
              <div className="text-zinc-500 text-sm font-medium leading-relaxed space-y-4">
                <p>
                  By accessing and using RSPLATFORM, you agree to comply with and be bound by the following terms and conditions of use. 
                  Our platform serves as a marketplace for digital assets related to RuneScape.
                </p>
                <p>
                  Users are responsible for maintaining the confidentiality of their accounts and passwords. 
                  Any fraudulent activity or violation of Jagex Ltd. terms of service is strictly prohibited and may lead to account suspension.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-amber-500 mr-4"></span>
                Privacy Policy
              </h2>
              <div className="text-zinc-500 text-sm font-medium leading-relaxed space-y-4">
                <p>
                  We value your privacy. We only collect information that is necessary for the operation of the marketplace and the security of our users. 
                  Your personal data is encrypted and stored securely.
                </p>
                <p>
                  We do not sell your personal information to third parties. 
                  We may use your email to send important updates regarding your transactions or security alerts.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-zinc-100 tracking-tight uppercase mb-6 flex items-center">
                <span className="w-8 h-[1px] bg-amber-500 mr-4"></span>
                Cookie Usage
              </h2>
              <div className="text-zinc-500 text-sm font-medium leading-relaxed space-y-4">
                <p>
                  We use cookies to enhance your browsing experience and analyze site traffic. 
                  By continuing to use our site, you consent to our use of cookies.
                </p>
                <p>
                  You can manage your cookie preferences through your browser settings at any time.
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
