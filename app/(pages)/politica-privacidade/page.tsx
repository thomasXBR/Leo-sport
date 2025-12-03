export default function PoliticaPrivacidadePage() {
    return (
        <div style={{ backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '40px 20px', fontFamily: 'sans-serif' }}>

            {/* Container Principal (Card) */}
            <div style={{
                maxWidth: '1024px',
                margin: '0 auto',
                backgroundColor: '#ffffff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                padding: '40px 60px'
            }}>

                {/* Cabeçalho da Página */}
                <header style={{ marginBottom: '40px', borderBottom: '1px solid #e5e7eb', paddingBottom: '20px' }}>
                    <h1 style={{ color: '#111827', fontSize: '2.25rem', fontWeight: '700', margin: '0 0 10px 0' }}>
                        Política de Privacidade
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        Última atualização: 02/12/2025
                    </p>
                </header>

                {/* Introdução */}
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151', marginBottom: '30px' }}>
                    A <strong>LeoSport</strong> valoriza a privacidade de seus usuários e clientes. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e compartilhamos seus dados pessoais ao utilizar nosso site e serviços.
                </p>

                {/* Seção 1 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        1. Informações que Coletamos
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '15px' }}>
                        Coletamos os seguintes dados pessoais fornecidos diretamente por você para viabilizar a compra e entrega de produtos:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '25px', color: '#4b5563', lineHeight: '1.8' }}>
                        <li style={{ marginBottom: '10px' }}><strong>Dados de Identificação:</strong> Primeiro nome.</li>
                        <li style={{ marginBottom: '10px' }}><strong>Dados de Contato:</strong> Endereço de e-mail e número de telefone (WhatsApp/Celular).</li>
                        <li style={{ marginBottom: '10px' }}><strong>Dados de Entrega:</strong> Endereço completo para envio.</li>
                    </ul>
                </section>

                {/* Seção 2 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        2. Como Utilizamos seus Dados
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '15px' }}>
                        Utilizamos seus dados para as seguintes finalidades:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '25px', color: '#4b5563', lineHeight: '1.8' }}>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Processamento de Pedidos:</strong> Para identificar você, processar sua compra e garantir a entrega dos artigos esportivos.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Comunicação Transacional:</strong> Enviar atualizações sobre o status do pedido, confirmação de pagamento e código de rastreio.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Marketing (Mediante Consentimento):</strong> Apenas se você concordou explicitamente durante o cadastro, enviaremos e-mails com ofertas, novidades e promoções. Você pode cancelar a inscrição a qualquer momento.
                        </li>
                    </ul>
                </section>

                {/* Seção 3 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        3. Compartilhamento com Terceiros
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '20px' }}>
                        Para operar nossa loja, precisamos compartilhar alguns de seus dados com parceiros essenciais. <strong>Não vendemos seus dados para terceiros.</strong>
                    </p>

                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb', marginBottom: '20px' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Processamento de Pagamentos (Mercado Pago)</h3>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                            Utilizamos o Mercado Pago (Checkout Pro) para processar pagamentos. Ao finalizar a compra, seus dados financeiros e de identificação necessários para a transação são processados diretamente pelo ambiente seguro do Mercado Pago. A LeoSport não armazena dados completos de cartão de crédito.
                        </p>
                    </div>

                    <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.1rem', fontWeight: '600', color: '#374151', marginBottom: '10px' }}>Logística e Frete (Melhor Envio)</h3>
                        <p style={{ color: '#4b5563', lineHeight: '1.6', margin: 0 }}>
                            Utilizamos a plataforma Melhor Envio para calcular o frete e gerar etiquetas de envio. Compartilhamos seu nome, telefone e endereço com o Melhor Envio e com a transportadora selecionada para que a entrega seja realizada.
                        </p>
                    </div>
                </section>

                {/* Seção 4 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        4. Seus Direitos (LGPD)
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '15px' }}>
                        Como titular dos dados, você tem direito a:
                    </p>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '25px', color: '#4b5563', lineHeight: '1.8' }}>
                        <li style={{ marginBottom: '8px' }}>Confirmar a existência de tratamento de dados.</li>
                        <li style={{ marginBottom: '8px' }}>Acessar seus dados.</li>
                        <li style={{ marginBottom: '8px' }}>Corrigir dados incompletos, inexatos ou desatualizados.</li>
                        <li style={{ marginBottom: '8px' }}>Revogar o consentimento para recebimento de e-mails de marketing.</li>
                        <li style={{ marginBottom: '8px' }}>Solicitar a exclusão dos seus dados pessoais (exceto quando a manutenção for necessária para cumprimento de obrigação legal).</li>
                    </ul>
                </section>

                {/* Seção 5 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        5. Segurança
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563' }}>
                        Adotamos medidas técnicas para proteger seus dados pessoais contra acessos não autorizados e situações acidentais ou ilícitas.
                    </p>
                </section>

                {/* Seção 6 */}
                <section style={{ marginTop: '50px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        6. Contato
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563' }}>
                        Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato conosco pelo e-mail:<br />
                        <a href="mailto:leonardo@leosport.com.br" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                            leonardo@leosport.com.br
                        </a>
                    </p>
                </section>

            </div>
        </div>
    );
}