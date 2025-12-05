'use client';
import { useState, useEffect } from 'react';
import { createProduct, updateProduct, Product, getSiteContent, supabase } from '@/lib/supabase';
import { getCategories } from '@/lib/products-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';

interface Sport {
  id: string;
  name: string;
}

interface ProductRegistrationFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  initialData?: Partial<Product> | null;
  productId?: string | null;
}

export default function ProductRegistrationForm({ onSuccess, onError, initialData = null, productId = null }: ProductRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sports, setSports] = useState<Sport[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);
  const [formData, setFormData] = useState(() => ({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    sku: initialData?.sku ?? '',
    category_id: initialData?.category_id ?? '',
    brand: initialData?.brand ?? '',
    price: initialData?.price ? String((initialData as any).price) : '',
    fake_price: (initialData as any)?.fake_price ? String((initialData as any).fake_price) : '',
    stock_quantity: (initialData as any)?.stock_quantity ? String((initialData as any).stock_quantity) : '',
    weight: (initialData as any)?.weight ?? '',
    dimensions: (initialData as any)?.dimensions ?? '',
    width: (initialData as any)?.width ? String((initialData as any).width) : '',
    height: (initialData as any)?.height ? String((initialData as any).height) : '',
    image_url: (initialData as any)?.image_url ?? '',
    status: (initialData as any)?.status ?? 'Ativo',
    color: (initialData as any)?.color ?? '',
    features: Array.isArray((initialData as any)?.features)
      ? ((initialData as any).features as string[]).join('\n')
      : typeof (initialData as any)?.features === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse((initialData as any).features)
              if (Array.isArray(parsed)) return parsed.join('\n')
            } catch (e) {
              // Se não for JSON, retorna como está
            }
            return (initialData as any).features ?? ''
          })()
        : '',
    specifications: typeof (initialData as any)?.specifications === 'object' && (initialData as any)?.specifications && !Array.isArray((initialData as any)?.specifications)
      ? Object.entries((initialData as any).specifications).map(([k, v]) => `${k}: ${v}`).join('\n')
      : typeof (initialData as any)?.specifications === 'string'
        ? (() => {
            try {
              const parsed = JSON.parse((initialData as any).specifications)
              if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
                return Object.entries(parsed).map(([k, v]) => `${k}: ${v}`).join('\n')
              }
            } catch (e) {
              // Se não for JSON, retorna como está (já está no formato correto)
            }
            return (initialData as any).specifications ?? ''
          })()
        : '',
    no_shipping: (initialData as any)?.no_shipping ?? false,
    devolution_months: (initialData as any)?.devolution_months ? String((initialData as any).devolution_months) : '1',
    warranty_months: (initialData as any)?.warranty_months ? String((initialData as any).warranty_months) : '12',
  }));

  useEffect(() => {
    const loadSports = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select('id, name')
          .order('name', { ascending: true });
        
        if (error) {
          console.error('Erro ao carregar categorias:', error);
          setSports([]);
        } else if (data && data.length > 0) {
          const loadedSports: Sport[] = data.map((category: any) => ({
            id: category.id,
            name: category.name
          }));
          console.log('Sports loaded from categories:', loadedSports);
          setSports(loadedSports);
        } else {
          console.warn('No sports found in categories table');
          setSports([]);
        }
      } catch (err) {
        console.error('Failed to load sports:', err);
        setSports([]);
      } finally {
        setLoadingContent(false);
      }
    };

    loadSports();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value } = target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const parseFeatures = (featuresText: string): string[] =>
    featuresText
      .split('\n')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);

  const parseSpecifications = (specText: string): Record<string, string> => {
    const specs: Record<string, string> = {};
    if (!specText || !specText.trim()) return specs;
    
    specText.split('\n').forEach((line) => {
      const trimmedLine = line.trim();
      if (trimmedLine) {
        const colonIndex = trimmedLine.indexOf(':');
        if (colonIndex > -1) {
          const key = trimmedLine.substring(0, colonIndex).trim();
          const value = trimmedLine.substring(colonIndex + 1).trim();
          if (key && value) {
            specs[key] = value;
          }
        }
      }
    });
    return specs;
  };

  const monthsToText = (months: number | string | undefined) => {
    const m = typeof months === 'string' ? parseInt(months, 10) : months || 0;
    if (!m || isNaN(m)) return '0 meses';
    if (m >= 12) {
      const years = Math.floor(m / 12);
      const rem = m % 12;
      if (rem === 0) return `${years} ${years > 1 ? 'anos' : 'ano'}`;
      return `${years} ${years > 1 ? 'anos' : 'ano'} e ${rem} meses`;
    }
    return `${m} ${m > 1 ? 'meses' : 'mês'}`;
  };

  const calculateDiscount = () => {
    const fake = formData.fake_price ? parseFloat(String(formData.fake_price)) : 0;
    const real = formData.price ? parseFloat(String(formData.price)) : 0;
    if (!fake || !real || fake <= real) return 0;
    return Math.round(((fake - real) / fake) * 100);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Nome do produto é obrigatório')
      return false;
    }
    if (!formData.sku.trim()) {
      setError('SKU é obrigatório');
      return false;
    }
    if (!formData.price || parseFloat(String(formData.price)) <= 0) {
      setError('Preço deve ser maior que zero');
      return false;
    }
    if (!formData.stock_quantity || parseInt(String(formData.stock_quantity)) < 0) {
      setError('Quantidade em estoque deve ser um número não-negativo');
      return false;
    }
    if (formData.fake_price && parseFloat(String(formData.fake_price)) <= parseFloat(String(formData.price))) {
      setError('Preço original (fake) deve ser maior que o preço real para exibir desconto');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      // Converte specifications em JSON string
      const specsObject = parseSpecifications(formData.specifications);
      const specsJson = Object.keys(specsObject).length > 0 ? JSON.stringify(specsObject) : undefined;

      const productData: any = {
        name: formData.name,
        description: formData.description || undefined,
        sku: formData.sku,
        category_id: formData.category_id || undefined,
        brand: formData.brand || undefined,
        price: parseFloat(String(formData.price)),
        fake_price: formData.fake_price ? parseFloat(String(formData.fake_price)) : undefined,
        stock_quantity: parseInt(String(formData.stock_quantity)),
        weight: formData.weight || undefined,
        dimensions: formData.dimensions || undefined,
        width: formData.width ? parseFloat(String(formData.width)) : undefined,
        height: formData.height ? parseFloat(String(formData.height)) : undefined,
        image_url: formData.image_url || undefined,
        color: (formData as any).color || undefined,
        status: formData.status as 'Ativo' | 'Inativo' | 'Esgotado',
        // Salvar features como JSON string de array
        features: formData.features ? JSON.stringify(parseFeatures(formData.features)) : undefined,
        // Salvar specifications como JSON string de objeto
        specifications: specsJson,
        no_shipping: Boolean((formData as any).no_shipping),
        devolution_months: formData.devolution_months ? parseInt(formData.devolution_months, 10) : undefined,
        warranty_months: formData.warranty_months ? parseInt(formData.warranty_months, 10) : undefined,
      };

      if (productId) {
        await updateProduct(productId, productData as Partial<Product>);
        setSuccess(`Produto "${formData.name}" atualizado com sucesso!`);
        onSuccess?.();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        await createProduct(productData as Omit<Product, 'id' | 'created_at' | 'updated_at'>);
        setSuccess(`Produto "${formData.name}" registrado com sucesso!`);
        setFormData({
          name: '',
          description: '',
          sku: '',
          category_id: '',
          brand: '',
          price: '',
          fake_price: '',
          stock_quantity: '',
          weight: '',
          dimensions: '',
          width: '',
          height: '',
          image_url: '',
          status: 'Ativo',
          color: '',
          features: '',
          specifications: '',
          no_shipping: false,
          devolution_months: '1',
          warranty_months: '12',
        });
        onSuccess?.();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Erro ao registrar produto. Tente novamente.';
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getSportNameById = (id: string) => {
    return sports.find(s => s.id === id)?.name || '';
  };

  const featuresPreview = parseFeatures(formData.features);
  const specsPreview = parseSpecifications(formData.specifications);
  const discount = calculateDiscount();

  return (
    <div className="w-full max-w-[1400px] mx-auto p-6 bg-white rounded-lg shadow-lg ring-1 ring-gray-100 overflow-hidden">
      <h1 className="text-3xl font-bold text-gray-900 mb-1">{productId ? 'Editar Produto' : 'Registrar Produto'}</h1>
      <p className="text-sm text-gray-600 mb-6">{productId ? 'Atualize os campos do produto e salve as alterações' : 'Preencha os campos obrigatórios para adicionar um produto'}</p>
      <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto pr-4">
        {error && (
          <div className="flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}
        <Collapsible defaultOpen>
          <div className="border-t pt-4">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Informações Básicas</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-3">
                  <div>
                    <Label htmlFor="name" className="text-sm font-medium text-gray-700 mb-1">Nome do Produto *</Label>
                    <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="sku" className="text-sm font-medium text-gray-700 mb-1">SKU *</Label>
                    <Input id="sku" name="sku" value={formData.sku} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="brand" className="text-sm font-medium text-gray-700 mb-1">Marca</Label>
                    <Input id="brand" name="brand" value={formData.brand} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="category_id" className="text-sm font-medium text-gray-700 mb-1">Esporte / Categoria</Label>
                    <select
                      id="category_id"
                      name="category_id"
                      value={formData.category_id}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                      disabled={loadingContent}
                    >
                      <option value="">
                        {loadingContent ? "Carregando esportes..." : "Escolha um esporte..."}
                      </option>
                      {sports.map((sport) => (
                        <option key={sport.id} value={sport.id}>
                          {sport.name}
                        </option>
                      ))}
                    </select>
                    {formData.category_id && (
                      <p className="text-xs text-gray-500 mt-1">
                        Selecionado: {getSportNameById(formData.category_id)}
                      </p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="color" className="text-sm font-medium text-gray-700 mb-1">Cor</Label>
                    <Input id="color" name="color" value={(formData as any).color} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="status" className="text-sm font-medium text-gray-700 mb-1">Status</Label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full border rounded px-2 py-1"
                    >
                      <option value="Ativo">Ativo</option>
                      <option value="Inativo">Inativo</option>
                      <option value="Esgotado">Esgotado</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-1">Descrição</Label>
                  <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible defaultOpen>
          <div className="border-t pt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Preço & Estoque</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="price" className="text-sm font-medium text-gray-700 mb-1">Preço Real (R$) *</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                  <div>
                    <Label htmlFor="fake_price" className="text-sm font-medium text-gray-700 mb-1">Preço Original / Falso (R$) - riscado</Label>
                    <Input id="fake_price" name="fake_price" type="number" step="0.01" value={formData.fake_price} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="stock_quantity" className="text-sm font-medium text-gray-700 mb-1">Quantidade em Estoque *</Label>
                    <Input id="stock_quantity" name="stock_quantity" type="number" min={0} value={formData.stock_quantity} onChange={handleInputChange} required />
                  </div>
                </div>
                {(formData.fake_price && parseFloat(String(formData.fake_price)) > 0) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg mt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-lg line-through text-gray-500">R$ {parseFloat(String(formData.fake_price)).toFixed(2).replace('.', ',')}</span>
                      <span className="ml-2 text-2xl font-bold text-blue-600">R$ {formData.price ? parseFloat(String(formData.price)).toFixed(2).replace('.', ',') : '0,00'}</span>
                      {discount > 0 && <span className="ml-4 bg-red-600 text-white px-3 py-1 rounded font-bold">-{discount}%</span>}
                    </div>
                  </div>
                )}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible>
          <div className="border-t pt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Especificações Físicas</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight" className="text-sm font-medium text-gray-700 mb-1">Peso (kg)</Label>
                    <Input id="weight" name="weight" value={formData.weight} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="dimensions" className="text-sm font-medium text-gray-700 mb-1">Dimensões (LxAxP em cm)</Label>
                    <Input id="dimensions" name="dimensions" value={formData.dimensions} onChange={handleInputChange} placeholder="30x45x15" />
                  </div>
                  <div>
                    <Label htmlFor="width" className="text-sm font-medium text-gray-700 mb-1">Largura (cm)</Label>
                    <Input id="width" name="width" type="number" step="0.01" value={formData.width} onChange={handleInputChange} />
                  </div>
                  <div>
                    <Label htmlFor="height" className="text-sm font-medium text-gray-700 mb-1">Altura (cm)</Label>
                    <Input id="height" name="height" type="number" step="0.01" value={formData.height} onChange={handleInputChange} />
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible>
          <div className="border-t pt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Imagem</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div>
                  <Label htmlFor="image_url" className="text-sm font-medium text-gray-700 mb-1">URL da Imagem</Label>
                  <Input id="image_url" name="image_url" value={formData.image_url} onChange={handleInputChange} />
                  {formData.image_url && (
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Prévia:</p>
                      <img src={formData.image_url} alt="Prévia" className="max-w-sm h-auto rounded-lg border" onError={(e) => {(e.target as HTMLImageElement).src = 'https://placehold.co/200x200';}} />
                    </div>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible>
          <div className="border-t pt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Recursos e Especificações</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label htmlFor="features" className="text-sm font-medium text-gray-700 mb-1">Recursos (um por linha)</Label>
                    <textarea id="features" name="features" value={formData.features} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border rounded-lg" placeholder="Quadro de alumínio&#10;Suspensão dianteira&#10;Freios a disco" />
                    {featuresPreview.length > 0 && (
                      <div className="mt-3 bg-gray-50 p-3 rounded">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pré-visualização</h4>
                        <ul className="list-disc pl-5 text-gray-700">
                          {featuresPreview.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="specifications" className="text-sm font-medium text-gray-700 mb-1">Especificações Técnicas (chave: valor)</Label>
                    <textarea id="specifications" name="specifications" value={formData.specifications} onChange={handleInputChange} rows={4} className="w-full px-3 py-2 border rounded-lg" placeholder="Quadro: Alumínio 6061&#10;Freios: Disco hidráulico" />
                    {Object.keys(specsPreview).length > 0 && (
                      <div className="mt-3 bg-gray-50 p-3 rounded">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Pré-visualização</h4>
                        <ul className="pl-3 text-gray-700">
                          {Object.entries(specsPreview).map(([k, v]) => (
                            <li key={k}><strong>{k}:</strong> {v}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <Collapsible>
          <div className="border-t pt-3">
            <CollapsibleTrigger asChild>
              <button className="w-full text-left flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-800">Frete, Devolução e Garantia</h2>
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <input id="no_shipping" name="no_shipping" type="checkbox" checked={Boolean((formData as any).no_shipping)} onChange={handleCheckboxChange} className="w-5 h-5 text-blue-600 rounded" />
                    <Label htmlFor="no_shipping" className="text-sm font-medium text-gray-700 cursor-pointer">Frete Grátis</Label>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="devolution_months" className="text-sm font-medium text-gray-700 mb-1">Meses para Devolução *</Label>
                      <Input id="devolution_months" name="devolution_months" type="number" min={0} max={240} value={formData.devolution_months} onChange={handleInputChange} />
                      <p className="text-xs text-gray-500 mt-1">{monthsToText(formData.devolution_months)} para devolução</p>
                    </div>
                    <div>
                      <Label htmlFor="warranty_months" className="text-sm font-medium text-gray-700 mb-1">Meses de Garantia *</Label>
                      <Input id="warranty_months" name="warranty_months" type="number" min={0} max={240} value={formData.warranty_months} onChange={handleInputChange} />
                      <p className="text-xs text-gray-500 mt-1">{monthsToText(formData.warranty_months)} de garantia</p>
                    </div>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        <div className="border-t pt-4 flex gap-3 justify-end">
          <Button type="button" variant="outline" onClick={() => setFormData({
            name: '', description: '', sku: '', category_id: '', brand: '', price: '', fake_price: '', stock_quantity: '', weight: '', dimensions: '', width: '', height: '', image_url: '', status: 'Ativo', color: '', features: '', specifications: '', no_shipping: false, devolution_months: '1', warranty_months: '12'
          })} className="px-4 py-1 text-sm">Limpar</Button>
          <Button type="submit" disabled={loading} className="px-4 py-1 text-sm bg-blue-600 text-white hover:bg-blue-700">{loading ? (productId ? 'Atualizando...' : 'Registrando...') : (productId ? 'Atualizar Produto' : 'Registrar Produto')}</Button>
        </div>
      </form>
    </div>
  );
}