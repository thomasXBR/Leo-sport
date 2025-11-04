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
import { Mail, Calendar, User as UserIcon, Shield, Save } from 'lucide-react';
import { toast } from 'sonner';

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
      </div>
    </div>
  );
}


