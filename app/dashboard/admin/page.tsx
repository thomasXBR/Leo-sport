import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Package, 
  Users, 
  ShoppingCart, 
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button'

export default function AdminDashboard() {
  // TODO: Replace with real data from Supabase
  const stats = [
    {
      title: 'Receita Total',
      value: 'R$ 45.231,50',
      change: '+12.5%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'Produtos Ativos',
      value: '487',
      change: '+23',
      changeType: 'positive' as const,
      icon: Package
    },
    {
      title: 'Parceiros Ativos',
      value: '52',
      change: '+3',
      changeType: 'positive' as const,
      icon: Users
    },
    {
      title: 'Pedidos Hoje',
      value: '18',
      change: '+5',
      changeType: 'positive' as const,
      icon: ShoppingCart
    }
  ];

  const recentActivity = [
    { type: 'order', message: 'Novo pedido #1234 - R$ 299,99', time: '2 min atrás' },
    { type: 'partner', message: 'Nova solicitação de parceria - SportMax', time: '15 min atrás' },
    { type: 'product', message: 'Produto aprovado - Chuteira Nike Pro', time: '1h atrás' },
    { type: 'order', message: 'Pedido #1230 entregue', time: '2h atrás' },
  ];

  const pendingActions = [
    { type: 'partner_application', count: 3, message: 'Solicitações de parceria pendentes' },
    { type: 'product_proposal', count: 7, message: 'Propostas de produtos para análise' },
    { type: 'support_ticket', count: 2, message: 'Tickets de suporte em aberto' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Administrativo</h1>
        <p className="text-gray-600">Visão geral do marketplace LeoSport</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">{stat.change}</span>
                <span className="text-sm text-gray-600 ml-1">vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
              Ações Pendentes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingActions.map((action, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <Badge variant="secondary" className="mr-3">
                      {action.count}
                    </Badge>
                    <span className="text-sm text-gray-700">{action.message}</span>
                  </div>
                  <Button size="sm" variant="outline">
                    Ver
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Atividade Recente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button className="h-20 flex-col space-y-2">
              <Package className="w-6 h-6" />
              <span>Gerenciar Produtos</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <Users className="w-6 h-6" />
              <span>Gerenciar Parceiros</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col space-y-2">
              <ShoppingCart className="w-6 h-6" />
              <span>Ver Pedidos</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}