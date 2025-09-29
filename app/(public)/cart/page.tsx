"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";

export default function CartPage() {
  // Exemplo de estado do carrinho (substitua por contexto ou store global futuramente)
  const [cartItems, setCartItems] = useState<any[]>([]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-2xl bg-white/80 p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900">Seu Carrinho</h1>
        {cartItems.length === 0 ? (
          <div className="text-center text-gray-500 mb-6">
            Seu carrinho está vazio.
          </div>
        ) : (
          <ul className="divide-y divide-gray-200 mb-6">
            {cartItems.map((item, idx) => (
              <li key={idx} className="py-4 flex items-center justify-between">
                <span>{item.name}</span>
                <span>R$ {item.price}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="flex justify-center">
          <Link href="/produtos">
            <Button variant="outline">Continuar comprando</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
