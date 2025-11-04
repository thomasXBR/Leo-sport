'use client';

import { useState, useEffect } from 'react';
import { Ticket } from 'lucide-react';

export default function CouponCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const messages = [
        '🎉 Cupom especial: 25% de desconto em todos os produtos! Use o código: LEOSPORT25',
        '💰 Desconto de 25% OFF! Aproveite agora com o cupom: LEOSPORT25',
        '✨ 25% de desconto em toda a loja! Não perca essa oportunidade: LEOSPORT25',
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % messages.length);
        }, 4000); // Muda a mensagem a cada 4 segundos

        return () => clearInterval(interval);
    }, [messages.length]);

    return (
        <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-2 overflow-hidden relative">
            <div className="flex items-center justify-center gap-2">
                <div className="overflow-hidden h-6 relative w-full max-w-4xl mx-auto">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentIndex * 100}%)`,
                        }}
                    >
                        {messages.map((message, index) => (
                            <div
                                key={index}
                                className="min-w-full text-center text-sm sm:text-base font-medium px-4"
                            >
                                {message}
                            </div>
                        ))}
                    </div>
                </div>
                <div className="flex gap-1 px-4">
                    {messages.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${index === currentIndex ? 'bg-white' : 'bg-white/50'
                                }`}
                            aria-label={`Ir para mensagem ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

