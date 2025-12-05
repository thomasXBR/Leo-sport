/**
 * Utilitários e helpers para integração completa do Mercado Pago e Melhor Envio
 */

import { MercadoPagoItem } from './mercadoPagoClient';
import { MelhorEnvioPackage } from './melhorEnvioClient';
import { Product } from './types';

/**
 * Converter produtos do sistema para itens do Mercado Pago
 */
export function convertProductsToMercadoPagoItems(
  products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    quantity: number;
    image_url?: string;
  }>
): MercadoPagoItem[] {
  return products.map((product) => ({
    id: product.id,
    title: product.name,
    description: product.description || '',
    quantity: product.quantity,
    unit_price: product.price,
    currency_id: 'BRL',
    picture_url: product.image_url,
  }));
}

/**
 * Converter produtos do sistema para pacotes do Melhor Envio
 */
export function convertProductsToMelhorEnvioPackages(
  products: Array<{
    weight: number; // kg
    dimensions: {
      length: number; // cm
      width: number; // cm
      height: number; // cm
    };
    quantity: number;
  }>
): MelhorEnvioPackage[] {
  const packages: MelhorEnvioPackage[] = [];

  products.forEach((product) => {
    // Criar um pacote para cada unidade do produto
    for (let i = 0; i < product.quantity; i++) {
      packages.push({
        height: product.dimensions.height,
        width: product.dimensions.width,
        length: product.dimensions.length,
        weight: product.weight,
      });
    }
  });

  return packages;
}

/**
 * Calcular dimensões totais de múltiplos produtos
 * Retorna as dimensões do maior produto (método simples)
 */
export function calculateTotalDimensions(
  products: Array<{
    dimensions: {
      length: number;
      width: number;
      height: number;
    };
    quantity: number;
  }>
): {
  length: number;
  width: number;
  height: number;
} {
  if (products.length === 0) {
    return { length: 10, width: 10, height: 10 }; // Dimensões padrão
  }

  // Encontrar o maior produto em cada dimensão
  let maxLength = 0;
  let maxWidth = 0;
  let maxHeight = 0;

  products.forEach((product) => {
    maxLength = Math.max(maxLength, product.dimensions.length);
    maxWidth = Math.max(maxWidth, product.dimensions.width);
    maxHeight = Math.max(maxHeight, product.dimensions.height);
  });

  return {
    length: maxLength,
    width: maxWidth,
    height: maxHeight,
  };
}

/**
 * Calcular peso total de múltiplos produtos
 */
export function calculateTotalWeight(
  products: Array<{
    weight: number;
    quantity: number;
  }>
): number {
  return products.reduce((total, product) => {
    return total + product.weight * product.quantity;
  }, 0);
}

/**
 * Validar CEP brasileiro
 */
export function validateCEP(cep: string): boolean {
  const cleanCEP = cep.replace(/\D/g, '');
  return cleanCEP.length === 8;
}

/**
 * Formatar CEP brasileiro
 */
export function formatCEP(cep: string): string {
  const cleanCEP = cep.replace(/\D/g, '');
  if (cleanCEP.length === 8) {
    return `${cleanCEP.substring(0, 5)}-${cleanCEP.substring(5)}`;
  }
  return cleanCEP;
}

/**
 * Validar CPF/CNPJ
 */
export function validateDocument(document: string): boolean {
  const cleanDoc = document.replace(/\D/g, '');
  return cleanDoc.length === 11 || cleanDoc.length === 14;
}

/**
 * Formatar CPF/CNPJ
 */
export function formatDocument(document: string): string {
  const cleanDoc = document.replace(/\D/g, '');
  
  if (cleanDoc.length === 11) {
    // CPF: 000.000.000-00
    return `${cleanDoc.substring(0, 3)}.${cleanDoc.substring(3, 6)}.${cleanDoc.substring(6, 9)}-${cleanDoc.substring(9)}`;
  } else if (cleanDoc.length === 14) {
    // CNPJ: 00.000.000/0000-00
    return `${cleanDoc.substring(0, 2)}.${cleanDoc.substring(2, 5)}.${cleanDoc.substring(5, 8)}/${cleanDoc.substring(8, 12)}-${cleanDoc.substring(12)}`;
  }
  
  return cleanDoc;
}

/**
 * Validar telefone brasileiro
 */
export function validatePhone(phone: string): boolean {
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length >= 10 && cleanPhone.length <= 11;
}

/**
 * Formatar telefone brasileiro
 */
export function formatPhone(phone: string): string {
  const cleanPhone = phone.replace(/\D/g, '');
  
  if (cleanPhone.length === 10) {
    // (00) 0000-0000
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 6)}-${cleanPhone.substring(6)}`;
  } else if (cleanPhone.length === 11) {
    // (00) 00000-0000
    return `(${cleanPhone.substring(0, 2)}) ${cleanPhone.substring(2, 7)}-${cleanPhone.substring(7)}`;
  }
  
  return cleanPhone;
}

/**
 * Gerar ID único para pedido
 */
export function generateOrderId(prefix: string = 'ORD'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Calcular valor total de um pedido
 */
export function calculateOrderTotal(
  items: Array<{
    price: number;
    quantity: number;
  }>,
  shipping?: number,
  discount?: number
): number {
  const itemsTotal = items.reduce((total, item) => {
    return total + item.price * item.quantity;
  }, 0);

  let total = itemsTotal;
  
  if (shipping) {
    total += shipping;
  }
  
  if (discount) {
    total -= discount;
  }

  return Math.max(0, total);
}

/**
 * Validar email
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Preparar dados de endereço para Melhor Envio
 */
export function prepareAddressForMelhorEnvio(address: {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  name: string;
  phone: string;
  email: string;
  document: string;
}): {
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
} {
  return {
    name: address.name,
    phone: address.phone.replace(/\D/g, ''),
    email: address.email,
    document: address.document.replace(/\D/g, ''),
    address: address.street,
    complement: address.complement,
    number: address.number,
    district: address.neighborhood,
    city: address.city,
    state: address.state.toUpperCase(),
    country_id: 'BR',
    postal_code: address.zip_code.replace(/\D/g, ''),
  };
}

/**
 * Preparar dados de endereço para Mercado Pago
 */
export function prepareAddressForMercadoPago(address: {
  zip_code: string;
  street: string;
  number: string;
  city?: string;
  state?: string;
}): {
  zip_code: string;
  street_name: string;
  street_number: string;
  city_name?: string;
  state_name?: string;
} {
  return {
    zip_code: address.zip_code.replace(/\D/g, ''),
    street_name: address.street,
    street_number: address.number,
    city_name: address.city,
    state_name: address.state,
  };
}




