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

  const fetchProfile = async (userId: string): Promise<void> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(
          'id, username, avatar_url, is_verified_seller, is_trusted_seller, role, created_at, username_updated_at'
        )
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

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

      setProfile(safeProfile);
    } catch (err: unknown) {
      console.error('Error fetching profile:', err);
      setProfile(null);
    }
  };

  useEffect(() => {
    const loadInitialSession = async (): Promise<void> => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    };

    void loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        await fetchProfile(session.user.id);
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const isVerifiedSeller = Boolean(profile?.is_verified_seller);

  return (
    <AuthContext.Provider
      value={{ user, session, profile, loading, isVerifiedSeller, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => useContext(AuthContext);