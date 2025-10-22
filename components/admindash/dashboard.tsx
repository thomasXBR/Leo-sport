'use client'

import { useState } from 'react'
import { Bar } from 'react-chartjs-2'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js'
import { PlusCircle, Edit, Trash2, User, Building } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('sales')

    //vamo ter q por os dados do database depois em

    const salesData = {
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
            label: 'Vendas Mensais (R$)',
            data: [12000, 19000, 15000, 25000, 22000, 30000],
            backgroundColor: '#0891b2',
            borderRadius: 5,
        }],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Performance de Vendas nos Últimos 6 Meses' },
        },
    }

    const inventoryItems = [
        { id: 'P001', name: 'Chuteira Nike Phantom', quantity: 75, status: 'Em Estoque' },
        { id: 'P002', name: 'Bola de Basquete Spalding', quantity: 120, status: 'Em Estoque' },
        { id: 'P003', name: 'Tênis de Corrida Adidas', quantity: 0, status: 'Esgotado' },
        { id: 'P004', name: 'Óculos de Natação Speedo', quantity: 15, status: 'Estoque Baixo' },
        { id: 'P005', name: 'Camisa Oficial do Brasil', quantity: 200, status: 'Em Estoque' },
    ]

    const users = [
        { id: 'U01', name: 'Carlos Silva', email: 'carlos.s@example.com', role: 'Cliente' },
        { id: 'U02', name: 'Ana Pereira', email: 'ana.p@example.com', role: 'Cliente' },
        { id: 'U03', name: 'José Oliveira', email: 'jose.o@leosport.com', role: 'Vendedor' },
    ];

    const partners = [
        { id: 'PAR01', companyName: 'Esporte Total Ltda.', contact: 'contato@esportetotal.com', status: 'Ativo' },
        { id: 'PAR02', companyName: 'Aventura & Cia', contact: 'parceria@aventura.com', status: 'Inativo' },
    ];

    const products = [
        { id: 1, name: 'Bicicleta Caloi Aro 29', category: 'Ciclismo', price: 'R$ 1.899,90', imageUrl: 'https://placehold.co/400x400/e2e8f0/334155?text=Bicicleta' },
        { id: 2, name: 'Raquete de Tênis Wilson', category: 'Tênis', price: 'R$ 799,90', imageUrl: 'https://placehold.co/400x400/e2e8f0/334155?text=Raquete' },
        { id: 3, name: 'Luva de Boxe Everlast', category: 'Lutas', price: 'R$ 249,90', imageUrl: 'https://placehold.co/400x400/e2e8f0/334155?text=Luva+de+Boxe' },
        { id: 4, name: 'Skate Completo Profissional', category: 'Skate', price: 'R$ 499,90', imageUrl: 'https://placehold.co/400x400/e2e8f0/334155?text=Skate' },
    ];

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Em Estoque': return 'bg-green-100 text-green-800';
            case 'Estoque Baixo': return 'bg-yellow-100 text-yellow-800';
            case 'Esgotado': return 'bg-red-100 text-red-800';
            case 'Ativo': return 'bg-green-100 text-green-800';
            case 'Inativo': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'sales':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Análise de Vendas</h2>
                        <div className="relative h-[400px]">
                            <Bar options={chartOptions} data={salesData} />
                        </div>
                    </div>
                );
            case 'inventory':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Gestão de Estoque</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {inventoryItems.map((item) => (
                                        <tr key={item.id}>
                                            <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{item.quantity}</td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-cyan-600 hover:text-cyan-900 mr-3"><Edit size={18} /></button>
                                                <button className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Usuários e Parcerias</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-600 flex items-center"><User className="mr-2" size={20} /> Clientes e Vendedores</h3>
                                <ul className="divide-y divide-gray-200 bg-white p-4 rounded-lg shadow-sm">
                                    {users.map(user => (
                                        <li key={user.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{user.name}</p>
                                                <p className="text-sm text-gray-500">{user.email}</p>
                                            </div>
                                            <span className="text-sm font-medium text-cyan-700">{user.role}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4 text-gray-600 flex items-center"><Building className="mr-2" size={20} /> Parceiros</h3>
                                <ul className="divide-y divide-gray-200 bg-white p-4 rounded-lg shadow-sm">
                                    {partners.map(partner => (
                                        <li key={partner.id} className="py-3 flex justify-between items-center">
                                            <div>
                                                <p className="font-semibold text-gray-800">{partner.companyName}</p>
                                                <p className="text-sm text-gray-500">{partner.contact}</p>
                                            </div>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(partner.status)}`}>{partner.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                );
            case 'products':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Gestão de Produtos</h2>
                            <button className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors">
                                <PlusCircle size={20} className="mr-2" />
                                Adicionar Novo Produto
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.map(product => (
                                <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity" />
                                    <div className="p-4">
                                        <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                        <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                                        <p className="text-lg font-bold text-gray-900 mb-3">{product.price}</p>
                                        <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-cyan-100 transition-colors font-semibold text-sm">Gerenciar</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-grow p-4 sm:p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Painel Administrativo</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <button onClick={() => setActiveTab('sales')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'sales' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Vendas</button>
                    <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'inventory' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Estoque</button>
                    <button onClick={() => setActiveTab('users')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('products')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'products' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Produtos</button>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg min-h-[500px]">
                    {renderTabContent()}
                </div>
            </main>
        </div>
    )
}

