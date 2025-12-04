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

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { user, profile, signIn, signOut, signUp } = useAuth();
  const { cartCount, clearCart } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Signup form states
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  
  const authDropdownRef = useRef<HTMLDivElement>(null);

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    } else {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (authMode === 'login') {
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
      } else {
        // Modo de cadastro
        if (!name || name.trim().length < 2) {
          setError("O nome deve ter no mínimo 2 caracteres");
          setLoading(false);
          return;
        }

        const emailValidation = validateEmail(email);
        if (!emailValidation.valid) {
          setError(emailValidation.error || "Email inválido");
          setLoading(false);
          return;
        }

        if (!password || password.length < 6) {
          setError("A senha deve ter no mínimo 6 caracteres");
          setLoading(false);
          return;
        }

        if (password !== confirmPassword) {
          setError("As senhas não coincidem");
          setLoading(false);
          return;
        }

        if (!phone || phone.replace(/\D/g, '').length < 10) {
          setError("Telefone inválido");
          setLoading(false);
          return;
        }

        if (!acceptTerms) {
          setError("Você deve aceitar os termos de uso para continuar");
          setLoading(false);
          return;
        }

        const result = await signUp(
          email.trim(),
          password,
          name.trim(),
          phone.trim(),
          acceptTerms,
          receiveEmails
        );

        if (result.error) {
          throw result.error;
        }

        setSuccess("Cadastro realizado com sucesso! Verifique seu email para confirmar sua conta.");
        // Reset form
        setEmail("");
        setPassword("");
        setName("");
        setConfirmPassword("");
        setPhone("");
        setAcceptTerms(false);
        setReceiveEmails(false);
        setTimeout(() => {
          setIsAuthOpen(false);
          setSuccess("");
          setAuthMode('login');
        }, 3000);
      }
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
    if (!isAuthOpen) {
      // Reset form when opening
      setError("");
      setSuccess("");
      setEmail("");
      setPassword("");
      setName("");
      setConfirmPassword("");
      setPhone("");
      setAcceptTerms(false);
      setReceiveEmails(false);
      setAuthMode('login');
    }
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
            {/* Cart Icon */}
            <Link href="/carrinho" className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="relative hover:bg-gray-100"
              >
                <ShoppingCart className="w-6 h-6 text-gray-700" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Button>
            </Link>

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
              <div ref={authDropdownRef} className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border z-50 overflow-hidden">
                {/* Tabs */}
                <div className="flex border-b">
                  <button
                    onClick={() => {
                      setAuthMode('login');
                      setError("");
                      setSuccess("");
                    }}
                    className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                      authMode === 'login'
                        ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Entrar
                  </button>
                  <button
                    onClick={() => {
                      setAuthMode('signup');
                      setError("");
                      setSuccess("");
                    }}
                    className={`flex-1 px-4 py-3 text-center font-medium transition-colors ${
                      authMode === 'signup'
                        ? 'bg-blue-50 text-blue-900 border-b-2 border-blue-900'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Criar Conta
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => setIsAuthOpen(false)} className="absolute top-2 right-2">
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div className="p-6 max-h-[80vh] overflow-y-auto">
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {authMode === 'login' ? (
                      <>
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
                            placeholder="seu@email.com"
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
                            placeholder="Sua senha"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div>
                          <Label htmlFor="signup-name">Nome completo *</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="mt-1"
                            placeholder="Seu nome completo"
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-email">Email *</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="mt-1"
                            placeholder="seu@email.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-phone">Telefone *</Label>
                          <Input
                            id="signup-phone"
                            type="tel"
                            required
                            value={phone}
                            onChange={handlePhoneChange}
                            className="mt-1"
                            placeholder="(00) 00000-0000"
                            maxLength={15}
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-password">Senha *</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="mt-1"
                            placeholder="Mínimo 6 caracteres"
                          />
                        </div>

                        <div>
                          <Label htmlFor="signup-confirm-password">Confirmar senha *</Label>
                          <Input
                            id="signup-confirm-password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="mt-1"
                            placeholder="Digite a senha novamente"
                          />
                        </div>

                        <div className="space-y-2 pt-2">
                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              checked={acceptTerms}
                              onChange={(e) => setAcceptTerms(e.target.checked)}
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Aceitar{' '}
                              <Link href="/termos-de-uso" className="text-blue-600 hover:underline" target="_blank">
                                termos de uso
                              </Link>
                              {' '}*
                            </span>
                          </label>

                          <label className="flex items-start cursor-pointer">
                            <input
                              type="checkbox"
                              checked={receiveEmails}
                              onChange={(e) => setReceiveEmails(e.target.checked)}
                              className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="ml-2 text-sm text-gray-700">
                              Desejo receber emails com ofertas e novidades
                            </span>
                          </label>
                        </div>
                      </>
                    )}

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-red-600 text-sm">{error}</p>
                      </div>
                    )}
                    {success && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-600 text-sm">{success}</p>
                      </div>
                    )}

                    <Button 
                      type="submit" 
                      className="w-full bg-blue-900 hover:bg-blue-950" 
                      disabled={loading || (authMode === 'signup' && !acceptTerms)}
                    >
                      {loading 
                        ? (authMode === 'login' ? "Entrando..." : "Cadastrando...") 
                        : (authMode === 'login' ? "Entrar" : "Criar conta")
                      }
                    </Button>
                  </form>
                </div>
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