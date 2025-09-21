import Link from 'next/link';
import { Facebook, Instagram, Twitter } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/inicio" className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-blue-900 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">L</span>
              </div>
              <span className="text-xl font-bold">LeoSport</span>
            </Link>
            <p className="text-gray-400 mb-4 max-w-md">
              O maior marketplace de produtos esportivos do Brasil. 
              Conectamos atletas e entusiastas aos melhores produtos e parceiros.
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </Link>
              <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Links Rápidos</h3>
            <ul className="space-y-2">
              <li><Link href="/sobre" className="text-gray-400 hover:text-white transition-colors">Sobre Nós</Link></li>
              <li><Link href="/produtos" className="text-gray-400 hover:text-white transition-colors">Produtos</Link></li>
              <li><Link href="/venda-na-leosport" className="text-gray-400 hover:text-white transition-colors">Seja Parceiro</Link></li>
              <li><Link href="/contato" className="text-gray-400 hover:text-white transition-colors">Contato</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Suporte</h3>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Central de Ajuda</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition-colors">Trocas e Devoluções</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-400">
            © 2025 LeoSport. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}