'use client'

import { useState, useEffect, useRef } from 'react'
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
import { PlusCircle, Edit, Trash2, User, Building, FileText, Handshake, Ticket, Type, X, Save, Upload, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Package, DollarSign } from 'lucide-react'
import Image from 'next/image'
import ProductRegistrationForm from '@/components/forms/ProductRegistrationForm'
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
    getSiteContent, updateSiteContent, getFAQs, createFAQ, updateFAQ, deleteFAQ, getPurchases, createPurchase, updatePurchase, deletePurchase,
    type Product, type Invoice, type Coupon, type Partnership, type SiteContent as SupabaseSiteContent, type FAQ, type Purchase,
} from '@/lib/supabase'
import { supabase } from '@/lib/supabase'

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
)

// Componente de Formulário do FAQ (necessário para o modal)
const FAQForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: { pergunta: string, resposta: string }) => void, onCancel: () => void }) => {
    const [pergunta, setPergunta] = useState(initialData?.perguntas_frequentes || '')
    const [resposta, setResposta] = useState(initialData?.respostas || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Certifique-se de que a função onSave recebe os nomes dos campos que o Supabase espera (pergunta, resposta)
        onSave({ pergunta, resposta })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Pergunta</label>
                    <input
                        type="text"
                        value={pergunta}
                        onChange={(e) => setPergunta(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Resposta</label>
                    <textarea
                        value={resposta}
                        onChange={(e) => setResposta(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                        required
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancelar
                </button>
                <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
                    <Save size={20} className="inline mr-2" /> Salvar
                </button>
            </DialogFooter>
        </form>
    )
}
// Componente de Formulário de Compras (Placeholder)
const PurchaseForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const [supplier, setSupplier] = useState(initialData?.supplier_name || '')
    const [total, setTotal] = useState<string>(initialData?.total_amount ? String(initialData.total_amount) : '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({ supplier_name: supplier, total_amount: parseFloat(total || '0') })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fornecedor</label>
                    <input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Valor Total (R$)</label>
                    <input
                        type="number"
                        step="0.01"
                        value={total}
                        onChange={(e) => setTotal(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancelar
                </button>
                <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
                    <Save size={20} className="inline mr-2" /> Salvar Compra
                </button>
            </DialogFooter>
        </form>
    )
}

export default function Dashboard() {
    const [activeTab, setActiveTab] = useState('purchases')
    const [loading, setLoading] = useState(true)

    // Estados dos dados
    const [products, setProducts] = useState<Product[]>([])
    const [inventoryItems, setInventoryItems] = useState<any[]>([])
    const [sales, setSales] = useState<any[]>([])
    const [invoices, setInvoices] = useState<Invoice[]>([])
    const [partnersList, setPartnersList] = useState<Partnership[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [siteContent, setSiteContent] = useState<SupabaseSiteContent[]>([])
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [purchases, setPurchases] = useState<Purchase[]>([])
    
    const FAQS_PER_PAGE = 2
    const [currentPage, setCurrentPage] = useState(1)
    const totalFAQs = faqs.length
    const calculatedTotalPages = Math.ceil(totalFAQs / FAQS_PER_PAGE)
    const currentFAQs = faqs.slice(
        (currentPage - 1) * FAQS_PER_PAGE,
        currentPage * FAQS_PER_PAGE
    )

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
    const [modalType, setModalType] = useState<'invoice' | 'partner' | 'coupon' | 'product' | 'inventory' | 'faq' | 'purchase' | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [uploadingPurchaseId, setUploadingPurchaseId] = useState<string | null>(null)
    const [uploading, setUploading] = useState(false)

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Performance de Vendas nos Últimos 6 Meses' },
        },
    }

    const openFileSelector = (purchaseId: string) => {
        setUploadingPurchaseId(purchaseId)
        // trigger native file selector
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const purchaseId = uploadingPurchaseId
        if (!file || !purchaseId) return
        setUploading(true)
        try {
            // Upload to Supabase Storage - ensure you have a bucket named 'purchases-pdfs'
            const path = `purchases/${purchaseId}/${Date.now()}_${file.name}`
            const { error: uploadError } = await supabase.storage.from('purchases-pdfs').upload(path, file, { upsert: true })
            if (uploadError) throw uploadError

            // Get public URL (or use createSignedUrl for private buckets)
            const { data: urlData } = supabase.storage.from('purchases-pdfs').getPublicUrl(path)
            const publicUrl = urlData.publicUrl

            // Save URL on purchase record (updatePurchase accepts partial)
            await updatePurchase(purchaseId, { pdf_url: publicUrl } as any)

            // Reload purchases
            await loadAllData()
            alert('PDF anexado com sucesso.')
        } catch (err) {
            console.error('Erro ao enviar PDF:', err)
            alert('Erro ao enviar PDF. Verifique o console.')
        } finally {
            setUploading(false)
            setUploadingPurchaseId(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    // Carregar dados do Supabase
    useEffect(() => {
        loadAllData()
    }, [])

    async function loadAllData() {
        try {
            setLoading(true)
            const [productsData, inventoryData, salesData, invoicesData, partnersData, couponsData, contentData, faqsData, purchasesData] = await Promise.all([
                getProducts().catch(() => []),
                getInventoryItems().catch(() => []),
                getSales().catch(() => []),
                getInvoices().catch(() => []),
                getPartnerships().catch(() => []),
                getCoupons().catch(() => []),
                getSiteContent().catch(() => []),
                getFAQs().catch(() => []),
                getPurchases().catch(() => []),
            ])

            setProducts(productsData || [])
            setInventoryItems(inventoryData || [])
            setSales(salesData || [])
            setInvoices(invoicesData || [])
            setPartnersList(partnersData || [])
            setCoupons(couponsData || [])
            setSiteContent(contentData || [])
            setFaqs(faqsData || [])
             setPurchases(purchasesData || [])

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
            case 'Aberto': return 'bg-yellow-100 text-yellow-800';
            case 'Recebido': return 'bg-green-100 text-green-800';
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
                case 'faq':
                    await deleteFAQ(itemToDelete.id)
                    loadAllData() // Recarregar para atualizar a lista
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
    const handlePageChange = (direction: 'prev' | 'next') => {
        if (direction === 'prev' && currentPage > 1) {
            setCurrentPage(prev => prev - 1)
        } else if (direction === 'next' && currentPage < calculatedTotalPages) {
            setCurrentPage(prev => prev + 1)
        }
    }

    const handleSaveFAQ = async (formData: { pergunta: string, resposta: string }) => {
        try {
            if (editingItem) {
                await updateFAQ(editingItem.id, formData)
            } else {
                await createFAQ(formData as any)
            }
            closeModal()
            loadAllData() // Recarrega para atualizar a lista e a paginação
        } catch (error) {
            console.error('Erro ao salvar FAQ:', error)
            alert('Erro ao salvar FAQ. Tente novamente.')
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader2 className="animate-spin text-cyan-600" size={48} />
            </div>
        )
    }

    function renderModals() {
        let modalTitle = ''
        let modalContent = null
        const isEdit = !!editingItem

        switch (modalType) {
            case 'faq':
                modalTitle = isEdit ? 'Editar FAQ' : 'Adicionar Nova FAQ'
                modalContent = (
                    <FAQForm
                        initialData={editingItem}
                        onSave={handleSaveFAQ}
                        onCancel={closeModal}
                    />
                )
                break
            case 'invoice':
                modalTitle = isEdit ? 'Editar Nota Fiscal' : 'Emitir Nova Nota Fiscal'
                // Aqui você precisaria de um componente InvoiceForm
                modalContent = <p>Formulário de Nota Fiscal Pendente</p> 
                break
            case 'coupon':
                modalTitle = isEdit ? 'Editar Cupom' : 'Adicionar Novo Cupom'
                // Aqui você precisaria de um componente CouponForm
                modalContent = <p>Formulário de Cupom Pendente</p>
                break
            case 'product':
                modalTitle = isEdit ? 'Editar Produto' : 'Adicionar Novo Produto'
                modalContent = (
                    <ProductRegistrationForm
                        initialData={editingItem}
                        productId={editingItem?.id ?? null}
                        onSuccess={() => {
                            // reload products and close modal after success
                            loadAllData()
                            closeModal()
                        }}
                        onError={(err) => {
                            alert(`Erro ao salvar produto: ${err}`)
                        }}
                    />
                )
                break
            case 'inventory':
                modalTitle = isEdit ? 'Editar Movimentação' : 'Nova Movimentação de Estoque'
                // Aqui você precisaria de um componente InventoryForm
                modalContent = <p>Formulário de Estoque Pendente</p>
                break
            case 'partner':
                modalTitle = isEdit ? 'Editar Parceria' : 'Adicionar Nova Parceria'
                // Aqui você precisaria de um componente PartnerForm
                modalContent = <p>Formulário de Parceria Pendente</p>
                break
            default:
                return null
        }

        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{modalTitle}</DialogTitle>
                    </DialogHeader>
                    {modalContent}
                </DialogContent>
            </Dialog>
        )
    }

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
                        {/* Tabela de Notas Fiscais (Conteúdo omitido para brevidade, assumindo que está funcionando) */}
                        <p className="text-gray-500">Tabela de Notas Fiscais...</p>
                    </div>
                );
            case 'partnerships':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <Handshake className="mr-2" size={24} />
                                Gestão de Parcerias
                            </h2>
                            <button
                                onClick={() => openModal('partner')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Adicionar Parceria
                            </button>
                        </div>
                        {/* Tabela de Parcerias (Conteúdo omitido para brevidade, assumindo que está funcionando) */}
                        <p className="text-gray-500">Tabela de Parcerias...</p>
                    </div>
                );
            case 'coupons':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <Ticket className="mr-2" size={24} />
                                Gestão de Cupons
                            </h2>
                            <button
                                onClick={() => openModal('coupon')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Adicionar Cupom
                            </button>
                        </div>
                        {/* Tabela de Cupons (Conteúdo omitido para brevidade, assumindo que está funcionando) */}
                        <p className="text-gray-500">Tabela de Cupons...</p>
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
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                <Save size={20} className="mr-2" />
                                Salvar Tudo
                            </button>
                        </div>
                        {/* Campos de Conteúdo do Site (Conteúdo omitido para brevidade, assumindo que está funcionando) */}
                        <p className="text-gray-500">Campos de Conteúdo do Site...</p>
                    </div>
                );
            case 'faq': // <-- NOVO BLOCO IMPLEMENTADO
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Perguntas Frequentes (FAQ)</h2>
                            <button
                                onClick={() => openModal('faq')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Adicionar FAQ
                            </button>
                        </div>

                        {faqs.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma pergunta frequente cadastrada.</p>
                        ) : (
                            <>
                                {/* Lista de FAQs */}
                                <div className="space-y-4">
                                    {currentFAQs.map(faq => (
                                        <div key={faq.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
                                            <div className="flex-grow pr-4">
                                                <p className="font-bold text-gray-800 mb-1">P: {faq.perguntas_frequentes}</p>
                                                <p className="text-sm text-gray-600">R: {faq.respostas}</p>
                                            </div>
                                            <div className="flex space-x-2 flex-shrink-0">
                                                <button
                                                    onClick={() => openModal('faq', faq)}
                                                    className="text-cyan-600 hover:text-cyan-800"
                                                >
                                                    <Edit size={18} />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog('faq', faq.id, faq.perguntas_frequentes)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Paginação */}
                                <div className="flex justify-center items-center mt-6 space-x-4">
                                    <button
                                        onClick={() => handlePageChange('prev')}
                                        disabled={currentPage === 1}
                                        className="p-2 border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <span className="text-gray-700">Página {currentPage} de {calculatedTotalPages}</span>
                                    <button
                                        onClick={() => handlePageChange('next')}
                                        disabled={currentPage === calculatedTotalPages || totalFAQs === 0}
                                        className="p-2 border rounded-full text-gray-600 hover:bg-gray-100 disabled:opacity-50"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                );
            case 'purchases':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Compras</h2>
                            <button
                                onClick={() => openModal('purchase')}
                                className="flex items-center bg-cyan-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-cyan-700 transition-colors"
                            >
                                <PlusCircle size={20} className="mr-2" />
                                Nova Compra
                            </button>
                        </div>

                        {purchases.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma compra registrada.</p>
                        ) : (
                            <div className="space-y-4">
                                {purchases.map((purchase: any) => (
                                    <div key={purchase.id} className="p-4 border rounded-lg bg-white flex justify-between items-start">
                                        <div className="flex-grow pr-4">
                                            <p className="font-semibold text-gray-800 mb-1">#{purchase.purchase_number || purchase.id} — Fornecedor: {purchase.supplier_name}</p>
                                            <p className="text-sm text-gray-600">Valor: R$ {Number(purchase.total_amount).toFixed(2).replace('.', ',')}</p>
                                            <p className="text-sm text-gray-500 mt-1">Data: {new Date(purchase.purchase_date || purchase.created_at).toLocaleDateString('pt-BR')}</p>
                                            {purchase.pdf_url && (
                                                <p className="mt-2">
                                                    <a href={purchase.pdf_url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">Visualizar PDF</a>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0">
                                            <button
                                                onClick={() => openFileSelector(purchase.id)}
                                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                                                title="Adicionar/Atualizar PDF"
                                            >
                                                {uploading && uploadingPurchaseId === purchase.id ? (
                                                    <Loader2 className="animate-spin" size={16} />
                                                ) : (
                                                    <Package size={16} />
                                                )}
                                                <span className="text-sm">Anexar PDF</span>
                                            </button>
                                            <button
                                                onClick={() => openDeleteDialog('purchase', purchase.id, purchase.purchase_number || purchase.supplier_name)}
                                                className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            default:
                return null;
        }
    }


    return (
        <div className="flex flex-col min-h-screen bg-gray-100">
            <main className="flex-grow p-4 sm:p-6">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Painel Administrativo</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-9 gap-3 mb-6">
                    <button onClick={() => setActiveTab('sales')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'sales' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Vendas</button>
                    <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'inventory' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Estoque</button>
                    <button onClick={() => setActiveTab('users')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('products')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'products' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Produtos</button>
                    <button onClick={() => setActiveTab('invoices')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'invoices' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Notas Fiscais</button>
                    <button onClick={() => setActiveTab('partnerships')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'partnerships' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Parcerias</button>
                    <button onClick={() => setActiveTab('coupons')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'coupons' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Cupons</button>
                    <button onClick={() => setActiveTab('content')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'content' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Textos do Site</button>
                    <button onClick={() => setActiveTab('faq')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'faq' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>FAQ </button>


                </div>

                <div className="bg-white rounded-lg p-6 shadow-lg min-h-[500px]">
                    {renderTabContent()}
                </div>

                {/* hidden file input used for attaching PDFs to purchases */}
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />

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
}