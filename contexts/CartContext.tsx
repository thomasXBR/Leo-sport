'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

    // Load cart from database or localStorage
    useEffect(() => {
        const loadCart = async () => {
            setLoading(true);
            try {
                if (user) {
                    // Carregar do banco de dados
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => {
                        // Normalize product data from database
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
                    });
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

    // Sincronizar com banco de dados quando usuário fizer login (apenas uma vez)
    useEffect(() => {
        if (user && !hasSynced) {
            const syncCartToDB = async () => {
                try {
                    const savedCart = localStorage.getItem('leosport-cart');
                    // Só sincronizar se houver itens no localStorage
                    if (savedCart) {
                        const items: CartItem[] = JSON.parse(savedCart);
                        if (items.length > 0) {
                            // Limpar carrinho do banco e sincronizar
                            await clearUserCartDB(user.id);
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
                    }
                    setHasSynced(true);
                } catch (error) {
                    console.error('Error syncing cart to database:', error);
                }
            };

            syncCartToDB();
        }
        
        // Reset quando o usuário fizer logout
        if (!user) {
            setHasSynced(false);
        }
    }, [user, hasSynced]);

    // Save cart to localStorage or database whenever it changes (apenas se não estiver carregando)
    useEffect(() => {
        if (!loading && !user && cartItems.length >= 0) {
            // Salvar apenas no localStorage se não estiver autenticado
            localStorage.setItem('leosport-cart', JSON.stringify(cartItems));
        }
    }, [cartItems, user, loading]);

    const addToCart = async (product: Product, quantity: number = 1) => {
        if (user) {
            try {
                await addToUserCartDB(user.id, product.id.toString(), quantity);
                // Recarregar carrinho do banco
                const dbCart = await getUserCart(user.id);
                const items: CartItem[] = dbCart.map((item: any) => {
                    // Normalize product data from database
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
                });
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
        // Atualizar estado imediatamente para melhor UX
        setCartItems(prevItems => prevItems.filter(item => item.product.id !== productId));
        
        if (user) {
            try {
                const item = cartItems.find(item => item.product.id === productId);
                if (item?.cartId) {
                    await deleteUserCartItemDB(item.cartId);
                    // Recarregar carrinho do banco para garantir sincronização
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => {
                        // Normalize product data from database
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
                    });
                    setCartItems(items);
                } else {
                    // Se não tem cartId, tentar encontrar pelo product_id no banco
                    const dbCart = await getUserCart(user.id);
                    const dbItem = dbCart.find((item: any) => 
                        parseInt(item.product?.id || item.product_id || '0') === productId
                    );
                    if (dbItem) {
                        await deleteUserCartItemDB(dbItem.id);
                        // Recarregar carrinho
                        const updatedCart = await getUserCart(user.id);
                        const items: CartItem[] = updatedCart.map((item: any) => {
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
                        });
                        setCartItems(items);
                    }
                }
            } catch (error) {
                console.error('Error removing from cart:', error);
                // Estado já foi atualizado acima, então não precisa fazer nada
            }
        }
    };

    const updateQuantity = async (productId: number, quantity: number) => {
        if (quantity <= 0) {
            await removeFromCart(productId);
            return;
        }

        // Atualizar estado imediatamente para melhor UX
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.product.id === productId ? { ...item, quantity } : item
            )
        );

        if (user) {
            try {
                const item = cartItems.find(item => item.product.id === productId);
                if (item?.cartId) {
                    await updateUserCartItemDB(item.cartId, quantity);
                    // Recarregar carrinho do banco para garantir sincronização
                    const dbCart = await getUserCart(user.id);
                    const items: CartItem[] = dbCart.map((item: any) => {
                        // Normalize product data from database
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
                    });
                    setCartItems(items);
                } else {
                    // Se não tem cartId, tentar encontrar pelo product_id no banco
                    const dbCart = await getUserCart(user.id);
                    const dbItem = dbCart.find((item: any) => 
                        parseInt(item.product?.id || item.product_id || '0') === productId
                    );
                    if (dbItem) {
                        await updateUserCartItemDB(dbItem.id, quantity);
                        // Recarregar carrinho
                        const updatedCart = await getUserCart(user.id);
                        const items: CartItem[] = updatedCart.map((item: any) => {
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
                        });
                        setCartItems(items);
                    }
                }
            } catch (error) {
                console.error('Error updating cart quantity:', error);
                // Estado já foi atualizado acima, então não precisa fazer nada
            }
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

