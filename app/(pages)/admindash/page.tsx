// Adiciona a diretiva no topo. Isto transforma a página num Componente de Cliente,
// o que é essencial para resolver o erro "ssr: false is not allowed".
'use client'

import dynamic from 'next/dynamic'

// Esta função importa dinamicamente o seu componente 'dashboard'.
// A opção 'ssr: false' garante que o componente (com os seus gráficos)
// só será renderizado no browser do utilizador, evitando erros no servidor.
const AdminDashboard = dynamic(
  () => import('@/components/admindash/dashboard'), 
  { 
    ssr: false,
    // A opção 'loading' mostra uma mensagem de carregamento amigável
    // enquanto o componente principal é preparado.
    loading: () => (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-lg text-gray-500">A carregar painel...</p>
      </div>
    )
  }
)

// A página em si é agora muito simples. A sua única responsabilidade
// é renderizar o componente que foi carregado de forma segura.
export default function AdminDashboardPage() {
    return <AdminDashboard />
}

