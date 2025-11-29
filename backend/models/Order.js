let orders = []; // In-memory "database"
let nextOrderId = 1;

class Order {
  constructor(buyerId, items, total, status, paymentStatus, deliveryAgencyId) {
    this.id = nextOrderId++;
    this.buyerId = buyerId;
    this.items = items; // Array of { productId, qty, price }
    this.total = total;
    this.status = status || 'pending';
    this.paymentStatus = paymentStatus || 'pending';
    this.deliveryAgencyId = deliveryAgencyId || null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async create({ buyerId, items, total, status, paymentStatus, deliveryAgencyId }) {
    const newOrder = new Order(buyerId, items, total, status, paymentStatus, deliveryAgencyId);
    orders.push(newOrder);
    return newOrder;
  }

  static async find() {
    return orders;
  }

  static async findById(id) {
    return orders.find(order => order.id === id);
  }

  static async updateStatus(id, newStatus) {
    const order = await this.findById(id);
    if (!order) return null;
    order.status = newStatus;
    order.updatedAt = new Date().toISOString();
    return order;
  }

  static async findByCriteria({ buyerId, sellerId, status }) {
    let filteredOrders = [...orders];

    if (buyerId) {
      filteredOrders = filteredOrders.filter(order => order.buyerId === parseInt(buyerId));
    }
    // Note: To filter by sellerId, we'd need to join with product data
    // For this in-memory model, we'll simplify and assume a direct sellerId lookup isn't feasible without product details in the order item.
    // In a real DB, you'd perform a join.

    if (status) {
      filteredOrders = filteredOrders.filter(order => order.status === status);
    }

    return filteredOrders;
  }
}

module.exports = Order;
