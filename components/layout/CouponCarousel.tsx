'use client';

import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { getNavbarCoupons, type Coupon } from '@/lib/supabase';

type Props = {
    onHasCouponsChange?: (hasCoupons: boolean) => void;
};

export default function CouponCarousel({ onHasCouponsChange }: Props) {
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const data = await getNavbarCoupons();
            const list = data || [];
            setCoupons(list);
            onHasCouponsChange?.(list.length > 0);
            setLoading(false);
        } catch (error: any) {
            // Log detalhado do erro
            console.error('Erro ao carregar cupons:', {
                message: error?.message || 'Erro desconhecido',
                details: error?.details || error?.hint || error,
                code: error?.code
            });
            // Não mostrar erro ao usuário, apenas não exibir o carrossel
            setCoupons([]);
            onHasCouponsChange?.(false);
            setLoading(false);
        }
    };

    if (loading || coupons.length === 0) return null;

    const formatCouponMessage = (coupon: Coupon) => {
        // Usar o texto personalizado do admin se existir, senão usar o padrão
        if (coupon.carousel_text) {
            return coupon.carousel_text;
        }
        // Fallback para texto padrão se não houver texto personalizado
        const code = coupon.code;
        return `🎉 Ganhe descontos especiais usando o cupom: ${code}`;
    };

    // Duplicar cupons para criar efeito de loop infinito
    const duplicatedCoupons = [...coupons, ...coupons];

    return (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-2 overflow-hidden relative fixed top-16 left-0 right-0 z-40">
            <style jsx>{`
                @keyframes coupon-marquee {
                    0% {
                        transform: translateX(0);
                    }
                    100% {
                        transform: translateX(-50%);
                    }
                }

                .marquee-track {
                    animation: coupon-marquee 18s linear infinite;
                }

                .marquee-track:hover {
                    animation-play-state: paused;
                }
            `}</style>
            
            <div className="flex items-center justify-center">
                <div className="overflow-hidden h-8 relative w-full">
                    <div className="flex marquee-track whitespace-nowrap min-w-max">
                        {duplicatedCoupons.map((coupon, index) => (
                            <div
                                key={`${coupon.id}-${index}`}
                                className="inline-flex items-center gap-2 px-8 text-sm sm:text-base font-medium flex-shrink-0"
                            >
                                <Ticket className="w-4 h-4 flex-shrink-0" />
                                <span>{formatCouponMessage(coupon)}</span>
                                <span className="mx-4 text-white/50">•</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

