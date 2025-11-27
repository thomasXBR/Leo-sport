'use client'

import { useState, useEffect } from 'react'
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
import { PlusCircle, Edit, Trash2, User, Building, FileText, Handshake, Ticket, Type, X, Save, Upload, Loader2 } from 'lucide-react'
import Image from 'next/image'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    getProducts, createProduct, updateProduct, deleteProduct,
    getInventoryItems, createInventoryMovement, deleteInventoryMovement,
    getSales, getSalesDataForChart,
    getInvoices, createInvoice, updateInvoice, deleteInvoice,
    getPartnerships, createPartnership, updatePartnership, deletePartnership,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getSiteContent, updateSiteContent,
    type Product, type Invoice, type Coupon, type Partnership, type SiteContent as SupabaseSiteContent
} from '@/lib/supabase'

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
    const [loading, setLoading] = useState(true)

    // Estados dos dados
    const [products, setProducts] = useState<Product[]>([])
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [partnersList, setPartnersList] = useState<Partnership[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [siteContent, setSiteContent] = useState<SupabaseSiteContent[]>([])
    const [salesData, setSalesData] = useState({
        labels: ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho'],
        datasets: [{
            label: 'Vendas Mensais (R$)',
            data: [0, 0, 0, 0, 0, 0],
            backgroundColor: '#0891b2',
            borderRadius: 5,
        }],
    })

    // Estados dos modais
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'invoice' | 'partner' | 'coupon' | 'product' | 'inventory' | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Performance de Vendas nos Últimos 6 Meses' },
        },
    }

    // Carregar dados do Supabase
    useEffect(() => {
        loadAllData()
    }, [])

    async function loadAllData() {
        try {
            setLoading(true)
            const [productsData, inventoryData, salesData, invoicesData, partnersData, couponsData, contentData] = await Promise.all([
                getProducts().catch(() => []),
                getInventoryItems().catch(() => []),
                getSales().catch(() => []),
                getInvoices().catch(() => []),
                getPartnerships().catch(() => []),
                getCoupons().catch(() => []),
                getSiteContent().catch(() => [])
            ])

            setProducts(productsData || [])
            setInventoryItems(inventoryData || [])
            setSales(salesData || [])
            setInvoices(invoicesData || [])
            setPartnersList(partnersData || [])
            setCoupons(couponsData || [])
            setSiteContent(contentData || [])

            // Carregar dados do gráfico
            const chartSalesData = await getSalesDataForChart().catch(() => [])
            if (chartSalesData && chartSalesData.length > 0) {
                // Processar dados para o gráfico (agrupar por mês)
                const monthlyData = processSalesDataForChart(chartSalesData)
                setSalesData(prev => ({
                    ...prev,
                    datasets: [{
                        ...prev.datasets[0],
                        data: monthlyData
                    }]
                }))
            }
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    function processSalesDataForChart(data: any[]) {
        // Agrupar vendas por mês
        const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho']
        const monthlyTotals = [0, 0, 0, 0, 0, 0]

        data.forEach(sale => {
            const date = new Date(sale.created_at)
            const monthIndex = date.getMonth()
            if (monthIndex >= 0 && monthIndex < 6) {
                monthlyTotals[monthIndex] += parseFloat(sale.total_amount) || 0
            }
        })

        return monthlyTotals
    }

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
            case 'Rejeitada': return 'bg-red-100 text-red-800';
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

    const openDeleteDialog = (type: string, id: string, name: string) => {
        setItemToDelete({ type, id, name })
        setDeleteDialogOpen(true)
    }

    const handleDelete = async () => {
        if (!itemToDelete) return

        try {
            switch (itemToDelete.type) {
                case 'invoice':
                    await deleteInvoice(itemToDelete.id)
                    // Recarregar dados do Supabase
                    const updatedInvoices = await getInvoices()
                    setInvoices(updatedInvoices || [])
                    break
                case 'coupon':
                    await deleteCoupon(itemToDelete.id)
                    // Recarregar dados do Supabase para garantir sincronização
                    const updatedCoupons = await getCoupons()
                    setCoupons(updatedCoupons || [])
                    break
                case 'inventory':
                    await deleteInventoryMovement(itemToDelete.id)
                    loadAllData() // Recarregar para atualizar estoque
                    break
                case 'product':
                    await deleteProduct(itemToDelete.id)
                    // Recarregar dados do Supabase
                    const updatedProducts = await getProducts()
                    setProducts(updatedProducts || [])
                    break
                case 'partnership':
                    await deletePartnership(itemToDelete.id)
                    // Recarregar dados do Supabase
                    const updatedPartners = await getPartnerships()
                    setPartnersList(updatedPartners || [])
                    break
            }
            setDeleteDialogOpen(false)
            setItemToDelete(null)
        } catch (error) {
            console.error('Erro ao deletar:', error)
            alert('Erro ao deletar item. Tente novamente.')
        }
    }

    const handleSaveInvoice = async (formData: any) => {
        try {
            if (editingItem) {
                await updateInvoice(editingItem.id, formData)
                setInvoices(invoices.map(i => i.id === editingItem.id ? { ...i, ...formData } : i))
            } else {
                const invoiceNumber = `NF${Date.now().toString().slice(-6)}`
                const newInvoice = await createInvoice({
                    invoice_number: invoiceNumber,
                    order_id: formData.order_id || '',
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email || '',
                    total_amount: parseFloat(formData.total_amount.toString().replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
                    status: formData.status || 'Pendente',
                    issue_date: formData.issue_date || new Date().toISOString().split('T')[0],
                })
                setInvoices([newInvoice, ...invoices])
            }
            closeModal()
            loadAllData()
        } catch (error) {
            console.error('Erro ao salvar nota fiscal:', error)
            alert('Erro ao salvar. Tente novamente.')
        }
    }

    const handleSaveCoupon = async (formData: any) => {
        try {
            // Formatar dados para envio ao Supabase
            const couponData: any = {
                code: formData.code,
                description: formData.description || undefined,
                discount_type: formData.discount_type,
                discount_value: formData.discount_value,
                valid_from: formData.valid_from || new Date().toISOString().split('T')[0],
                valid_until: formData.valid_until,
                usage_limit: formData.usage_limit ? parseInt(formData.usage_limit.toString()) : undefined,
                min_purchase_amount: formData.min_purchase_amount ? parseFloat(formData.min_purchase_amount.toString()) : undefined,
            }

            if (editingItem) {
                // Atualizar cupom existente
                if (formData.status) {
                    couponData.status = formData.status
                }
                // Só adiciona show_in_navbar se a coluna existir (não causa erro se não existir)
                if (formData.show_in_navbar !== undefined) {
                    couponData.show_in_navbar = formData.show_in_navbar
                }
                const updatedCoupon = await updateCoupon(editingItem.id, couponData)
                // Recarregar dados do Supabase para garantir sincronização
                const updatedCoupons = await getCoupons()
                setCoupons(updatedCoupons || [])
            } else {
                // Criar novo cupom - remover show_in_navbar se a coluna não existir
                const newCouponData: any = {
                    ...couponData,
                    usage_count: 0,
                    status: formData.status || 'Ativo',
                }
                // Só adiciona show_in_navbar se estiver definido (evita erro se coluna não existir)
                if (formData.show_in_navbar !== undefined) {
                    newCouponData.show_in_navbar = formData.show_in_navbar
                }
                const newCoupon = await createCoupon(newCouponData)
                // Recarregar dados do Supabase para garantir sincronização
                const updatedCoupons = await getCoupons()
                setCoupons(updatedCoupons || [])
            }
            closeModal()
        } catch (error: any) {
            // Capturar todas as propriedades do erro do Supabase
            const errorInfo: any = {}

            if (error) {
                if (typeof error === 'string') {
                    errorInfo.message = error
                } else if (typeof error === 'object') {
                    errorInfo.message = error.message || error.msg || 'Erro desconhecido'
                    errorInfo.details = error.details || error.hint || null
                    errorInfo.code = error.code || null
                    errorInfo.hint = error.hint || null

                    // Se for erro do Supabase, pode ter mais propriedades
                    if (error.error_description) errorInfo.error_description = error.error_description
                    if (error.status) errorInfo.status = error.status
                }
            }

            // Log completo do erro
            console.error('Erro ao salvar cupom:', error)
            console.error('Detalhes do erro:', errorInfo)

            // Mensagem para o usuário
            const errorMessage = errorInfo.message || errorInfo.details || errorInfo.hint || 'Erro desconhecido ao salvar cupom'

            // Verificar se é erro de coluna não encontrada
            const isColumnError = errorMessage.includes('column') ||
                errorMessage.includes('show_in_navbar') ||
                errorInfo.code === 'PGRST116' ||
                errorInfo.details?.includes('column')

            if (isColumnError) {
                alert('A coluna "show_in_navbar" não existe no banco de dados.\n\nPor favor, adicione-a no Supabase:\n1. Vá para Table Editor → coupons\n2. Adicione coluna: show_in_navbar (boolean, nullable)')
            } else {
                alert(`Erro ao salvar cupom: ${errorMessage}`)
            }
        }
    }

    const handleSaveInventory = async (formData: any) => {
        try {
            await createInventoryMovement({
                product_id: formData.product_id,
                product_name: '',
                movement_type: formData.movement_type,
                quantity: parseInt(formData.quantity),
                previous_quantity: 0,
                new_quantity: 0,
                reason: formData.reason || '',
            })
            closeModal()
            loadAllData()
        } catch (error) {
            console.error('Erro ao salvar movimento de estoque:', error)
            alert('Erro ao salvar. Tente novamente.')
        }
    }

    const handleSaveContent = async (id: string, value: string) => {
        try {
            await updateSiteContent(id, value)
            setSiteContent(siteContent.map(c => c.id === id ? { ...c, value } : c))
        } catch (error) {
            console.error('Erro ao salvar conteúdo:', error)
            alert('Erro ao salvar. Tente novamente.')
        }
    }

    const handleSaveAllContent = async () => {
        try {
            const updates = siteContent.map(content =>
                updateSiteContent(content.id, content.value)
            )
            await Promise.all(updates)
            alert('Todas as alterações foram salvas!')
        } catch (error) {
            console.error('Erro ao salvar conteúdo:', error)
            alert('Erro ao salvar. Tente novamente.')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-cyan-600" size={48} />
            </div>
        )
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

                {/* Modais de Edição */}
                {renderModals()}

                {/* Dialog de Confirmação de Exclusão */}
                <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                                Tem certeza que deseja deletar {itemToDelete?.name}? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                                Deletar
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </main>
        </div>
    )

    function renderTabContent() {
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-700">Gestão de Estoque</h2>
                            <button
                                onClick={() => openModal('inventory')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Nova Movimentação
                            </button>
                        </div>
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
                                    {inventoryItems.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 text-center text-gray-500">
                                                Nenhum item em estoque
                                            </td>
                                        </tr>
                                    ) : (
                                        inventoryItems.map((item) => (
                                            <tr key={item.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{item.name}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{item.quantity}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(item.status)}`}>
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openModal('inventory', item)}
                                                        className="text-cyan-600 hover:text-cyan-900 mr-3"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteDialog('inventory', item.id, item.name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'users':
                return (
                    <div>
                        <h2 className="text-2xl font-semibold mb-6 text-gray-700">Usuários e Parcerias</h2>
                        <p className="text-gray-600">Gestão de usuários através da tabela profiles no Supabase.</p>
                    </div>
                );
case 'products':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Gestão de Produtos</h2>
                            <button
                                onClick={() => openModal('product')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Adicionar Novo Produto
                            </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {products.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    Nenhum produto cadastrado
                                </div>
                            ) : (
                                products.map(product => (
                                    <div key={product.id} className="bg-white rounded-lg shadow-md overflow-hidden group">
                                        <Image
                                            src={product.image_url || 'https://placehold.co/400x400/e2e8f0/334155?text=Produto'}
                                            alt={product.name}
                                            width={400}
                                            height={160}
                                            className="w-full h-40 object-cover group-hover:opacity-80 transition-opacity"
                                        />
                                        <div className="p-4">
                                            <h3 className="font-semibold text-gray-800 truncate">{product.name}</h3>
                                            <p className="text-sm text-gray-600 mb-1">SKU: {product.sku}</p>
                                            <p className="text-sm text-gray-600 mb-2">Estoque: {product.stock_quantity}</p>
                                            <p className="text-lg font-bold text-gray-900 mb-3">R$ {product.price.toFixed(2).replace('.', ',')}</p>
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-400 line-trough">
                                                    R${
                                                        (
                                                            (Number(product.price) / 0.75)
                                                            .toFixed(2)
                                                            .replace('.', ',')
                                                        )
                                                    }
                                                </p>
                                                <p className="text-xl font-extrabold text-red-600">
                                                    R${product.price.toFixed(2).replace('.', ',')}
                                                </p>
                                                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full"> 
                                                    25% OFF
                                                </span>  
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal('product', product)}
                                                    className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors font-semibold text-sm"
                                                >
                                                    <Edit size={16} className="mx-auto" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog('product', product.id, product.name)}
                                                    className="bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                    {invoices.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-8 text-center text-gray-500">
                                                Nenhuma nota fiscal cadastrada
                                            </td>
                                        </tr>
                                    ) : (
                                        invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{invoice.invoice_number}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{invoice.order_id || '-'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{invoice.customer_name}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{new Date(invoice.issue_date).toLocaleDateString('pt-BR')}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-900 font-semibold">R$ {invoice.total_amount.toFixed(2).replace('.', ',')}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openModal('invoice', invoice)}
                                                        className="text-cyan-600 hover:text-cyan-900 mr-3"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteDialog('invoice', invoice.id, `NF ${invoice.invoice_number}`)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                            {partnersList.length === 0 ? (
                                <div className="col-span-full text-center py-8 text-gray-500">
                                    Nenhuma parceria cadastrada
                                </div>
                            ) : (
                                partnersList.map(partner => (
                                    <div key={partner.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="flex items-center">
                                                <Building className="text-cyan-600 mr-2" size={20} />
                                                <h3 className="font-bold text-gray-800">{partner.company_name}</h3>
                                            </div>
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(partner.status)}`}>
                                                {partner.status}
                                            </span>
                                        </div>
                                        <div className="space-y-2 mb-4">
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Email:</span> {partner.contact_email}
                                            </p>
                                            {partner.contact_phone && (
                                                <p className="text-sm text-gray-600">
                                                    <span className="font-medium">Telefone:</span> {partner.contact_phone}
                                                </p>
                                            )}
                                            <p className="text-sm text-gray-600">
                                                <span className="font-medium">Desde:</span> {new Date(partner.partnership_date).toLocaleDateString('pt-BR')}
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
                                                onClick={() => openDeleteDialog('partnership', partner.id, partner.company_name)}
                                                className="flex items-center justify-center bg-red-600 text-white px-3 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
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
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mostrar na Navbar</th>
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
                                    {coupons.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="py-8 text-center text-gray-500">
                                                Nenhum cupom cadastrado
                                            </td>
                                        </tr>
                                    ) : (
                                        coupons.map((coupon) => (
                                            <tr key={coupon.id}>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <input
                                                        type="checkbox"
                                                        checked={coupon.show_in_navbar || false}
                                                        onChange={async (e) => {
                                                            try {
                                                                await updateCoupon(coupon.id, { show_in_navbar: e.target.checked })
                                                                const updatedCoupons = await getCoupons()
                                                                setCoupons(updatedCoupons || [])
                                                            } catch (error: any) {
                                                                console.error('Erro ao atualizar cupom:', {
                                                                    message: error?.message || 'Erro desconhecido',
                                                                    details: error?.details || error,
                                                                    code: error?.code
                                                                })
                                                                const errorMsg = error?.message || error?.details || 'Erro desconhecido'
                                                                if (errorMsg.includes('column') || errorMsg.includes('show_in_navbar')) {
                                                                    alert('A coluna show_in_navbar não existe no banco de dados. Por favor, adicione-a primeiro no Supabase.')
                                                                } else {
                                                                    alert(`Erro ao atualizar: ${errorMsg}`)
                                                                }
                                                            }
                                                        }}
                                                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                                        title="Mostrar este cupom na navbar do site"
                                                    />
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-1 rounded">{coupon.code}</span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-900 font-semibold">{coupon.discount_value}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{coupon.discount_type}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">{new Date(coupon.valid_until).toLocaleDateString('pt-BR')}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-gray-500">
                                                    {coupon.usage_count} / {coupon.usage_limit || '∞'}
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
                                                        onClick={() => openDeleteDialog('coupon', coupon.id, coupon.code)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
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
                                onClick={handleSaveAllContent}
                                className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                <Save size={20} className="mr-2" />
                                Salvar Todas as Alterações
                            </button>
                        </div>
                        <div className="space-y-6">
                            {Array.from(new Set(siteContent.map(c => c.section))).map(section => (
                                <div key={section} className="bg-white rounded-lg shadow-md p-6">
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">{section}</h3>
                                    <div className="space-y-4">
                                        {siteContent.filter(c => c.section === section).map(content => (
                                            <div key={content.id} className="border-l-4 border-cyan-500 pl-4 py-2">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    {content.label}
                                                </label>
                                                {content.content_type === 'textarea' ? (
                                                    <textarea
                                                        value={content.value}
                                                        onChange={(e) => {
                                                            setSiteContent(siteContent.map(c =>
                                                                c.id === content.id ? { ...c, value: e.target.value } : c
                                                            ))
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                                                        rows={3}
                                                    />
                                                ) : (
                                                    <input
                                                        type="text"
                                                        value={content.value}
                                                        onChange={(e) => {
                                                            setSiteContent(siteContent.map(c =>
                                                                c.id === content.id ? { ...c, value: e.target.value } : c
                                                            ))
                                                        }}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                    />
                                                )}
                                                <p className="text-xs text-gray-500 mt-1">Chave: <code className="bg-gray-100 px-1 rounded">{content.content_key}</code></p>
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

    function renderModals() {
        return (
            <>
                {/* Modal de Nota Fiscal */}
                <Dialog open={isModalOpen && modalType === 'invoice'} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Editar Nota Fiscal' : 'Emitir Nota Fiscal'}
                            </DialogTitle>
                        </DialogHeader>
                        <InvoiceForm invoice={editingItem} onSave={handleSaveInvoice} onCancel={closeModal} />
                    </DialogContent>
                </Dialog>

                {/* Modal de Cupom */}
                <Dialog open={isModalOpen && modalType === 'coupon'} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Editar Cupom' : 'Criar Cupom'}
                            </DialogTitle>
                        </DialogHeader>
                        <CouponForm coupon={editingItem} onSave={handleSaveCoupon} onCancel={closeModal} />
                    </DialogContent>
                </Dialog>

                {/* Modal de Estoque */}
                <Dialog open={isModalOpen && modalType === 'inventory'} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                Nova Movimentação de Estoque
                            </DialogTitle>
                        </DialogHeader>
                        <InventoryForm item={editingItem} products={products} onSave={handleSaveInventory} onCancel={closeModal} />
                    </DialogContent>
                </Dialog>

                {/* Modal de Produto */}
                <Dialog open={isModalOpen && modalType === 'product'} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Editar Produto' : 'Novo Produto'}
                            </DialogTitle>
                        </DialogHeader>
                        <ProductForm product={editingItem} onSave={async (data: any) => {
                            try {
                                if (editingItem) {
                                    await updateProduct(editingItem.id, data)
                                    setProducts(products.map(p => p.id === editingItem.id ? { ...p, ...data } : p))
                                } else {
                                    const newProduct = await createProduct(data as any)
                                    setProducts([newProduct, ...products])
                                }
                                closeModal()
                                loadAllData()
                            } catch (error) {
                                console.error('Erro ao salvar produto:', error)
                                alert('Erro ao salvar. Tente novamente.')
                            }
                        }} onCancel={closeModal} />
                    </DialogContent>
                </Dialog>

                {/* Modal de Parceria */}
                <Dialog open={isModalOpen && modalType === 'partner'} onOpenChange={closeModal}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingItem ? 'Editar Parceria' : 'Nova Parceria'}
                            </DialogTitle>
                        </DialogHeader>
                        <PartnershipForm partnership={editingItem} onSave={async (data: any) => {
                            try {
                                if (editingItem) {
                                    await updatePartnership(editingItem.id, data)
                                    setPartnersList(partnersList.map(p => p.id === editingItem.id ? { ...p, ...data } : p))
                                } else {
                                    const newPartnership = await createPartnership(data as any)
                                    setPartnersList([newPartnership, ...partnersList])
                                }
                                closeModal()
                                loadAllData()
                            } catch (error) {
                                console.error('Erro ao salvar parceria:', error)
                                alert('Erro ao salvar. Tente novamente.')
                            }
                        }} onCancel={closeModal} />
                    </DialogContent>
                </Dialog>
            </>
        )
    }
}

// Componentes de Formulário
function InvoiceForm({ invoice, onSave, onCancel }: any) {
    const [formData, setFormData] = useState({
        order_id: invoice?.order_id || '',
        customer_name: invoice?.customer_name || '',
        customer_email: invoice?.customer_email || '',
        total_amount: invoice?.total_amount || 0,
        status: invoice?.status || 'Pendente',
        issue_date: invoice?.issue_date || new Date().toISOString().split('T')[0],
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Número do Pedido</label>
                    <input
                        type="text"
                        value={formData.order_id}
                        onChange={(e) => setFormData({ ...formData, order_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="PED123"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                    <input
                        type="text"
                        value={formData.customer_name}
                        onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Nome do Cliente"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email do Cliente</label>
                    <input
                        type="email"
                        value={formData.customer_email}
                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="cliente@email.com"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.total_amount}
                        onChange={(e) => setFormData({ ...formData, total_amount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0.00"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Emitida">Emitida</option>
                        <option value="Cancelada">Cancelada</option>
                        <option value="Rejeitada">Rejeitada</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data de Emissão</label>
                    <input
                        type="date"
                        value={formData.issue_date}
                        onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Salvar
                </button>
            </DialogFooter>
        </form>
    )
}

function CouponForm({ coupon, onSave, onCancel }: any) {
    // Converter valid_from de timestamp para date string se necessário
    const formatDate = (dateValue: any) => {
        if (!dateValue) return new Date().toISOString().split('T')[0]
        if (typeof dateValue === 'string' && dateValue.includes('T')) {
            return dateValue.split('T')[0]
        }
        if (typeof dateValue === 'string') {
            return dateValue
        }
        return new Date(dateValue).toISOString().split('T')[0]
    }

    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        description: coupon?.description || '',
        discount_type: coupon?.discount_type || 'Percentual',
        discount_value: coupon?.discount_value || '',
        valid_from: formatDate(coupon?.valid_from),
        valid_until: formatDate(coupon?.valid_until),
        usage_limit: coupon?.usage_limit?.toString() || '',
        min_purchase_amount: coupon?.min_purchase_amount?.toString() || '',
        status: coupon?.status || 'Ativo',
        show_in_navbar: coupon?.show_in_navbar || false,
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Código do Cupom *</label>
                    <input
                        type="text"
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono"
                        placeholder="CUPOM2025"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        value={formData.description || ''}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Descrição do cupom (opcional)"
                        rows={3}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Desconto *</label>
                    <select
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Percentual">Percentual</option>
                        <option value="Fixo">Valor Fixo</option>
                        <option value="Especial">Especial</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Desconto *</label>
                    <input
                        type="text"
                        value={formData.discount_value}
                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="15% ou R$ 50,00 ou Frete Grátis"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Válido De</label>
                    <input
                        type="date"
                        value={formData.valid_from}
                        onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Válido Até *</label>
                    <input
                        type="date"
                        value={formData.valid_until}
                        onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Limite de Uso</label>
                    <input
                        type="number"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="100"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Valor Mínimo de Compra (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={formData.min_purchase_amount}
                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0.00"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Expirado">Expirado</option>
                    </select>
                </div>
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="show_in_navbar"
                        checked={formData.show_in_navbar || false}
                        onChange={(e) => setFormData({ ...formData, show_in_navbar: e.target.checked })}
                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                    />
                    <label htmlFor="show_in_navbar" className="ml-2 block text-sm font-medium text-gray-700">
                        Mostrar na Navbar do Site
                    </label>
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Salvar
                </button>
            </DialogFooter>
        </form>
    )
}

function InventoryForm({ item, products, onSave, onCancel }: any) {
    const [formData, setFormData] = useState({
        product_id: item?.id || '',
        movement_type: 'Entrada',
        quantity: '',
        reason: '',
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Produto *</label>
                    <select
                        value={formData.product_id}
                        onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        required
                    >
                        <option value="">Selecione um produto</option>
                        {products.map((p: Product) => (
                            <option key={p.id} value={p.id}>{p.name} (Estoque: {p.stock_quantity})</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimentação *</label>
                    <select
                        value={formData.movement_type}
                        onChange={(e) => setFormData({ ...formData, movement_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Entrada">Entrada</option>
                        <option value="Saída">Saída</option>
                        <option value="Ajuste">Ajuste</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantidade *</label>
                    <input
                        type="number"
                        value={formData.quantity}
                        onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="0"
                        min="1"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                    <textarea
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="Motivo da movimentação..."
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Salvar
                </button>
            </DialogFooter>
        </form>
    )
}

function ProductForm({ product, onSave, onCancel }: any) {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        sku: product?.sku || '',
        category_id: product?.category_id || '',
        brand: product?.brand || '',
        price: product?.price || 0,
        stock_quantity: product?.stock_quantity || 0,
        weight: product?.weight || '',
        dimensions: product?.dimensions || '',
        image_url: product?.image_url || '',
        status: product?.status || 'Ativo',
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Nome do produto"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">SKU *</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="SKU001"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        rows={3}
                        placeholder="Descrição detalhada do produto"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Marca</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="Nike, Adidas, etc."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={formData.price}
                            onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="0.00"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Estoque *</label>
                        <input
                            type="number"
                            value={formData.stock_quantity}
                            onChange={(e) => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="0"
                            min="0"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Peso</label>
                        <input
                            type="text"
                            value={formData.weight}
                            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="1.5kg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Dimensões</label>
                        <input
                            type="text"
                            value={formData.dimensions}
                            onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                            placeholder="LxAxP cm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">URL da Imagem</label>
                    <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="https://exemplo.com/imagem.jpg"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Esgotado">Esgotado</option>
                    </select>
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Salvar
                </button>
            </DialogFooter>
        </form>
    )
}

function PartnershipForm({ partnership, onSave, onCancel }: any) {
    const [formData, setFormData] = useState({
        company_name: partnership?.company_name || '',
        contact_email: partnership?.contact_email || '',
        contact_phone: partnership?.contact_phone || '',
        status: partnership?.status || 'Ativo',
    })

    return (
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nome da Empresa *</label>
                    <input
                        type="text"
                        value={formData.company_name}
                        onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Nome da Empresa"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email de Contato *</label>
                    <input
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="contato@empresa.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                    <input
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="(00) 00000-0000"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    >
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                        <option value="Pendente">Pendente</option>
                    </select>
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
                    Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700">
                    Salvar
                </button>
            </DialogFooter>
        </form>
    )
}
