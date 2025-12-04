'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { validateEmail } from '@/lib/email-validation';
import { ArrowLeft, Check } from 'lucide-react';

export default function CadastroPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveEmails, setReceiveEmails] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  // Função para selecionar todos os checkboxes
  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    setAcceptTerms(checked);
    setReceiveEmails(checked);
  };

  // Atualizar selectAll quando os outros checkboxes mudarem
  const handleCheckboxChange = (field: 'terms' | 'emails', checked: boolean) => {
    if (field === 'terms') {
      setAcceptTerms(checked);
    } else {
      setReceiveEmails(checked);
    }
    // Se ambos estão marcados, marcar selectAll
    if (field === 'terms' && checked && receiveEmails) {
      setSelectAll(true);
    } else if (field === 'emails' && checked && acceptTerms) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  };

  const formatPhone = (value: string) => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '');
    // Formata: (XX) XXXXX-XXXX
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validações
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

      // Criar conta
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
      
      // Redirecionar após 3 segundos
      setTimeout(() => {
        router.push('/inicio');
      }, 3000);
    } catch (err: any) {
      setError(err.message || "Erro ao criar conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Back Button */}
          <Link href="/inicio" className="flex items-center text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </Link>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
              Criar Conta
            </h1>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nome */}
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                  placeholder="Seu nome completo"
                />
              </div>

              {/* Email */}
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

              {/* Senha */}
              <div>
                <Label htmlFor="password">Senha</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>

              {/* Confirmar Senha */}
              <div>
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1"
                  placeholder="Digite a senha novamente"
                />
              </div>

              {/* Telefone */}
              <div>
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={handlePhoneChange}
                  className="mt-1"
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                />
              </div>

              {/* Checkboxes */}
              <div className="space-y-3 pt-2">
                {/* Selecionar todos */}
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-900">
                    Selecionar todos
                  </span>
                </label>

                {/* Aceitar termos */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => handleCheckboxChange('terms', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Aceitar{' '}
                    <Link href="/termos-de-uso" className="text-blue-600 hover:underline" target="_blank">
                      termos de uso
                    </Link>
                  </span>
                </label>

                {/* Receber emails */}
                <label className="flex items-start cursor-pointer">
                  <input
                    type="checkbox"
                    checked={receiveEmails}
                    onChange={(e) => handleCheckboxChange('emails', e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Desejo receber emails com ofertas e novidades
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Success Message */}
              {success && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-green-600 text-sm">{success}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                disabled={loading || !acceptTerms}
              >
                {loading ? "Cadastrando..." : "Criar conta"}
              </Button>
            </form>

            {/* Login Link */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Já tem uma conta?{' '}
                <Link href="/inicio" className="text-blue-600 hover:underline font-medium">
                  Entrar
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
