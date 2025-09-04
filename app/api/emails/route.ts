import { NextRequest, NextResponse } from 'next/server';
import { resendClient } from '@/lib/resendClient';

interface SendEmailRequest {
  type: 'order_confirmation' | 'partner_approval' | 'contact_form';
  to: string;
  data: any;
}

// POST /api/emails/send - Send email
export async function POST(request: NextRequest) {
  try {
    const { type, to, data }: SendEmailRequest = await request.json();

    let result;

    switch (type) {
      case 'order_confirmation':
        result = await resendClient.sendOrderConfirmation({
          customerName: data.customerName,
          customerEmail: to,
          orderId: data.orderId,
          products: data.products,
          totalAmount: data.totalAmount,
          deliveryEstimate: data.deliveryEstimate
        });
        break;

      case 'partner_approval':
        result = await resendClient.sendPartnerApproval(to, data.partnerName);
        break;

      case 'contact_form':
        result = await resendClient.sendEmail({
          to: 'contato@leosport.com.br', // TODO: Move to environment variable
          subject: `Contato do site: ${data.subject}`,
          html: `
            <h2>Nova mensagem de contato</h2>
            <p><strong>Nome:</strong> ${data.name}</p>
            <p><strong>Email:</strong> ${data.email}</p>
            <p><strong>Assunto:</strong> ${data.subject}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${data.message}</p>
          `
        });
        break;

      default:
        return NextResponse.json({ error: 'Invalid email type' }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }
}