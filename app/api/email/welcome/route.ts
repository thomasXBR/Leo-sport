import { NextRequest, NextResponse } from 'next/server';
import { supabase, getCoupons } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { email, name } = await request.json();

    if (!email || !name) {
      return NextResponse.json(
        { error: 'Email e nome são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar cupons ativos do banco de dados
    const coupons = await getCoupons();
    
    // Buscar um cupom de boas-vindas específico ou o primeiro cupom ativo
    // Primeiro, tentar encontrar um cupom com código específico de boas-vindas
    let welcomeCoupon = coupons.find((coupon: any) => 
      coupon.status === 'Ativo' && 
      (coupon.code.toLowerCase().includes('bemvindo') || 
       coupon.code.toLowerCase().includes('welcome') ||
       coupon.code.toLowerCase().includes('boasvindas'))
    );

    // Se não encontrar, pegar o primeiro cupom ativo e válido
    if (!welcomeCoupon) {
      const now = new Date();
      welcomeCoupon = coupons.find((coupon: any) => {
        if (coupon.status !== 'Ativo') return false;
        const validUntil = new Date(coupon.valid_until);
        const validFrom = new Date(coupon.valid_from);
        return validUntil >= now && validFrom <= now;
      });
    }

    // Preparar conteúdo do email
    let emailSubject = 'Bem-vindo à LeoSport! 🎉';
    let emailMessage = `Olá ${name},\n\n`;
    emailMessage += `É um prazer ter você conosco na LeoSport!\n\n`;
    
    if (welcomeCoupon) {
      emailMessage += `Como presente de boas-vindas, temos um cupom especial para você:\n\n`;
      emailMessage += `🎁 CUPOM: ${welcomeCoupon.code}\n`;
      
      if (welcomeCoupon.description) {
        emailMessage += `\n${welcomeCoupon.description}\n`;
      }
      
      if (welcomeCoupon.discount_type === 'Percentual') {
        emailMessage += `\nDesconto: ${welcomeCoupon.discount_value}% OFF\n`;
      } else if (welcomeCoupon.discount_type === 'Fixo') {
        emailMessage += `\nDesconto: R$ ${welcomeCoupon.discount_value} OFF\n`;
      }
      
      if (welcomeCoupon.valid_until) {
        const validUntil = new Date(welcomeCoupon.valid_until);
        emailMessage += `\nVálido até: ${validUntil.toLocaleDateString('pt-BR')}\n`;
      }
      
      emailMessage += `\nUse este cupom na sua próxima compra e aproveite!\n\n`;
    } else {
      emailMessage += `Fique atento às nossas promoções e ofertas especiais!\n\n`;
    }
    
    emailMessage += `Agradecemos por escolher a LeoSport.\n\n`;
    emailMessage += `Atenciosamente,\nEquipe LeoSport`;

    // HTML do email
    let emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .coupon-box { background: white; border: 2px dashed #3b82f6; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
          .coupon-code { font-size: 24px; font-weight: bold; color: #1e40af; margin: 10px 0; }
          .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Bem-vindo à LeoSport! 🎉</h1>
          </div>
          <div class="content">
            <p>Olá <strong>${name}</strong>,</p>
            <p>É um prazer ter você conosco na LeoSport!</p>
            ${welcomeCoupon ? `
              <p>Como presente de boas-vindas, temos um cupom especial para você:</p>
              <div class="coupon-box">
                <p style="margin: 0; color: #6b7280;">Cupom de Desconto</p>
                <div class="coupon-code">${welcomeCoupon.code}</div>
                ${welcomeCoupon.description ? `<p style="margin: 10px 0; color: #4b5563;">${welcomeCoupon.description}</p>` : ''}
                ${welcomeCoupon.discount_type === 'Percentual' ? 
                  `<p style="margin: 10px 0; font-size: 18px; color: #059669;"><strong>${welcomeCoupon.discount_value}% OFF</strong></p>` :
                  welcomeCoupon.discount_type === 'Fixo' ?
                  `<p style="margin: 10px 0; font-size: 18px; color: #059669;"><strong>R$ ${welcomeCoupon.discount_value} OFF</strong></p>` :
                  ''
                }
                ${welcomeCoupon.valid_until ? 
                  `<p style="margin: 10px 0; color: #6b7280; font-size: 14px;">Válido até ${new Date(welcomeCoupon.valid_until).toLocaleDateString('pt-BR')}</p>` :
                  ''
                }
              </div>
              <p>Use este cupom na sua próxima compra e aproveite!</p>
            ` : `
              <p>Fique atento às nossas promoções e ofertas especiais!</p>
            `}
            <p>Agradecemos por escolher a LeoSport.</p>
            <p>Atenciosamente,<br><strong>Equipe LeoSport</strong></p>
          </div>
          <div class="footer">
            <p>Este é um email automático, por favor não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Enviar email usando Resend (se configurado)
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    
    if (RESEND_API_KEY) {
      const resendResponse = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
          to: email,
          subject: emailSubject,
          html: emailHtml,
        }),
      });

      if (!resendResponse.ok) {
        const error = await resendResponse.json();
        console.error('Erro ao enviar email de boas-vindas:', error);
        // Não falhar o cadastro se o email não for enviado
        return NextResponse.json({ 
          success: true, 
          message: 'Conta criada, mas email não foi enviado',
          warning: error.message 
        });
      }

      const data = await resendResponse.json();
      return NextResponse.json({ success: true, id: data.id });
    } else {
      // Em desenvolvimento, apenas logar o email
      console.log('Email de boas-vindas que seria enviado:', { 
        to: email, 
        subject: emailSubject,
        coupon: welcomeCoupon?.code || 'Nenhum cupom encontrado'
      });
      
      return NextResponse.json({ 
        success: true, 
        message: 'Email de boas-vindas agendado (Resend não configurado)',
        preview: { to: email, subject: emailSubject, coupon: welcomeCoupon?.code }
      });
    }
  } catch (error: any) {
    console.error('Erro ao enviar email de boas-vindas:', error);
    // Não falhar o cadastro se o email não for enviado
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Erro ao enviar email de boas-vindas',
      message: 'Conta criada, mas email não foi enviado'
    });
  }
}

