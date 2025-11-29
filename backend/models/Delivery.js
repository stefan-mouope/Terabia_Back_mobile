let deliveries = []; // In-memory "database"
let nextDeliveryId = 1;

class Delivery {
  constructor(orderId, agencyId, status, pickedAt, deliveredAt) {
    this.id = nextDeliveryId++;
    this.orderId = orderId;
    this.agencyId = agencyId; // ID of the delivery agency who accepted it
    this.status = status || 'available';
    this.pickedAt = pickedAt || null;
    this.deliveredAt = deliveredAt || null;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async create({ orderId, agencyId, status, pickedAt, deliveredAt }) {
    const newDelivery = new Delivery(orderId, agencyId, status, pickedAt, deliveredAt);
    deliveries.push(newDelivery);
    return newDelivery;
  }

  static async find() {
    return deliveries;
  }

  static async findById(id) {
    return deliveries.find(delivery => delivery.id === id);
  }

  static async findAvailable() {
    return deliveries.filter(delivery => delivery.status === 'available');
  }

  static async acceptDelivery(id, agencyId) {
    const delivery = await this.findById(id);
    if (!delivery || delivery.status !== 'available') return null;
    delivery.agencyId = agencyId;
    delivery.status = 'accepted';
    delivery.updatedAt = new Date().toISOString();
    return delivery;
  }

  static async updateStatus(id, newStatus) {
    const delivery = await this.findById(id);
    if (!delivery) return null;
    delivery.status = newStatus;
    if (newStatus === 'en_route' && !delivery.pickedAt) {
      delivery.pickedAt = new Date().toISOString();
    }
    if (newStatus === 'delivered' && !delivery.deliveredAt) {
      delivery.deliveredAt = new Date().toISOString();
    }
    delivery.updatedAt = new Date().toISOString();
    return delivery;
  }
}

module.exports = Delivery;
