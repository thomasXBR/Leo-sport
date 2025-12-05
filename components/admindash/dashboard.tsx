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
import { PlusCircle, Edit, Trash2, User, Building, FileText, Handshake, Ticket, Type, X, Save, Upload, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Package, DollarSign, Mail, Calendar, Filter } from 'lucide-react'
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
    getSiteContent, updateSiteContent, getFAQs, createFAQ, updateFAQ, deleteFAQ, getPurchases, createPurchase, updatePurchase, deletePurchase, getAllUsers, getAllUserCarts, getUserCart,
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
// Componente de Formulário de Cupom
const CouponForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const [code, setCode] = useState(initialData?.code || '')
    const [description, setDescription] = useState(initialData?.description || '')
    const [carouselText, setCarouselText] = useState(initialData?.carousel_text || '')
    const [discountType, setDiscountType] = useState<'Percentual' | 'Fixo' | 'Especial'>(initialData?.discount_type || 'Percentual')
    const [discountValue, setDiscountValue] = useState(initialData?.discount_value || '')
    const [validFrom, setValidFrom] = useState(initialData?.valid_from || new Date().toISOString().split('T')[0])
    const [validUntil, setValidUntil] = useState(initialData?.valid_until || '')
    const [usageLimit, setUsageLimit] = useState<string>(initialData?.usage_limit ? String(initialData.usage_limit) : '')
    const [minPurchaseAmount, setMinPurchaseAmount] = useState<string>(initialData?.min_purchase_amount ? String(initialData.min_purchase_amount) : '')
    const [status, setStatus] = useState<'Ativo' | 'Inativo' | 'Expirado'>(initialData?.status || 'Ativo')
    const [showInNavbar, setShowInNavbar] = useState(initialData?.show_in_navbar || false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            code,
            description,
            carousel_text: carouselText,
            discount_type: discountType,
            discount_value: discountValue,
            valid_from: validFrom,
            valid_until: validUntil,
            usage_limit: usageLimit ? parseInt(usageLimit) : undefined,
            min_purchase_amount: minPurchaseAmount ? parseFloat(minPurchaseAmount) : undefined,
            status,
            show_in_navbar: showInNavbar,
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Código do Cupom *</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="EX: DESCONTO10"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                        placeholder="Descrição do cupom (opcional)"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Texto do Carrossel *</label>
                    <input
                        type="text"
                        value={carouselText}
                        onChange={(e) => setCarouselText(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="Ex: 🎉 Use o cupom DESCONTO10 e ganhe 10% OFF!"
                    />
                    <p className="mt-1 text-xs text-gray-500">Este texto será exibido no carrossel do topo do site</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipo de Desconto *</label>
                        <select
                            value={discountType}
                            onChange={(e) => setDiscountType(e.target.value as 'Percentual' | 'Fixo' | 'Especial')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="Percentual">Percentual (%)</option>
                            <option value="Fixo">Valor Fixo (R$)</option>
                            <option value="Especial">Especial</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor do Desconto *</label>
                        <input
                            type="text"
                            value={discountValue}
                            onChange={(e) => setDiscountValue(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                            placeholder={discountType === 'Percentual' ? 'Ex: 10' : 'Ex: 50.00'}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Válido de *</label>
                        <input
                            type="date"
                            value={validFrom}
                            onChange={(e) => setValidFrom(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Válido até *</label>
                        <input
                            type="date"
                            value={validUntil}
                            onChange={(e) => setValidUntil(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Limite de Uso</label>
                        <input
                            type="number"
                            value={usageLimit}
                            onChange={(e) => setUsageLimit(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Ex: 100 (opcional)"
                            min="1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Mínimo de Compra (R$)</label>
                        <input
                            type="number"
                            step="0.01"
                            value={minPurchaseAmount}
                            onChange={(e) => setMinPurchaseAmount(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="Ex: 100.00 (opcional)"
                            min="0"
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo' | 'Expirado')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                            <option value="Expirado">Expirado</option>
                        </select>
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={showInNavbar}
                                onChange={(e) => setShowInNavbar(e.target.checked)}
                                className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Exibir no Carrossel</span>
                        </label>
                    </div>
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

// Componente de Formulário de Envio de Email
const EmailForm = ({ userEmail, userName, onSend, onCancel }: { userEmail: string, userName: string, onSend: (data: { subject: string, message: string }) => Promise<void>, onCancel: () => void }) => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSending(true)
        try {
            await onSend({ subject, message })
            setSubject('')
            setMessage('')
        } catch (error) {
            console.error('Erro ao enviar email:', error)
        } finally {
            setSending(false)
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Para</label>
                    <input
                        type="text"
                        value={`${userName} <${userEmail}>`}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-50"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Assunto *</label>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="Assunto do email"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Mensagem *</label>
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-32"
                        required
                        placeholder="Digite sua mensagem..."
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancelar
                </button>
                <button type="submit" disabled={sending} className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50">
                    {sending ? 'Enviando...' : 'Enviar Email'}
                </button>
            </DialogFooter>
        </form>
    )
}

// Componente de Formulário de Nota Fiscal
const InvoiceForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const [invoiceNumber, setInvoiceNumber] = useState(initialData?.invoice_number || '')
    const [orderId, setOrderId] = useState(initialData?.order_id || '')
    const [customerName, setCustomerName] = useState(initialData?.customer_name || '')
    const [customerEmail, setCustomerEmail] = useState(initialData?.customer_email || '')
    const [customerCpfCnpj, setCustomerCpfCnpj] = useState(initialData?.customer_cpf_cnpj || '')
    const [totalAmount, setTotalAmount] = useState<string>(initialData?.total_amount ? String(initialData.total_amount) : '')
    const [status, setStatus] = useState<'Pendente' | 'Emitida' | 'Cancelada' | 'Rejeitada'>(initialData?.status || 'Pendente')
    const [issueDate, setIssueDate] = useState(initialData?.issue_date || new Date().toISOString().split('T')[0])
    const [dueDate, setDueDate] = useState(initialData?.due_date || '')
    const [notes, setNotes] = useState(initialData?.notes || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            invoice_number: invoiceNumber,
            order_id: orderId || undefined,
            customer_name: customerName,
            customer_email: customerEmail || undefined,
            customer_cpf_cnpj: customerCpfCnpj || undefined,
            total_amount: parseFloat(totalAmount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0,
            status,
            issue_date: issueDate,
            due_date: dueDate || undefined,
            notes: notes || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Número da Nota Fiscal *</label>
                    <input
                        type="text"
                        value={invoiceNumber}
                        onChange={(e) => setInvoiceNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                        placeholder="Ex: NF001234"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID do Pedido</label>
                    <input
                        type="text"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="ID do pedido relacionado (opcional)"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nome do Cliente *</label>
                        <input
                            type="text"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email do Cliente</label>
                        <input
                            type="email"
                            value={customerEmail}
                            onChange={(e) => setCustomerEmail(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            placeholder="cliente@email.com"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">CPF/CNPJ</label>
                    <input
                        type="text"
                        value={customerCpfCnpj}
                        onChange={(e) => setCustomerCpfCnpj(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="000.000.000-00 ou 00.000.000/0000-00"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Total (R$) *</label>
                        <input
                            type="text"
                            value={totalAmount}
                            onChange={(e) => setTotalAmount(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                            placeholder="0.00"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Pendente' | 'Emitida' | 'Cancelada' | 'Rejeitada')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="Pendente">Pendente</option>
                            <option value="Emitida">Emitida</option>
                            <option value="Cancelada">Cancelada</option>
                            <option value="Rejeitada">Rejeitada</option>
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Emissão *</label>
                        <input
                            type="date"
                            value={issueDate}
                            onChange={(e) => setIssueDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data de Vencimento</label>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                        placeholder="Observações adicionais (opcional)"
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

// Componente de Formulário de Estoque
const InventoryForm = ({ initialData, products, onSave, onCancel }: { initialData: any, products: Product[], onSave: (data: any) => void, onCancel: () => void }) => {
    const [productId, setProductId] = useState(initialData?.product_id || '')
    const [movementType, setMovementType] = useState<'Entrada' | 'Saída' | 'Ajuste'>(initialData?.movement_type || 'Entrada')
    const [quantity, setQuantity] = useState<string>(initialData?.quantity ? String(initialData.quantity) : '')
    const [newQuantity, setNewQuantity] = useState<string>(initialData?.new_quantity ? String(initialData.new_quantity) : '')
    const [reason, setReason] = useState(initialData?.reason || '')

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            product_id: productId,
            movement_type: movementType,
            quantity: movementType === 'Ajuste' ? 0 : parseInt(quantity) || 0,
            new_quantity: movementType === 'Ajuste' ? parseInt(newQuantity) : undefined,
            reason: reason || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Produto *</label>
                    <select
                        value={productId}
                        onChange={(e) => setProductId(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="">Selecione um produto</option>
                        {products.map((product) => (
                            <option key={product.id} value={product.id}>
                                {product.name} - Estoque: {product.stock_quantity || 0}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo de Movimentação *</label>
                    <select
                        value={movementType}
                        onChange={(e) => setMovementType(e.target.value as 'Entrada' | 'Saída' | 'Ajuste')}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    >
                        <option value="Entrada">Entrada (Adicionar)</option>
                        <option value="Saída">Saída (Remover)</option>
                        <option value="Ajuste">Ajuste (Definir quantidade)</option>
                    </select>
                </div>
                {movementType === 'Ajuste' ? (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nova Quantidade *</label>
                        <input
                            type="number"
                            min="0"
                            value={newQuantity}
                            onChange={(e) => setNewQuantity(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                            placeholder="Quantidade final desejada"
                        />
                    </div>
                ) : (
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Quantidade *</label>
                        <input
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                            placeholder={movementType === 'Entrada' ? 'Quantidade a adicionar' : 'Quantidade a remover'}
                        />
                    </div>
                )}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Motivo</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                        placeholder="Motivo da movimentação (opcional)"
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

// Componente de Formulário de Compras
const PurchaseForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const [purchaseNumber, setPurchaseNumber] = useState(initialData?.purchase_number || '')
    const [supplier, setSupplier] = useState(initialData?.supplier_name || '')
    const [total, setTotal] = useState<string>(initialData?.total_amount ? String(initialData.total_amount) : '')
    const [purchaseDate, setPurchaseDate] = useState(initialData?.purchase_date || new Date().toISOString().split('T')[0])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            purchase_number: purchaseNumber || undefined,
            supplier_name: supplier,
            total_amount: parseFloat(total || '0'),
            purchase_date: purchaseDate || new Date().toISOString().split('T')[0],
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Número da Compra</label>
                    <input
                        type="text"
                        value={purchaseNumber}
                        onChange={(e) => setPurchaseNumber(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="Ex: COMP001 (opcional)"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Fornecedor *</label>
                    <input
                        type="text"
                        value={supplier}
                        onChange={(e) => setSupplier(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Valor Total (R$) *</label>
                        <input
                            type="number"
                            step="0.01"
                            value={total}
                            onChange={(e) => setTotal(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data da Compra *</label>
                        <input
                            type="date"
                            value={purchaseDate}
                            onChange={(e) => setPurchaseDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
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
    const [users, setUsers] = useState<any[]>([])
    const [userCarts, setUserCarts] = useState<any[]>([])
    const [filterConsentEmails, setFilterConsentEmails] = useState(false)
    const [selectedUserForEmail, setSelectedUserForEmail] = useState<any>(null)
    const [emailModalOpen, setEmailModalOpen] = useState(false)
    const [chartFilter, setChartFilter] = useState<'week' | 'month' | 'year'>('month')
    
    const FAQS_PER_PAGE = 6
    const [currentPage, setCurrentPage] = useState(1)
    const totalFAQs = faqs.length
    const calculatedTotalPages = Math.ceil(totalFAQs / FAQS_PER_PAGE)
    const currentFAQs = faqs.slice(
        (currentPage - 1) * FAQS_PER_PAGE,
        currentPage * FAQS_PER_PAGE
    )

    // Ajusta a página atual caso a lista de FAQs mude (ex.: exclusão/adição)
    useEffect(() => {
        if (calculatedTotalPages === 0) {
            setCurrentPage(1)
        } else if (currentPage > calculatedTotalPages) {
            setCurrentPage(calculatedTotalPages)
        }
    }, [faqs, calculatedTotalPages])

    const [salesData, setSalesData] = useState({
        labels: [] as string[],
        datasets: [{
            label: 'Vendas (R$)',
            data: [] as number[],
            backgroundColor: '#0891b2',
            borderRadius: 5,
        }],
    })

    const updateChartData = (data: any[], filter: 'week' | 'month' | 'year') => {
        const { labels, totals } = processSalesDataForChart(data, filter)
        setSalesData({
            labels,
            datasets: [{
                label: filter === 'week' ? 'Vendas Semanais (R$)' : filter === 'year' ? 'Vendas Anuais (R$)' : 'Vendas Mensais (R$)',
                data: totals,
                backgroundColor: '#0891b2',
                borderRadius: 5,
            }],
        })
    }

    useEffect(() => {
        if (sales.length > 0) {
            updateChartData(sales, chartFilter)
        }
    }, [chartFilter])

    // Estados dos modais
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'invoice' | 'partner' | 'coupon' | 'products' | 'inventory' | 'faq' | 'purchase' | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [uploadingPurchaseId, setUploadingPurchaseId] = useState<string | null>(null)
    const [uploadingInvoiceId, setUploadingInvoiceId] = useState<string | null>(null)
    const [uploadingFileType, setUploadingFileType] = useState<'purchase' | 'invoice' | null>(null)
    const [uploading, setUploading] = useState(false)

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    stepSize: 1000,
                    callback: function(value: any) {
                        return 'R$ ' + value.toLocaleString('pt-BR')
                    }
                }
            }
        },
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: chartFilter === 'week' ? 'Performance de Vendas nas Últimas 4 Semanas' : chartFilter === 'year' ? 'Performance de Vendas nos Últimos 12 Meses' : 'Performance de Vendas nos Últimos 6 Meses' },
            tooltip: {
                callbacks: {
                    label: function(context: any) {
                        return 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                    }
                }
            }
        },
    }

    const openFileSelector = (id: string, type: 'purchase' | 'invoice') => {
        if (type === 'purchase') {
            setUploadingPurchaseId(id)
        } else {
            setUploadingInvoiceId(id)
        }
        setUploadingFileType(type)
        // trigger native file selector
        fileInputRef.current?.click()
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const purchaseId = uploadingPurchaseId
        const invoiceId = uploadingInvoiceId
        const fileType = uploadingFileType
        if (!file || (!purchaseId && !invoiceId) || !fileType) return
        setUploading(true)
        try {
            const id = fileType === 'purchase' ? purchaseId : invoiceId
            if (!id) return

            // Upload to Supabase Storage
            const bucketName = fileType === 'purchase' ? 'purchases-pdfs' : 'invoices-pdfs'
            const folderName = fileType === 'purchase' ? 'purchases' : 'invoices'
            const path = `${folderName}/${id}/${Date.now()}_${file.name}`
            const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, { upsert: true })
            if (uploadError) throw uploadError

            // Get public URL (or use createSignedUrl for private buckets)
            const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(path)
            const publicUrl = urlData.publicUrl

            // Save URL on record
            if (fileType === 'purchase') {
                await updatePurchase(id, { pdf_url: publicUrl } as any)
            } else {
                await updateInvoice(id, { pdf_url: publicUrl } as any)
            }

            // Reload data
            await loadAllData()
            alert('PDF anexado com sucesso.')
        } catch (err) {
            console.error('Erro ao enviar PDF:', err)
            alert('Erro ao enviar PDF. Verifique o console.')
        } finally {
            setUploading(false)
            setUploadingPurchaseId(null)
            setUploadingInvoiceId(null)
            setUploadingFileType(null)
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
            const [productsData, inventoryData, salesData, invoicesData, partnersData, couponsData, contentData, faqsData, purchasesData, usersData, cartsData] = await Promise.all([
                getProducts().catch(() => []),
                getInventoryItems().catch(() => []),
                getSales().catch(() => []),
                getInvoices().catch(() => []),
                getPartnerships().catch(() => []),
                getCoupons().catch(() => []),
                getSiteContent().catch(() => []),
                getFAQs().catch(() => []),
                getPurchases().catch(() => []),
                getAllUsers().catch(() => []),
                getAllUserCarts().catch(() => []),
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
            setUsers(usersData || [])
            setUserCarts(cartsData || [])

            // Carregar dados do gráfico
            const chartSalesData = await getSalesDataForChart().catch(() => [])
            updateChartData(chartSalesData || [], chartFilter)
        } catch (error) {
            console.error('Erro ao carregar dados:', error)
        } finally {
            setLoading(false)
        }
    }

    function processSalesDataForChart(data: any[], filter: 'week' | 'month' | 'year' = 'month') {
        const now = new Date()
        let labels: string[] = []
        let totals: number[] = []

        if (filter === 'month') {
            // Últimos 6 meses
            labels = []
            totals = Array(6).fill(0)
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            
            for (let i = 5; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
                labels.push(monthNames[monthDate.getMonth()])
            }

            data.forEach(sale => {
                const date = new Date(sale.created_at)
                const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
                if (monthsDiff >= 0 && monthsDiff < 6) {
                    totals[5 - monthsDiff] += parseFloat(sale.total_amount) || 0
                }
            })
        } else if (filter === 'week') {
            // Últimas 4 semanas
            labels = []
            totals = Array(4).fill(0)
            
            for (let i = 3; i >= 0; i--) {
                const weekDate = new Date(now)
                weekDate.setDate(now.getDate() - (i * 7))
                labels.push(`Sem ${weekDate.getDate()}/${weekDate.getMonth() + 1}`)
            }

            data.forEach(sale => {
                const date = new Date(sale.created_at)
                const daysDiff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
                const weekIndex = Math.floor(daysDiff / 7)
                if (weekIndex >= 0 && weekIndex < 4) {
                    totals[3 - weekIndex] += parseFloat(sale.total_amount) || 0
                }
            })
        } else if (filter === 'year') {
            // Últimos 12 meses
            labels = []
            totals = Array(12).fill(0)
            const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']
            
            for (let i = 11; i >= 0; i--) {
                const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
                labels.push(`${monthNames[monthDate.getMonth()]}/${monthDate.getFullYear().toString().slice(-2)}`)
            }

            data.forEach(sale => {
                const date = new Date(sale.created_at)
                const monthsDiff = (now.getFullYear() - date.getFullYear()) * 12 + (now.getMonth() - date.getMonth())
                if (monthsDiff >= 0 && monthsDiff < 12) {
                    totals[11 - monthsDiff] += parseFloat(sale.total_amount) || 0
                }
            })
        }

        return { labels, totals }
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
                case 'products':
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
                const invoiceNumber = formData.invoice_number || `NF${Date.now().toString().slice(-6)}`
                const newInvoice = await createInvoice({
                    invoice_number: invoiceNumber,
                    order_id: formData.order_id || '',
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email || '',
                    customer_cpf_cnpj: formData.customer_cpf_cnpj || undefined,
                    total_amount: typeof formData.total_amount === 'string' 
                        ? parseFloat(formData.total_amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                        : formData.total_amount || 0,
                    status: formData.status || 'Pendente',
                    issue_date: formData.issue_date || new Date().toISOString().split('T')[0],
                    due_date: formData.due_date || undefined,
                    notes: formData.notes || undefined,
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

    const handleSavePurchase = async (formData: any) => {
        try {
            if (editingItem) {
                await updatePurchase(editingItem.id, formData)
                setPurchases(purchases.map(p => p.id === editingItem.id ? { ...p, ...formData } : p))
            } else {
                const purchaseNumber = formData.purchase_number || `COMP${Date.now().toString().slice(-6)}`
                const newPurchase = await createPurchase({
                    purchase_number: purchaseNumber,
                    supplier_name: formData.supplier_name,
                    total_amount: typeof formData.total_amount === 'string' 
                        ? parseFloat(formData.total_amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                        : formData.total_amount || 0,
                    purchase_date: formData.purchase_date || new Date().toISOString().split('T')[0],
                    pdf_url: formData.pdf_url || undefined,
                })
                setPurchases([newPurchase, ...purchases])
            }
            closeModal()
            loadAllData()
        } catch (error) {
            console.error('Erro ao salvar compra:', error)
            alert('Erro ao salvar compra. Tente novamente.')
        }
    }

    const handleSaveInventory = async (formData: any) => {
        try {
            // Buscar produto para obter dados necessários
            const { data: product } = await supabase
                .from('products')
                .select('stock_quantity, name')
                .eq('id', formData.product_id)
                .single()
            
            if (!product) {
                throw new Error('Produto não encontrado')
            }
            
            const previousQuantity = product.stock_quantity || 0
            let newQuantity = previousQuantity
            
            // Calcular nova quantidade baseada no tipo de movimentação
            if (formData.movement_type === 'Entrada') {
                newQuantity = previousQuantity + (formData.quantity || 0)
            } else if (formData.movement_type === 'Saída') {
                newQuantity = Math.max(0, previousQuantity - (formData.quantity || 0))
            } else if (formData.movement_type === 'Ajuste' && formData.new_quantity !== undefined) {
                newQuantity = parseInt(String(formData.new_quantity))
            }
            
            // Criar movimentação de estoque
            const movementData: any = {
                product_id: formData.product_id,
                product_name: product.name,
                movement_type: formData.movement_type,
                quantity: formData.quantity || 0,
                previous_quantity: previousQuantity,
                new_quantity: newQuantity,
                reason: formData.reason || undefined,
            }
            
            await createInventoryMovement(movementData)
            
            // Atualizar estoque do produto
            await supabase
                .from('products')
                .update({ stock_quantity: newQuantity })
                .eq('id', formData.product_id)
            
            closeModal()
            loadAllData()
        } catch (error: any) {
            console.error('Erro ao salvar movimentação de estoque:', error)
            alert(`Erro ao salvar movimentação: ${error.message || 'Tente novamente.'}`)
        }
    }

    const handleSaveCoupon = async (formData: any) => {
        try {
            // Formatar dados para envio ao Supabase
            const couponData: any = {
                code: formData.code,
                description: formData.description || undefined,
                carousel_text: formData.carousel_text || undefined,
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
                // Sempre incluir show_in_navbar, mesmo que a coluna não exista
                // O Supabase vai ignorar campos desconhecidos ou vamos tratar o erro
                couponData.show_in_navbar = formData.show_in_navbar || false
                
                try {
                    await updateCoupon(editingItem.id, couponData)
                } catch (err: any) {
                    // Se der erro por causa de show_in_navbar, tentar novamente sem esse campo
                    if (err?.message?.includes('show_in_navbar') || err?.code === 'PGRST116') {
                        delete couponData.show_in_navbar
                        await updateCoupon(editingItem.id, couponData)
                    } else {
                        throw err
                    }
                }
                // Recarregar dados do Supabase para garantir sincronização
                const updatedCoupons = await getCoupons()
                setCoupons(updatedCoupons || [])
                alert('Cupom atualizado com sucesso!')
            } else {
                // Criar novo cupom
                const newCouponData: any = {
                    ...couponData,
                    usage_count: 0,
                    status: formData.status || 'Ativo',
                    show_in_navbar: formData.show_in_navbar || false,
                }
                
                try {
                    await createCoupon(newCouponData)
                } catch (err: any) {
                    // Se der erro por causa de show_in_navbar, tentar novamente sem esse campo
                    if (err?.message?.includes('show_in_navbar') || err?.code === 'PGRST116') {
                        delete newCouponData.show_in_navbar
                        await createCoupon(newCouponData)
                    } else {
                        throw err
                    }
                }
                // Recarregar dados do Supabase para garantir sincronização
                const updatedCoupons = await getCoupons()
                setCoupons(updatedCoupons || [])
                alert('Cupom criado com sucesso!')
            }
            closeModal()
        } catch (error: any) {
            console.error('Erro ao salvar cupom:', error)
            const errorMessage = error?.message || error?.details || error?.hint || 'Erro desconhecido ao salvar cupom'
            alert(`Erro ao salvar cupom: ${errorMessage}`)
        }
    }

    const handleSaveContent = async (id: string, value: string) => {
        try {
            await updateSiteContent(id, value)
            setSiteContent(siteContent.map(c => c.id === id ? { ...c, value } : c))
            alert('Texto salvo com sucesso! As alterações serão visíveis após recarregar a página.')
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
            // Recarregar dados do Supabase para garantir sincronização
            const updatedContent = await getSiteContent()
            setSiteContent(updatedContent || [])
            alert('Todas as alterações foram salvas com sucesso! As alterações serão visíveis após recarregar a página.')
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

    const handleSendEmail = async (data: { subject: string, message: string }) => {
        try {
            if (!selectedUserForEmail || !selectedUserForEmail.email) {
                alert('Email do usuário não encontrado')
                return
            }

            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                alert('Sessão expirada. Por favor, faça login novamente.')
                return
            }

            const response = await fetch('/api/email/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({
                    to: selectedUserForEmail.email,
                    subject: data.subject,
                    message: data.message,
                }),
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Erro ao enviar email')
            }

            alert('Email enviado com sucesso!')
            setEmailModalOpen(false)
            setSelectedUserForEmail(null)
        } catch (error: any) {
            console.error('Erro ao enviar email:', error)
            alert(`Erro ao enviar email: ${error.message || 'Tente novamente.'}`)
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
                modalContent = (
                    <InvoiceForm
                        initialData={editingItem}
                        onSave={handleSaveInvoice}
                        onCancel={closeModal}
                    />
                )
                break
            case 'coupon':
                modalTitle = isEdit ? 'Editar Cupom' : 'Adicionar Novo Cupom'
                modalContent = (
                    <CouponForm
                        initialData={editingItem}
                        onSave={handleSaveCoupon}
                        onCancel={closeModal}
                    />
                )
                break
            case 'products':
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
                modalContent = (
                    <InventoryForm
                        initialData={editingItem}
                        products={products}
                        onSave={handleSaveInventory}
                        onCancel={closeModal}
                    />
                )
                break
            case 'partner':
                modalTitle = isEdit ? 'Editar Parceria' : 'Adicionar Nova Parceria'
                // Aqui você precisaria de um componente PartnerForm
                modalContent = <p>Formulário de Parceria Pendente</p>
                break
            case 'purchase':
                modalTitle = isEdit ? 'Editar Compra' : 'Nova Compra'
                modalContent = (
                    <PurchaseForm
                        initialData={editingItem}
                        onSave={handleSavePurchase}
                        onCancel={closeModal}
                    />
                )
                break
            default:
                break
            }

        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className={modalType === 'coupon' || modalType === 'invoice' || modalType === 'products' ? 'sm:max-w-[900px] max-h-[90vh] overflow-y-auto' : 'sm:max-w-[425px]'}>
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
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-semibold text-gray-700">Análise de Vendas</h2>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setChartFilter('week')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${chartFilter === 'week' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Semana
                                </button>
                                <button
                                    onClick={() => setChartFilter('month')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${chartFilter === 'month' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Mês
                                </button>
                                <button
                                    onClick={() => setChartFilter('year')}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${chartFilter === 'year' ? 'bg-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                                >
                                    Ano
                                </button>
                            </div>
                        </div>
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
                const usersToShow = filterConsentEmails
                    ? users.filter((u: any) => u.consent_emails === true)
                    : users
                
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Gestão de Usuários</h2>
                        </div>
                        <div className="mb-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={filterConsentEmails}
                                    onChange={(e) => setFilterConsentEmails(e.target.checked)}
                                    className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                />
                                <span className="text-sm font-medium text-gray-700">
                                    Apenas usuários que aceitaram e-mails
                                </span>
                            </label>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full bg-white">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aceitou E-mails</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Cadastro</th>
                                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {usersToShow.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="py-8 text-center text-gray-500">
                                                {filterConsentEmails ? 'Nenhum usuário encontrado com consentimento de e-mails.' : 'Nenhum usuário encontrado.'}
                                            </td>
                                        </tr>
                                    ) : (
                                        usersToShow.map((user: any) => (
                                            <tr key={user.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{user.name || 'Sem nome'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{user.email || '-'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        user.user_type === 'admin' ? 'bg-purple-100 text-purple-800' :
                                                        user.user_type === 'vendedor' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                        {user.user_type === 'admin' ? 'Admin' : user.user_type === 'vendedor' ? 'Vendedor' : 'Comprador'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {user.consent_emails ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            ✓ Sim
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            Não
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : '-'}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    {user.consent_emails && user.email ? (
                                                        <button
                                                            onClick={() => {
                                                                setSelectedUserForEmail(user)
                                                                setEmailModalOpen(true)
                                                            }}
                                                            className="text-cyan-600 hover:text-cyan-900 flex items-center gap-1"
                                                        >
                                                            <Mail size={16} />
                                                            Enviar Email
                                                        </button>
                                                    ) : (
                                                        <span className="text-gray-400 text-xs">N/A</span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                );
            case 'products':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700">Gestão de Produtos</h2>
                            <button
                                onClick={() => openModal('products')}
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
                                products.map((product) => (
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
                                            <p className="text-sm text-gray-600 mb-2">Estoque: {product.stock_quantity || 0}</p>
                                            <p className="text-lg font-bold text-gray-900 mb-3">
                                                R$ {typeof product.price === 'number' ? product.price.toFixed(2).replace('.', ',') : String(product.price || '0,00')}
                                            </p>
                                            <div className="mb-4">
                                                {product.fake_price && typeof product.fake_price === 'number' && product.fake_price > 0 ? (
                                                    <p className="text-sm text-gray-400 line-through">
                                                        R$ {product.fake_price.toFixed(2).replace('.', ',')}
                                                    </p>
                                                ) : null}
                                                <p className="text-xl font-extrabold text-red-600">
                                                    R$ {typeof product.price === 'number' ? product.price.toFixed(2).replace('.', ',') : String(product.price || '0,00')}
                                                </p>
                                                {product.fake_price && typeof product.fake_price === 'number' && typeof product.price === 'number' && product.fake_price > product.price ? (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                        {Math.round((1 - product.price / product.fake_price) * 100)}% OFF
                                                    </span>
                                                ) : null}
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openModal('products', product)}
                                                    className="flex-1 bg-cyan-600 text-white py-2 rounded-lg hover:bg-cyan-700 transition-colors font-semibold text-sm"
                                                >
                                                    <Edit size={16} className="mx-auto" />
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog('products', product.id, product.name)}
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
                        {invoices.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma nota fiscal cadastrada.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Número</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Emissão</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PDF</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {invoices.map((invoice) => (
                                            <tr key={invoice.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{invoice.invoice_number}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600">{invoice.customer_name}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{invoice.customer_email || '-'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-900 font-semibold">
                                                    R$ {Number(invoice.total_amount).toFixed(2).replace('.', ',')}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(invoice.issue_date).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(invoice.status)}`}>
                                                        {invoice.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm">
                                                    {invoice.pdf_url ? (
                                                        <a href={invoice.pdf_url} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">
                                                            Visualizar PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => openFileSelector(invoice.id, 'invoice')}
                                                            className="flex items-center gap-1 bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                                            title="Adicionar/Atualizar PDF"
                                                        >
                                                            {uploading && uploadingFileType === 'invoice' && uploadingInvoiceId === invoice.id ? (
                                                                <Loader2 className="animate-spin" size={14} />
                                                            ) : (
                                                                <Package size={14} />
                                                            )}
                                                        </button>
                                                        <button
                                                            onClick={() => openModal('invoice', invoice)}
                                                            className="text-cyan-600 hover:text-cyan-900"
                                                        >
                                                            <Edit size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => openDeleteDialog('invoice', invoice.id, invoice.invoice_number)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
                        </div>
                        {partnersList.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma parceria cadastrada.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Empresa</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Informações do Formulário</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {partnersList.map((partner: any) => {
                                            let formData = null
                                            try {
                                                if (partner.form_payload) {
                                                    formData = typeof partner.form_payload === 'string' ? JSON.parse(partner.form_payload) : partner.form_payload
                                                }
                                            } catch (e) {
                                                console.error('Erro ao parsear form_payload:', e)
                                            }
                                            
                                            return (
                                            <tr key={partner.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{partner.company_name || 'Não informado'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{partner.contact_email || '-'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">{partner.contact_phone || '-'}</td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(partner.status)}`}>
                                                        {partner.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {partner.form_type === 'fornecedor' ? 'Fornecedor' : partner.form_type === 'representante' ? 'Representante' : '-'}
                                                </td>
                                                <td className="py-4 px-4 text-sm text-gray-500 max-w-md">
                                                    {formData ? (
                                                        <div className="space-y-1">
                                                            {formData.activeForm === 'fornecedor' && (
                                                                <>
                                                                    {formData.nomeEmpresa && <p><strong>Empresa:</strong> {formData.nomeEmpresa}</p>}
                                                                    {formData.anosMercado && <p><strong>Anos no mercado:</strong> {formData.anosMercado}</p>}
                                                                    {formData.oQueFabrica && <p><strong>O que fabrica:</strong> {formData.oQueFabrica}</p>}
                                                                    {formData.canaisVendaAtuais && <p><strong>Canais de venda:</strong> {formData.canaisVendaAtuais}</p>}
                                                                </>
                                                            )}
                                                            {formData.activeForm === 'representante' && (
                                                                <>
                                                                    {formData.localAtuacao && <p><strong>Local de atuação:</strong> {formData.localAtuacao}</p>}
                                                                    {formData.produtoRevender && <p><strong>Produtos a revender:</strong> {formData.produtoRevender}</p>}
                                                                    {formData.estrategiasVenda && <p><strong>Estratégias de venda:</strong> {formData.estrategiasVenda}</p>}
                                                                </>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        partner.notes || '-'
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {partner.partnership_date ? new Date(partner.partnership_date).toLocaleDateString('pt-BR') : '-'}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <button
                                                        onClick={() => openModal('partner', partner)}
                                                        className="text-cyan-600 hover:text-cyan-900 mr-3"
                                                    >
                                                        <Edit size={18} />
                                                    </button>
                                                    <button
                                                        onClick={() => openDeleteDialog('partner', partner.id, partner.company_name)}
                                                        className="text-red-600 hover:text-red-900"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </td>
                                            </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
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
                        {coupons.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhum cupom cadastrado.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Texto do Carrossel</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Desconto</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Válido até</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Carrossel</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">{coupon.code}</td>
                                                <td className="py-4 px-4 text-sm text-gray-600 max-w-xs truncate" title={coupon.carousel_text || coupon.description || 'Sem texto'}>
                                                    {coupon.carousel_text || coupon.description || '-'}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {coupon.discount_type === 'Percentual' ? `${coupon.discount_value}%` : `R$ ${coupon.discount_value}`}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                    {new Date(coupon.valid_until).toLocaleDateString('pt-BR')}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(coupon.status)}`}>
                                                        {coupon.status}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {coupon.show_in_navbar ? (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                            Sim
                                                        </span>
                                                    ) : (
                                                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                                                            Não
                                                        </span>
                                                    )}
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                );
            case 'content':
                // Agrupar conteúdos por seção
                const contentBySection = siteContent.reduce((acc: any, content) => {
                    const section = content.section || 'Outros';
                    if (!acc[section]) {
                        acc[section] = [];
                    }
                    acc[section].push(content);
                    return acc;
                }, {});

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
                        {siteContent.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhum conteúdo encontrado. Os textos padrão serão usados.</p>
                        ) : (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                {Object.entries(contentBySection).map(([section, contents]: [string, any]) => (
                                    <div key={section} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                                            {section}
                                        </h3>
                                        <div className="space-y-4">
                                            {contents.map((content: SupabaseSiteContent) => (
                                                <div key={content.id} className="bg-white p-4 rounded border border-gray-200">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {content.label || content.content_key}
                                                    </label>
                                                    {content.content_type === 'textarea' ? (
                                                        <textarea
                                                            value={content.value || ''}
                                                            onChange={(e) => {
                                                                const updated = siteContent.map(c =>
                                                                    c.id === content.id ? { ...c, value: e.target.value } : c
                                                                );
                                                                setSiteContent(updated);
                                                            }}
                                                            className="w-full border border-gray-300 rounded-md shadow-sm p-2 h-24"
                                                            placeholder={`Digite o ${content.label.toLowerCase()}...`}
                                                        />
                                                    ) : (
                                                        <input
                                                            type="text"
                                                            value={content.value || ''}
                                                            onChange={(e) => {
                                                                const updated = siteContent.map(c =>
                                                                    c.id === content.id ? { ...c, value: e.target.value } : c
                                                                );
                                                                setSiteContent(updated);
                                                            }}
                                                            className="w-full border border-gray-300 rounded-md shadow-sm p-2"
                                                            placeholder={`Digite o ${content.label.toLowerCase()}...`}
                                                        />
                                                    )}
                                                    <div className="mt-2 flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">Chave: {content.content_key}</span>
                                                        <button
                                                            onClick={() => handleSaveContent(content.id, content.value)}
                                                            className="text-xs text-cyan-600 hover:text-cyan-800 font-medium"
                                                        >
                                                            Salvar este campo
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
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
                                                onClick={() => openFileSelector(purchase.id, 'purchase')}
                                                className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700"
                                                title="Adicionar/Atualizar PDF"
                                            >
                                                {uploading && uploadingFileType === 'purchase' && uploadingPurchaseId === purchase.id ? (
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
            case 'carts':
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <ShoppingCart className="mr-2" size={24} />
                                Carrinhos de Usuários
                            </h2>
                        </div>
                        {userCarts.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhum carrinho encontrado.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produtos</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {userCarts.map((cart: any) => {
                                            const cartItems = cart.items || []
                                            const total = cartItems.reduce((sum: number, item: any) => {
                                                const price = parseFloat(item.price || item.product?.price || '0')
                                                const quantity = item.quantity || 1
                                                return sum + (price * quantity)
                                            }, 0)
                                            
                                            return (
                                                <tr key={cart.id}>
                                                    <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">
                                                        {users.find((u: any) => u.id === cart.user_id)?.name || 'Usuário desconhecido'}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                        {users.find((u: any) => u.id === cart.user_id)?.email || '-'}
                                                    </td>
                                                    <td className="py-4 px-4 text-sm text-gray-500">
                                                        <div className="space-y-1">
                                                            {cartItems.map((item: any, idx: number) => (
                                                                <div key={idx} className="text-xs">
                                                                    {item.product?.name || item.name || 'Produto desconhecido'} - Qtd: {item.quantity || 1}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                                                        R$ {total.toFixed(2).replace('.', ',')}
                                                    </td>
                                                    <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-500">
                                                        {cart.updated_at ? new Date(cart.updated_at).toLocaleDateString('pt-BR') : '-'}
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
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

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-10 gap-3 mb-6">
                    <button onClick={() => setActiveTab('sales')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'sales' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Vendas</button>
                    <button onClick={() => setActiveTab('inventory')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'inventory' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Estoque</button>
                    <button onClick={() => setActiveTab('users')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'users' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Usuários</button>
                    <button onClick={() => setActiveTab('products')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'products' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Produtos</button>
                    <button onClick={() => setActiveTab('invoices')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'invoices' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Notas Fiscais</button>
                    <button onClick={() => setActiveTab('partnerships')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'partnerships' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Parcerias</button>
                    <button onClick={() => setActiveTab('coupons')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'coupons' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Cupons</button>
                    <button onClick={() => setActiveTab('content')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'content' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Textos do Site</button>
                    <button onClick={() => setActiveTab('faq')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'faq' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>FAQ </button>
                    <button onClick={() => setActiveTab('carts')} className={`p-4 rounded-lg font-semibold transition-all duration-200 ${activeTab === 'carts' ? 'bg-cyan-600 text-white shadow-lg scale-105' : 'bg-white text-gray-700 hover:bg-cyan-50'}`}>Carrinhos</button>
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

                {/* Modal de Envio de Email */}
                <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Enviar Email para {selectedUserForEmail?.name || 'Usuário'}</DialogTitle>
                        </DialogHeader>
                        {selectedUserForEmail && (
                            <EmailForm
                                userEmail={selectedUserForEmail.email}
                                userName={selectedUserForEmail.name}
                                onSend={handleSendEmail}
                                onCancel={() => {
                                    setEmailModalOpen(false)
                                    setSelectedUserForEmail(null)
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>
            </main>
        </div>
    )
}