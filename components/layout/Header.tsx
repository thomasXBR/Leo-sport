// src/components/Header.tsx (ou onde seu componente estiver)
'use client';

import Link from 'next/link';
import { Menu, User, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient'; // 1. IMPORTAR O CLIENTE SUPABASE

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const authDropdownRef = useRef<HTMLDivElement>(null);

  // 2. ALTERAR A FUNÇÃO DE SUBMISSÃO
  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (isSignUp) {
      // --- Lógica de Cadastro (Sign Up) ---
      if (password !== confirmPassword) {
        setError("As senhas não coincidem.");
        setLoading(false);
        return;
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            nome_completo: name, // Usando a chave que definimos no SQL
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess("Cadastro realizado! Verifique seu e-mail para confirmar a conta e realizar o login.");
        setTimeout(() => {
          setIsAuthOpen(false);
          setSuccess("");
          setIsSignUp(false);
        }, 2000);
      }
    } else {
      // --- Lógica de Login (Sign In) ---
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      } else {
        setSuccess("Login realizado com sucesso!");
        // Não precisa de redirect, apenas fechamos o modal e a página pode se atualizar se necessário.
        setTimeout(() => {
          setIsAuthOpen(false);
          setSuccess("");
        }, 1500);
      }
    }

    setLoading(false);
  };


  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError("");
    setSuccess("");
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
    { href: '/sobre', label: 'Sobre' },
    { href: '/venda-na-leosport', label: 'Venda na LeoSport' },
    { href: '/contato', label: 'Contato' },
  ];

  return (
    // O RESTO DO SEU CÓDIGO JSX CONTINUA EXATAMENTE O MESMO
    // ...
    // Nenhuma alteração visual é necessária
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
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
          <div className="flex items-center space-x-4 relative">
            {/* Login Button */}
            <Button
              onClick={handleAuthToggle}
              className="flex items-center justify-center bg-gray-900 text-white font-semibold py-2 px-5 rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
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

            {/* Auth Dropdown */}
            {isAuthOpen && (
              <div ref={authDropdownRef} className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border p-6 z-50">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900">
                    {isSignUp ? "Criar Conta" : "Entrar"}
                  </h2>
                  <Button variant="ghost" size="sm" onClick={() => setIsAuthOpen(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  {isSignUp && (
                    <div>
                      <Label htmlFor="name">Nome</Label>
                      <Input
                        id="name"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

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
                      autoComplete={isSignUp ? "new-password" : "current-password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  {isSignUp && (
                    <div>
                      <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        autoComplete="new-password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  )}

                  {error && <div className="text-red-600 text-sm">{error}</div>}
                  {success && <div className="text-green-600 text-sm">{success}</div>}

                  <Button type="submit" className="w-full bg-blue-900 hover:bg-blue-950" disabled={loading}>
                    {loading ? (isSignUp ? "Cadastrando..." : "Entrando...") : (isSignUp ? "Cadastrar" : "Entrar")}
                  </Button>

                  <div className="text-center text-sm">
                    {isSignUp ? "Já tem uma conta?" : "Não tem uma conta?"}{' '}
                    <button
                      type="button"
                      onClick={toggleAuthMode}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      {isSignUp ? "Entrar" : "Cadastre-se"}
                    </button>
                  </div>
                </form>
              </div>
            )}
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