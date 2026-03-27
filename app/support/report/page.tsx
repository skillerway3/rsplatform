'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { 
  AlertTriangle, 
  Send, 
  Loader2, 
  ArrowLeft,
  CheckCircle2,
  ShieldAlert,
  HelpCircle,
  FileText,
  Upload,
  X,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

const CATEGORIES = [
  { id: 'technical', label: 'Technical Issue', icon: HelpCircle },
  { id: 'payment', label: 'Payment / Billing', icon: FileText },
  { id: 'account', label: 'Account Access', icon: ShieldAlert },
  { id: 'other', label: 'Other Problem', icon: AlertTriangle },
];

export default function ReportProblemPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [category, setCategory] = React.useState('technical');
  const [subject, setSubject] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [evidence, setEvidence] = React.useState<File[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setEvidence(prev => [...prev, ...files].slice(0, 5));
  };

  const removeFile = (index: number) => {
    setEvidence(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setError(null);

    try {
      const evidenceUrls: string[] = [];

      if (evidence.length > 0) {
        setUploading(true);
        for (const file of evidence) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${user.id}-${Math.random()}.${fileExt}`;
          const filePath = `platform-reports/${user.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('reports') // Using dedicated reports bucket
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);
          
          evidenceUrls.push(publicUrl);
        }
        setUploading(false);
      }

      const { error: reportError } = await supabase
        .from('platform_reports')
        .insert({
          user_id: user.id,
          category,
          subject,
          description,
          evidence_urls: evidenceUrls,
        });

      if (reportError) throw reportError;

      setSuccess(true);
      setSubject('');
      setDescription('');
      setEvidence([]);
    } catch (err: unknown) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
      setUploading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <Link href="/profile" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-amber-500 transition-colors mb-12 group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Profile
          </Link>

          <header className="mb-16">
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Support Center</div>
            <h1 className="text-6xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Report a Problem</h1>
          </header>

          {success ? (
            <Card className="premium-card p-16 text-center flex flex-col items-center">
              <div className="w-24 h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mb-8 border border-emerald-500/20">
                <CheckCircle2 className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">Report Submitted</h2>
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs max-w-md mx-auto leading-relaxed mb-12">
                Thank you for your feedback. Our support team has been notified and will investigate the issue shortly.
              </p>
              <Button 
                onClick={() => setSuccess(false)}
                variant="gold" 
                className="h-14 px-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
              >
                Submit Another Report
              </Button>
            </Card>
          ) : (
            <Card className="premium-card p-10">
              <form onSubmit={handleSubmit} className="space-y-10">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-500 text-[10px] font-black uppercase tracking-widest">
                    <ShieldAlert className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Select Category</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id)}
                        className={cn(
                          "p-6 rounded-2xl border transition-all flex flex-col items-center text-center gap-4 group",
                          category === cat.id 
                            ? "bg-amber-500/10 border-amber-500/50 text-amber-500" 
                            : "bg-zinc-950/50 border-white/5 text-zinc-500 hover:border-white/10"
                        )}
                      >
                        <cat.icon className={cn("w-6 h-6 transition-transform group-hover:scale-110", category === cat.id ? "text-amber-500" : "text-zinc-700")} />
                        <span className="text-[9px] font-black uppercase tracking-widest">{cat.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Subject</label>
                    <input 
                      type="text" 
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Brief summary of the issue"
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl px-6 h-14 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Description</label>
                    <textarea 
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Please provide as much detail as possible..."
                      rows={6}
                      className="w-full bg-zinc-950/50 border border-zinc-800 rounded-2xl p-6 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 transition-colors resize-none"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em] ml-1">Evidence (Images/Video)</label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {evidence.map((file, index) => (
                        <div key={index} className="relative aspect-square rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden group flex items-center justify-center">
                          {file.type.startsWith('image/') ? (
                            <Image 
                              src={URL.createObjectURL(file)} 
                              alt="Preview" 
                              fill 
                              className="object-cover"
                            />
                          ) : (
                            <Film className="w-8 h-8 text-zinc-700" />
                          )}
                          <button 
                            type="button"
                            onClick={() => removeFile(index)}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                          >
                            <X className="w-4 h-4 text-white" />
                          </button>
                          <div className="absolute bottom-0 left-0 right-0 p-2 bg-zinc-950/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[7px] font-black text-white truncate uppercase tracking-widest">{file.name}</p>
                          </div>
                        </div>
                      ))}
                      {evidence.length < 5 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-2xl bg-zinc-950 border border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all group"
                        >
                          <Upload className="w-6 h-6 text-zinc-700 group-hover:text-amber-500 transition-colors" />
                          <span className="text-[8px] font-black uppercase tracking-widest text-zinc-600 group-hover:text-amber-500">Add File</span>
                        </button>
                      )}
                    </div>
                    <input 
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/*,video/*"
                      multiple
                      className="hidden"
                    />
                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest ml-1">
                      Upload screenshots or videos that help explain the problem (Max 5).
                    </p>
                  </div>
                </div>

                <div className="pt-6">
                  <Button 
                    type="submit"
                    disabled={submitting || uploading}
                    variant="gold" 
                    className="w-full h-16 rounded-2xl text-[11px] font-black uppercase tracking-[0.4em] shadow-lg shadow-amber-500/10 group"
                  >
                    {submitting ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        Submit Report
                        <Send className="w-4 h-4 ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
