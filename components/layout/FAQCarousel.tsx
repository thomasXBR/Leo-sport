'use client';

import { useState, useEffect } from 'react';
import { HelpCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { getFAQs, type FAQ } from '@/lib/supabase';

export default function FAQCarousel() {
    const [currentPage, setCurrentPage] = useState(0);
    const [faqs, setFaqs] = useState<FAQ[]>([]);
    const [loading, setLoading] = useState(true);
    
    const FAQS_PER_PAGE = 5;

    useEffect(() => {
        loadFAQs();
    }, []);

    const loadFAQs = async () => {
        try {
            const data = await getFAQs();
            setFaqs(data || []);
            setLoading(false);
        } catch (error: any) {
            console.error('Erro ao carregar FAQs:', error);
            setFaqs([]);
            setLoading(false);
        }
    };

    if (loading) {
        return null;
    }

    if (faqs.length === 0) {
        return null;
    }

    const totalPages = Math.ceil(faqs.length / FAQS_PER_PAGE);
    const currentFAQs = faqs.slice(
        currentPage * FAQS_PER_PAGE,
        (currentPage + 1) * FAQS_PER_PAGE
    );

    const goToPrevious = () => {
        setCurrentPage((prev) => (prev > 0 ? prev - 1 : totalPages - 1));
    };

    const goToNext = () => {
        setCurrentPage((prev) => (prev < totalPages - 1 ? prev + 1 : 0));
    };

    return (
        <div className="w-full">
            <div className="relative">
                <div className="overflow-hidden">
                    <div
                        className="flex transition-transform duration-500 ease-in-out"
                        style={{
                            transform: `translateX(-${currentPage * 100}%)`,
                        }}
                    >
                        {Array.from({ length: totalPages }).map((_, pageIndex) => (
                            <div key={pageIndex} className="min-w-full">
                                <div className="space-y-4">
                                    {faqs.slice(pageIndex * FAQS_PER_PAGE, (pageIndex + 1) * FAQS_PER_PAGE).map((faq) => (
                                        <div
                                            key={faq.id}
                                            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                        >
                                            <div className="flex items-start gap-3">
                                                <HelpCircle className="w-5 h-5 text-blue-900 flex-shrink-0 mt-0.5" />
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-900 mb-2">
                                                        {faq.perguntas_frequentes}
                                                    </h4>
                                                    <p className="text-gray-600 text-sm">
                                                        {faq.respostas}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                        <button
                            onClick={goToPrevious}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Pergunta anterior"
                        >
                            <ChevronLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        
                        <div className="flex gap-2">
                            {Array.from({ length: totalPages }).map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentPage(index)}
                                    className={`w-2 h-2 rounded-full transition-all ${
                                        index === currentPage ? 'bg-blue-900 w-6' : 'bg-gray-300'
                                    }`}
                                    aria-label={`Ir para página ${index + 1}`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={goToNext}
                            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                            aria-label="Próxima pergunta"
                        >
                            <ChevronRight className="w-5 h-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

