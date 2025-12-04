'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, UserProfile } from '@/lib/supabase';
import { validateEmail } from '@/lib/email-validation';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string, phone?: string, acceptTerms?: boolean, consentEmails?: boolean) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>;
  updatePassword: (newPassword: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar sessão e perfil ao inicializar
  useEffect(() => {
    // Verificar sessão atual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escutar mudanças de autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await loadProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Carregar perfil do usuário
  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        // PGRST116 = nenhuma linha encontrada (primeira vez)
        console.error('Erro ao carregar perfil:', error);
      }

      if (data) {
        setProfile(data);
      } else {
        // Se não existe perfil, criar um básico
        const userData = await supabase.auth.getUser();
        if (userData.data.user) {
          const newProfile: UserProfile = {
            id: userData.data.user.id,
            email: userData.data.user.email || '',
            name: userData.data.user.user_metadata?.full_name || userData.data.user.email?.split('@')[0] || 'Usuário',
            avatar_url: userData.data.user.user_metadata?.avatar_url,
            description: '',
            user_type: 'comprador',
            created_at: userData.data.user.created_at,
            updated_at: new Date().toISOString(),
          };
          
          // Tentar criar o perfil
          const { data: createdProfile } = await supabase
            .from('profiles')
            .insert([newProfile])
            .select()
            .single();

          if (createdProfile) {
            setProfile(createdProfile);
          }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    } finally {
      setLoading(false);
    }
  }

  const signUp = async (email: string, password: string, name: string, phone?: string, acceptTerms?: boolean, consentEmails?: boolean) => {
    try {
      // Validar email antes de qualquer coisa
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return { error: { message: emailValidation.error || 'Email inválido ou não permitido' } };
      }

      // Verificar se é email de demonstração
      const emailLower = email.toLowerCase().trim();
      if (emailLower.includes('demo') || emailLower.includes('demonstracao') || emailLower.includes('demonstration') || 
          emailLower.includes('usuario@') || emailLower.includes('test@') || emailLower.includes('teste@')) {
        return { error: { message: 'Este email não pode ser usado. Por favor, use um email pessoal válido.' } };
      }

      // Validar senha
      if (!password || password.length < 6) {
        return { error: { message: 'A senha deve ter no mínimo 6 caracteres' } };
      }

      // Validar nome
      if (!name || name.trim().length < 2) {
        return { error: { message: 'O nome deve ter no mínimo 2 caracteres' } };
      }

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (authError) {
        return { error: authError };
      }

      if (!authData.user) {
        return { error: { message: 'Erro ao criar usuário' } };
      }

      // Criar perfil na tabela profiles
      const newProfile: any = {
        email: email.trim(),
        name: name.trim(),
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${name.trim()}`,
        description: '',
        user_type: 'comprador',
      };

      // Adicionar telefone se fornecido
      if (phone) {
        newProfile.phone = phone.trim();
      }

      // Adicionar aceite de termos
      if (acceptTerms !== undefined) {
        newProfile.accept_terms = acceptTerms;
      }

      // Adicionar consentimento de emails se fornecido
      if (consentEmails !== undefined) {
        newProfile.consent_emails = consentEmails;
      }

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .insert([{
          id: authData.user.id,
          ...newProfile,
        }])
        .select()
        .single();

      if (profileError) {
        console.error('Erro ao criar perfil:', profileError);
        // Se falhar ao criar perfil, ainda assim o usuário foi criado
        // O perfil será criado automaticamente na próxima vez que fizer login
      }

      if (profileData) {
        setProfile(profileData);
      }

      // Aguardar um pouco para garantir que tudo foi salvo
      await new Promise(resolve => setTimeout(resolve, 500));

      return { error: null };
    } catch (error: any) {
      console.error('Erro no signUp:', error);
      return { error: { message: error.message || 'Erro ao criar conta. Tente novamente.' } };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      // Validar email antes de qualquer coisa
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        return { error: { message: emailValidation.error || 'Email inválido ou não permitido' } };
      }

      // Verificar se é email de demonstração
      const emailLower = email.toLowerCase().trim();
      if (emailLower.includes('demo') || emailLower.includes('demonstracao') || emailLower.includes('demonstration') || 
          emailLower.includes('usuario@') || emailLower.includes('test@') || emailLower.includes('teste@')) {
        return { error: { message: 'Este email não pode ser usado. Por favor, use um email pessoal válido.' } };
      }

      // Validar senha
      if (!password || password.length < 6) {
        return { error: { message: 'Senha inválida' } };
      }

      // Fazer login no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        await loadProfile(data.user.id);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro no signIn:', error);
      return { error: { message: error.message || 'Erro ao fazer login. Tente novamente.' } };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Erro ao fazer logout:', error);
      }
      setUser(null);
      setProfile(null);
      setSession(null);
    } catch (error) {
      console.error('Erro no signOut:', error);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      // Validar email se foi alterado
      if (updates.email) {
        const emailValidation = validateEmail(updates.email);
        if (!emailValidation.valid) {
          return { error: { message: emailValidation.error } };
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      if (data) {
        setProfile(data);
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro no updateProfile:', error);
      return { error: { message: error.message || 'Erro ao atualizar perfil' } };
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      if (!user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      if (!newPassword || newPassword.length < 6) {
        return { error: { message: 'A senha deve ter no mínimo 6 caracteres' } };
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro no updatePassword:', error);
      return { error: { message: error.message || 'Erro ao alterar senha' } };
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
