// Adiciona a diretiva no topo. Isto transforma a página num Componente de Cliente,
// o que é essencial para resolver o erro "ssr: false is not allowed".
'use client'

import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Loader2 } from 'lucide-react'

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
        <div className="text-center">
          <Loader2 className="animate-spin text-cyan-600 mx-auto mb-4" size={48} />
          <p className="text-lg text-gray-500">A carregar painel...</p>
        </div>
      </div>
    )
  }
)

// A página em si é agora muito simples. A sua única responsabilidade
// é renderizar o componente que foi carregado de forma segura.
export default function AdminDashboardPage() {
    const { user, profile, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading) {
            // Se não há usuário, redireciona para login
            if (!user) {
                router.push('/inicio')
                return
            }

            // Se o usuário não é admin, redireciona para a página inicial
            if (profile?.user_type !== 'admin') {
                router.push('/inicio')
                return
            }
        }
    }, [user, profile, loading, router])

    // Mostrar loading enquanto verifica autenticação
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="text-center">
                    <Loader2 className="animate-spin text-cyan-600 mx-auto mb-4" size={48} />
                    <p className="text-lg text-gray-500">Verificando permissões...</p>
                </div>
            </div>
        )
    }

    // Se não há usuário ou não é admin, não renderiza nada (será redirecionado)
    if (!user || profile?.user_type !== 'admin') {
        return null
    }

    return <AdminDashboard />
}

