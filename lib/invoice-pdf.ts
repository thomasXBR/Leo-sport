/**
 * Geração de PDF de Notas Fiscais
 * Este arquivo é isolado para evitar que o Next.js analise o jspdf em todas as páginas
 */

import type { Invoice } from './supabase';

/**
 * Gerar PDF da nota fiscal
 * @param invoice - Dados da nota fiscal
 * @returns Blob do PDF gerado
 */
export async function generateInvoicePdf(invoice: Invoice): Promise<Blob> {
  // Verificar se está no client-side
  if (typeof window === 'undefined') {
    throw new Error('Geração de PDF só é suportada no client-side');
  }

  // Importar jsPDF dinamicamente (client-side only)
  // Usar import dinâmico para evitar problemas no build do Next.js
  // jspdf v3 usa named export { jsPDF }
  const { jsPDF } = await import('jspdf');
  
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  let yPos = margin;

  // Cores
  const primaryColor: [number, number, number] = [0, 102, 153]; // Azul
  const darkGray: [number, number, number] = [64, 64, 64];
  const lightGray: [number, number, number] = [200, 200, 200];

  // Cabeçalho
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('NOTA FISCAL', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text('LeoSport - Produtos Esportivos', pageWidth / 2, 30, { align: 'center' });

  yPos = 50;

  // Informações da empresa
  doc.setTextColor(...darkGray);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('EMITENTE', margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text('LeoSport - Produtos Esportivos', margin, yPos);
  yPos += 5;
  doc.text('CNPJ: 00.000.000/0001-00', margin, yPos);
  yPos += 5;
  doc.text('Endereço: Rua Exemplo, 123 - São Paulo, SP', margin, yPos);
  yPos += 5;
  doc.text('CEP: 00000-000 | Tel: (11) 0000-0000', margin, yPos);

  yPos += 10;

  // Informações da nota fiscal
  doc.setFont('helvetica', 'bold');
  doc.text('NOTA FISCAL Nº', pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  doc.setFontSize(16);
  doc.text(invoice.invoice_number, pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  // Data de emissão
  const issueDate = new Date(invoice.issue_date).toLocaleDateString('pt-BR');
  doc.text(`Data de Emissão: ${issueDate}`, margin, yPos);
  
  if (invoice.due_date) {
    const dueDate = new Date(invoice.due_date).toLocaleDateString('pt-BR');
    doc.text(`Data de Vencimento: ${dueDate}`, pageWidth - margin, yPos, { align: 'right' });
  }
  
  yPos += 10;

  // Linha divisória
  doc.setDrawColor(...lightGray);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Dados do cliente
  doc.setFont('helvetica', 'bold');
  doc.text('DESTINATÁRIO', margin, yPos);
  
  yPos += 5;
  doc.setFont('helvetica', 'normal');
  doc.text(`Nome: ${invoice.customer_name}`, margin, yPos);
  yPos += 5;
  
  if (invoice.customer_email) {
    doc.text(`Email: ${invoice.customer_email}`, margin, yPos);
    yPos += 5;
  }
  
  if (invoice.customer_cpf_cnpj) {
    doc.text(`CPF/CNPJ: ${invoice.customer_cpf_cnpj}`, margin, yPos);
    yPos += 5;
  }

  yPos += 10;

  // Linha divisória
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 10;

  // Tabela de itens (simplificada)
  doc.setFont('helvetica', 'bold');
  doc.text('DESCRIÇÃO', margin, yPos);
  doc.text('VALOR TOTAL', pageWidth - margin, yPos, { align: 'right' });
  yPos += 5;
  
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;
  
  doc.setFont('helvetica', 'normal');
  doc.text('Produtos e Serviços', margin, yPos);
  const totalAmount = Number(invoice.total_amount).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
  doc.text(totalAmount, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;

  // Linha divisória
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  // Total
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('TOTAL:', pageWidth - margin - 40, yPos);
  doc.text(totalAmount, pageWidth - margin, yPos, { align: 'right' });
  yPos += 10;

  // Status
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Status: ${invoice.status}`, margin, yPos);
  yPos += 10;

  // Observações
  if (invoice.notes) {
    doc.setFont('helvetica', 'bold');
    doc.text('OBSERVAÇÕES:', margin, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const notesLines = doc.splitTextToSize(invoice.notes, pageWidth - 2 * margin);
    doc.text(notesLines, margin, yPos);
    yPos += notesLines.length * 5;
  }

  yPos += 10;

  // Rodapé
  if (yPos > pageHeight - 30) {
    doc.addPage();
    yPos = margin;
  }

  doc.setDrawColor(...lightGray);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 5;

  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Esta é uma nota fiscal gerada automaticamente pelo sistema LeoSport.', pageWidth / 2, yPos, { align: 'center' });
  yPos += 5;
  doc.text('Para mais informações, entre em contato através do nosso site.', pageWidth / 2, yPos, { align: 'center' });

  // Gerar blob do PDF
  const pdfBlob = doc.output('blob');
  return pdfBlob;
}

