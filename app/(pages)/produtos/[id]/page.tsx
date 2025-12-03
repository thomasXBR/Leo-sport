import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Heart, Share2, Star, Truck, Shield, RotateCcw } from 'lucide-react'
import ProductCard from '@/components/products/ProductCard'
import AddToCartButton from '@/components/products/AddToCartButton'
import { getProductById, getProducts, productsData } from '@/lib/products-data'
import { getProductById as getSupabaseProductById, getProducts as getSupabaseProducts } from '@/lib/supabase'
import ReviewForm from '@/components/reviews/review-form'
import ReviewsSection from '@/components/reviews/reviews-section'
import ProductRating from '@/components/reviews/product-rating'

export const dynamicParams = true

interface ProductPageProps {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { id } = await params

  let product = null
  try {
    product = await getSupabaseProductById(id)
  } catch (error: any) {
    if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
      const numericId = parseInt(id, 10)
      if (!isNaN(numericId)) {
        product = getProductById(numericId)
      }
    }
  }

  if (!product) {
    return {
      title: 'Produto não encontrado - LeoSport',
    }
  }

  return {
    title: `${product.name} - LeoSport`,
    description: product.description || '',
    keywords: [product.name, product.category || '', product.brand || '', 'produtos esportivos'],
  }
}

export async function generateStaticParams() {
  try {
    const supabaseProducts = await getSupabaseProducts()
    if (supabaseProducts && supabaseProducts.length > 0) {
      return supabaseProducts.map((product: any) => ({
        id: product.id.toString(),
      }))
    }
  } catch (error: any) {
    console.log('Using mock products for static generation:', error?.message || error)
  }

  return productsData.map((product) => ({
    id: product.id.toString(),
  }))
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params

  const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)

  let product = null
  let isSupabaseProduct = false

  if (isUUID) {
    try {
      product = await getSupabaseProductById(id)
      if (product) {
        isSupabaseProduct = true
      }
    } catch (error: any) {
      const isNotFoundError = error?.code === 'PGRST116' || 
                              error?.message?.includes('No rows') ||
                              error?.message?.includes('not found')
      
      if (isNotFoundError) {
        notFound()
        return
      }
      
      console.error('Error fetching UUID product from Supabase:', error?.message || error)
      notFound()
      return
    }
  } else {
    try {
      product = await getSupabaseProductById(id)
      if (product) {
        isSupabaseProduct = true
      }
    } catch (error: any) {
      const isNotFoundError = error?.code === 'PGRST116' || 
                              error?.message?.includes('No rows') ||
                              error?.message?.includes('not found')
      
      if (!isNotFoundError) {
        console.error('Error fetching product from Supabase:', error?.message || error)
      }
    }

    if (!product) {
      const numericId = parseInt(id, 10)
      if (!isNaN(numericId)) {
        product = getProductById(numericId)
      }
    }
  }

  if (!product) {
    notFound()
    return
  }

  try {
    if (!product || !product.id) {
      notFound()
      return
    }

    const fakePrice = product.fake_price ? parseFloat(String(product.fake_price)) : 0
    const realPrice = typeof product.price === 'number' ? product.price : parseFloat(String(product.price || 0))
    const hasFakePrice = fakePrice > 0 && fakePrice > realPrice
    
    // Parse features: JSON array string (from Supabase) or array (from mock data)
    const parseFeatures = (features: any): string[] => {
      if (Array.isArray(features)) {
        return features
      }
      if (typeof features === 'string' && features.trim()) {
        try {
          // Try to parse as JSON first (new format: ["item1", "item2"])
          const parsed = JSON.parse(features)
          if (Array.isArray(parsed)) return parsed
        } catch (e) {
          // If not JSON, try splitting by newlines (legacy format)
          return features.split('\n').map(f => f.trim()).filter(f => f.length > 0)
        }
      }
      return []
    }
    
    // Parse specifications: JSON object string (from Supabase) or object (from mock data)
    const parseSpecifications = (specs: any): Record<string, string> => {
      // If it's already an object, return as is
      if (typeof specs === 'object' && specs !== null && !Array.isArray(specs)) {
        return specs
      }
      
      // If it's a string, try to parse it
      if (typeof specs === 'string' && specs.trim()) {
        try {
          // Try to parse as JSON first (new format: {"key": "value"})
          const parsed = JSON.parse(specs)
          if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
            return parsed
          }
        } catch (e) {
          // If JSON parse fails, try line-by-line parsing (legacy format)
          // Format: "Chave: Valor\nChave2: Valor2"
          const result: Record<string, string> = {}
          specs.split('\n').forEach((line: string) => {
            const trimmedLine = line.trim()
            if (trimmedLine) {
              const parts = trimmedLine.split(':')
              if (parts.length >= 2) {
                const key = parts[0].trim()
                const value = parts.slice(1).join(':').trim()
                if (key && value) {
                  result[key] = value
                }
              }
            }
          })
          if (Object.keys(result).length > 0) {
            return result
          }
        }
      }
      
      return {}
    }
    
    const normalizedFeatures = parseFeatures(product.features)
    const normalizedSpecs = parseSpecifications(product.specifications)
    
    // Função para converter meses em texto
    const monthsToText = (months: number | string | undefined): string => {
      const m = typeof months === 'string' ? parseInt(months, 10) : months || 0
      if (!m || isNaN(m)) return '0 meses'
      if (m >= 12) {
        const years = Math.floor(m / 12)
        const rem = m % 12
        if (rem === 0) return `${years} ${years > 1 ? 'anos' : 'ano'}`
        return `${years} ${years > 1 ? 'anos' : 'ano'} e ${rem} meses`
      }
      return `${m} ${m > 1 ? 'meses' : 'mês'}`
    }

    const normalizedProduct = {
      id: product.id?.toString?.() ?? '',
      name: product.name ?? 'Produto sem nome',
      category: product.category || (product.categories?.name || 'Sem categoria'),
      price: typeof product.price === 'string'
        ? product.price
        : `R$ ${parseFloat(String(product.price || 0)).toFixed(2).replace('.', ',')}`,
      fake_price: hasFakePrice ? fakePrice : undefined,
      imageUrl: product.imageUrl || product.image_url || 'https://placehold.co/600x600?text=Sem+Imagem',
      description: product.description || '',
      stock: product.stock !== undefined ? product.stock : product.stock_quantity || 0,
      sku: product.sku || '',
      brand: product.brand || '',
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      status: product.status || 'Ativo',
      features: normalizedFeatures,
      specifications: normalizedSpecs,
      no_shipping: product.no_shipping || false,
      warranty_months: product.warranty_months || 12,
      devolution_months: product.devolution_months || 1,
      warrantyText: monthsToText(product.warranty_months),
      devolutionText: monthsToText(product.devolution_months),
    }

    const relatedProducts = productsData
      .filter((p) => p.category === normalizedProduct.category && p.id.toString() !== normalizedProduct.id)
      .slice(0, 4)

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/inicio" className="hover:text-blue-900">
              Início
            </Link>
            <span>/</span>
            <Link href="/produtos" className="hover:text-blue-900">
              Produtos
            </Link>
            <span>/</span>
            <span className="text-gray-900">{normalizedProduct.category}</span>
            <span>/</span>
            <span className="text-gray-900 font-medium">{normalizedProduct.name}</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <div className="mb-6">
          <Link href="/produtos">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              Voltar aos Produtos
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
              <Image
                src={normalizedProduct.imageUrl}
                alt={normalizedProduct.name}
                fill
                className="object-cover"
                priority
              />
              {normalizedProduct.status === 'Esgotado' && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  Esgotado
                </div>
              )}
            </div>

            {/* Additional Images Placeholder */}
            <div className="grid grid-cols-4 gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-square rounded-lg overflow-hidden bg-gray-200">
                  <Image
                    src={normalizedProduct.imageUrl}
                    alt={`${normalizedProduct.name} ${i}`}
                    width={100}
                    height={100}
                    className="w-full h-full object-cover opacity-70"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-gray-500">{normalizedProduct.brand}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm text-gray-500">{normalizedProduct.category}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{normalizedProduct.name}</h1>

              {/* Rating */}
              <div className="mb-4">
                <ProductRating productId={normalizedProduct.id} />
              </div>

              {/* Price with fake_price support */}
              <div className="mb-6">
                {normalizedProduct.fake_price ? (
                  <div className="space-y-2">
                    <div className="text-2xl text-gray-400 line-through">
                      R$ {normalizedProduct.fake_price.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-3xl font-bold text-red-600">
                      {normalizedProduct.price}
                    </div>
                    {normalizedProduct.fake_price && realPrice && (
                      <div className="inline-block bg-red-600 text-white px-3 py-1 rounded font-bold text-sm">
                        -{Math.round(((normalizedProduct.fake_price - realPrice) / normalizedProduct.fake_price) * 100)}% OFF
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-3xl font-bold text-gray-900">{normalizedProduct.price}</div>
                )}
              </div>
            </div>

            {/* Product Description */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descrição</h3>
              <p className="text-gray-700 leading-relaxed">{normalizedProduct.description}</p>
            </div>

            {/* Features */}
            {normalizedProduct.features && normalizedProduct.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Características
                </h3>
                <ul className="space-y-2">
                  {normalizedProduct.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-center gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Specifications */}
            {normalizedProduct.specifications && Object.keys(normalizedProduct.specifications).length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  Especificações Técnicas
                </h3>
                <ul className="space-y-2">
                  {Object.entries(normalizedProduct.specifications).map(([key, value]) => (
                    <li key={key} className="flex items-start gap-2 text-gray-700">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-semibold text-gray-900">{key}:</span> {String(value)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Stock Info */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-3 h-3 ${normalizedProduct.stock > 0 ? 'bg-green-500' : 'bg-red-500'} rounded-full`}></div>
                <span className="text-sm font-medium text-gray-900">
                  {normalizedProduct.stock > 0 ? `${normalizedProduct.stock} unidade${normalizedProduct.stock > 1 ? 's' : ''} em estoque` : 'Produto esgotado'}
                </span>
              </div>
              <p className="text-sm text-gray-600">SKU: {normalizedProduct.sku}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <div className="flex gap-4">
                <AddToCartButton product={normalizedProduct} />
                <Button size="lg" variant="outline" aria-label="Favoritar">
                  <Heart size={20} />
                </Button>
                <Button size="lg" variant="outline" aria-label="Compartilhar">
                  <Share2 size={20} />
                </Button>
              </div>
            </div>

            {/* Shipping Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    {normalizedProduct.no_shipping ? 'Frete Grátis' : 'Frete Calculado'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {normalizedProduct.no_shipping ? 'Para todo o Brasil' : 'Acima de R$ 200'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Garantia</p>
                  <p className="text-sm text-gray-600">{normalizedProduct.warrantyText}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RotateCcw className="w-6 h-6 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">Devolução</p>
                  <p className="text-sm text-gray-600">{normalizedProduct.devolutionText}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <ReviewsSection productId={normalizedProduct.id} />

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} showStock={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
    )
  } catch (error: any) {
    console.error('Error normalizing product data:', error?.message || error)
    notFound()
    return
  }
}