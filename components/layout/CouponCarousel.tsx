'use client';

import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';
import { getNavbarCoupons, type Coupon } from '@/lib/supabase';

export default function CouponCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCoupons();
    }, []);

    const loadCoupons = async () => {
        try {
            const data = await getNavbarCoupons();
            setCoupons(data || []);
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
            setLoading(false);
        }
    };

    useEffect(() => {
        if (coupons.length > 1) {
            const interval = setInterval(() => {
                setCurrentIndex((prev) => (prev + 1) % coupons.length);
            }, 4000); // Muda o cupom a cada 4 segundos

            return () => clearInterval(interval);
        }
    }, [coupons.length]);

    if (loading) {
        return null;
    }

    if (coupons.length === 0) {
        return null;
    }

    const formatCouponMessage = (coupon: Coupon) => {
        // Usar o texto personalizado do admin se existir, senão usar o padrão
        if (coupon.carousel_text) {
            return coupon.carousel_text;
        }
        // Fallback para texto padrão se não houver texto personalizado
        const code = coupon.code;
        return `🎉 Ganhe descontos especiais usando o cupom: ${code}`;
    };

    return (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-2 overflow-hidden relative fixed top-0 left-0 right-0 z-40">
            <div className="flex items-center justify-center gap-2">
                <div className="overflow-hidden h-6 relative w-full max-w-4xl mx-auto">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {coupons.map((coupon, index) => (
                            <div
                                key={coupon.id}
                                className="min-w-full text-center text-sm sm:text-base font-medium px-4 flex items-center justify-center gap-2"
                            >
                                <Ticket className="w-4 h-4 flex-shrink-0" />
                                <span>{formatCouponMessage(coupon)}</span>
                            </div>
                        ))}
                    </div>
                </div>
                {coupons.length > 1 && (
                    <div className="flex gap-1 px-4">
                        {coupons.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                                    }`}
                                aria-label={`Ir para cupom ${index + 1}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

