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
import { PlusCircle, Edit, Trash2, User, Building, FileText, Handshake, Ticket, Type, X, Save, Upload } from 'lucide-react'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { defaultSiteContent, SiteContent } from '@/lib/site-content'

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
    const [siteContent, setSiteContent] = useState<SiteContent[]>(defaultSiteContent)

    // Modals state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'invoice' | 'partner' | 'coupon' | 'content' | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)

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

    const [invoices, setInvoices] = useState([
        { id: 'NF001', orderId: 'PED123', customer: 'Carlos Silva', date: '2025-01-15', value: 'R$ 1.299,90', status: 'Emitida' },
        { id: 'NF002', orderId: 'PED124', customer: 'Ana Pereira', date: '2025-01-16', value: 'R$ 549,90', status: 'Pendente' },
        { id: 'NF003', orderId: 'PED125', customer: 'José Oliveira', date: '2025-01-17', value: 'R$ 899,90', status: 'Emitida' },
    ]);

    const [partnersList, setPartnersList] = useState([
        { id: 'PAR01', companyName: 'Esporte Total Ltda.', contact: 'contato@esportetotal.com', phone: '(11) 98765-4321', status: 'Ativo', since: '2024-01-15' },
        { id: 'PAR02', companyName: 'Aventura & Cia', contact: 'parceria@aventura.com', phone: '(21) 97654-3210', status: 'Inativo', since: '2024-06-20' },
        { id: 'PAR03', companyName: 'Sport World', contact: 'contato@sportworld.com', phone: '(31) 96543-2109', status: 'Ativo', since: '2024-03-10' },
    ]);

    const [coupons, setCoupons] = useState([
        { id: 'CUP001', code: 'VERAO2025', discount: '15%', type: 'Percentual', validUntil: '2025-03-31', status: 'Ativo', usageLimit: 100, usageCount: 23 },
        { id: 'CUP002', code: 'PRIMEIRACOMPRA', discount: 'R$ 50,00', type: 'Fixo', validUntil: '2025-12-31', status: 'Ativo', usageLimit: 1000, usageCount: 456 },
        { id: 'CUP003', code: 'BLACKFRIDAY', discount: '30%', type: 'Percentual', validUntil: '2024-11-30', status: 'Expirado', usageLimit: 500, usageCount: 500 },
        { id: 'CUP004', code: 'FRETEGRATIS', discount: 'Frete Grátis', type: 'Especial', validUntil: '2025-06-30', status: 'Ativo', usageLimit: 200, usageCount: 87 },
    ]);

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'Em Estoque': return 'bg-green-100 text-green-800';
            case 'Estoque Baixo': return 'bg-yellow-100 text-yellow-800';
            case 'Esgotado': return 'bg-red-100 text-red-800';
            case 'Ativo': return 'bg-green-100 text-green-800';
            case 'Inativo': return 'bg-gray-100 text-gray-800';
            case 'Emitida': return 'bg-green-100 text-green-800';
            case 'Pendente': return 'bg-yellow-100 text-yellow-800';
            case 'Cancelada': return 'bg-red-100 text-red-800';
            case 'Expirado': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    }

    const openModal = (type: typeof modalType, item: any = null) => {
        setModalType(type)
        setEditingItem(item)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setModalType(null)
        setEditingItem(null)
    }

    const handleDeleteCoupon = (id: string) => {
        if (confirm('Tem certeza que deseja deletar este cupom?')) {
            setCoupons(coupons.filter(c => c.id !== id))
        }
    }

    const handleDeletePartner = (id: string) => {
        if (confirm('Tem certeza que deseja remover esta parceria?')) {
            setPartnersList(partnersList.filter(p => p.id !== id))
        }
    }

    const handleSaveContent = (id: string, newValue: string) => {
        setSiteContent(siteContent.map(c =>
            c.id === id ? { ...c, value: newValue } : c
        ))
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
            case 'invoices':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <FileText className="mr-2" size={24} />
                                Notas Fiscais
                            </h2>
                            <button
                                onClick={() => openModal('invoice')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Emitir Nota Fiscal
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NF</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pedido</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {invoices.map((invoice) => (
                                        <tr key={invoice.id}>
                                            <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{invoice.id}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{invoice.orderId}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{invoice.customer}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{new Date(invoice.date).toLocaleDateString('pt-BR')}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-900 font-semibold">{invoice.value}</td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                                    {invoice.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                <button className="text-cyan-600 hover:text-cyan-900 mr-3"><Edit size={18} /></button>
                                                <button className="text-green-600 hover:text-green-900"><Upload size={18} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'partnerships':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <Handshake className="mr-2" size={24} />
                                Parcerias
                            </h2>
                            <button
                                onClick={() => openModal('partner')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Nova Parceria
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {partnersList.map(partner => (
                                <div key={partner.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center">
                                            <Building className="text-cyan-600 mr-2" size={20} />
                                            <h3 className="font-bold text-gray-800">{partner.companyName}</h3>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(partner.status)}`}>
                                            {partner.status}
                                        </span>
                                    </div>
                                    <div className="space-y-2 mb-4">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Email:</span> {partner.contact}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Telefone:</span> {partner.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Desde:</span> {new Date(partner.since).toLocaleDateString('pt-BR')}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openModal('partner', partner)}
                                            className="flex-1 flex items-center justify-center bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 transition-colors text-sm"
                                        >
                                            <Edit size={16} className="mr-1" />
                                            Editar
                                        </button>
                                        <button
                                            onClick={() => handleDeletePartner(partner.id)}
                                            className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'coupons':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <Ticket className="mr-2" size={24} />
                                Cupons de Desconto
                            </h2>
                            <button
                                onClick={() => openModal('coupon')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Criar Cupom
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Válido Até</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uso</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {coupons.map((coupon) => (
                                        <tr key={coupon.id}>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded">{coupon.code}</span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-900 font-semibold">{coupon.discount}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{coupon.type}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">{new Date(coupon.validUntil).toLocaleDateString('pt-BR')}</td>
                                            <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                                                {coupon.usageCount} / {coupon.usageLimit}
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(coupon.status)}`}>
                                                    {coupon.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                <button
                                                    onClick={() => openModal('coupon', coupon)}
                                                    className="text-cyan-600 hover:text-cyan-900 mr-3"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCoupon(coupon.id)}
                                                    className="text-red-600 hover:text-red-900"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'content':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <Type className="mr-2" size={24} />
                                Edição de Textos do Site
                            </h2>
                            <button
                                onClick={() => alert('Alterações salvas no estado local. Integre com o banco de dados para persistir.')}
                                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                <Save size={20} className="mr-2" />
                                Salvar Todas as Alterações
                            </button>
                        </div>
                        <div className="space-y-6">
                            {/* Group by section */}
                            {Array.from(new Set(siteContent.map(c => c.section))).map(section => (
                                <div key={section} className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{section}</h3>
                                    <div className="space-y-4">
                                        {siteContent.filter(c => c.section === section).map(content => (
                                            <div key={content.id} className="border-l-4 border-cyan-500 pl-4 py-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {content.label}
                                                </label>
                                                {content.type === 'textarea' ? (
                                                    <textarea
                                                        value={content.value}
                                                        onChange={(e) => handleSaveContent(content.id, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={content.value}
                                                        onChange={(e) => handleSaveContent(content.id, e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    />
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">Chave: <code className="bg-gray-100 px-1 rounded">{content.key}</code></p>
                                            </div>
                                        ))}
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

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
                    <button onClick={() => setActiveTab('sales')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'sales' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Vendas</button>
                    <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'inventory' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Estoque</button>
                    <button onClick={() => setActiveTab('users')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('products')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'products' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Produtos</button>
                    <button onClick={() => setActiveTab('invoices')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'invoices' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Notas Fiscais</button>
                    <button onClick={() => setActiveTab('partnerships')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'partnerships' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Parcerias</button>
                    <button onClick={() => setActiveTab('coupons')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'coupons' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Cupons</button>
                    <button onClick={() => setActiveTab('content')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'content' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Textos do Site</button>
                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg min-h-[500px]">
                    {renderTabContent()}
                </div>

                {/* Modal Placeholder */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b flex justify-between items-center">
                                <h3 className="text-2xl font-bold text-gray-800">
                                    {modalType === 'invoice' && 'Emitir Nota Fiscal'}
                                    {modalType === 'partner' && (editingItem ? 'Editar Parceria' : 'Nova Parceria')}
                                    {modalType === 'coupon' && (editingItem ? 'Editar Cupom' : 'Criar Cupom')}
                                </h3>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                    <X size={24} />
                                </button>
                            </div>
                            <div className="p-6">
                                <p className="text-gray-600 mb-4">
                                    Formulário de {modalType === 'invoice' ? 'emissão de nota fiscal' : modalType === 'partner' ? 'parceria' : 'cupom'}.
                                </p>
                                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                                    <p className="text-sm text-yellow-700">
                                        <strong>Protótipo:</strong> Este é um modal de demonstração. Integre com o Supabase para funcionalidade completa.
                                    </p>
                                </div>
                                <div className="space-y-4">
                                    {modalType === 'invoice' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Número do Pedido</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="PED123" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nome do Cliente" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="R$ 0,00" />
                                            </div>
                                        </>
                                    )}
                                    {modalType === 'partner' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="Nome da Empresa" defaultValue={editingItem?.companyName} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato</label>
                                                <input type="email" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="contato@empresa.com" defaultValue={editingItem?.contact} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                                                <input type="tel" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="(00) 00000-0000" defaultValue={editingItem?.phone} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue={editingItem?.status}>
                                                    <option value="Ativo">Ativo</option>
                                                    <option value="Inativo">Inativo</option>
                                                </select>
                                            </div>
                                        </>
                                    )}
                                    {modalType === 'coupon' && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono" placeholder="CUPOM2025" defaultValue={editingItem?.code} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto</label>
                                                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue={editingItem?.type}>
                                                    <option value="Percentual">Percentual</option>
                                                    <option value="Fixo">Valor Fixo</option>
                                                    <option value="Especial">Especial</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Desconto</label>
                                                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="15% ou R$ 50,00" defaultValue={editingItem?.discount} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Válido Até</label>
                                                <input type="date" className="w-full px-3 py-2 border border-gray-300 rounded-lg" defaultValue={editingItem?.validUntil} />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Uso</label>
                                                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded-lg" placeholder="100" defaultValue={editingItem?.usageLimit} />
                                            </div>
                                        </>
                                    )}
                                </div>
                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={closeModal}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            alert('Funcionalidade de salvamento será implementada com integração ao banco de dados');
                                            closeModal();
                                        }}
                                        className="flex-1 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-semibold"
                                    >
                                        Salvar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    )
}

