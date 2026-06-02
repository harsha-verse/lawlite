import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User as SupabaseUser, Session } from '@supabase/supabase-js';

interface Profile {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  user_type: 'user' | 'lawyer';
  state: string | null;
  city: string | null;
  preferred_language: string;
  avatar_url: string | null;
}

interface LawyerProfile {
  id: string;
  user_id: string;
  bar_council_number: string;
  year_of_practice: number;
  role_type: string;
  practice_areas: string[];
  specialization: string | null;
  consultation_fee: number;
  experience: number;
  bio: string | null;
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected';
  rating: number;
  total_reviews: number;
}

interface AuthContextType {
  user: SupabaseUser | null;
  session: Session | null;
  profile: Profile | null;
  lawyerProfile: LawyerProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: SignupData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

interface SignupData {
  email: string;
  password: string;
  name: string;
  user_type: 'user' | 'lawyer';
  state?: string;
  city?: string;
  preferred_language?: string;
  phone?: string;
  // Lawyer-specific
  bar_council_number?: string;
  year_of_practice?: number;
  role_type?: string;
  practice_areas?: string[];
  specialization?: string;
  consultation_fee?: number;
  experience?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [lawyerProfile, setLawyerProfile] = useState<LawyerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (data) setProfile(data as Profile);

    // Check if lawyer
    if (data?.user_type === 'lawyer') {
      const { data: lp } = await supabase
        .from('lawyer_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      if (lp) setLawyerProfile(lp as LawyerProfile);
    }

    // Check admin role
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    setIsAdmin(roles?.some((r: any) => r.role === 'admin') ?? false);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // Defer profile fetch to avoid Supabase deadlock
          setTimeout(() => fetchProfile(session.user.id), 0);
        } else {
          setProfile(null);
          setLawyerProfile(null);
          setIsAdmin(false);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  const signup = async (data: SignupData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          user_type: data.user_type,
          state: data.state,
          preferred_language: data.preferred_language || 'en',
        },
      },
    });

    if (error) return { success: false, error: error.message };
    if (!authData.user) return { success: false, error: 'Signup failed' };

    // Update profile with additional fields
    await supabase.from('profiles').update({
      phone: data.phone,
      city: data.city,
    }).eq('id', authData.user.id);

    // If lawyer, create lawyer profile
    if (data.user_type === 'lawyer' && data.bar_council_number) {
      await (supabase.from('lawyer_profiles') as any).insert({
        user_id: authData.user.id,
        bar_council_number: data.bar_council_number,
        year_of_practice: data.year_of_practice || 0,
        role_type: data.role_type || 'advocate',
        practice_areas: data.practice_areas || [],
        specialization: data.specialization,
        consultation_fee: data.consultation_fee || 0,
        experience: data.experience || 0,
      });
    }

    return { success: true };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setLawyerProfile(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, lawyerProfile, isLoading, isAdmin, login, signup, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
