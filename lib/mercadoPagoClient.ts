import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Cliente Mercado Pago para integração de pagamentos
 * Suporta credenciais de teste e produção
 */

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN || '';
const isTestMode = process.env.MERCADOPAGO_TEST_MODE === 'true' || !accessToken;

// Inicializar cliente Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken,
  options: {
    timeout: 5000,
  }
});

export const preferenceClient = new Preference(client);

/**
 * Tipos para integração com Mercado Pago
 */
export interface MercadoPagoItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer?: {
    name?: string;
    surname?: string;
    email: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
    identification?: {
      type?: string;
      number?: string;
    };
    address?: {
      zip_code?: string;
      street_name?: string;
      street_number?: number;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
}

export interface MercadoPagoPaymentNotification {
  id: string;
  action: string;
  api_version: string;
  data: {
    id: string;
  };
  date_created: string;
  live_mode: boolean;
  type: string;
  user_id: string;
}

/**
 * Criar preferência de pagamento no Mercado Pago
 */
export async function createPaymentPreference(
  preferenceData: MercadoPagoPreference
): Promise<any> {
  try {
    // Garantir que está usando modo de teste se configurado
    if (isTestMode) {
      console.log('[Mercado Pago] Modo de teste ativado');
    }

    const preference = await preferenceClient.create({
      body: {
        ...preferenceData,
        metadata: {
          ...preferenceData.metadata,
          test_mode: isTestMode,
        },
      },
    });

    return preference;
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao criar preferência:', error);
    throw new Error(`Erro ao criar preferência de pagamento: ${error.message}`);
  }
}

/**
 * Buscar informação de pagamento por ID
 */
export async function getPaymentById(paymentId: string): Promise<any> {
  try {
    // Usar o SDK do Mercado Pago para buscar pagamento
    // Nota: Será implementado quando necessário buscar detalhes do pagamento
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao buscar pagamento:', error);
    throw new Error(`Erro ao buscar pagamento: ${error.message}`);
  }
}

/**
 * Validar webhook do Mercado Pago
 */
export function validateWebhookNotification(
  notification: MercadoPagoPaymentNotification
): boolean {
  // Validar estrutura básica da notificação
  if (!notification.id || !notification.type || !notification.data?.id) {
    return false;
  }

  // Validar que o tipo é de pagamento
  if (notification.type !== 'payment') {
    return false;
  }

  return true;
}

export { client };
export const isTestModeEnabled = isTestMode;

