export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'buyer' | 'seller' | 'delivery' | 'admin';
export type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
export type PaymentStatus = 'pending' | 'success' | 'failed';
export type DeliveryStatus = 'available' | 'accepted' | 'en_route' | 'delivered' | 'cancelled';
export type ReviewType = 'product' | 'delivery';

export interface User {
  id: string;
  role: UserRole;
  name: string;
  phone: string;
  city: string;
  gender: string | null;
  cni: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_verified: boolean;
  rating: number;
  total_ratings: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
  description: string | null;
  created_at: string;
}

// @/types/database.ts

export interface ProductImage {
  url: string;
  publicId: string;
  width?: number | null;
  height?: number | null;
}

export interface Seller {
  id: string;
  name: string;
  username?: string;
  phone?: string;
  email?: string;
  city?: string;
  avatar_url?: string | null;
  rating: number;
  total_ratings: number;
  is_verified?: boolean;
}

export interface Product {
  id: number;
  seller_id: string;
  category_id: number;
  title: string;
  description: string | null;
  price: number;
  currency?: string;
  stock: number;
  unit: string | null;
  images: ProductImage[];           // ← tableau d'objets Cloudinary
  main_image?: string | null;       // ← URL de l'image principale (facultatif)
  location_city: string;
  location_coords?: { lat: number; lng: number } | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;

  // Relation incluse par le backend
  seller?: Seller;
}
export interface Order {
  id: number;
  buyer_id: string;
  order_number: string;
  items: Json;
  subtotal: number;
  delivery_fee: number;
  total: number;
  status: OrderStatus;
  payment_status: PaymentStatus;
  delivery_address: string;
  delivery_city: string;
  delivery_coords: Json | null;
  delivery_agency_id: string | null;
  buyer_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Delivery {
  id: number;
  order_id: number;
  agency_id: string | null;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_coords: Json | null;
  delivery_address: string;
  delivery_coords: Json | null;
  estimated_fee: number | null;
  actual_fee: number | null;
  accepted_at: string | null;
  picked_at: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
}

export interface Transaction {
  id: number;
  order_id: number;
  amount: number;
  provider: string;
  status: PaymentStatus;
  payment_reference: string;
  phone_number: string;
  metadata: Json;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  order_id: number;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  type: ReviewType;
  created_at: string;
}
