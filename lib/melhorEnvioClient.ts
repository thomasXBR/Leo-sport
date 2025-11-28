import axios, { AxiosInstance } from 'axios';
import crypto from 'crypto';

/**
 * Cliente Melhor Envio para cálculo de frete e criação de envios
 */

const token = process.env.MELHOR_ENVIO_TOKEN || '';
const isProduction = process.env.MELHOR_ENVIO_PRODUCTION === 'true';
const webhookSecret = process.env.MELHOR_ENVIO_WEBHOOK_SECRET || '';

// URLs da API do Melhor Envio
const BASE_URL = isProduction
  ? 'https://melhorenvio.com.br/api/v2/me'
  : 'https://sandbox.melhorenvio.com.br/api/v2/me';

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'User-Agent': 'LeoSport (leosport@email.com)',
  },
  timeout: 30000,
});

/**
 * Tipos para integração com Melhor Envio
 */
export interface MelhorEnvioPackage {
  height: number; // cm
  width: number; // cm
  length: number; // cm
  weight: number; // kg
}

export interface MelhorEnvioFrom {
  postal_code: string; // CEP do remetente
}

export interface MelhorEnvioTo {
  postal_code: string; // CEP do destinatário
}

export interface MelhorEnvioCalculateShippingRequest {
  from: MelhorEnvioFrom;
  to: MelhorEnvioTo;
  products: MelhorEnvioPackage[];
  services?: string; // IDs dos serviços específicos (opcional)
}

export interface MelhorEnvioShippingOption {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
    picture: string;
  };
  price: string; // Preço em formato string (ex: "25.50")
  currency: string;
  delivery_time: number; // Dias para entrega
  delivery_range: {
    min: number;
    max: number;
  };
  packages: MelhorEnvioPackage[];
  additional_services?: any[];
  company_id: number;
}

export interface MelhorEnvioShippingResponse {
  id: string;
  protocol: string;
  service_id: number;
  status: string;
  tracking?: string;
  created_at: string;
}

export interface MelhorEnvioCreateShippingRequest {
  service: number; // ID do serviço escolhido
  from: {
    name: string;
    phone: string;
    email: string;
    document: string; // CPF/CNPJ
    company_document?: string; // CNPJ se for empresa
    state_register?: string; // Inscrição estadual
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state: string; // UF (ex: "SP")
    country_id: string;
    postal_code: string;
  };
  to: {
    name: string;
    phone: string;
    email: string;
    document: string;
    address: string;
    complement?: string;
    number: string;
    district: string;
    city: string;
    state: string;
    country_id: string;
    postal_code: string;
  };
  products: Array<{
    name: string;
    quantity: number;
    unitary_value: number; // Valor unitário
  }>;
  volumes: MelhorEnvioPackage[];
  options?: {
    insurance_value?: number;
    receipt?: boolean;
    own_hand?: boolean;
    reverse?: boolean;
    non_commercial?: boolean;
    invoice?: {
      key?: string;
    };
    platform?: string;
  };
}

/**
 * Calcular opções de frete
 */
export async function calculateShipping(
  request: MelhorEnvioCalculateShippingRequest
): Promise<MelhorEnvioShippingOption[]> {
  try {
    const response = await apiClient.post('/shipment/calculate', request);

    if (response.data && Array.isArray(response.data)) {
      return response.data.map((option: any) => ({
        id: option.id,
        name: option.name,
        company: {
          id: option.company.id,
          name: option.company.name,
          picture: option.company.picture || '',
        },
        price: option.price || '0',
        currency: option.currency || 'BRL',
        delivery_time: option.delivery_time || 0,
        delivery_range: {
          min: option.delivery_range?.min || 0,
          max: option.delivery_range?.max || 0,
        },
        packages: option.packages || [],
        additional_services: option.additional_services || [],
        company_id: option.company_id || 0,
      }));
    }

    return [];
  } catch (error: any) {
    console.error('[Melhor Envio] Erro ao calcular frete:', error.response?.data || error.message);
    throw new Error(
      `Erro ao calcular frete: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Criar envio no Melhor Envio
 */
export async function createShipping(
  request: MelhorEnvioCreateShippingRequest
): Promise<MelhorEnvioShippingResponse> {
  try {
    const response = await apiClient.post('/shipment', request);

    return {
      id: response.data.id,
      protocol: response.data.protocol || '',
      service_id: response.data.service_id || request.service,
      status: response.data.status || 'pending',
      tracking: response.data.tracking || undefined,
      created_at: response.data.created_at || new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('[Melhor Envio] Erro ao criar envio:', error.response?.data || error.message);
    throw new Error(
      `Erro ao criar envio: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Buscar informação de um envio
 */
export async function getShippingById(shippingId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/shipment/${shippingId}`);
    return response.data;
  } catch (error: any) {
    console.error('[Melhor Envio] Erro ao buscar envio:', error.response?.data || error.message);
    throw new Error(
      `Erro ao buscar envio: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Rastrear envio
 */
export async function trackShipping(shippingId: string): Promise<any> {
  try {
    const response = await apiClient.get(`/shipment/${shippingId}/tracking`);
    return response.data;
  } catch (error: any) {
    console.error('[Melhor Envio] Erro ao rastrear envio:', error.response?.data || error.message);
    throw new Error(
      `Erro ao rastrear envio: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Gerar etiqueta de envio
 */
export async function generateShippingLabel(shippingId: string): Promise<any> {
  try {
    const response = await apiClient.post(`/shipment/${shippingId}/label`);
    return response.data;
  } catch (error: any) {
    console.error('[Melhor Envio] Erro ao gerar etiqueta:', error.response?.data || error.message);
    throw new Error(
      `Erro ao gerar etiqueta: ${error.response?.data?.message || error.message}`
    );
  }
}

/**
 * Validar assinatura do webhook do Melhor Envio
 * @param signature - Assinatura recebida no cabeçalho X-ME-Signature
 * @param body - Corpo da requisição (string JSON)
 * @returns true se a assinatura for válida
 */
export function validateWebhookSignature(signature: string, body: string): boolean {
  if (!webhookSecret) {
    console.warn('[Melhor Envio] Webhook secret não configurado. Validação desabilitada.');
    return true; // Em desenvolvimento, permitir sem validação se não houver secret
  }

  if (!signature) {
    return false;
  }

  try {
    // Calcular HMAC-SHA256
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(body);
    const calculatedSignature = hmac.digest('hex');

    // Verificar se as assinaturas têm o mesmo tamanho
    if (signature.length !== calculatedSignature.length) {
      return false;
    }

    // Comparar assinaturas (usar comparação segura para evitar timing attacks)
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(calculatedSignature)
    );
  } catch (error) {
    console.error('[Melhor Envio] Erro ao validar assinatura do webhook:', error);
    return false;
  }
}

/**
 * Tipos para webhook do Melhor Envio
 */
export interface MelhorEnvioWebhookEvent {
  event: string; // Ex: "order.created", "order.paid", "order.cancelled", "order.shipped", etc.
  data: {
    id: string;
    protocol?: string;
    status?: string;
    tracking?: string;
    [key: string]: any;
  };
}

export { apiClient as melhorEnvioClient };

