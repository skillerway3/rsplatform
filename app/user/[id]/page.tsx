'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  User, 
  ShieldCheck, 
  Zap, 
  Star, 
  Calendar, 
  Loader2, 
  CheckCircle2,
  AlertCircle,
  Flag,
  Tag,
  Clock,
  Upload,
  X,
  Image as ImageIcon,
  Film
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/lib/supabase';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

interface PublicProfile {
  id: string;
  username: string;
  avatar_url: string;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
  average_rating: number;
  review_count: number;
  created_at: string;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  game: string;
  category: string;
  images: string[];
  status: string;
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = React.useState<PublicProfile | null>(null);
  const [listings, setListings] = React.useState<Listing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [contactLoading, setContactLoading] = React.useState(false);
  
  // Reporting state
  const [showReportModal, setShowReportModal] = React.useState(false);
  const [reportReason, setReportReason] = React.useState('scam');
  const [reportDetails, setReportDetails] = React.useState('');
  const [evidenceFiles, setEvidenceFiles] = React.useState<File[]>([]);
  const [submittingReport, setSubmittingReport] = React.useState(false);
  const [reportSuccess, setReportSuccess] = React.useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('id, username, avatar_url, is_verified_seller, is_trusted_seller, created_at, average_rating, review_count')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch active listings
        const { data: listingsData, error: listingsError } = await supabase
          .from('listings')
          .select('id, title, price, game, category, images, created_at')
          .eq('seller_id', id)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;
        setListings(listingsData || []);
      } catch (err: unknown) {
        console.error('Error fetching public profile:', err);
        setError('User not found');
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleContactSeller = async () => {
    if (!currentUser) {
      router.push(`/login?next=/user/${id}`);
      return;
    }

    if (currentUser.id === id) {
      alert("You cannot contact yourself.");
      return;
    }

    try {
      setContactLoading(true);
      // Check for existing conversation without a listing_id
      const { data: existing, error: findErr } = await supabase
        .from('conversations')
        .select('id')
        .is('listing_id', null)
        .or(`and(buyer_id.eq.${currentUser.id},seller_id.eq.${id}),and(buyer_id.eq.${id},seller_id.eq.${currentUser.id})`)
        .limit(1)
        .maybeSingle();

      if (findErr) throw findErr;

      if (existing) {
        router.push(`/chat/${existing.id}`);
        return;
      }

      // Create new conversation
      const { data: created, error: createErr } = await supabase
        .from('conversations')
        .insert({
          buyer_id: currentUser.id,
          seller_id: id,
          listing_id: null
        })
        .select('id')
        .single();

      if (createErr) throw createErr;
      router.push(`/chat/${created.id}`);
    } catch (err: unknown) {
      console.error('Error starting chat:', err);
      alert('Failed to start conversation');
    } finally {
      setContactLoading(false);
    }
  };

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !profile) return;

    setSubmittingReport(true);
    try {
      const evidenceUrls: string[] = [];

      // Upload evidence files if any
      if (evidenceFiles.length > 0) {
        for (const file of evidenceFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${currentUser.id}-${Math.random()}.${fileExt}`;
          const filePath = `user-reports/${profile.id}/${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('reports') // Using 'reports' bucket
            .upload(filePath, file);

          if (!uploadError) {
            const { data: { publicUrl } } = supabase.storage
              .from('reports')
              .getPublicUrl(filePath);
            evidenceUrls.push(publicUrl);
          }
        }
      }

      const { error: reportError } = await supabase
        .from('user_reports')
        .insert({
          reporter_id: currentUser.id,
          reported_user_id: profile.id,
          reason: reportReason,
          details: reportDetails,
          evidence_urls: evidenceUrls
        });

      if (reportError) throw reportError;
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
        setReportSuccess(false);
        setReportDetails('');
        setEvidenceFiles([]);
      }, 3000);
    } catch (err: unknown) {
      console.error('Error submitting report:', err);
      alert('Failed to submit report');
    } finally {
      setSubmittingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-6">
        <AlertCircle className="w-16 h-16 text-zinc-800 mb-6" />
        <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">{error || 'User not found'}</h1>
        <Button onClick={() => router.back()} variant="outline" className="rounded-xl">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-zinc-950 min-h-screen relative overflow-hidden">
      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0">

      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* Left Sidebar: User Info */}
            <div className="lg:col-span-1 space-y-8">
              <Card className="premium-card p-8 flex flex-col items-center text-center">
                <div className="w-32 h-32 rounded-[2.5rem] bg-zinc-900 flex items-center justify-center overflow-hidden border border-white/5 mb-6 relative">
                  {profile.avatar_url ? (
                    <Image 
                      src={profile.avatar_url} 
                      alt={profile.username} 
                      fill 
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <User className="w-12 h-12 text-zinc-800" />
                  )}
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-1">{profile.username}</h2>
                <div className="flex items-center gap-2 text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-6">
                  <Calendar className="w-3 h-3" />
                  Joined {formatDate(profile.created_at)}
                </div>

                <div className="w-full space-y-3 mb-8">
                  <div className="flex items-center justify-between p-3 bg-zinc-950/50 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className={cn("w-3.5 h-3.5", profile.is_verified_seller ? "text-emerald-500" : "text-zinc-600")} />
                      <span className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Verified</span>
                    </div>
                    {profile.is_verified_seller && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  {profile.is_trusted_seller && (
                    <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-xl border border-amber-500/10">
                      <div className="flex items-center gap-2">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">Trusted</span>
                      </div>
                      <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded-md">Elite</span>
                    </div>
                  )}
                </div>

                <div className="w-full grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5">
                    <div className="flex items-center justify-center gap-1 text-amber-500 mb-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span className="text-lg font-black tracking-tighter">{profile.average_rating.toFixed(1)}</span>
                    </div>
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Rating</p>
                  </div>
                  <div className="p-4 bg-zinc-950 rounded-2xl border border-white/5">
                    <div className="text-lg font-black text-white tracking-tighter mb-1">{profile.review_count}</div>
                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Reviews</p>
                  </div>
                </div>

                <div className="w-full space-y-3">
                  <Button 
                    variant="gold" 
                    className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    onClick={handleContactSeller}
                    disabled={contactLoading}
                  >
                    {contactLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Contact Seller'}
                  </Button>
                  {currentUser && currentUser.id !== profile.id && (
                    <button 
                      onClick={() => setShowReportModal(true)}
                      className="w-full h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-red-500 transition-colors flex items-center justify-center gap-2"
                    >
                      <Flag className="w-3.5 h-3.5" />
                      Report User
                    </button>
                  )}
                </div>
              </Card>

              <Card className="premium-card p-8">
                <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-widest mb-6">Trust & Safety</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5 shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">Identity verified via government ID and phone.</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-lg bg-zinc-950 flex items-center justify-center border border-white/5 shrink-0">
                      <Clock className="w-4 h-4 text-blue-500" />
                    </div>
                    <p className="text-[10px] font-bold text-zinc-400 leading-relaxed">Average response time: Under 2 hours.</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column: Listings */}
            <div className="lg:col-span-3 space-y-12">
              <header className="flex items-center justify-between">
                <div>
                  <div className="text-amber-500 text-[10px] font-black uppercase tracking-[0.4em] mb-2">Marketplace</div>
                  <h1 className="text-4xl font-black text-zinc-100 tracking-tighter uppercase leading-none">Active Listings</h1>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white tracking-tighter leading-none">{listings.length}</div>
                  <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Total Items</div>
                </div>
              </header>

              {listings.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={`/listing/${listing.id}`}>
                      <Card className="premium-card overflow-hidden group cursor-pointer hover:border-amber-500/30 transition-all">
                        <div className="aspect-video relative overflow-hidden">
                          {listing.images?.[0] ? (
                            <Image 
                              src={listing.images[0]} 
                              alt={listing.title} 
                              fill 
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                              <Tag className="w-12 h-12 text-zinc-800" />
                            </div>
                          )}
                          <div className="absolute top-4 left-4 px-3 py-1 bg-zinc-950/90 rounded-lg border border-white/5 text-[9px] font-black text-white uppercase tracking-widest">
                            {listing.game}
                          </div>
                        </div>
                        <div className="p-6">
                          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2 truncate group-hover:text-amber-500 transition-colors">{listing.title}</h3>
                          <div className="flex items-center justify-between">
                            <div className="text-2xl font-black text-amber-500 tracking-tighter">
                              {formatCurrency(listing.price)}
                            </div>
                            <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                              {listing.category}
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-white/5 flex flex-col items-center text-center">
                  <div className="w-20 h-20 rounded-full bg-zinc-900/50 flex items-center justify-center mb-6">
                    <Tag className="w-8 h-8 text-zinc-800" />
                  </div>
                  <h4 className="text-xl font-black text-zinc-500 uppercase tracking-tight mb-2">No Active Listings</h4>
                  <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest max-w-[200px]">This user currently has no items for sale.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-950/90" onClick={() => setShowReportModal(false)} />
          <Card className="relative z-10 w-full max-w-lg premium-card p-10">
            {reportSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight mb-2">Report Received</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Our moderators will review this user shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleReport} className="space-y-8">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-white uppercase tracking-tight">Report User</h3>
                  <button type="button" onClick={() => setShowReportModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Reason for Report</label>
                  <select 
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl h-12 px-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="scam">Scamming / Fraud</option>
                    <option value="harassment">Harassment / Toxicity</option>
                    <option value="fake_items">Fake / Misleading Items</option>
                    <option value="off_platform">Attempting Off-Platform Trade</option>
                    <option value="other">Other Misconduct</option>
                  </select>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Additional Details</label>
                  <textarea 
                    required
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Please explain what happened..."
                    rows={4}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-sm font-bold text-white focus:outline-none focus:border-amber-500/50 resize-none"
                  />
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Evidence (Images/Video)</label>
                  <div className="grid grid-cols-2 gap-4">
                    {evidenceFiles.map((file, idx) => (
                      <div key={idx} className="relative group aspect-video bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden flex items-center justify-center">
                        {file.type.startsWith('image/') ? (
                          <ImageIcon className="w-6 h-6 text-zinc-700" />
                        ) : (
                          <Film className="w-6 h-6 text-zinc-700" />
                        )}
                        <span className="absolute bottom-2 left-2 right-2 text-[8px] font-black text-zinc-500 truncate uppercase tracking-widest text-center">
                          {file.name}
                        </span>
                        <button 
                          type="button"
                          onClick={() => setEvidenceFiles(prev => prev.filter((_, i) => i !== idx))}
                          className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {evidenceFiles.length < 4 && (
                      <label className="aspect-video bg-zinc-950/50 border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-900/50 transition-all group">
                        <Upload className="w-6 h-6 text-zinc-700 group-hover:text-amber-500 transition-colors mb-2" />
                        <span className="text-[8px] font-black text-zinc-600 uppercase tracking-widest">Upload Evidence</span>
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*,video/*" 
                          className="hidden" 
                          onChange={(e) => {
                            const files = Array.from(e.target.files || []);
                            setEvidenceFiles(prev => [...prev, ...files].slice(0, 4));
                          }}
                        />
                      </label>
                    )}
                  </div>
                  <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                    Upload up to 4 screenshots or videos showing the issue.
                  </p>
                </div>

                <Button 
                  type="submit"
                  disabled={submittingReport}
                  variant="gold" 
                  className="w-full h-14 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  {submittingReport ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Submit Report'}
                </Button>
              </form>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}

