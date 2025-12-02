import { useState, useCallback } from 'react';

export interface CreatePreferenceParams {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    picture_url?: string;
  }>;
  payer: {
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
      street_number?: string | number;
    };
  };
  external_reference?: string;
  notification_url?: string;
  statement_descriptor?: string;
  metadata?: Record<string, any>;
}

export interface WebCheckoutParams {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    picture_url?: string;
  }>;
  payerEmail: string;
  orderId: string;
  payerName?: string;
  payerSurname?: string;
  payerPhone?: string;
  payerIdentification?: string;
  shipmentMode?: 'not_specified' | 'custom' | 'me2';
  statementDescriptor?: string;
  installments?: number;
}

export interface MobileCheckoutParams {
  items: Array<{
    id: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
    currency_id?: string;
    picture_url?: string;
  }>;
  payerEmail: string;
  orderId: string;
  payerName?: string;
  payerPhone?: string;
  installments?: number;
  excludedPaymentMethods?: string[];
}

export interface PaymentPreference {
  success: boolean;
  preference_id: string;
  init_point: string;
  sandbox_init_point: string;
  preference: any;
}

export function useMercadoPago() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreference = useCallback(
    async (params: CreatePreferenceParams): Promise<PaymentPreference | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/payments/create-preference', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar preferência de pagamento');
        }

        const data: PaymentPreference = await response.json();
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao criar preferência de pagamento';
        setError(errorMessage);
        console.error('[useMercadoPago]', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createWebCheckout = useCallback(
    async (params: WebCheckoutParams): Promise<PaymentPreference | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/payments/web-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar checkout web');
        }

        const data: PaymentPreference = await response.json();
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao criar checkout web';
        setError(errorMessage);
        console.error('[useMercadoPago - Web]', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const createMobileCheckout = useCallback(
    async (params: MobileCheckoutParams): Promise<PaymentPreference | null> => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/payments/mobile-checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao criar checkout mobile');
        }

        const data: PaymentPreference = await response.json();
        return data;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao criar checkout mobile';
        setError(errorMessage);
        console.error('[useMercadoPago - Mobile]', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getPaymentStatus = useCallback(
    async (paymentId: string) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/payments/status?payment_id=${paymentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao buscar status do pagamento');
        }

        const data = await response.json();
        return data.payment;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao buscar status do pagamento';
        setError(errorMessage);
        console.error('[useMercadoPago]', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refundPayment = useCallback(
    async (paymentId: string, amount?: number) => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch('/api/payments/refund', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ paymentId, amount }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Erro ao reembolsar pagamento');
        }

        const data = await response.json();
        return data.refund;
      } catch (err: any) {
        const errorMessage = err.message || 'Erro ao reembolsar pagamento';
        setError(errorMessage);
        console.error('[useMercadoPago - Refund]', errorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const redirectToCheckout = useCallback(
    async (params: CreatePreferenceParams) => {
      const preference = await createPreference(params);
      if (preference?.init_point) {
        window.location.href = preference.init_point;
      }
    },
    [createPreference]
  );

  const redirectToWebCheckout = useCallback(
    async (params: WebCheckoutParams) => {
      const preference = await createWebCheckout(params);
      if (preference?.init_point) {
        window.location.href = preference.init_point;
      }
    },
    [createWebCheckout]
  );

  return {
    loading,
    error,
    createPreference,
    createWebCheckout,
    createMobileCheckout,
    getPaymentStatus,
    refundPayment,
    redirectToCheckout,
    redirectToWebCheckout,
  };
}
