'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, User, X, LogOut, UserCircle, ShoppingCart, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/lib/email-validation';
import { useCart } from '@/contexts/CartContext';
import CartSidebar from '@/components/products/CartSidebar';

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signIn, signOut } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const authDropdownRef = useRef<HTMLDivElement>(null);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validar email antes de enviar
      const emailValidation = validateEmail(email);
      if (!emailValidation.valid) {
        setError(emailValidation.error || "Email inválido");
        setLoading(false);
        return;
      }

      // Validação de senha
      if (!password || password.length < 6) {
        setError("A senha deve ter no mínimo 6 caracteres");
        setLoading(false);
        return;
      }

      const result = await signIn(email.trim(), password);

      if (result.error) {
        throw result.error;
      }

      setSuccess("Login realizado!");
      // Reset form
      setEmail("");
      setPassword("");
      setTimeout(() => {
        setIsAuthOpen(false);
        setSuccess("");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Erro inesperado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      clearCart(); // Limpar carrinho ao fazer logout
      setIsAuthOpen(false);
      router.push('/inicio'); // Redirecionar para a página inicial
    } catch (err) {
      console.error('Error logging out:', err);
    }
  };


  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (authDropdownRef.current && !authDropdownRef.current.contains(event.target as Node)) {
        setIsAuthOpen(false);
      }
    };

    if (isAuthOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isAuthOpen]);

  // Toggle auth dropdown when clicking Entrar button
  const handleAuthToggle = () => {
    setIsAuthOpen(!isAuthOpen);
  };

  const navigationItems = [
    { href: '/inicio', label: 'Início' },
    { href: '/produtos', label: 'Produtos' },
    { href: '/sobre', label: 'Sobre' },
    { href: '/venda-na-leosport', label: 'Venda na LeoSport' },
    { href: '/contato', label: 'Contato' },
  ];

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/inicio" className="flex items-center space-x-2">
            <Image
              src="/favicon.ico"
              alt="LeoSport Logo"
              width={40}
              height={40}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">LeoSport</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 transition-colors duration-200 font-medium border-b-2 ${
                    isActive
                      ? 'border-blue-600 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-blue-600'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4 relative">
            {/* Cart Sidebar */}
            <CartSidebar />

            {/* Login/Profile Button */}
            <Button
              onClick={handleAuthToggle}
              className="flex items-center justify-center bg-gray-900 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              {user && profile ? (
                <>
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                    {profile.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="ml-2 hidden sm:inline">{profile.name}</span>
                </>
              ) : (
                <>
                  <User className="w-5 h-5" />
                  <span className="ml-2 hidden sm:inline">Entrar</span>
                </>
              )}
            </Button>

            {/* Removido botão "Criar Conta" do lado do de entrar */}

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Auth Dropdown */}
            {isAuthOpen && !user && (
              <div ref={authDropdownRef} className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border p-6 z-50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    Entrar
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsAuthOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Senha</Label>
                    <Input
                      id="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}

                  <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                  </Button>

                  <div className="text-center text-sm pt-2">
                    <span className="text-gray-600">Não tem uma conta? </span>
                    <Link href="/cadastro" className="text-blue-600 hover:underline font-medium">
                      Cadastre-se
                    </Link>
                  </div>
                </form>
              </div>
            )}

            {/* User Menu Dropdown - When logged in */}
            {isAuthOpen && user && (
              <div ref={authDropdownRef} className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border z-50">
                <div className="p-4 border-b bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-900 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {profile?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{profile?.name || 'Usuário'}</p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <Link href="/perfil">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-left hover:bg-gray-100"
                      onClick={() => setIsAuthOpen(false)}
                    >
                      <UserCircle className="w-5 h-5 mr-3" />
                      Meu Perfil
                    </Button>
                  </Link>

                  {profile?.user_type === 'admin' && (
                    <>
                      <div className="border-t my-2"></div>
                      <Link href="/admindash">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-left hover:bg-cyan-50 text-cyan-600 hover:text-cyan-700"
                          onClick={() => setIsAuthOpen(false)}
                        >
                          <Shield className="w-5 h-5 mr-3" />
                          Dashboard Admin
                        </Button>
                      </Link>
                    </>
                  )}

                  <div className="border-t my-2"></div>

                  <Button
                    variant="ghost"
                    className="w-full justify-start text-left hover:bg-red-50 text-red-600 hover:text-red-700"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5 mr-3" />
                    Sair
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-2 transition-colors duration-200 font-medium border-l-4 ${
                      isActive
                        ? 'border-blue-600 text-blue-600'
                        : 'border-transparent text-gray-600 hover:text-blue-600'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
              <Link
                href="/carrinho"
                className={`flex items-center px-3 py-2 rounded-md transition-colors duration-200 font-medium ${
                  pathname === '/carrinho'
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-600 hover:text-blue-900 hover:bg-blue-50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Carrinho {cartCount > 0 && `(${cartCount})`}
              </Link>

              <button
                onClick={() => {
                  handleAuthToggle();
                  setIsMenuOpen(false);
                }}
                className="text-gray-600 hover:text-blue-900 py-2 transition-colors duration-200 text-left"
              >
                Entrar
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}