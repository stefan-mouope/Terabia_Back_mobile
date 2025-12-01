// services/orderService.ts

import { API_BASE_URL } from "@/constants/api";


export interface OrderItem {
  product_id: number;
  quantity: number;
  price: number;
  unit: string;
}

export interface CreateOrderData {
  buyer_id: string;
  seller_id: string;
  total_amount: number;
  delivery_fee: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  payment_method: 'mobile_money' | 'cash_on_delivery' | 'card';
  payment_status: 'pending' | 'paid' | 'failed';
  delivery_address: string;
  items: OrderItem[];
}

export interface Order extends CreateOrderData {
  id: number;
  created_at: string;
  updated_at: string;
}

class OrderService {
  private baseUrl = `${API_BASE_URL}/orders`;

  /**
   * Créer une nouvelle commande
   */
  async createOrder(orderData: CreateOrderData): Promise<Order> {
    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Obtenir une commande par ID
   */
  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  /**
   * Obtenir toutes les commandes d'un acheteur
   */
  async getOrdersByBuyerId(buyerId: string): Promise<Order[]> {
    try {
      const response = await fetch(`${this.baseUrl}/buyer/${buyerId}`);

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une commande
   */
  async updateOrder(orderId: number, updateData: Partial<CreateOrderData>): Promise<Order> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        throw new Error('Failed to update order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  /**
   * Annuler une commande
   */
  async cancelOrder(orderId: number): Promise<Order> {
    return this.updateOrder(orderId, { status: 'cancelled' });
  }

  /**
   * Obtenir toutes les commandes
   */
  async getAllOrders(): Promise<Order[]> {
    try {
      const response = await fetch(this.baseUrl);

      if (!response.ok) {
        throw new Error('Failed to fetch all orders');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching all orders:', error);
      throw error;
    }
  }

  /**
   * Supprimer une commande
   */
  async deleteOrder(orderId: number): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/${orderId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete order');
      }

      return await response.json();
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  }
}

export const orderService = new OrderService();