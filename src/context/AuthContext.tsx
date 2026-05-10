'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import { logout as serverLogout, getProfile as serverGetProfile } from '@/app/actions/auth';

interface User {
  id: number;
  fullName: string;
  username: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  logout: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { user: authUser } = session;
          const meta = authUser.app_metadata || {};
          
          if (meta.userId && meta.fullName) {
            setUser({
              id: meta.userId,
              fullName: meta.fullName,
              username: authUser.email?.split('@')[0] || '',
              role: meta.userRole,
            });
          } else {
            // Securely fetch from server to bypass RLS 406 issues
            const profile = await serverGetProfile();
            if (profile) {
              setUser(profile);
            }
          }
        }
      } catch (err) {
        console.error('AuthContext sync error:', err);
        // Fallback: try to set a guest state if critical
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { user: authUser } = session;
        const meta = authUser.app_metadata || {};
        
        if (meta.userId && meta.fullName) {
          setUser({
            id: meta.userId,
            fullName: meta.fullName,
            username: authUser.email?.split('@')[0] || '',
            role: meta.userRole,
          });
        } else {
          const profile = await serverGetProfile();
          if (profile) {
            setUser(profile);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = async () => {
    // 1. Clear server-side session cookies via server action
    await serverLogout();
    // 2. Clear client-side Supabase session
    await supabase.auth.signOut();
    // 3. Force redirect and reload
    window.location.href = '/login';
  };

  return (
    // CRITICAL FIX: Always render children immediately — never block on loading.
    // Route protection is handled server-side in proxy.ts, so the UI never needs
    // to hold the page hostage waiting for client-side auth state.
    <AuthContext.Provider value={{ user, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
