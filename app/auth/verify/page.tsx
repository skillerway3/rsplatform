'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { resendEmailVerification } from '@/lib/auth';
import { 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

function VerifyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>(
    error ? 'error' : 'pending'
  );
  const [message, setMessage] = useState<string | null>(
    errorDescription || (error ? 'Verification failed. The link may have expired or is invalid.' : null)
  );
  const [pendingEmail] = useState<string | null>(
    searchParams.get('email') || (typeof window !== 'undefined' ? localStorage.getItem('pending_verification_email') : null)
  );

  const handleVerify = React.useCallback(async (token: string) => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.exchangeCodeForSession(token);
      if (error) throw error;
      
      setStatus('success');
      setMessage('Your email has been successfully verified! You can now access all features.');
      
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err: unknown) {
      const error = err as Error;
      setStatus('error');
      setMessage(error.message || 'Verification failed. The link may have expired or is invalid.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  React.useEffect(() => {
    if (code) {
      handleVerify(code);
    }
  }, [code, handleVerify]);

  const handleResend = async () => {
    const email = pendingEmail || (typeof window !== 'undefined' ? localStorage.getItem('pending_verification_email') : null);
    if (!email) {
      alert('Please sign in again to resend the verification email.');
      router.push('/login');
      return;
    }

    setResending(true);
    try {
      const { error } = await resendEmailVerification(email);
      if (error) throw error;
      alert('Verification email resent! Please check your inbox.');
    } catch (err: unknown) {
      const error = err as Error;
      alert(error.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl">
          <div className="flex flex-col items-center text-center">
            {status === 'pending' && (
              <>
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                  {loading ? (
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  ) : (
                    <Mail className="w-8 h-8 text-blue-500" />
                  )}
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verify your email</h1>
                <p className="text-zinc-400 mb-8">
                  {loading 
                    ? 'Verifying your email address...' 
                    : `We've sent a verification link to ${pendingEmail || 'your email'}. Please click the link to verify your account.`}
                </p>
                
                {!loading && (
                  <div className="space-y-4 w-full">
                    <Button 
                      onClick={handleResend}
                      disabled={resending}
                      variant="outline"
                      className="w-full border-zinc-800 hover:bg-zinc-800"
                    >
                      {resending ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Resend verification email
                    </Button>
                    <Button 
                      onClick={() => router.push('/login')}
                      variant="ghost"
                      className="w-full text-zinc-500 hover:text-white"
                    >
                      Back to login
                    </Button>
                  </div>
                )}
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Email verified!</h1>
                <p className="text-zinc-400 mb-8">{message}</p>
                <Button 
                  onClick={() => router.push('/')}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Go to Home
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-6">
                  <AlertCircle className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2">Verification failed</h1>
                <p className="text-zinc-400 mb-8">{message}</p>
                <div className="space-y-4 w-full">
                  <Button 
                    onClick={() => {
                      setStatus('pending');
                      setMessage(null);
                      router.push('/auth/verify');
                    }}
                    className="w-full bg-zinc-800 hover:bg-zinc-700"
                  >
                    Try again
                  </Button>
                  <Button 
                    onClick={() => router.push('/signup')}
                    variant="ghost"
                    className="w-full text-zinc-500 hover:text-white"
                  >
                    Create a new account
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Trust Badge */}
        <div className="mt-8 flex items-center justify-center gap-2 text-zinc-500 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure verification powered by Supabase</span>
        </div>
      </div>
    </div>
  );
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    }>
      <VerifyContent />
    </Suspense>
  );
}
