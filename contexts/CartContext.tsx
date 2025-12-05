'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
    const { user } = useAuth();

    // Load cart from database or localStorage
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            try {
                if (user) {
                    // Carregar do banco de dados
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => ({
                        product: item.product || {
                            id: item.product_id,
                            name: 'Produto não encontrado',
                            price: '0,00',
                            imageUrl: '',
                            category: '',
                        },
                        quantity: item.quantity,
                        cartId: item.id,
                    }));
                    setCartItems(items);
                } else {
                    // Carregar do localStorage
                    const savedCart = localStorage.getItem('leosport-cart');
                    if (savedCart) {
                        try {
                            setCartItems(JSON.parse(savedCart));
                        } catch (error) {
                            console.error('Error loading cart from localStorage', error);
                        }
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
                    }
                }
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [user]);

    // Sincronizar com banco de dados quando usuário fizer login
    useEffect(() => {
        if (user) {
            const syncCartToDB = async () => {
                try {
                    // Primeiro, limpar carrinho do banco
                    await clearUserCartDB(user.id);
                    
                    // Depois, adicionar todos os itens do localStorage ao banco
                    const savedCart = localStorage.getItem('leosport-cart');
                    if (savedCart) {
                        const items: CartItem[] = JSON.parse(savedCart);
                        for (const item of items) {
                            try {
                                await addToUserCartDB(user.id, item.product.id.toString(), item.quantity);
                            } catch (error) {
                                console.error('Error syncing cart item:', error);
                            }
                        }
                        // Limpar localStorage após sincronizar
                        localStorage.removeItem('leosport-cart');
                    }
                } catch (error) {
                    console.error('Error syncing cart to database:', error);
                }
            };

            syncCartToDB();
        }
    }, [user]);

    // Save cart to localStorage or database whenever it changes
    useEffect(() => {
        if (!user) {
            // Salvar apenas no localStorage se não estiver autenticado
            localStorage.setItem('leosport-cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user]);

    const addToCart = async (product: Product, quantity: number = 1) => {
        if (user) {
            try {
                await addToUserCartDB(user.id, product.id.toString(), quantity);
                // Recarregar carrinho do banco
                const dbCart = await getUserCart(user.id);
                const items: CartItem[] = dbCart.map((item: any) => ({
                    product: item.product || {
                        id: item.product_id,
                        name: 'Produto não encontrado',
                        price: '0,00',
                        imageUrl: '',
                        category: '',
                    },
                    quantity: item.quantity,
                    cartId: item.id,
                }));
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
    };

    const removeFromCart = async (productId: number) => {
        if (user) {
            try {
                const item = cartItems.find(item => item.product.id === productId);
                if (item?.cartId) {
                    await deleteUserCartItemDB(item.cartId);
                    // Recarregar carrinho do banco
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => ({
                        product: item.product || {
                            id: item.product_id,
                            name: 'Produto não encontrado',
                            price: '0,00',
                            imageUrl: '',
                            category: '',
                        },
                        quantity: item.quantity,
                        cartId: item.id,
                    }));
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Error removing from cart:', error);
                // Fallback para estado local
                setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
            }
        } else {
            setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        }
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
            return;
        }

        if (user) {
            try {
                const item = cartItems.find(item => item.product.id === productId);
                if (item?.cartId) {
                    await updateUserCartItemDB(item.cartId, quantity);
                    // Recarregar carrinho do banco
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => ({
                        product: item.product || {
                            id: item.product_id,
                            name: 'Produto não encontrado',
                            price: '0,00',
                            imageUrl: '',
                            category: '',
                        },
                        quantity: item.quantity,
                        cartId: item.id,
                    }));
                    setCartItems(items);
                }
            } catch (error) {
                console.error('Error updating cart quantity:', error);
                // Fallback para estado local
                setCartItems(prevItems =>
                    prevItems.map(item =>
                        item.product.id === productId ? { ...item, quantity } : item
                    )
                );
            }
        } else {
            setCartItems(prevItems =>
                prevItems.map(item =>
                    item.product.id === productId ? { ...item, quantity } : item
                )
            );
        }
    };

    const clearCart = async () => {
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
    };

    // Calculate total price
    const cartTotal = cartItems.reduce((total, item) => {
        const price = parseFloat(item.product.price.replace(/[^\d,]/g, '').replace(',', '.'));
        return total + (price * item.quantity);
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

