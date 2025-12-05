'use client';

import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Calendar, User as UserIcon, Shield, Save, ShoppingBag, FileText, Download, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { getUserOrders, getUserInvoices, type Sale, type Invoice } from '@/lib/supabase';

export default function PerfilPage() {
  const { user, profile, updateProfile, updatePassword, loading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [userType, setUserType] = useState<'comprador' | 'vendedor' | 'admin'>('comprador');

  // Password change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // Histórico de compras e notas fiscais
  const [orders, setOrders] = useState<(Sale & { items?: any[] })[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/inicio');
    }

    if (profile) {
      setName(profile.name || '');
      setDescription(profile.description || '');
      setUserType(profile.user_type || 'comprador');
    }
  }, [user, profile, loading, router]);

  // Carregar histórico de compras e notas fiscais
  useEffect(() => {
    if (user?.id) {
      loadUserOrders();
      loadUserInvoices();
    }
  }, [user]);

  const loadUserOrders = async () => {
    if (!user?.id) return;
    
    setLoadingOrders(true);
    try {
      const userOrders = await getUserOrders(user.id);
      setOrders(userOrders || []);
    } catch (error: any) {
      console.error('Erro ao carregar pedidos:', error);
      toast.error('Erro ao carregar histórico de compras');
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUserInvoices = async () => {
    if (!user?.id && !user?.email) return;
    
    setLoadingInvoices(true);
    try {
      const userInvoices = await getUserInvoices(user.id, user.email || undefined);
      setInvoices(userInvoices || []);
    } catch (error: any) {
      console.error('Erro ao carregar notas fiscais:', error);
      toast.error('Erro ao carregar notas fiscais');
    } finally {
      setLoadingInvoices(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const result = await updateProfile({
        name,
        description,
        user_type: userType,
      });

      if (result.error) {
        throw result.error;
      }

      toast.success('Perfil atualizado com sucesso!');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao atualizar perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmNewPassword) {
      toast.error('As senhas não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A senha deve ter no mínimo 6 caracteres');
      return;
    }

    setChangingPassword(true);
    try {
      const result = await updatePassword(newPassword);

      if (result.error) {
        throw result.error;
      }

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setChangingPassword(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'Pendente': 'bg-yellow-100 text-yellow-800',
      'Pago': 'bg-blue-100 text-blue-800',
      'Em Processamento': 'bg-purple-100 text-purple-800',
      'Enviado': 'bg-indigo-100 text-indigo-800',
      'Entregue': 'bg-green-100 text-green-800',
      'Cancelado': 'bg-red-100 text-red-800',
      'Emitida': 'bg-green-100 text-green-800',
      'Rejeitada': 'bg-red-100 text-red-800',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user || !profile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Meu Perfil</h1>
          <p className="mt-2 text-gray-600">Gerencie suas informações pessoais e configurações</p>
        </div>

        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações Pessoais</CardTitle>
            <CardDescription>Atualize suas informações básicas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome completo"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="currentPassword">Senha Atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="newPassword">Nova Senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite sua nova senha"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirme sua nova senha"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Sobre você..."
                className="mt-1"
                rows={3}
              />
            </div>

            <div className="flex gap-4">
              <Button
                onClick={handleSaveProfile}
                disabled={saving}
                className="flex-1 bg-blue-900 hover:bg-blue-950"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar Alterações'}
              </Button>

              <Button
                onClick={handleChangePassword}
                disabled={changingPassword || !newPassword || !confirmNewPassword}
                variant="outline"
                className="flex-1"
              >
                {changingPassword ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes sobre sua conta no sistema</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 py-3">
              <UserIcon className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">ID do Usuário</p>
                <p className="text-sm text-gray-900 font-mono break-all">{user.id}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3 py-3">
              <Mail className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Email</p>
                <p className="text-sm text-gray-900">{user.email || profile.email}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3 py-3">
              <Shield className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Tipo de usuário</p>
                <p className="text-sm text-gray-900 capitalize">
                  {userType === 'comprador' ? 'Comprador' : userType === 'vendedor' ? 'Vendedor' : 'Administrador'}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3 py-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Conta criada em</p>
                <p className="text-sm text-gray-900">{formatDate(profile.created_at)}</p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center space-x-3 py-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-700">Última alteração da conta</p>
                <p className="text-sm text-gray-900">{formatDate(profile.updated_at)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Histórico de Compras */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Histórico de Compras
            </CardTitle>
            <CardDescription>Visualize todos os seus pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Você ainda não realizou nenhuma compra.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">Pedido #{order.order_number || order.id.slice(0, 8)}</h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Data: {formatDate(order.created_at)}
                        </p>
                        {order.items && order.items.length > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {order.items.length} item{order.items.length > 1 ? 's' : ''}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </p>
                        {order.payment_method && (
                          <p className="text-xs text-gray-500 mt-1">
                            {order.payment_method}
                          </p>
                        )}
                      </div>
                    </div>
                    {order.items && order.items.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-3">Itens do pedido:</p>
                        <div className="space-y-3">
                          {order.items.map((item: any, index: number) => (
                            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                              {item.product?.image_url && (
                                <img 
                                  src={item.product.image_url} 
                                  alt={item.product.name || 'Produto'}
                                  className="w-16 h-16 object-cover rounded"
                                />
                              )}
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {item.product?.name || item.product_name || 'Produto'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Quantidade: {item.quantity || 1}
                                </p>
                                <p className="text-sm font-semibold text-gray-900 mt-2">
                                  {formatCurrency(item.total_price || (item.unit_price * (item.quantity || 1)))}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notas Fiscais */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Notas Fiscais
            </CardTitle>
            <CardDescription>Visualize as notas fiscais emitidas pelo admin para suas compras</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingInvoices ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-gray-600">Carregando notas fiscais...</p>
              </div>
            ) : invoices.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Nenhuma nota fiscal disponível no momento.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            Nota Fiscal #{invoice.invoice_number}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                            {invoice.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          Emitida em: {formatDate(invoice.issue_date)}
                        </p>
                        {invoice.customer_name && (
                          <p className="text-sm text-gray-600 mt-1">
                            Cliente: {invoice.customer_name}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                        <div className="text-right sm:text-left">
                          <p className="text-lg font-bold text-gray-900">
                            {formatCurrency(invoice.total_amount)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          {invoice.pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex items-center gap-1"
                            >
                              <a href={invoice.pdf_url} target="_blank" rel="noopener noreferrer">
                                <Eye className="w-4 h-4" />
                                Visualizar
                              </a>
                            </Button>
                          )}
                          {invoice.pdf_url && (
                            <Button
                              size="sm"
                              variant="outline"
                              asChild
                              className="flex items-center gap-1"
                            >
                              <a href={invoice.pdf_url} download>
                                <Download className="w-4 h-4" />
                                Baixar
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    {invoice.nfse_key && (
                      <div className="mt-4 pt-4 border-t">
                        <p className="text-xs text-gray-500">
                          <strong>Chave de acesso:</strong> {invoice.nfse_key}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


