'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
import { Product } from '@/lib/products-data';
import { useAuth } from '@/contexts/AuthContext';
import { 
    getUserCart, 
    addToUserCart as addToUserCartDB, 
    updateUserCartItem as updateUserCartItemDB,
    deleteUserCartItem as deleteUserCartItemDB,
    clearUserCart as clearUserCartDB,
    type UserCart 
} from '@/lib/supabase';
import { supabase } from '@/lib/supabase';

export interface CartItem {
    product: Product;
    quantity: number;
    cartId?: string; // ID do item no banco de dados
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: number) => void;
    updateQuantity: (productId: number, quantity: number) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    loading: boolean;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [hasSynced, setHasSynced] = useState(false);
    const { user } = useAuth();
    const isLoadingRef = useRef(false);
    const isSyncingRef = useRef(false);

    // Função para normalizar item do banco de dados
    const normalizeCartItem = useCallback((item: any): CartItem => {
        const product = item.product || {};
        const price = typeof product.price === 'number' 
            ? `R$ ${product.price.toFixed(2).replace('.', ',')}`
            : (product.price || '0,00');
        
        return {
            product: {
                id: parseInt(product.id || item.product_id || '0'),
                name: product.name || 'Produto não encontrado',
                price: price,
                imageUrl: product.image_url || product.imageUrl || '',
                category: product.categories?.name || product.category || '',
                description: product.description || '',
                stock: product.stock_quantity || 0,
                sku: product.sku || '',
                brand: product.brand || '',
                weight: product.weight || '',
                dimensions: product.dimensions || '',
                status: product.status || 'Ativo',
            },
            quantity: item.quantity,
            cartId: item.id,
        };
    }, []);

    // Load cart from database or localStorage (apenas uma vez por usuário)
    useEffect(() => {
        // Evitar múltiplas chamadas simultâneas
        if (isLoadingRef.current) return;
        isLoadingRef.current = true;

        const loadCart = async () => {
            setLoading(true);
            try {
                if (user) {
                    // Carregar do banco de dados
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map(normalizeCartItem);
                    setCartItems(items);
                } else {
                    // Carregar do localStorage
                    const savedCart = localStorage.getItem('leosport-cart');
                    if (savedCart) {
                        try {
                            setCartItems(JSON.parse(savedCart));
                        } catch (error) {
                            console.error('Error loading cart from localStorage', error);
                            setCartItems([]);
                        }
                    } else {
                        setCartItems([]);
                    }
                }
            } catch (error) {
                console.error('Error loading cart:', error);
                // Fallback para localStorage se houver erro
                const savedCart = localStorage.getItem('leosport-cart');
                if (savedCart) {
                    try {
                        setCartItems(JSON.parse(savedCart));
                    } catch (e) {
                        console.error('Error loading cart from localStorage', e);
                        setCartItems([]);
                    }
                } else {
                    setCartItems([]);
                }
            } finally {
                setLoading(false);
                isLoadingRef.current = false;
            }
        };

        loadCart();
    }, [user, normalizeCartItem]);

    // Sincronizar com banco de dados quando usuário fizer login (apenas uma vez)
    useEffect(() => {
        if (user && !hasSynced && !isSyncingRef.current) {
            isSyncingRef.current = true;
            
            const syncCartToDB = async () => {
                try {
                    const savedCart = localStorage.getItem('leosport-cart');
                    // Só sincronizar se houver itens no localStorage
                    if (savedCart) {
                        const items: CartItem[] = JSON.parse(savedCart);
                        if (items.length > 0) {
                            // Sincronizar cada item
                            for (const item of items) {
                                try {
                                    await addToUserCartDB(user.id, item.product.id.toString(), item.quantity);
                                } catch (error) {
                                    console.error('Error syncing cart item:', error);
                                }
                            }
                            // Limpar localStorage após sincronizar
                            localStorage.removeItem('leosport-cart');
                            
                            // Recarregar carrinho do banco
                            const dbCart = await getUserCart(user.id);
                            const syncedItems: CartItem[] = dbCart.map(normalizeCartItem);
                            setCartItems(syncedItems);
                        }
                    }
                    setHasSynced(true);
                } catch (error) {
                    console.error('Error syncing cart to database:', error);
                } finally {
                    isSyncingRef.current = false;
                }
            };

            syncCartToDB();
        }
        
        // Reset quando o usuário fizer logout
        if (!user) {
            setHasSynced(false);
            isSyncingRef.current = false;
        }
    }, [user, hasSynced, normalizeCartItem]);

    // Save cart to localStorage (apenas se não estiver autenticado e não carregando)
    useEffect(() => {
        if (!loading && !user) {
            localStorage.setItem('leosport-cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user, loading]);

    const addToCart = useCallback(async (product: Product, quantity: number = 1) => {
        if (user) {
            try {
                setLoading(true);
                await addToUserCartDB(user.id, product.id.toString(), quantity);
                // Recarregar carrinho do banco UMA VEZ
                const dbCart = await getUserCart(user.id);
                const items: CartItem[] = dbCart.map(normalizeCartItem);
                setCartItems(items);
            } catch (error) {
                console.error('Error adding to cart:', error);
                // Fallback para estado local
                setCartItems(prevItems => {
                    const existingItem = prevItems.find(item => item.product.id === product.id);
                    if (existingItem) {
                        return prevItems.map(item =>
                            item.product.id === product.id
                                ? { ...item, quantity: item.quantity + quantity }
                                : item
                        );
                    } else {
                        return [...prevItems, { product, quantity }];
                    }
                });
            } finally {
                setLoading(false);
            }
        } else {
            // Usar localStorage
            setCartItems(prevItems => {
                const existingItem = prevItems.find(item => item.product.id === product.id);
                if (existingItem) {
                    return prevItems.map(item =>
                        item.product.id === product.id
                            ? { ...item, quantity: item.quantity + quantity }
                            : item
                    );
                } else {
                    return [...prevItems, { product, quantity }];
                }
            });
        }
    }, [user, normalizeCartItem]);

    const removeFromCart = useCallback(async (productId: number) => {
        // Encontrar o item antes de atualizar o estado
        const item = cartItems.find(item => item.product.id === productId);
        
        // Atualizar estado imediatamente para melhor UX
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        
        if (user && item?.cartId) {
            try {
                await deleteUserCartItemDB(item.cartId);
            } catch (error) {
                console.error('Error removing from cart:', error);
                // Recarregar carrinho em caso de erro
                try {
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map(normalizeCartItem);
                    setCartItems(items);
                } catch (e) {
                    console.error('Error reloading cart:', e);
                }
            }
        }
    }, [user, cartItems, normalizeCartItem]);

    const updateQuantity = useCallback(async (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        // Encontrar o item antes de atualizar
        const item = cartItems.find(item => item.product.id === productId);

        // Atualizar estado imediatamente para melhor UX
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );

        if (user && item?.cartId) {
            try {
                await updateUserCartItemDB(item.cartId, quantity);
            } catch (error) {
                console.error('Error updating cart quantity:', error);
                // Recarregar carrinho em caso de erro
                try {
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map(normalizeCartItem);
                    setCartItems(items);
                } catch (e) {
                    console.error('Error reloading cart:', e);
                }
            }
        }
    }, [user, cartItems, removeFromCart, normalizeCartItem]);

    const clearCart = useCallback(async () => {
        if (user) {
            try {
                await clearUserCartDB(user.id);
                setCartItems([]);
            } catch (error) {
                console.error('Error clearing cart:', error);
                setCartItems([]);
            }
        } else {
            setCartItems([]);
        }
    }, [user]);

    // Calculate total price
    const cartTotal = cartItems.reduce((total, item) => {
        // Handle both string and number prices
        let priceValue: number;
        if (typeof item.product.price === 'string') {
            priceValue = parseFloat(item.product.price.replace(/[^\d,]/g, '').replace(',', '.'));
        } else if (typeof item.product.price === 'number') {
            priceValue = item.product.price;
        } else {
            priceValue = 0;
        }
        return total + (priceValue * item.quantity);
    }, 0);

    // Calculate total items count
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                cartCount,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
