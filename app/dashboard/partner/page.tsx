import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  DollarSign, 
  Eye, 
  Plus,
  TrendingUp,
  Clock
} from 'lucide-react';

export default function PartnerDashboard() {
  // TODO: Replace with real data from Supabase
  const stats = [
    {
      title: 'Produtos Ativos',
      value: '12',
      change: '+2',
      changeType: 'positive' as const,
      icon: Package
    },
    {
      title: 'Vendas do Mês',
      value: 'R$ 3.450,00',
      change: '+15.3%',
      changeType: 'positive' as const,
      icon: DollarSign
    },
    {
      title: 'Visualizações',
      value: '1.234',
      change: '+8.2%',
      changeType: 'positive' as const,
      icon: Eye
    },
    {
      title: 'Propostas Pendentes',
      value: '3',
      change: 'Aguardando análise',
      changeType: 'neutral' as const,
      icon: Clock
    }
  ];

  const recentProducts = [
    { name: 'Chuteira Nike Mercurial', status: 'approved', sales: 5, revenue: 'R$ 1.499,95' },
    { name: 'Bola de Futebol Penalty', status: 'pending', sales: 0, revenue: 'R$ 0,00' },
    { name: 'Meião Adidas Pro', status: 'approved', sales: 12, revenue: 'R$ 359,88' },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">Aprovado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard do Parceiro</h1>
          <p className="text-gray-600">Gerencie seus produtos e acompanhe suas vendas</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
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
                {stat.changeType === 'positive' && (
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  stat.changeType === 'positive' ? "text-green-600" : "text-gray-600"
                )}>
                  {stat.change}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produtos Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <div className="flex items-center space-x-4 mt-1">
                      {getStatusBadge(product.status)}
                      <span className="text-sm text-gray-600">
                        {product.sales} vendas
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="w-4 h-4 mr-2" />
                Propor Novo Produto
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="w-4 h-4 mr-2" />
                Ver Todos os Produtos
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Relatório de Vendas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}