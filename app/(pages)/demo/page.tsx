'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { CheckCircle2, LogIn, UserCircle, Settings, BarChart3, FileText, Handshake, Ticket, Type } from 'lucide-react';

export default function DemoPage() {
  const { user, profile } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 py-12 px-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-gray-900">
            🎨 Modo Visual Ativado!
          </h1>
          <p className="text-xl text-gray-600">
            Tudo funcionando sem precisar configurar Supabase
          </p>
          
          {/* Status de Login */}
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <UserCircle className="w-6 h-6" />
                Status de Autenticação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-semibold">Você está logado!</span>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
                    <p><strong>Nome:</strong> {profile?.name}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                    <p><strong>Tipo:</strong> {profile?.user_type}</p>
                  </div>
                  <Link href="/perfil">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Ver Meu Perfil
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-2 text-gray-600">
                    <LogIn className="w-5 h-5" />
                    <span>Você não está logado</span>
                  </div>
                  <p className="text-sm text-gray-500 text-center">
                    Clique no botão "Entrar" no header para fazer login (use qualquer email/senha)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Funcionalidades Disponíveis */}
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            ✨ Funcionalidades Disponíveis
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Autenticação */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="w-5 h-5 text-blue-600" />
                  Autenticação
                </CardTitle>
                <CardDescription>Sistema completo de login</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Login mockado
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Cadastro de usuário
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Logout funcional
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Persistência localStorage
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Perfil */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCircle className="w-5 h-5 text-purple-600" />
                  Perfil de Usuário
                </CardTitle>
                <CardDescription>Gerenciamento completo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Editar informações
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Avatar personalizável
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Alterar senha
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Tipo de usuário
                  </li>
                </ul>
                {user && (
                  <Link href="/perfil">
                    <Button className="w-full mt-4" variant="outline">
                      Acessar Perfil
                    </Button>
                  </Link>
                )}
              </CardContent>
            </Card>

            {/* Dashboard */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-600" />
                  Dashboard Admin
                </CardTitle>
                <CardDescription>8 abas funcionais</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Vendas e Estoque
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Usuários e Produtos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Notas Fiscais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    4 abas novas!
                  </li>
                </ul>
                <Link href="/admindash">
                  <Button className="w-full mt-4 bg-cyan-600 hover:bg-cyan-700">
                    Abrir Dashboard
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Notas Fiscais */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-orange-600" />
                  Notas Fiscais
                </CardTitle>
                <CardDescription>Gestão completa de NF</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Emitir nota fiscal
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Editar NF
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Upload de documentos
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Status coloridos
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Parcerias */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-green-600" />
                  Parcerias
                </CardTitle>
                <CardDescription>Gestão de parceiros</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Cards visuais
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Adicionar parceiro
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Editar informações
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Deletar com confirmação
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Cupons */}
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-pink-600" />
                  Cupons
                </CardTitle>
                <CardDescription>CRUD completo</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Criar cupom
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Editar cupom
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Deletar cupom
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Contador de uso
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Editor de Conteúdo */}
            <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Type className="w-5 h-5 text-indigo-600" />
                  Editor de Textos do Site (INOVADOR! 🌟)
                </CardTitle>
                <CardDescription>Sistema completo de conteúdo editável</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">15+ Campos Editáveis</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Títulos</li>
                      <li>• Subtítulos</li>
                      <li>• Descrições</li>
                      <li>• Textos longos</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">6 Seções</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Header</li>
                      <li>• Página Inicial</li>
                      <li>• Sobre Nós</li>
                      <li>• Footer</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Funcionalidades</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Edição inline</li>
                      <li>• Agrupamento visual</li>
                      <li>• Salvar tudo de uma vez</li>
                      <li>• Preview em tempo real</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2 text-sm">Uso Fácil</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>• Sem código</li>
                      <li>• Interface intuitiva</li>
                      <li>• Hook personalizado</li>
                      <li>• Componentes prontos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guia Rápido */}
        <Card className="border-2 border-blue-300 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-2xl">🚀 Guia Rápido</CardTitle>
            <CardDescription>Como testar todas as funcionalidades</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-bold text-lg mb-2">1. Testar Autenticação</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Clique em "Entrar" no header</li>
                <li>Digite qualquer email e senha</li>
                <li>Veja o header mudar com seu nome</li>
                <li>Clique no avatar para ver opções</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">2. Acessar Perfil</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Após login, clique em "Meu Perfil"</li>
                <li>Edite seu nome, descrição, etc</li>
                <li>Clique em "Salvar Alterações"</li>
                <li>Veja as mudanças persistirem</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">3. Explorar Dashboard</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Acesse /admindash</li>
                <li>Navegue pelas 8 abas</li>
                <li>Teste criar/editar cupons</li>
                <li>Edite textos do site</li>
              </ol>
            </div>

            <div>
              <h3 className="font-bold text-lg mb-2">4. Testar CRUD</h3>
              <ol className="list-decimal list-inside space-y-1 text-gray-700">
                <li>Vá na aba "Cupons"</li>
                <li>Clique em "Criar Cupom"</li>
                <li>Preencha o modal</li>
                <li>Teste editar e deletar</li>
              </ol>
            </div>

            <Link href="/admindash">
              <Button size="lg" className="w-full mt-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-lg">
                🎯 Ir para Dashboard Administrativa
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Documentação */}
        <Card>
          <CardHeader>
            <CardTitle>📚 Documentação Completa</CardTitle>
            <CardDescription>Guias detalhados disponíveis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">MODO_VISUAL.md</h4>
                <p className="text-sm text-gray-600">
                  Guia completo do modo visual sem Supabase
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">ADMIN_DASHBOARD_GUIDE.md</h4>
                <p className="text-sm text-gray-600">
                  Documentação completa da dashboard
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">INTEGRATION_EXAMPLES.md</h4>
                <p className="text-sm text-gray-600">
                  Exemplos práticos de integração
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">IMPLEMENTACAO_COMPLETA.md</h4>
                <p className="text-sm text-gray-600">
                  Resumo visual de tudo implementado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-8 space-y-4">
          <div className="flex items-center justify-center gap-2 text-green-600 text-xl font-bold">
            <CheckCircle2 className="w-6 h-6" />
            <span>Tudo Funcionando 100%!</span>
          </div>
          <p className="text-gray-600">
            Sem Supabase. Sem Configuração. Só Diversão! ✨
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/inicio">
              <Button variant="outline">Página Inicial</Button>
            </Link>
            <Link href="/sobre">
              <Button variant="outline">Sobre</Button>
            </Link>
            <Link href="/contato">
              <Button variant="outline">Contato</Button>
            </Link>
            {user && (
              <Link href="/perfil">
                <Button variant="outline">Meu Perfil</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

