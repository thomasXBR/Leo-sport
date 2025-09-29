'use client';

import Link from 'next/link';
import { ShoppingCart, User, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Header() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/login');
  }

  const gotoCart = () => {
    router.push('/cart');
  }

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigationItems = [
    { href: '/inicio', label: 'Início' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/venda-na-leosport', label: 'Venda na LeoSport' },
    { href: '/contato', label: 'Contato' },
    {href: '/login', label: 'Entrar'}
  ];

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/inicio" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <span className="text-xl font-bold text-gray-900">LeoSport</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-gray-600 hover:text-blue-900 transition-colors duration-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={gotoCart}>
              <ShoppingCart className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">Carrinho</span>
            </Button >
            <Button onClick={handleClick} className="flex items-center justify-center bg-gray-900 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500">
              <User className="w-5 h-5" />
              <span className="ml-2 hidden sm:inline">Entrar</span>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-900 py-2 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}