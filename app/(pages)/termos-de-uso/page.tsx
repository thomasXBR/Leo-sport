export default function TermosDeUsoPage() {
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
                        Termos de Uso
                    </h1>
                    <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>
                        Última atualização: 02/12/2025
                    </p>

                </header>

                {/* Introdução */}
                <p style={{ fontSize: '1.1rem', lineHeight: '1.8', color: '#374151', marginBottom: '30px' }}>
                    <p style={{ color: '#1f2937', fontSize: '1.1rem' }}>
                        Bem-vindo à LeoSport. Estes são os termos para compras em nosso site.
                    </p> <br></br>
                    Ao acessar nosso site e comprar nossos produtos, você concorda com os termos descritos abaixo. Leia atentamente as condições antes de finalizar sua compra.
                </p>

                {/* Seção 1 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        1. Cadastro e Conta
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '15px' }}>
                        Para realizar compras, o usuário deve preencher um cadastro com informações verídicas e atualizadas (Nome, E-mail, Telefone). A segurança da senha de acesso é de responsabilidade exclusiva do usuário.
                    </p>
                </section>

                {/* Seção 2 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        2. Produtos e Disponibilidade
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563', marginBottom: '15px' }}>
                        A LeoSport envida todos os esforços para exibir as cores e características dos produtos com precisão. No entanto, pequenas variações podem ocorrer dependendo do monitor do usuário. Todos os produtos estão sujeitos à disponibilidade de estoque.
                    </p>
                </section>

                {/* Seção 3 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        3. Preços e Pagamentos
                    </h2>
                    <div style={{ backgroundColor: '#f9fafb', padding: '25px', borderRadius: '8px', border: '1px solid #e5e7eb' }}>
                        <ul style={{ listStyleType: 'none', padding: 0, margin: 0, color: '#4b5563', lineHeight: '1.8' }}>
                            <li style={{ marginBottom: '15px' }}>
                                <strong>Alteração de Preços:</strong> Os preços estão sujeitos a alterações sem aviso prévio.
                            </li>
                            <li style={{ marginBottom: '15px' }}>
                                <strong>Processamento (Mercado Pago):</strong> O pagamento é processado através da plataforma Mercado Pago (Checkout Pro). Aceitamos as formas de pagamento disponibilizadas por esta ferramenta (Cartão de Crédito, PIX, Boleto, etc.).
                            </li>
                            <li>
                                <strong>Aprovação:</strong> A confirmação do pedido está sujeita à aprovação do pagamento pelo Mercado Pago.
                            </li>
                        </ul>
                    </div>
                </section>

                {/* Seção 4 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        4. Entrega e Frete
                    </h2>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '25px', color: '#4b5563', lineHeight: '1.8' }}>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Cálculo:</strong> O cálculo de frete e o prazo de entrega são estimados pela plataforma Melhor Envio, baseados no CEP fornecido pelo cliente.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Prazo:</strong> O prazo de entrega começa a contar a partir da confirmação do pagamento e do despacho do produto.
                        </li>
                        <li style={{ marginBottom: '12px' }}>
                            <strong>Responsabilidade:</strong> A LeoSport não se responsabiliza por atrasos decorrentes de greves, falhas das transportadoras ou eventos de força maior, embora nos comprometamos a auxiliar o cliente na resolução de problemas com a entrega.
                        </li>
                    </ul>
                </section>

                {/* Seção 5 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        5. Trocas e Devoluções
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563' }}>
                        Para qualquer arrependimento na compra de um produto ou defeito na entrega, entre em contato conosco através do e-mail de suporte:<br />
                        <a href="mailto:leonardo@leosport.com.br" style={{ color: '#2563eb', textDecoration: 'none', fontWeight: '600' }}>
                            leonardo@leosport.com.br
                        </a>
                    </p>
                </section>

                {/* Seção 6 */}
                <section style={{ marginBottom: '40px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        6. Propriedade Intelectual
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563' }}>
                        Todo o conteúdo do site (imagens, textos, logotipos da LeoSport) é propriedade exclusiva da empresa e não pode ser reproduzido sem autorização prévia.
                    </p>
                </section>

                {/* Seção 7 */}
                <section style={{ marginTop: '50px', borderTop: '1px solid #e5e7eb', paddingTop: '30px' }}>
                    <h2 style={{ color: '#1f2937', fontSize: '1.5rem', fontWeight: '600', marginBottom: '20px' }}>
                        7. Foro
                    </h2>
                    <p style={{ lineHeight: '1.8', color: '#4b5563' }}>
                        Fica eleito o foro da comarca de <strong>São Paulo/SP</strong> para dirimir quaisquer dúvidas oriundas destes Termos de Uso.
                    </p>
                </section>

            </div>
        </div>
    );
}