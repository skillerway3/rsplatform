'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  is_verified_seller: boolean;
  is_trusted_seller: boolean;
  role: string | null;
  created_at: string | null;
  username_updated_at: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  isVerifiedSeller: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  profile: null,
  loading: true,
  isVerifiedSeller: false,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string, userEmail?: string): Promise<void> => {
    if (!userId) return;
    
    console.log('[AuthProvider] Fetching profile for:', userId);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, username, avatar_url, is_verified_seller, is_trusted_seller, role, created_at, username_updated_at'
        )
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[AuthProvider] Error fetching profile:', error);
        throw error;
      }

      if (!data) {
        console.log('[AuthProvider] Profile not found, creating one...');
        // Profile doesn't exist, create one
        const newUsername = userEmail 
          ? userEmail.split('@')[0] + Math.floor(Math.random() * 1000)
          : 'user_' + userId.substring(0, 8);
        
        const { data: newData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            username: newUsername,
            avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
            role: 'user'
          })
          .select()
          .single();

        if (insertError) {
          console.error('[AuthProvider] Error creating profile:', insertError);
          setProfile(null);
          return;
        }

        const safeProfile: Profile = {
          id: newData.id,
          username: typeof newData.username === 'string' ? newData.username : null,
          avatar_url: typeof newData.avatar_url === 'string' ? newData.avatar_url : null,
          is_verified_seller: Boolean(newData.is_verified_seller),
          is_trusted_seller: Boolean(newData.is_trusted_seller),
          role: typeof newData.role === 'string' ? newData.role : null,
          created_at: typeof newData.created_at === 'string' ? newData.created_at : null,
          username_updated_at: typeof newData.username_updated_at === 'string' ? newData.username_updated_at : null,
        };
        setProfile(safeProfile);
        console.log('[AuthProvider] Profile created successfully');
        return;
      }

      const safeProfile: Profile | null = data
        ? {
            id: data.id,
            username: typeof data.username === 'string' ? data.username : null,
            avatar_url:
              typeof data.avatar_url === 'string' ? data.avatar_url : null,
            is_verified_seller: Boolean(data.is_verified_seller),
            is_trusted_seller: Boolean(data.is_trusted_seller),
            role: typeof data.role === 'string' ? data.role : null,
            created_at:
              typeof data.created_at === 'string' ? data.created_at : null,
            username_updated_at:
              typeof data.username_updated_at === 'string'
                ? data.username_updated_at
                : null,
          }
        : null;

      // Only update if profile data has actually changed to avoid re-render loops
      setProfile((current) => {
        if (JSON.stringify(current) === JSON.stringify(safeProfile)) {
          return current;
        }
        return safeProfile;
      });
      console.log('[AuthProvider] Profile fetched successfully');
    } catch (err: unknown) {
      console.error('[AuthProvider] Unexpected error in fetchProfile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      console.log('[AuthProvider] Initializing auth...');
      try {
        // 1. Get initial session
        const {
          data: { session: initialSession },
          error: sessionError
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('[AuthProvider] Error getting initial session:', sessionError);
        }

        if (isMounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);

          if (initialSession?.user) {
            console.log('[AuthProvider] Initial session found for user:', initialSession.user.id);
            await fetchProfile(initialSession.user.id, initialSession.user.email);
          } else {
            console.log('[AuthProvider] No initial session found');
            setProfile(null);
          }
        }
      } catch (err) {
        console.error('[AuthProvider] Unexpected error during auth initialization:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('[AuthProvider] Auth initialization complete. Loading state:', false);
        }
      }
    };

    // Start initialization
    void initializeAuth();

    // 2. Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AuthProvider] Auth state changed:', event, session?.user?.id);
      
      if (isMounted) {
        try {
          setSession(session);
          setUser(session?.user ?? null);

          if (session?.user) {
            await fetchProfile(session.user.id, session.user.email);
          } else {
            setProfile(null);
          }
        } catch (err) {
          console.error('[AuthProvider] Error in onAuthStateChange:', err);
        } finally {
          // Always ensure loading is false after an auth state change
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    console.log('[AuthProvider] Signing out...');
    try {
      // Clear state immediately for better UX
      setUser(null);
      setSession(null);
      setProfile(null);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('[AuthProvider] Supabase signOut error:', error);
      }
    } catch (err) {
      console.error('[AuthProvider] Unexpected error during signOut:', err);
    } finally {
      // Ensure state is cleared even if signOut fails
      setUser(null);
      setSession(null);
      setProfile(null);
      console.log('[AuthProvider] Sign out complete');
    }
  };

  const isVerifiedSeller = Boolean(profile?.is_verified_seller);

  const value = React.useMemo(() => ({
    user,
    session,
    profile,
    loading,
    isVerifiedSeller,
    signOut
  }), [user, session, profile, loading, isVerifiedSeller]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);