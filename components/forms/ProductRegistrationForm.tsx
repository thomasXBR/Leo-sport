'use client';

import { useState, useEffect } from 'react';
import { createProduct, Product, getCategories, Category } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ProductRegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function ProductRegistrationForm({
  onSuccess,
  onError,
}: ProductRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    category_id: '',
    brand: '',
    fake_price: '',
    price: '',
    stock_quantity: '',
    weight: '',
    dimensions: '',
    image_url: '',
    status: 'Ativo',
    color: '',
    features: '',
    specifications: '',
    no_shipping: false,
    devolution_months: '',
    warranty_months: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Load categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        // getCategories sempre retorna array, nunca lança erro
        setCategories(Array.isArray(cats) ? cats : []);
      } catch (err: any) {
        // Fallback adicional caso algo inesperado aconteça
        console.warn('Unexpected error loading categories:', err);
        setCategories([]);
      }
    };
    loadCategories();
  }, []);

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome do produto é obrigatório');
      return false;
    }
    if (!formData.sku.trim()) {
      setError('SKU é obrigatório');
      return false;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Preço deve ser maior que zero');
      return false;
    }
    if (!formData.stock_quantity || parseInt(formData.stock_quantity) < 0) {
      setError('Quantidade em estoque deve ser um número não-negativo');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Generate random ID for new product
      const randomId = crypto.randomUUID();
      
      const productData = {
        id: randomId,
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        category_id: formData.category_id && formData.category_id.trim() !== '' ? formData.category_id.trim() : undefined,
        brand: formData.brand || undefined,
        price: parseFloat(formData.price),
        fake_price: formData.fake_price ? parseFloat(formData.fake_price) : undefined,
        stock_quantity: parseInt(formData.stock_quantity),
        weight: formData.weight || undefined,
        dimensions: formData.dimensions || undefined,
        image_url: formData.image_url || undefined,
        color: formData.color || undefined,
        features: formData.features || undefined,
        specifications: formData.specifications || undefined,
        no_shipping: formData.no_shipping,
        devolution_months: formData.devolution_months ? parseInt(formData.devolution_months) : undefined,
        warranty_months: formData.warranty_months ? parseInt(formData.warranty_months) : undefined,
        status: formData.status as 'Ativo' | 'Inativo' | 'Esgotado',
      };

      await createProduct(productData as Omit<Product, 'created_at' | 'updated_at'> & { id: string });

      setSuccess(`Produto "${formData.name}" registrado com sucesso!`);
      setFormData({
        name: '',
        description: '',
        sku: '',
        category_id: '',
        brand: '',
        fake_price: '',
        price: '',
        stock_quantity: '',
        weight: '',
        dimensions: '',
        image_url: '',
        status: 'Ativo',
        color: '',
        features: '',
        specifications: '',
        no_shipping: false,
        devolution_months: '',
        warranty_months: '',
      });

      onSuccess?.();

      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao registrar produto. Tente novamente.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Registrar Novo Produto</h1>
      <p className="text-gray-600 mb-6">Preencha todos os campos obrigatórios para adicionar um novo produto ao catálogo</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-green-700">{success}</p>
          </div>
        )}

        {/* Basic Information */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Informações Básicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">
                Nome do Produto *
              </Label>
              <Input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="ex: Bicicleta Mountain Bike"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* SKU */}
            <div>
              <Label htmlFor="sku" className="text-sm font-medium text-gray-700 mb-1">
                SKU *
              </Label>
              <Input
                id="sku"
                name="sku"
                type="text"
                value={formData.sku}
                onChange={handleInputChange}
                placeholder="ex: BIC001"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Brand */}
            <div>
              <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-1">
                Marca
              </Label>
              <Input
                id="brand"
                name="brand"
                type="text"
                value={formData.brand}
                onChange={handleInputChange}
                placeholder="ex: Caloi"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Color */}
            <div>
              <Label htmlFor="color" className="text-sm font-medium text-gray-700 mb-1">
                Cor
              </Label>
              <Input
                id="color"
                name="color"
                type="text"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="ex: Preto, Azul, Vermelho"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category (Sport) */}
            <div>
              <Label htmlFor="category_id" className="text-sm font-medium text-gray-700 mb-1">
                Categoria (Esporte) *
              </Label>
              <Select 
                value={formData.category_id} 
                onValueChange={(value) => handleSelectChange('category_id', value)}
              >
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="" disabled>
                      Nenhuma categoria disponível. Crie categorias no Supabase primeiro.
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="mt-4">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">
              Descrição
            </Label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Descreva os detalhes do produto..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Preço e Estoque</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Fake Price (Strikethrough) */}
            <div>
              <Label htmlFor="fake_price" className="text-sm font-medium text-gray-700 mb-1">
                Preço Falso (R$) - Preço Riscado
              </Label>
              <Input
                id="fake_price"
                name="fake_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.fake_price}
                onChange={handleInputChange}
                placeholder="Preço que será riscado"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Real Price */}
            <div>
              <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1">
                Preço Real (R$) *
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.00"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Stock Quantity */}
            <div>
              <Label htmlFor="stock_quantity" className="text-sm font-medium text-gray-700 mb-1">
                Quantidade em Estoque *
              </Label>
              <Input
                id="stock_quantity"
                name="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={handleInputChange}
                placeholder="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1">
                Status *
              </Label>
              <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ativo">Ativo</SelectItem>
                  <SelectItem value="Inativo">Inativo</SelectItem>
                  <SelectItem value="Esgotado">Esgotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Physical Specifications */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Especificações Físicas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight */}
            <div>
              <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-1">
                Peso (kg)
              </Label>
              <Input
                id="weight"
                name="weight"
                type="text"
                value={formData.weight}
                onChange={handleInputChange}
                placeholder="ex: 15.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Dimensions */}
            <div>
              <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700 mb-1">
                Dimensões (LxAxP em cm)
              </Label>
              <Input
                id="dimensions"
                name="dimensions"
                type="text"
                value={formData.dimensions}
                onChange={handleInputChange}
                placeholder="ex: 180x70x100"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Shipping & Warranty */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Frete e Garantia</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* No Shipping */}
            <div className="flex items-center space-x-2">
              <input
                id="no_shipping"
                name="no_shipping"
                type="checkbox"
                checked={formData.no_shipping}
                onChange={(e) => handleCheckboxChange('no_shipping', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <Label htmlFor="no_shipping" className="text-sm font-medium text-gray-700">
                Sem taxa de frete
              </Label>
            </div>

            {/* Devolution Months */}
            <div>
              <Label htmlFor="devolution_months" className="text-sm font-medium text-gray-700 mb-1">
                Meses para Devolução
              </Label>
              <Input
                id="devolution_months"
                name="devolution_months"
                type="number"
                min="0"
                value={formData.devolution_months}
                onChange={handleInputChange}
                placeholder="ex: 3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Warranty Months */}
            <div>
              <Label htmlFor="warranty_months" className="text-sm font-medium text-gray-700 mb-1">
                Meses de Garantia
              </Label>
              <Input
                id="warranty_months"
                name="warranty_months"
                type="number"
                min="0"
                value={formData.warranty_months}
                onChange={handleInputChange}
                placeholder="ex: 12"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Imagem</h2>
          
          <div>
            <Label htmlFor="image_url" className="text-sm font-medium text-gray-700 mb-1">
              URL da Imagem
            </Label>
            <Input
              id="image_url"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleInputChange}
              placeholder="https://exemplo.com/imagem.jpg"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            {formData.image_url && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Prévia:</p>
                <img
                  src={formData.image_url}
                  alt="Prévia do produto"
                  className="max-w-xs h-auto rounded-lg border border-gray-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/e2e8f0/64748b?text=Erro ao carregar';
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Features & Specifications */}
        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recursos e Especificações Técnicas</h2>
          
          <div className="grid grid-cols-1 gap-4">
            {/* Features */}
            <div>
              <Label htmlFor="features" className="text-sm font-medium text-gray-700 mb-1">
                Recursos (um por linha)
              </Label>
              <textarea
                id="features"
                name="features"
                value={formData.features}
                onChange={handleInputChange}
                placeholder="ex:&#10;Quadro de alumínio resistente&#10;Suspensão dianteira&#10;Freios a disco&#10;Pneus 29&quot; para melhor estabilidade"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Adicione cada recurso em uma nova linha</p>
            </div>

            {/* Technical Specifications */}
            <div>
              <Label htmlFor="specifications" className="text-sm font-medium text-gray-700 mb-1">
                Especificações Técnicas (formato: chave: valor, um por linha)
              </Label>
              <textarea
                id="specifications"
                name="specifications"
                value={formData.specifications}
                onChange={handleInputChange}
                placeholder="ex:&#10;Quadro: Alumínio 6061&#10;Garfo: Suspensão com 100mm de curso&#10;Freios: Disco hidráulico&#10;Marchas: 21 velocidades"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Use o formato: &quot;Nome da Especificação: Valor&quot;</p>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="border-t pt-6 flex gap-4 justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => setFormData({
              name: '',
              description: '',
              sku: '',
              category_id: '',
              brand: '',
              fake_price: '',
              price: '',
              stock_quantity: '',
              weight: '',
              dimensions: '',
              image_url: '',
              status: 'Ativo',
              color: '',
              features: '',
              specifications: '',
              no_shipping: false,
              devolution_months: '',
              warranty_months: '',
            })}
            className="px-6 py-2"
          >
            Limpar
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700"
          >
            {loading ? 'Registrando...' : 'Registrar Produto'}
          </Button>
        </div>
      </form>
    </div>
  );
}
