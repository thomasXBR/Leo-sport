import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Calcula o preço com desconto baseado no tipo e valor do desconto
 * @param originalPrice - Preço original em número
 * @param discountType - Tipo: 'Percentual' | 'Fixo' | 'Especial'
 * @param discountValue - Valor do desconto (string ou número)
 * @returns Objeto com preço original, desconto aplicado e preço final
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountType?: string,
  discountValue?: string | number
): {
  originalPrice: number;
  discountAmount: number;
  finalPrice: number;
  discountPercentage: number;
  hasDiscount: boolean;
} {
  if (!discountType || !discountValue || originalPrice <= 0) {
    return {
      originalPrice,
      discountAmount: 0,
      finalPrice: originalPrice,
      discountPercentage: 0,
      hasDiscount: false,
    };
  }

  let discountAmount = 0;
  let discountPercentage = 0;

  if (discountType === 'Percentual') {
    // Extrai número da string (ex: "15%" -> 15)
    const percentValue = typeof discountValue === 'string'
      ? parseFloat(discountValue.replace(/[^\d.,]/g, '').replace(',', '.'))
      : discountValue;

    if (!isNaN(percentValue) && percentValue > 0 && percentValue <= 100) {
      discountPercentage = percentValue;
      discountAmount = originalPrice * (percentValue / 100);
    }
  } else if (discountType === 'Fixo') {
    // Extrai número da string (ex: "R$ 50,00" -> 50)
    const fixedValue = typeof discountValue === 'string'
      ? parseFloat(discountValue.replace(/[^\d.,]/g, '').replace(',', '.'))
      : discountValue;

    if (!isNaN(fixedValue) && fixedValue > 0 && fixedValue < originalPrice) {
      discountAmount = fixedValue;
      discountPercentage = (fixedValue / originalPrice) * 100;
    }
  } else if (discountType === 'Especial') {
    // Para desconto especial, aplicamos um desconto fixo predefinido (ex: 20%)
    const specialDiscount = 0.2; // 20%
    discountPercentage = specialDiscount * 100;
    discountAmount = originalPrice * specialDiscount;
  }

  const finalPrice = Math.max(0, originalPrice - discountAmount);

  return {
    originalPrice,
    discountAmount: Math.round(discountAmount * 100) / 100,
    finalPrice: Math.round(finalPrice * 100) / 100,
    discountPercentage: Math.round(discountPercentage),
    hasDiscount: discountAmount > 0,
  };
}

/**
 * Formata um número como moeda brasileira (R$)
 */
export function formatCurrency(value: number): string {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}
