// Mock do Supabase para funcionamento visual sem autenticação
// Para usar o Supabase real, descomente as linhas abaixo e configure as variáveis de ambiente

// import { createClient } from '@supabase/supabase-js';
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
// export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const supabase = null; // Mock para desenvolvimento sem Supabase

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  description?: string;
  user_type: 'comprador' | 'vendedor' | 'admin';
  created_at: string;
  updated_at: string;
};


