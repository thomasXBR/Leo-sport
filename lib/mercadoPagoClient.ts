import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';

/**
 * Cliente Mercado Pago para integração de pagamentos
 * Suporta credenciais de teste e produção
 * 
 * Variáveis de ambiente necessárias:
 * - MERCADO_PAGO_ACCESS_TOKEN: Token de acesso do Mercado Pago
 * - MERCADO_PAGO_TEST_MODE: 'true' para modo de teste (opcional)
 * - NEXT_PUBLIC_APP_URL: URL base da aplicação para webhooks
 */

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';
const isTestMode = process.env.MERCADO_PAGO_TEST_MODE === 'true' || !accessToken;

if (!accessToken && process.env.NODE_ENV === 'production') {
  console.warn('[Mercado Pago] ATENÇÃO: MERCADO_PAGO_ACCESS_TOKEN não configurado em produção!');
}

// Inicializar cliente Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken,
  options: {
    timeout: 30000, // 30 segundos para operações mais complexas
    idempotencyKey: undefined, // Será definido por requisição se necessário
  }
});

export const preferenceClient = new Preference(client);
export const paymentClient = new Payment(client);

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

export interface MercadoPagoAddress {
  zip_code?: string;
  street_name?: string;
  street_number?: string | number;
  city_name?: string;
  state_name?: string;
}

export interface MercadoPagoPayer {
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
  address?: MercadoPagoAddress;
}

export interface MercadoPagoBackUrls {
  success?: string;
  failure?: string;
  pending?: string;
}

export interface MercadoPagoShipment {
  mode?: 'not_specified' | 'custom' | 'me2';
  default_shipping_method?: number;
  free_methods?: number[];
  cost?: number;
  free_shipping?: boolean;
  receiver_address?: MercadoPagoAddress;
}

export interface MercadoPagoPaymentMethods {
  excluded_payment_methods?: Array<{
    id: string;
  }>;
  excluded_payment_types?: Array<{
    id: string;
  }>;
  installments?: number;
  default_installments?: number;
  default_payment_method_id?: string;
}

export interface MercadoPagoPreference {
  items: MercadoPagoItem[];
  payer?: MercadoPagoPayer;
  back_urls?: MercadoPagoBackUrls;
  auto_return?: 'approved' | 'all';
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
  shipment?: MercadoPagoShipment;
  payment_methods?: MercadoPagoPaymentMethods;
  additional_info?: {
    items?: MercadoPagoItem[];
    payer?: MercadoPagoPayer;
    shipments?: MercadoPagoShipment;
  };
  expires?: boolean;
  expiration_date_from?: string;
  expiration_date_to?: string;
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

    // Preparar dados convertendo tipos conforme necessário
    const body: any = {
      items: preferenceData.items.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || '',
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id || 'BRL',
        picture_url: item.picture_url,
      })),
      metadata: {
        ...preferenceData.metadata,
        test_mode: isTestMode,
      },
    };

    // Adicionar payer se existir, convertendo street_number para string
    if (preferenceData.payer) {
      body.payer = {
        ...preferenceData.payer,
        address: preferenceData.payer.address
          ? {
              ...preferenceData.payer.address,
              street_number:
                preferenceData.payer.address.street_number !== undefined
                  ? String(preferenceData.payer.address.street_number)
                  : undefined,
            }
          : undefined,
      };
    }

    // Adicionar outros campos opcionais
    if (preferenceData.back_urls) {
      body.back_urls = preferenceData.back_urls;
    }
    if (preferenceData.auto_return) {
      body.auto_return = preferenceData.auto_return;
    }
    if (preferenceData.external_reference) {
      body.external_reference = preferenceData.external_reference;
    }
    if (preferenceData.notification_url) {
      body.notification_url = preferenceData.notification_url;
    }
    if (preferenceData.statement_descriptor) {
      body.statement_descriptor = preferenceData.statement_descriptor;
    }
    if (preferenceData.shipment) {
      body.shipment = preferenceData.shipment;
    }
    if (preferenceData.payment_methods) {
      body.payment_methods = preferenceData.payment_methods;
    }
    if (preferenceData.additional_info) {
      body.additional_info = preferenceData.additional_info;
    }
    if (preferenceData.expires !== undefined) {
      body.expires = preferenceData.expires;
      if (preferenceData.expiration_date_from) {
        body.expiration_date_from = preferenceData.expiration_date_from;
      }
      if (preferenceData.expiration_date_to) {
        body.expiration_date_to = preferenceData.expiration_date_to;
      }
    }

    const preference = await preferenceClient.create({
      body,
    });

    return preference;
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao criar preferência:', error);
    throw new Error(`Erro ao criar preferência de pagamento: ${error.message}`);
  }
}

/**
 * Criar preferência para integração WEB (Checkout Pro)
 * Redireciona para o Mercado Pago Checkout Pro
 */
export async function createWebCheckoutPreference(
  items: MercadoPagoItem[],
  payerEmail: string,
  orderId: string,
  options?: {
    payerName?: string;
    payerSurname?: string;
    payerPhone?: string;
    payerIdentification?: string;
    shipmentMode?: 'not_specified' | 'custom' | 'me2';
    statementDescriptor?: string;
    installments?: number;
  }
): Promise<any> {
  const backUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const preference = await createPaymentPreference({
    items,
    payer: {
      email: payerEmail,
      name: options?.payerName,
      surname: options?.payerSurname,
      phone: options?.payerPhone ? { number: options.payerPhone } : undefined,
      identification: options?.payerIdentification
        ? { number: options.payerIdentification }
        : undefined,
    },
    back_urls: {
      success: `${backUrl}/checkout/success?preference_id={preference_id}`,
      failure: `${backUrl}/checkout/failure`,
      pending: `${backUrl}/checkout/pending`,
    },
    auto_return: 'approved',
    external_reference: orderId,
    statement_descriptor: options?.statementDescriptor || 'LEOSPORT',
    notification_url: `${backUrl}/api/payments/webhook`,
    payment_methods: {
      installments: options?.installments || 12,
    },
    metadata: {
      order_id: orderId,
      integration_type: 'web',
      created_at: new Date().toISOString(),
    },
  });

  return preference;
}

/**
 * Criar preferência para integração MOBILE
 * Retorna dados para integração com apps nativos
 */
export async function createMobileCheckoutPreference(
  items: MercadoPagoItem[],
  payerEmail: string,
  orderId: string,
  options?: {
    payerName?: string;
    payerPhone?: string;
    installments?: number;
    excludedPaymentMethods?: string[];
  }
): Promise<any> {
  const backUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  const preference = await createPaymentPreference({
    items,
    payer: {
      email: payerEmail,
      name: options?.payerName,
      phone: options?.payerPhone ? { number: options.payerPhone } : undefined,
    },
    back_urls: {
      success: `${backUrl}/checkout/success?preference_id={preference_id}`,
      failure: `${backUrl}/checkout/failure`,
      pending: `${backUrl}/checkout/pending`,
    },
    external_reference: orderId,
    statement_descriptor: 'LEOSPORT',
    notification_url: `${backUrl}/api/payments/webhook`,
    payment_methods: {
      installments: options?.installments || 12,
      excluded_payment_methods: options?.excludedPaymentMethods?.map(id => ({
        id,
      })),
    },
    metadata: {
      order_id: orderId,
      integration_type: 'mobile',
      device_type: 'mobile_app',
      created_at: new Date().toISOString(),
    },
  });

  return preference;
}

/**
 * Buscar informação de pagamento por ID
 */
export async function getPaymentById(paymentId: string): Promise<any> {
  try {
    const payment = await paymentClient.get({ id: paymentId });
    return payment;
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao buscar pagamento:', error);
    throw new Error(`Erro ao buscar pagamento: ${error.message}`);
  }
}

/**
 * Buscar pagamentos por external_reference (ID do pedido)
 */
export async function searchPaymentsByReference(
  externalReference: string
): Promise<any> {
  try {
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${externalReference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamentos: ${response.statusText}`);
    }

    const data = await response.json();
    return data.results || [];
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao buscar pagamentos:', error);
    throw new Error(`Erro ao buscar pagamentos: ${error.message}`);
  }
}

/**
 * Reembolsar um pagamento (total ou parcial)
 */
export async function refundPayment(paymentId: string, amount?: number): Promise<any> {
  try {
    const refundData: any = {};
    if (amount) {
      refundData.amount = amount;
    }

    // Usar API REST diretamente pois o SDK não expõe método refund
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}/refunds`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(refundData),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao reembolsar: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao reembolsar pagamento:', error);
    throw new Error(`Erro ao reembolsar pagamento: ${error.message}`);
  }
}

/**
 * Cancelar um pagamento pendente
 */
export async function cancelPayment(paymentId: string): Promise<any> {
  try {
    // Usar API REST diretamente
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao cancelar: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao cancelar pagamento:', error);
    throw new Error(`Erro ao cancelar pagamento: ${error.message}`);
  }
}

/**
 * Capturar um pagamento autorizado
 */
export async function capturePayment(paymentId: string, amount?: number): Promise<any> {
  try {
    const captureData: any = {};
    if (amount) {
      captureData.transaction_amount = amount;
    }

    // Usar API REST diretamente
    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...captureData,
          capture: true,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Erro ao capturar: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[Mercado Pago] Erro ao capturar pagamento:', error);
    throw new Error(`Erro ao capturar pagamento: ${error.message}`);
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

/**
 * Obter URL base da aplicação para webhooks e redirects
 */
export function getBaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.NEXT_PUBLIC_APP_URL || 
           (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '');
  }
  
  return process.env.NEXT_PUBLIC_APP_URL || 
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
}

/**
 * Verificar se o pagamento está aprovado
 */
export function isPaymentApproved(payment: any): boolean {
  return payment?.status === 'approved';
}

/**
 * Verificar se o pagamento está pendente
 */
export function isPaymentPending(payment: any): boolean {
  return payment?.status === 'pending' || payment?.status === 'in_process';
}

/**
 * Verificar se o pagamento foi rejeitado
 */
export function isPaymentRejected(payment: any): boolean {
  return payment?.status === 'rejected';
}

/**
 * Verificar se o pagamento foi cancelado
 */
export function isPaymentCancelled(payment: any): boolean {
  return payment?.status === 'cancelled';
}

/**
 * Verificar se o pagamento foi reembolsado
 */
export function isPaymentRefunded(payment: any): boolean {
  return payment?.status === 'refunded';
}

export { client };
export const isTestModeEnabled = isTestMode;

