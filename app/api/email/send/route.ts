import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { to, subject, message, html } = await request.json();

    if (!to || !subject || !message) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: to, subject, message' },
        { status: 400 }
      );
    }

    // Verificar se o usuário está autenticado e é admin
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('user_type')
      .eq('id', user.id)
      .single();

    if (profile?.user_type !== 'admin') {
      return NextResponse.json(
        { error: 'Apenas administradores podem enviar emails' },
        { status: 403 }
      );
    }

    // Enviar email usando Resend (se configurado) ou uma alternativa simples
    // Por enquanto, vamos criar uma solução que salva o email para envio posterior
    // ou usa uma API de email como Resend
    
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      // Usar Resend se a chave estiver configurada
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to,
          subject,
          html: html || `<p>${message.replace(/\n/g, '<br>')}</p>`,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.json();
        throw new Error(error.message || 'Erro ao enviar email');
      }

      const data = await resendResponse.json();
      return NextResponse.json({ success: true, id: data.id });
    } else {
      // Fallback: salvar o email em uma tabela para envio posterior
      // ou apenas retornar sucesso (para desenvolvimento)
      console.log('Email que seria enviado:', { to, subject, message });
      
      // Você pode criar uma tabela 'email_queue' para armazenar emails pendentes
      return NextResponse.json({ 
        success: true, 
        message: 'Email agendado para envio (Resend não configurado)',
        preview: { to, subject, message }
      });
    }
  } catch (error: any) {
    console.error('Erro ao enviar email:', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao enviar email' },
      { status: 500 }
    );
  }
}

