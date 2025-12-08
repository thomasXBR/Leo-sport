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
import { PlusCircle, Edit, Trash2, User, Building, FileText, Handshake, Ticket, Type, X, Save, Upload, Loader2, ChevronLeft, ChevronRight, ShoppingCart, Package, DollarSign, Image as ImageIcon, Mail, Menu, X as XIcon, ChevronRight as ChevronRightIcon, CheckCircle, Calendar } from 'lucide-react'
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
    getSales, getSalesDataForChart, getSalesWithItems, getSaleById,
    getInvoices, createInvoice, updateInvoice, deleteInvoice,
    getPartnerships, createPartnership, updatePartnership, deletePartnership,
    getCoupons, createCoupon, updateCoupon, deleteCoupon,
    getSiteContent, updateSiteContent, getFAQs, createFAQ, updateFAQ, deleteFAQ, getPurchases, createPurchase, updatePurchase, deletePurchase,
    getSiteImages, createSiteImage, updateSiteImage, deleteSiteImage,
    getAllUsers, getAllUserCarts, getAllSaleItems,
    uploadInvoicePdf, uploadSiteImage, normalizeInvoicePdfUrl,
    type Product, type Invoice, type Coupon, type Partnership, type SiteContent as SupabaseSiteContent, type FAQ, type Purchase, type SiteImage,
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
    // Padrão true para novos cupons aparecerem no carrossel automaticamente
    const [showInNavbar, setShowInNavbar] = useState(initialData?.show_in_navbar !== undefined ? initialData.show_in_navbar : true)

    // Sempre mostrar o checkbox - a coluna show_in_navbar agora existe no banco
    const hasNavbarSupport = true

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
            // Sempre incluir show_in_navbar agora que a coluna existe no banco
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
    const [pdfFile, setPdfFile] = useState<File | null>(null)
    const [uploadingPdf, setUploadingPdf] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            // Validar tipo de arquivo (PDF)
            if (file.type !== 'application/pdf') {
                alert('Por favor, selecione um arquivo PDF.')
                return
            }
            // Validar tamanho (máximo 5MB)
            const maxSize = 5 * 1024 * 1024 // 5MB
            if (file.size > maxSize) {
                alert('O arquivo PDF deve ter no máximo 5MB.')
                return
            }
            setPdfFile(file)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // Preparar dados para salvar (sem PDF ainda, será feito depois se necessário)
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
            pdf_file: pdfFile, // Passar o arquivo para fazer upload depois
            pdf_url: initialData?.pdf_url || undefined, // Manter URL existente se não houver novo arquivo
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
                <div>
                    <label className="block text-sm font-medium text-gray-700">PDF da Nota Fiscal</label>
                    <div className="mt-1">
                        <input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                            {pdfFile ? `Arquivo selecionado: ${pdfFile.name}` : initialData?.pdf_url ? 'PDF já anexado. Selecione um novo arquivo para substituir.' : 'Tamanho máximo: 5MB'}
                        </p>
                        {initialData?.pdf_url && !pdfFile && (
                            <a
                                href={normalizeInvoicePdfUrl(initialData.pdf_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-2 inline-block text-sm text-cyan-600 hover:underline"
                            >
                                Visualizar PDF atual
                            </a>
                        )}
                    </div>
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400" disabled={uploadingPdf}>
                    Cancelar
                </button>
                <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed" disabled={uploadingPdf}>
                    {uploadingPdf ? (
                        <>
                            <Loader2 size={20} className="inline mr-2 animate-spin" /> Enviando PDF...
                        </>
                    ) : (
                        <>
                            <Save size={20} className="inline mr-2" /> Salvar
                        </>
                    )}
                </button>
            </DialogFooter>
        </form>
    )
}

// Componente de Formulário de Email
const EmailForm = ({ recipient, recipientName, onSend, onCancel }: { recipient: string, recipientName: string, onSend: (to: string, subject: string, message: string) => void, onCancel: () => void }) => {
    const [subject, setSubject] = useState('')
    const [message, setMessage] = useState('')
    const [sending, setSending] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !message) {
            alert('Por favor, preencha todos os campos.')
            return
        }

        setSending(true)
        try {
            await onSend(recipient, subject, message)
            setSubject('')
            setMessage('')
        } catch (error) {
            // Erro já tratado na função handleSendEmail
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
                        type="email"
                        value={recipient}
                        disabled
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 bg-gray-100"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nome: {recipientName}</p>
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
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-48"
                        required
                        placeholder="Digite sua mensagem aqui..."
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button
                    type="button"
                    onClick={onCancel}
                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                    disabled={sending}
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 flex items-center gap-2"
                    disabled={sending}
                >
                    {sending ? (
                        <>
                            <Loader2 className="animate-spin" size={16} />
                            Enviando...
                        </>
                    ) : (
                        <>
                            <Mail size={16} />
                            Enviar Email
                        </>
                    )}
                </button>
            </DialogFooter>
        </form>
    )
}

// Componente de Formulário de Parceria
const PartnerForm = ({ initialData, onSave, onCancel }: { initialData: any, onSave: (data: any) => void, onCancel: () => void }) => {
    const [companyName, setCompanyName] = useState(initialData?.company_name || '')
    const [contactEmail, setContactEmail] = useState(initialData?.contact_email || '')
    const [contactPhone, setContactPhone] = useState(initialData?.contact_phone || '')
    const [status, setStatus] = useState<'Ativo' | 'Inativo' | 'Pendente'>(initialData?.status || 'Pendente')
    const [partnershipDate, setPartnershipDate] = useState(initialData?.partnership_date || new Date().toISOString().split('T')[0])
    const [notes, setNotes] = useState(initialData?.notes || '')

    // Parsear form_payload se existir
    let formPayload = null
    try {
        if (initialData?.form_payload) {
            formPayload = typeof initialData.form_payload === 'string'
                ? JSON.parse(initialData.form_payload)
                : initialData.form_payload
        }
    } catch (e) {
        console.error('Erro ao parsear form_payload:', e)
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        onSave({
            company_name: companyName,
            contact_email: contactEmail,
            contact_phone: contactPhone || undefined,
            status: status,
            partnership_date: partnershipDate,
            notes: notes || undefined,
        })
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                {/* Informações do Formulário Original (Somente Leitura) */}
                {formPayload && (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                        <h3 className="text-sm font-semibold text-gray-700 mb-3">Informações do Formulário de Solicitação</h3>
                        <div className="space-y-2 text-sm">
                            <div className="grid grid-cols-2 gap-2">
                                {formPayload.nome && (
                                    <div>
                                        <span className="font-medium text-gray-600">Nome:</span>
                                        <p className="text-gray-900">{formPayload.nome}</p>
                                    </div>
                                )}
                                {formPayload.email && (
                                    <div>
                                        <span className="font-medium text-gray-600">Email (original):</span>
                                        <p className="text-gray-900">{formPayload.email}</p>
                                    </div>
                                )}
                                {formPayload.telefone && (
                                    <div>
                                        <span className="font-medium text-gray-600">Telefone (original):</span>
                                        <p className="text-gray-900">{formPayload.telefone}</p>
                                    </div>
                                )}
                                {formPayload.activeForm && (
                                    <div>
                                        <span className="font-medium text-gray-600">Tipo de Solicitação:</span>
                                        <p className="text-gray-900">
                                            {formPayload.activeForm === 'fornecedor' ? 'Fornecedor' : 'Representante'}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {formPayload.activeForm === 'fornecedor' && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                    <h4 className="font-semibold text-gray-700 mb-2">Dados do Fornecedor</h4>
                                    <div className="space-y-2">
                                        {formPayload.nomeEmpresa && (
                                            <div>
                                                <span className="font-medium text-gray-600">Nome da Empresa:</span>
                                                <p className="text-gray-900">{formPayload.nomeEmpresa}</p>
                                            </div>
                                        )}
                                        {formPayload.anosMercado && (
                                            <div>
                                                <span className="font-medium text-gray-600">Anos no Mercado:</span>
                                                <p className="text-gray-900">{formPayload.anosMercado}</p>
                                            </div>
                                        )}
                                        {formPayload.oQueFabrica && (
                                            <div>
                                                <span className="font-medium text-gray-600">O que fabrica:</span>
                                                <p className="text-gray-900">{formPayload.oQueFabrica}</p>
                                            </div>
                                        )}
                                        {formPayload.canaisVendaAtuais && (
                                            <div>
                                                <span className="font-medium text-gray-600">Canais de Venda Atuais:</span>
                                                <p className="text-gray-900">{formPayload.canaisVendaAtuais}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formPayload.activeForm === 'representante' && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                    <h4 className="font-semibold text-gray-700 mb-2">Dados do Representante</h4>
                                    <div className="space-y-2">
                                        {formPayload.localAtuacao && (
                                            <div>
                                                <span className="font-medium text-gray-600">Local de Atuação:</span>
                                                <p className="text-gray-900">{formPayload.localAtuacao}</p>
                                            </div>
                                        )}
                                        {formPayload.produtoRevender && (
                                            <div>
                                                <span className="font-medium text-gray-600">Produtos a Revender:</span>
                                                <p className="text-gray-900">{formPayload.produtoRevender}</p>
                                            </div>
                                        )}
                                        {formPayload.estrategiasVenda && (
                                            <div>
                                                <span className="font-medium text-gray-600">Estratégias de Venda:</span>
                                                <p className="text-gray-900">{formPayload.estrategiasVenda}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {formPayload.submittedAt && (
                                <div className="mt-3 pt-3 border-t border-gray-300">
                                    <span className="font-medium text-gray-600">Data de Envio:</span>
                                    <p className="text-gray-900">
                                        {new Date(formPayload.submittedAt).toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Campos Editáveis */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Nome da Empresa *</label>
                    <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Email de Contato *</label>
                    <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone de Contato</label>
                    <input
                        type="tel"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                        placeholder="(00) 00000-0000"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Status *</label>
                        <select
                            value={status}
                            onChange={(e) => setStatus(e.target.value as 'Ativo' | 'Inativo' | 'Pendente')}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        >
                            <option value="Pendente">Pendente</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Inativo">Inativo</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Data da Parceria *</label>
                        <input
                            type="date"
                            value={partnershipDate}
                            onChange={(e) => setPartnershipDate(e.target.value)}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                            required
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Observações</label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 h-20"
                        placeholder="Observações adicionais sobre a parceria (opcional)"
                    />
                </div>
            </div>
            <DialogFooter className="mt-6">
                <button type="button" onClick={onCancel} className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400">
                    Cancelar
                </button>
                <button type="submit" className="bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700">
                    <Save size={20} className="inline mr-2" /> Salvar Parceria
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
    // Requests submitted via the public "venda-na-leosport" form
    // These are partnership applications pending admin review
    const [partnershipRequests, setPartnershipRequests] = useState<any[]>([])
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [siteContent, setSiteContent] = useState<SupabaseSiteContent[]>([])
    const [faqs, setFaqs] = useState<FAQ[]>([])
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [siteImages, setSiteImages] = useState<SiteImage[]>([])
    const [users, setUsers] = useState<any[]>([])
    const [salesWithItems, setSalesWithItems] = useState<any[]>([])
    const [purchasedItems, setPurchasedItems] = useState<any[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [emailModalOpen, setEmailModalOpen] = useState(false)
    const [selectedUserForEmail, setSelectedUserForEmail] = useState<any>(null)
    const [filterAcceptedTerms, setFilterAcceptedTerms] = useState(false)

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
        labels: [''],
        datasets: [{
            label: 'Vendas (R$)',
            data: [0],
            backgroundColor: '#0891b2',
            borderRadius: 5,
        }],
    })
    const [chartGranularity, setChartGranularity] = useState<'day' | 'month' | 'year'>('month')

    // Accept a pending partnership request: update status to 'Ativo' in Supabase
    const handleAcceptPartnership = async (requestId: string) => {
        const partnership = partnershipRequests.find((p: any) => p.id === requestId)
        const partnershipName = partnership?.company_name || partnership?.nomeEmpresa || 'Esta parceria'

        if (!confirm(`Tem certeza que deseja ACEITAR a solicitação de parceria de "${partnershipName}"?`)) {
            return
        }

        try {
            await updatePartnership(requestId, { status: 'Ativo' })
            // Recarregar dados para manter sincronização
            await loadAllData()
            alert(`Parceria de "${partnershipName}" aceita e ativada com sucesso!`)
        } catch (err) {
            console.error('Erro ao aceitar parceria:', err)
            alert('Erro ao aceitar parceria. Confira o console.')
        }
    }

    // Reject a pending partnership request: marcar como 'Inativo' (ou usar deletePartnership conforme sua política)
    const handleRejectPartnership = async (requestId: string) => {
        const partnership = partnershipRequests.find((p: any) => p.id === requestId)
        const partnershipName = partnership?.company_name || partnership?.nomeEmpresa || 'Esta parceria'

        if (!confirm(`Tem certeza que deseja RECUSAR a solicitação de parceria de "${partnershipName}"? Esta ação pode ser revertida depois.`)) {
            return
        }

        try {
            await updatePartnership(requestId, { status: 'Inativo' })
            await loadAllData()
            alert(`Solicitação de parceria de "${partnershipName}" foi recusada.`)
        } catch (err) {
            console.error('Erro ao recusar parceria:', err)
            alert('Erro ao recusar parceria. Confira o console.')
        }
    }

    // Estados dos modais
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [modalType, setModalType] = useState<'invoice' | 'partner' | 'coupon' | 'product' | 'inventory' | 'faq' | 'purchase' | null>(null)
    const [editingItem, setEditingItem] = useState<any>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [itemToDelete, setItemToDelete] = useState<{ type: string; id: string; name: string } | null>(null)
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [uploadingPurchaseId, setUploadingPurchaseId] = useState<string | null>(null)
    const [uploadingInvoiceId, setUploadingInvoiceId] = useState<string | null>(null)
    const [uploadingFileType, setUploadingFileType] = useState<'purchase' | 'invoice' | 'site-image' | null>(null)
    const [uploading, setUploading] = useState(false)
    const [uploadingImageId, setUploadingImageId] = useState<string | null>(null)
    const imageInputRef = useRef<HTMLInputElement | null>(null)
    const [cartModalOpen, setCartModalOpen] = useState(false)
    const [selectedUserCart, setSelectedUserCart] = useState<any>(null)
    const [realtimeUserCart, setRealtimeUserCart] = useState<any[]>([])

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: 'top' as const },
            title: { display: true, text: 'Performance de Vendas' },
        },
        scales: {
            y: {
                ticks: {
                    // Exibe labels em passos de 1000
                    stepSize: 1000,
                    callback: (value: any) => `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`,
                },
                beginAtZero: true,
            },
        },
    }

    // Helpers para estatísticas de vendas
    const getTopBuyers = (list: any[], limit = 5) => {
        const totals: Record<string, { name: string; email: string; total: number; orders: number }> = {}
            ; (list || []).forEach((sale: any) => {
                const email = sale.customer_email || 'N/D'
                const name = sale.customer_name || email || 'N/D'
                const key = email || name
                const total = Number(sale.total_amount || 0)
                if (!totals[key]) totals[key] = { name, email, total: 0, orders: 0 }
                totals[key].total += total
                totals[key].orders += 1
            })
        return Object.values(totals)
            .sort((a, b) => b.total - a.total)
            .slice(0, limit)
    }

    const getLatestPurchases = (list: any[], limit = 5) => {
        return (list || [])
            .slice()
            .sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime())
            .slice(0, limit)
    }

    const getBestSellers = (items: any[], limit = 5) => {
        const totals: Record<string, { name: string; quantity: number }> = {}
            ; (items || []).forEach((item: any) => {
                const name = item.product_name || item.product?.name || 'Produto'
                const qty = Number(item.quantity || 0)
                if (!totals[name]) totals[name] = { name, quantity: 0 }
                totals[name].quantity += qty
            })
        return Object.values(totals)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, limit)
    }

    const openFileSelector = (id: string, type: 'purchase' | 'invoice' | 'site-image') => {
        if (type === 'purchase') {
            setUploadingPurchaseId(id)
        } else if (type === 'invoice') {
            setUploadingInvoiceId(id)
        } else if (type === 'site-image') {
            setUploadingImageId(id)
        }
        setUploadingFileType(type)
        // trigger native file selector
        if (type === 'site-image') {
            imageInputRef.current?.click()
        } else {
            fileInputRef.current?.click()
        }
    }

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const purchaseId = uploadingPurchaseId
        const invoiceId = uploadingInvoiceId
        const fileType = uploadingFileType
        if (!file || (!purchaseId && !invoiceId) || !fileType || fileType === 'site-image') return
        setUploading(true)
        try {
            const id = fileType === 'purchase' ? purchaseId : invoiceId
            if (!id) return

            // Obter o ID do usuário autenticado para definir como owner (apenas para invoices)
            let ownerId: string | undefined
            if (fileType === 'invoice') {
                const { data: { user }, error: userError } = await supabase.auth.getUser()
                if (userError || !user) {
                    throw new Error('Usuário não autenticado. É necessário estar logado para fazer upload de PDFs.')
                }
                ownerId = user.id
            }

            // Upload to Supabase Storage
            const bucketName = fileType === 'purchase' ? 'purchases-pdfs' : 'invoices'
            const folderName = fileType === 'purchase' ? 'purchases' : 'invoices'
            const path = `${folderName}/${id}/${Date.now()}_${file.name}`

            // Para invoices, incluir owner no metadata conforme políticas do Supabase
            const uploadOptions: any = { upsert: true }
            if (fileType === 'invoice' && ownerId) {
                uploadOptions.metadata = { owner: ownerId }
            }

            const { error: uploadError } = await supabase.storage.from(bucketName).upload(path, file, uploadOptions)
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
        } catch (err: any) {
            console.error('Erro ao enviar PDF:', err)
            alert(`Erro ao enviar PDF: ${err.message || 'Verifique o console.'}`)
        } finally {
            setUploading(false)
            setUploadingPurchaseId(null)
            setUploadingInvoiceId(null)
            setUploadingFileType(null)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        const imageId = uploadingImageId
        if (!file || !imageId || uploadingFileType !== 'site-image') return

        setUploading(true)
        try {
            // Buscar o registro da imagem para obter a image_key
            const imageRecord = siteImages.find(img => img.id === imageId)
            if (!imageRecord) {
                alert('Erro: Imagem não encontrada.')
                return
            }

            // Fazer upload usando a função do supabase.ts que usa o bucket 'imgs'
            const publicUrl = await uploadSiteImage(file, imageRecord.image_key)

            // Atualizar o registro da imagem com a nova URL
            await updateSiteImage(imageId, { image_url: publicUrl })

            // Recarregar dados
            await loadAllData()
            alert('Imagem enviada com sucesso!')
        } catch (err: any) {
            console.error('Erro ao enviar imagem:', err)
            if (err.message?.includes('Bucket not found') || err.message?.includes('does not exist')) {
                alert('Erro: O bucket "imgs" não existe. Por favor, verifique se ele foi criado no Supabase Dashboard > Storage.')
            } else {
                alert(`Erro ao enviar imagem: ${err.message || 'Erro desconhecido'}`)
            }
        } finally {
            setUploading(false)
            setUploadingImageId(null)
            setUploadingFileType(null)
            if (imageInputRef.current) imageInputRef.current.value = ''
        }
    }

    // Atualiza dados do gráfico de vendas de acordo com granularidade
    function updateSalesChart(salesList: any[], granularity: 'day' | 'month' | 'year') {
        if (!salesList || salesList.length === 0) {
            setSalesData(prev => ({
                ...prev,
                labels: ['Sem dados'],
                datasets: [{ ...prev.datasets[0], data: [0] }]
            }))
            return
        }

        const buckets: Record<string, number> = {}

        salesList
            .filter((s: any) => s.status === 'Pago')
            .forEach((sale: any) => {
                const date = new Date(sale.created_at)
                let key = ''
                if (granularity === 'day') {
                    key = date.toLocaleDateString('pt-BR') // dd/mm/aaaa
                } else if (granularity === 'month') {
                    const month = date.toLocaleDateString('pt-BR', { month: 'short' })
                    key = `${month.toUpperCase()}/${date.getFullYear()}`
                } else {
                    key = `${date.getFullYear()}`
                }
                const total = Number(sale.total_amount || 0)
                buckets[key] = (buckets[key] || 0) + total
            })

        // Garantir que o dia atual apareça mesmo sem vendas
        if (granularity === 'day') {
            const todayKey = new Date().toLocaleDateString('pt-BR')
            if (!(todayKey in buckets)) {
                buckets[todayKey] = 0
            }
        }

        // Ordenar por data
        const labels = Object.keys(buckets).sort((a, b) => {
            const parse = (label: string) => {
                if (granularity === 'day') {
                    const [d, m, y] = label.split('/').map(Number)
                    return new Date(y, m - 1, d).getTime()
                }
                if (granularity === 'month') {
                    const [mon, yStr] = label.split('/')
                    const y = Number(yStr)
                    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ']
                    const m = months.indexOf(mon.toUpperCase())
                    return new Date(y, m >= 0 ? m : 0, 1).getTime()
                }
                return new Date(Number(label), 0, 1).getTime()
            }
            return parse(a) - parse(b)
        })

        const data = labels.map(l => Number(buckets[l]?.toFixed(2) || 0))

        setSalesData(prev => ({
            ...prev,
            labels,
            datasets: [{
                ...prev.datasets[0],
                label: granularity === 'day' ? 'Vendas diárias (R$)' : granularity === 'month' ? 'Vendas mensais (R$)' : 'Vendas anuais (R$)',
                data,
            }]
        }))
    }

    // Carregar dados do Supabase
    useEffect(() => {
        loadAllData()
    }, [])

    async function loadAllData() {
        try {
            setLoading(true)
            // Carregar apenas os dados essenciais inicialmente
            const [productsData, inventoryData, salesDataResp, invoicesData, partnersData, couponsData, contentData, faqsData, purchasesData, imagesData, usersData, salesWithItemsData, purchasedItemsData] = await Promise.all([
                getProducts().catch(() => []),
                getInventoryItems().catch(() => []),
                getSales().catch(() => []),
                getInvoices().catch(() => []),
                getPartnerships().catch(() => []),
                getCoupons().catch(() => []),
                getSiteContent().catch(() => []),
                getFAQs().catch(() => []),
                getPurchases().catch(() => []),
                getSiteImages().catch(() => []),
                getAllUsers().catch(() => []),
                getSalesWithItems().catch(() => []),
                getAllSaleItems().catch(() => []),
            ])

            setProducts(productsData || [])
            setInventoryItems(inventoryData || [])
            setSales(salesDataResp || [])
            setInvoices(invoicesData || [])
            // Separar solicitações pendentes das parcerias ativas/inativas
            const allPartners = partnersData || []
            // Filtrar por status 'Pendente' e ordenar por data de criação (mais recentes primeiro)
            const pending = (allPartners || [])
                .filter((p: any) => p.status === 'Pendente')
                .sort((a: any, b: any) => {
                    const dateA = new Date(a.created_at || 0).getTime()
                    const dateB = new Date(b.created_at || 0).getTime()
                    return dateB - dateA // Mais recentes primeiro
                })
            const others = allPartners.filter((p: any) => p.status !== 'Pendente')
            setPartnershipRequests(pending || [])
            setPartnersList(others || [])
            setCoupons(couponsData || [])
            setSiteContent(contentData || [])
            setFaqs(faqsData || [])
            setPurchases(purchasesData || [])
            setSiteImages(imagesData || [])
            setUsers(usersData || [])
            setSalesWithItems(salesWithItemsData || [])
            setPurchasedItems(purchasedItemsData || [])

            // Recalcular gráfico com as vendas carregadas
            updateSalesChart(salesDataResp || [], chartGranularity)
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

    // Função para abrir modal do carrinho do usuário
    const handleViewUserCart = async (user: any) => {
        setSelectedUserCart(user)
        setCartModalOpen(true)

        // Buscar carrinho do usuário
        try {
            const { data, error } = await supabase
                .from('user_carts')
                .select('*, product:products(*, categories:categories(*))')
                .eq('user_id', user.id)
                .order('updated_at', { ascending: false })

            if (error) throw error
            setRealtimeUserCart(data || [])
        } catch (error) {
            console.error('Erro ao buscar carrinho do usuário:', error)
            setRealtimeUserCart([])
        }
    }

    // Configurar realtime para o carrinho do usuário selecionado
    useEffect(() => {
        if (!selectedUserCart?.id) return

        const channel = supabase
            .channel(`user_cart_${selectedUserCart.id}`)
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'user_carts',
                    filter: `user_id=eq.${selectedUserCart.id}`
                },
                async (payload) => {
                    console.log('Atualização em tempo real do carrinho:', payload)

                    // Recarregar carrinho do usuário
                    try {
                        const { data, error } = await supabase
                            .from('user_carts')
                            .select('*, product:products(*, categories:categories(*))')
                            .eq('user_id', selectedUserCart.id)
                            .order('updated_at', { ascending: false })

                        if (error) throw error
                        setRealtimeUserCart(data || [])
                    } catch (error) {
                        console.error('Erro ao atualizar carrinho:', error)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [selectedUserCart?.id])

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
                case 'site-image':
                    await deleteSiteImage(itemToDelete.id)
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
            let invoiceId: string
            let pdfUrl = formData.pdf_url || undefined

            if (editingItem) {
                // Editar invoice existente
                invoiceId = editingItem.id

                // Se houver um novo arquivo PDF, fazer upload
                if (formData.pdf_file) {
                    setUploading(true)
                    try {
                        pdfUrl = await uploadInvoicePdf(formData.pdf_file, invoiceId)
                    } catch (error: any) {
                        console.error('Erro ao fazer upload do PDF:', error)
                        alert(`Erro ao fazer upload do PDF: ${error.message || 'Tente novamente.'}`)
                        setUploading(false)
                        return
                    } finally {
                        setUploading(false)
                    }
                }

                // Atualizar invoice
                const updateData: any = {
                    invoice_number: formData.invoice_number,
                    order_id: formData.order_id || undefined,
                    customer_name: formData.customer_name,
                    customer_email: formData.customer_email || undefined,
                    customer_cpf_cnpj: formData.customer_cpf_cnpj || undefined,
                    total_amount: typeof formData.total_amount === 'string'
                        ? parseFloat(formData.total_amount.replace(/[^\d.,]/g, '').replace(',', '.')) || 0
                        : formData.total_amount || 0,
                    status: formData.status || 'Pendente',
                    issue_date: formData.issue_date || new Date().toISOString().split('T')[0],
                    due_date: formData.due_date || undefined,
                    notes: formData.notes || undefined,
                }
                if (pdfUrl) updateData.pdf_url = pdfUrl

                await updateInvoice(editingItem.id, updateData)
                setInvoices(invoices.map(i => i.id === editingItem.id ? { ...i, ...updateData } : i))
            } else {
                // Criar nova invoice
                const invoiceNumber = formData.invoice_number || `NF${Date.now().toString().slice(-6)}`
                const invoiceData: any = {
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
                }

                // Criar invoice primeiro para obter o ID
                const newInvoice = await createInvoice(invoiceData)
                invoiceId = newInvoice.id

                // Gerar PDF automaticamente se não houver um arquivo PDF fornecido
                if (!formData.pdf_file) {
                    setUploading(true)
                    try {
                        // Gerar PDF da nota fiscal (importação dinâmica)
                        const { generateInvoicePdf } = await import('@/lib/invoice-pdf')
                        const pdfBlob = await generateInvoicePdf({ ...newInvoice, ...invoiceData })

                        // Converter Blob para File
                        const pdfFile = new File([pdfBlob], `nota_fiscal_${invoiceData.invoice_number}.pdf`, {
                            type: 'application/pdf'
                        })

                        // Fazer upload do PDF gerado
                        pdfUrl = await uploadInvoicePdf(pdfFile, invoiceId)

                        // Atualizar invoice com a URL do PDF
                        await updateInvoice(invoiceId, { pdf_url: pdfUrl })
                        invoiceData.pdf_url = pdfUrl
                    } catch (error: any) {
                        console.error('Erro ao gerar PDF da nota fiscal:', error)
                        alert(`Erro ao gerar PDF: ${error.message || 'Tente novamente.'}`)
                        setUploading(false)
                        // Continuar mesmo se houver erro na geração do PDF
                    } finally {
                        setUploading(false)
                    }
                } else {
                    // Se houver um novo arquivo PDF fornecido, fazer upload
                    setUploading(true)
                    try {
                        pdfUrl = await uploadInvoicePdf(formData.pdf_file, invoiceId)

                        // Atualizar invoice com a URL do PDF
                        await updateInvoice(invoiceId, { pdf_url: pdfUrl })
                        invoiceData.pdf_url = pdfUrl
                    } catch (error: any) {
                        console.error('Erro ao fazer upload do PDF:', error)
                        alert(`Erro ao fazer upload do PDF: ${error.message || 'Tente novamente.'}`)
                        setUploading(false)
                        return
                    } finally {
                        setUploading(false)
                    }
                }

                setInvoices([{ ...newInvoice, ...invoiceData }, ...invoices])
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
                // Sempre incluir show_in_navbar na atualização
                couponData.show_in_navbar = formData.show_in_navbar !== undefined ? formData.show_in_navbar : true
                await updateCoupon(editingItem.id, couponData)
                // Recarregar dados do Supabase para garantir sincronização
                const updatedCoupons = await getCoupons()
                setCoupons(updatedCoupons || [])
            } else {
                // Criar novo cupom - agora sempre com show_in_navbar
                const newCouponData: any = {
                    ...couponData,
                    usage_count: 0,
                    status: formData.status || 'Ativo',
                    // Sempre incluir show_in_navbar (padrão true se não especificado)
                    show_in_navbar: formData.show_in_navbar !== undefined ? formData.show_in_navbar : true,
                }
                await createCoupon(newCouponData)
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

    const handleSavePartner = async (formData: any) => {
        try {
            if (editingItem) {
                // Atualizar parceria existente
                await updatePartnership(editingItem.id, formData)
                // Recarregar dados do Supabase para garantir sincronização
                const updatedPartners = await getPartnerships()
                setPartnersList(updatedPartners || [])
                alert('Parceria atualizada com sucesso!')
            } else {
                // Criar nova parceria
                const newPartner = await createPartnership({
                    company_name: formData.company_name,
                    contact_email: formData.contact_email,
                    contact_phone: formData.contact_phone || undefined,
                    status: formData.status || 'Pendente',
                    partnership_date: formData.partnership_date || new Date().toISOString().split('T')[0],
                    notes: formData.notes || undefined,
                })
                setPartnersList([newPartner, ...partnersList])
                alert('Parceria criada com sucesso!')
            }
            closeModal()
            loadAllData()
        } catch (error: any) {
            console.error('Erro ao salvar parceria:', error)
            const errorMessage = error?.message || error?.details || error?.hint || 'Erro desconhecido ao salvar parceria'
            alert(`Erro ao salvar parceria: ${errorMessage}`)
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

    const handleSendEmail = async (to: string, subject: string, message: string) => {
        try {
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
                    to,
                    subject,
                    message,
                    html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
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
            alert(error.message || 'Erro ao enviar email. Tente novamente.')
        }
    }

    useEffect(() => {
        updateSalesChart(sales, chartGranularity)
    }, [sales, chartGranularity])

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
            case 'inventory':
                modalTitle = isEdit ? 'Editar Movimentação' : 'Nova Movimentação de Estoque'
                modalContent = <p>Formulário de Estoque Pendente</p>
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
            case 'partner':
                modalTitle = isEdit ? 'Editar Parceria' : 'Adicionar Nova Parceria'
                modalContent = (
                    <PartnerForm
                        initialData={editingItem}
                        onSave={handleSavePartner}
                        onCancel={closeModal}
                    />
                )
                break
            default:
                break
        }

        return (
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className={modalType === 'coupon' || modalType === 'invoice' || modalType === 'partner' ? 'sm:max-w-[900px] max-h-[90vh] overflow-y-auto' : 'sm:max-w-[425px]'}>
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
                const topBuyers = getTopBuyers(sales, 5)
                const latestPurchases = getLatestPurchases(salesWithItems, 5)
                const bestSellers = getBestSellers(purchasedItems, 5)

                return (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-2xl font-semibold text-gray-700">Análise de Vendas</h2>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-600">Agrupar por:</span>
                                <select
                                    value={chartGranularity}
                                    onChange={(e) => setChartGranularity(e.target.value as 'day' | 'month' | 'year')}
                                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                                >
                                    <option value="day">Dia</option>
                                    <option value="month">Mês</option>
                                    <option value="year">Ano</option>
                                </select>
                            </div>
                        </div>
                        <div className="relative h-[400px]">
                            <Bar options={chartOptions} data={salesData} />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Maiores compradores</h3>
                                {topBuyers.length === 0 ? (
                                    <p className="text-sm text-gray-500">Sem dados</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {topBuyers.map((buyer, idx) => (
                                            <li key={idx} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{buyer.name}</p>
                                                    <p className="text-xs text-gray-500">{buyer.email}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-800">R$ {buyer.total.toFixed(2).replace('.', ',')}</p>
                                                    <p className="text-xs text-gray-500">{buyer.orders} {buyer.orders === 1 ? 'pedido' : 'pedidos'}</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Últimas compras</h3>
                                {latestPurchases.length === 0 ? (
                                    <p className="text-sm text-gray-500">Sem dados</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {latestPurchases.map((sale: any) => (
                                            <li key={sale.id} className="flex items-center justify-between">
                                                <div>
                                                    <p className="font-semibold text-gray-800">{sale.customer_name || 'Cliente'}</p>
                                                    <p className="text-xs text-gray-500">{new Date(sale.created_at).toLocaleString('pt-BR')}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-semibold text-gray-800">R$ {Number(sale.total_amount || 0).toFixed(2).replace('.', ',')}</p>
                                                    <p className="text-xs text-gray-500">{(sale.sale_items || []).length} itens</p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>

                            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">Produtos mais vendidos</h3>
                                {bestSellers.length === 0 ? (
                                    <p className="text-sm text-gray-500">Sem dados</p>
                                ) : (
                                    <ul className="space-y-3">
                                        {bestSellers.map((prod, idx) => (
                                            <li key={idx} className="flex items-center justify-between">
                                                <p className="font-semibold text-gray-800">{prod.name}</p>
                                                <p className="text-sm text-gray-700">{prod.quantity} un.</p>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
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
                const usersToShow = filterAcceptedTerms
                    ? users.filter((u: any) => u.accept_terms === true)
                    : users
                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <User className="mr-2" size={24} />
                                Usuários
                            </h2>
                            <div className="flex items-center gap-4">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={filterAcceptedTerms}
                                        onChange={(e) => setFilterAcceptedTerms(e.target.checked)}
                                        className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">
                                        Apenas usuários que aceitaram termos
                                    </span>
                                </label>
                            </div>
                        </div>
                        {usersToShow.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">
                                {filterAcceptedTerms
                                    ? 'Nenhum usuário que aceitou os termos encontrado.'
                                    : 'Nenhum usuário encontrado.'}
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full bg-white">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aceitou Termos</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data de Criação</th>
                                            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {usersToShow.map((user: any) => (
                                            <tr key={user.id} className={user.accept_terms ? 'bg-green-50' : ''}>
                                                <td className="py-4 px-4 whitespace-nowrap font-medium text-gray-900">
                                                    {user.name || '-'}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm text-gray-600">
                                                    {user.email || '-'}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.user_type === 'admin' ? 'bg-red-100 text-red-800' :
                                                        user.user_type === 'vendedor' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                        }`}>
                                                        {user.user_type || 'N/A'}
                                                    </span>
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap">
                                                    {user.accept_terms ? (
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
                                                    <div className="flex gap-2 items-center">
                                                        {user.accept_terms && user.email ? (
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedUserForEmail(user)
                                                                    setEmailModalOpen(true)
                                                                }}
                                                                className="text-cyan-600 hover:text-cyan-900 flex items-center gap-1"
                                                                title="Enviar email para o usuário"
                                                            >
                                                                <Mail size={16} />
                                                                Email
                                                            </button>
                                                        ) : (
                                                            <span className="text-gray-400 text-xs">N/A</span>
                                                        )}
                                                        <button
                                                            onClick={() => handleViewUserCart(user)}
                                                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                                                            title="Ver carrinho do usuário em tempo real"
                                                        >
                                                            <ShoppingCart size={16} />
                                                            Carrinho
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
                                            <p className="text-lg font-bold text-gray-900 mb-3">
                                                R$ {product.price.toFixed(2).replace('.', ',')}
                                            </p>
                                            <div className="mb-4">
                                                {product.fake_price && product.fake_price > 0 ? (
                                                    <p className="text-sm text-gray-400 line-through">
                                                        R$ {product.fake_price.toFixed(2).replace('.', ',')}
                                                    </p>
                                                ) : null}
                                                <p className="text-xl font-extrabold text-red-600">
                                                    R$ {product.price.toFixed(2).replace('.', ',')}
                                                </p>
                                                {product.fake_price && product.fake_price > product.price ? (
                                                    <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold bg-red-100 text-red-800 rounded-full">
                                                        {Math.round((1 - product.price / product.fake_price) * 100)}% OFF
                                                    </span>
                                                ) : null}
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
                                                        <a href={normalizeInvoicePdfUrl(invoice.pdf_url)} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">
                                                            Visualizar PDF
                                                        </a>
                                                    ) : (
                                                        <span className="text-gray-400">-</span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4 whitespace-nowrap text-sm font-medium">
                                                    <div className="flex items-center gap-2">


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
                        {/* Pending partnership requests submitted from the public form */}
                        {partnershipRequests.length > 0 && (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
                                            {partnershipRequests.length}
                                        </span>
                                        Solicitações Pendentes de Parceria
                                    </h3>
                                    <span className="text-sm text-gray-500">
                                        {new Date().toLocaleDateString('pt-BR')}
                                    </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {partnershipRequests.map((req: any) => {
                                        // Parsear form_payload se necessário
                                        let parsedData: any = {}
                                        if (req.form_payload) {
                                            try {
                                                parsedData = JSON.parse(req.form_payload)
                                            } catch (e) {
                                                console.error('Erro ao parsear form_payload:', e)
                                            }
                                        }

                                        // Determinar tipo de parceria
                                        const partnershipType = req.form_type || parsedData.activeForm || 'fornecedor'
                                        const isFornecedor = partnershipType === 'fornecedor'

                                        // Obter dados do formulário
                                        const nomeEmpresa = req.company_name || parsedData.nomeEmpresa || parsedData.nome || 'Não informado'
                                        const email = req.contact_email || parsedData.email || 'Não informado'
                                        const telefone = req.contact_phone || parsedData.telefone || '-'
                                        const dataSolicitacao = req.created_at ? new Date(req.created_at).toLocaleDateString('pt-BR') : '-'

                                        return (
                                            <div key={req.id} className="p-5 border-2 border-yellow-200 rounded-lg bg-gradient-to-br from-white to-yellow-50 shadow-md hover:shadow-lg transition-all">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-gray-900 text-lg mb-1">{nomeEmpresa}</h4>
                                                        <span className={`inline-block px-2 py-1 text-xs rounded-full font-semibold ${isFornecedor
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-purple-100 text-purple-800'
                                                            }`}>
                                                            {isFornecedor ? 'Fornecedor' : 'Representante'}
                                                        </span>
                                                    </div>
                                                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                                                        Pendente
                                                    </span>
                                                </div>

                                                <div className="space-y-2 mb-4 text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <Mail size={14} className="text-gray-400" />
                                                        <span className="text-gray-600">{email}</span>
                                                    </div>
                                                    {telefone && telefone !== '-' && (
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-gray-400">📞</span>
                                                            <span className="text-gray-600">{telefone}</span>
                                                        </div>
                                                    )}
                                                    <div className="flex items-center gap-2">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        <span className="text-gray-500 text-xs">Solicitado em: {dataSolicitacao}</span>
                                                    </div>
                                                </div>

                                                <div className="border-t pt-3 mb-4">
                                                    {isFornecedor ? (
                                                        <div className="text-sm text-gray-700 space-y-2">
                                                            {parsedData.anosMercado && (
                                                                <div>
                                                                    <strong className="text-gray-800">Anos no mercado:</strong>
                                                                    <p className="text-gray-600">{parsedData.anosMercado} anos</p>
                                                                </div>
                                                            )}
                                                            {parsedData.oQueFabrica && (
                                                                <div>
                                                                    <strong className="text-gray-800">O que fabrica:</strong>
                                                                    <p className="text-gray-600 line-clamp-2">{parsedData.oQueFabrica}</p>
                                                                </div>
                                                            )}
                                                            {parsedData.canaisVendaAtuais && (
                                                                <div>
                                                                    <strong className="text-gray-800">Canais de venda:</strong>
                                                                    <p className="text-gray-600 line-clamp-2">{parsedData.canaisVendaAtuais}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="text-sm text-gray-700 space-y-2">
                                                            {parsedData.localAtuacao && (
                                                                <div>
                                                                    <strong className="text-gray-800">Área de atuação:</strong>
                                                                    <p className="text-gray-600">{parsedData.localAtuacao}</p>
                                                                </div>
                                                            )}
                                                            {parsedData.produtoRevender && (
                                                                <div>
                                                                    <strong className="text-gray-800">Produto a revender:</strong>
                                                                    <p className="text-gray-600 line-clamp-2">{parsedData.produtoRevender}</p>
                                                                </div>
                                                            )}
                                                            {parsedData.estrategiasVenda && (
                                                                <div>
                                                                    <strong className="text-gray-800">Estratégias de venda:</strong>
                                                                    <p className="text-gray-600 line-clamp-2">{parsedData.estrategiasVenda}</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-2 mt-4">
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => handleAcceptPartnership(req.id)}
                                                            className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <CheckCircle size={16} />
                                                            Aceitar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRejectPartnership(req.id)}
                                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                                        >
                                                            <X size={16} />
                                                            Recusar
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            setSelectedUserForEmail({ email, name: nomeEmpresa })
                                                            setEmailModalOpen(true)
                                                        }}
                                                        className="w-full bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center justify-center gap-2 text-sm"
                                                    >
                                                        <Mail size={14} />
                                                        Enviar Email
                                                    </button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )}

                        {partnershipRequests.length === 0 && (
                            <div className="mb-8 p-6 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 text-center">
                                <Handshake className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-600 font-medium">Nenhuma solicitação pendente no momento</p>
                                <p className="text-sm text-gray-500 mt-1">As novas solicitações da página de vendas aparecerão aqui</p>
                            </div>
                        )}

                        {partnersList.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma parceria cadastrada.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {partnersList.map((partner: any) => {
                                    // Tentar obter o tipo de parceria do form_type ou form_payload
                                    let partnershipType = partner.form_type || 'N/A'
                                    if (!partnershipType && partner.form_payload) {
                                        try {
                                            const payload = JSON.parse(partner.form_payload)
                                            if (payload.activeForm) {
                                                partnershipType = payload.activeForm === 'fornecedor' ? 'Fornecedor' : 'Representante'
                                            }
                                        } catch (e) {
                                            // Se não conseguir parsear, usar form_type ou 'N/A'
                                        }
                                    }
                                    const displayType = partnershipType === 'fornecedor' ? 'Fornecedor' :
                                        partnershipType === 'representante' ? 'Representante' :
                                            partnershipType || 'N/A'

                                    return (
                                        <div key={partner.id} className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex justify-between items-start mb-2">
                                                <h3 className="font-semibold text-gray-800">{partner.company_name}</h3>
                                                <span className={`px-2 py-1 text-xs rounded-full font-semibold ${displayType === 'Fornecedor' ? 'bg-blue-100 text-blue-800' :
                                                    displayType === 'Representante' ? 'bg-purple-100 text-purple-800' :
                                                        'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {displayType}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-1">Email: {partner.contact_email}</p>
                                            <p className="text-sm text-gray-600 mb-3">Telefone: {partner.contact_phone || '-'}</p>
                                            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${getStatusClass(partner.status)}`}>
                                                {partner.status}
                                            </span>
                                            <div className="mt-4 flex gap-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedUserForEmail({ email: partner.contact_email, name: partner.company_name })
                                                        setEmailModalOpen(true)
                                                    }}
                                                    className="flex-1 bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 text-sm font-medium flex items-center justify-center gap-2"
                                                >
                                                    <Mail size={14} />
                                                    Email
                                                </button>
                                                <button
                                                    onClick={() => openModal('partner', partner)}
                                                    className="flex-1 text-cyan-600 hover:text-cyan-800 text-sm font-medium"
                                                >
                                                    <Edit size={16} className="inline mr-1" />
                                                    Editar
                                                </button>
                                                <button
                                                    onClick={() => openDeleteDialog('partnership', partner.id, partner.company_name)}
                                                    className="flex-1 text-red-600 hover:text-red-800 text-sm font-medium"
                                                >
                                                    <Trash2 size={16} className="inline mr-1" />
                                                    Deletar
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
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
            case 'images':
                // Agrupar imagens por seção
                const imagesBySection = siteImages.reduce((acc: any, image) => {
                    const section = image.section || 'Outros';
                    if (!acc[section]) {
                        acc[section] = [];
                    }
                    acc[section].push(image);
                    return acc;
                }, {});

                return (
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-semibold text-gray-700 flex items-center">
                                <ImageIcon className="mr-2" size={24} />
                                Edição de Imagens do Site
                            </h2>
                        </div>
                        {siteImages.length === 0 ? (
                            <p className="text-center py-8 text-gray-500">Nenhuma imagem encontrada. As imagens padrão serão usadas.</p>
                        ) : (
                            <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                                {Object.entries(imagesBySection).map(([section, images]: [string, any]) => (
                                    <div key={section} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                        <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-300">
                                            {section}
                                        </h3>
                                        <div className="space-y-4">
                                            {images.map((image: SiteImage) => (
                                                <div key={image.id} className="bg-white p-4 rounded border border-gray-200">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        {image.label}
                                                    </label>
                                                    <div className="mb-3">
                                                        {image.image_url ? (
                                                            <div className="relative w-full max-w-md h-48 border border-gray-300 rounded-lg overflow-hidden">
                                                                <img
                                                                    src={image.image_url}
                                                                    alt={image.alt_text || image.label}
                                                                    className="w-full h-full object-contain"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div className="w-full max-w-md h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                                                                <p className="text-gray-500">Nenhuma imagem carregada</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <button
                                                            onClick={() => openFileSelector(image.id, 'site-image')}
                                                            disabled={uploading && uploadingImageId === image.id}
                                                            className="flex items-center gap-2 bg-cyan-600 text-white px-4 py-2 rounded-lg hover:bg-cyan-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {uploading && uploadingImageId === image.id ? (
                                                                <>
                                                                    <Loader2 className="animate-spin" size={16} />
                                                                    <span>Enviando...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload size={16} />
                                                                    <span>{image.image_url ? 'Trocar Imagem' : 'Upload Imagem'}</span>
                                                                </>
                                                            )}
                                                        </button>
                                                        {image.image_url && (
                                                            <a
                                                                href={image.image_url}
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                                                            >
                                                                Visualizar
                                                            </a>
                                                        )}
                                                        <button
                                                            onClick={() => openDeleteDialog('site-image', image.id, image.label || image.image_key || 'Imagem')}
                                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                    <div className="mt-2">
                                                        <span className="text-xs text-gray-500">Chave: {image.image_key}</span>
                                                        {image.description && (
                                                            <p className="text-xs text-gray-500 mt-1">{image.description}</p>
                                                        )}
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
                                                    <a href={normalizeInvoicePdfUrl(purchase.pdf_url)} target="_blank" rel="noreferrer" className="text-cyan-600 hover:underline">Visualizar PDF</a>
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex space-x-2 flex-shrink-0">
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


    const menuItems = [
        { id: 'sales', label: 'Vendas', icon: DollarSign },
        { id: 'inventory', label: 'Estoque', icon: Package },
        { id: 'users', label: 'Usuários', icon: User },
        { id: 'products', label: 'Produtos', icon: ShoppingCart },
        { id: 'invoices', label: 'Notas Fiscais', icon: FileText },
        { id: 'partnerships', label: 'Parcerias', icon: Handshake },
        { id: 'coupons', label: 'Cupons', icon: Ticket },
        { id: 'content', label: 'Textos do Site', icon: Type },
        { id: 'images', label: 'Imagens', icon: ImageIcon },
        { id: 'faq', label: 'FAQ', icon: FileText },
        { id: 'purchases', label: 'Compras', icon: Package },
    ]

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-cyan-900 text-white transition-all duration-300 flex flex-col fixed h-screen`}>
                <div className="p-4 flex items-center justify-between border-b border-cyan-800">
                    {sidebarOpen && <h1 className="text-xl font-bold">Painel Admin</h1>}
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 hover:bg-cyan-800 rounded-lg transition-colors"
                    >
                        {sidebarOpen ? <XIcon size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                <nav className="flex-1 overflow-y-auto p-2">
                    {menuItems.map((item) => {
                        const Icon = item.icon
                        return (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`w-full flex items-center gap-3 p-3 rounded-lg mb-1 transition-all duration-200 ${activeTab === item.id
                                    ? 'bg-cyan-700 text-white shadow-lg'
                                    : 'text-cyan-100 hover:bg-cyan-800'
                                    }`}
                                title={!sidebarOpen ? item.label : ''}
                            >
                                <Icon size={20} className="flex-shrink-0" />
                                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
                            </button>
                        )
                    })}
                </nav>
            </aside>

            {/* Main Content */}
            <main className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'} p-4 sm:p-6`}>
                <div className="bg-white rounded-lg p-6 shadow-lg min-h-[calc(100vh-2rem)]">
                    {renderTabContent()}
                </div>

                {/* hidden file input used for attaching PDFs to purchases */}
                <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                {/* hidden file input used for uploading site images */}
                <input ref={imageInputRef} type="file" accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" onChange={handleImageUpload} />

                {/* Modais de Edição */}
                {renderModals()}

                {/* Modal de Envio de Email */}
                <Dialog open={emailModalOpen} onOpenChange={setEmailModalOpen}>
                    <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                            <DialogTitle>Enviar Email</DialogTitle>
                        </DialogHeader>
                        {selectedUserForEmail && (
                            <EmailForm
                                recipient={selectedUserForEmail.email || selectedUserForEmail}
                                recipientName={selectedUserForEmail.name || selectedUserForEmail.email || 'Usuário'}
                                onSend={handleSendEmail}
                                onCancel={() => {
                                    setEmailModalOpen(false)
                                    setSelectedUserForEmail(null)
                                }}
                            />
                        )}
                    </DialogContent>
                </Dialog>

                {/* Modal de Carrinho do Usuário */}
                <Dialog open={cartModalOpen} onOpenChange={(open) => {
                    setCartModalOpen(open)
                    if (!open) {
                        setSelectedUserCart(null)
                        setRealtimeUserCart([])
                    }
                }}>
                    <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <ShoppingCart size={24} className="text-cyan-600" />
                                Carrinho de {selectedUserCart?.name || 'Usuário'}
                                <span className="text-sm font-normal text-gray-500 ml-2">
                                    (Atualização em tempo real)
                                </span>
                            </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            {selectedUserCart && (
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <p className="text-sm text-gray-600">
                                        <strong>Email:</strong> {selectedUserCart.email}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <strong>ID do Usuário:</strong> {selectedUserCart.id}
                                    </p>
                                </div>
                            )}

                            {realtimeUserCart.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingCart size={48} className="mx-auto text-gray-300 mb-3" />
                                    <p className="text-gray-500">O carrinho está vazio</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {realtimeUserCart.map((item: any) => {
                                        const product = item.product
                                        const productPrice = typeof product?.price === 'number'
                                            ? product.price
                                            : parseFloat(String(product?.price || '0').replace(/[^\d,.-]/g, '').replace(',', '.'))
                                        const totalPrice = productPrice * item.quantity

                                        return (
                                            <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4 flex gap-4">
                                                {product?.image_url && (
                                                    <Image
                                                        src={product.image_url}
                                                        alt={product.name || 'Produto'}
                                                        width={80}
                                                        height={80}
                                                        className="w-20 h-20 object-cover rounded"
                                                    />
                                                )}
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-gray-800">
                                                        {product?.name || 'Produto não encontrado'}
                                                    </h4>
                                                    <p className="text-sm text-gray-500">
                                                        SKU: {product?.sku || 'N/A'}
                                                    </p>
                                                    <p className="text-sm text-gray-500">
                                                        Categoria: {product?.categories?.name || product?.category || 'N/A'}
                                                    </p>
                                                    <div className="mt-2 flex items-center gap-4">
                                                        <p className="text-sm font-medium text-gray-700">
                                                            Quantidade: <span className="font-bold">{item.quantity}</span>
                                                        </p>
                                                        <p className="text-sm font-medium text-gray-700">
                                                            Preço unitário: <span className="font-bold">R$ {productPrice.toFixed(2).replace('.', ',')}</span>
                                                        </p>
                                                    </div>
                                                    <p className="text-lg font-bold text-cyan-600 mt-2">
                                                        Total: R$ {totalPrice.toFixed(2).replace('.', ',')}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        Atualizado em: {new Date(item.updated_at).toLocaleString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    })}

                                    {/* Total do Carrinho */}
                                    <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4 mt-4">
                                        <div className="flex justify-between items-center">
                                            <span className="text-lg font-semibold text-gray-700">Total do Carrinho:</span>
                                            <span className="text-2xl font-bold text-cyan-600">
                                                R$ {realtimeUserCart.reduce((total, item) => {
                                                    const product = item.product
                                                    const productPrice = typeof product?.price === 'number'
                                                        ? product.price
                                                        : parseFloat(String(product?.price || '0').replace(/[^\d,.-]/g, '').replace(',', '.'))
                                                    return total + (productPrice * item.quantity)
                                                }, 0).toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-500 mt-2">
                                            Total de itens: {realtimeUserCart.reduce((sum, item) => sum + item.quantity, 0)}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <button
                                onClick={() => {
                                    setCartModalOpen(false)
                                    setSelectedUserCart(null)
                                    setRealtimeUserCart([])
                                }}
                                className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
                            >
                                Fechar
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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