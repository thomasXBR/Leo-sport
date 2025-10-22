'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '@/lib/supabase';

// Mock User type (sem dependência do Supabase)
interface MockUser {
  id: string;
  email: string;
  created_at: string;
}

interface AuthContextType {
  user: MockUser | null;
  profile: UserProfile | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Usuário mockado para demonstração visual
const MOCK_USER: MockUser = {
  id: 'mock-user-123',
  email: 'usuario@leosport.com',
  created_at: new Date().toISOString(),
};

const MOCK_PROFILE: UserProfile = {
  id: 'mock-user-123',
  email: 'usuario@leosport.com',
  name: 'Usuário Demonstração',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo',
  description: 'Este é um usuário de demonstração para visualização do sistema.',
  user_type: 'comprador',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Estado inicial: usuário NÃO logado (null)
  // Para testar logado, mude para MOCK_USER e MOCK_PROFILE
  const [user, setUser] = useState<MockUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Verificar se há sessão salva no localStorage
    const savedSession = localStorage.getItem('mock_session');
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      setUser(sessionData.user);
      setProfile(sessionData.profile);
      setSession(sessionData);
    }
    setLoading(false);
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newUser: MockUser = {
        id: `user-${Date.now()}`,
        email,
        created_at: new Date().toISOString(),
      };

      const newProfile: UserProfile = {
        id: newUser.id,
        email,
        name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name}`,
        description: '',
        user_type: 'comprador',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const sessionData = { user: newUser, profile: newProfile };
      localStorage.setItem('mock_session', JSON.stringify(sessionData));

      setUser(newUser);
      setProfile(newProfile);
      setSession(sessionData);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Usar usuário mockado
      const sessionData = { user: MOCK_USER, profile: MOCK_PROFILE };
      localStorage.setItem('mock_session', JSON.stringify(sessionData));

      setUser(MOCK_USER);
      setProfile(MOCK_PROFILE);
      setSession(sessionData);

      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('mock_session');
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) throw new Error('Usuário não autenticado');

      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedProfile = {
        ...profile!,
        ...updates,
        updated_at: new Date().toISOString(),
      };

      const sessionData = { user, profile: updatedProfile };
      localStorage.setItem('mock_session', JSON.stringify(sessionData));

      setProfile(updatedProfile);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 500));

      // Em um sistema real, isso mudaria a senha
      console.log('Password would be updated to:', newPassword);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


