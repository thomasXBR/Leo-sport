// Global types for LeoSport application

export type UserRole = 'client' | 'partner' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  phone?: string;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  partner_id: string;
  status: 'active' | 'inactive' | 'pending';
  images: string[];
  stock_quantity: number;
  weight: number; // for shipping calculation
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  created_at: string;
  updated_at: string;
}

export interface ProductProposal {
  id: string;
  partner_id: string;
  name: string;
  description: string;
  price: number;
  category_id: string;
  images: string[];
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  total_amount: number;
  shipping_amount: number;
  payment_id?: string;
  tracking_code?: string;
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product: Product;
}

export interface PartnerApplication {
  id: string;
  user_id: string;
  business_name: string;
  business_description: string;
  contact_phone: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_feedback?: string;
  created_at: string;
  updated_at: string;
}

export interface ShippingOption {
  id: number;
  name: string;
  price: number;
  currency?: string;
  delivery_time: number;
  delivery_range?: {
    min: number;
    max: number;
  };
  company: {
    id: number;
    name: string;
    picture: string;
  };
}

// Tipos para integração de pagamento
export interface PaymentPreference {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
  external_reference?: string;
}

export interface PaymentStatus {
  id: string;
  status: 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled' | 'refunded';
  status_detail: string;
  external_reference?: string;
  transaction_amount: number;
  payment_method_id?: string;
  payment_type_id?: string;
  date_created: string;
  date_approved?: string;
}

export interface ShippingTracking {
  id: string;
  protocol: string;
  status: string;
  tracking?: string;
  events?: Array<{
    date: string;
    status: string;
    location?: string;
    description?: string;
  }>;
}