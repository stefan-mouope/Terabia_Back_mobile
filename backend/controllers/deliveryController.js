// backend/controllers/deliveryController.js

const { Delivery, Order } = require('../models');
const { DELIVERY_STATUS, ORDER_STATUS } = require('../constants/enums'); 
const { updateOrderStatus } = require('../services/orderService'); // ✔️ version backend "pure"

/**
 * NOUVELLE FONCTION : Crée un enregistrement de livraison à partir d'un objet Order.
 * Elle est appelée par orderController.createOrder.
 */
exports.createDeliveryFromOrder = async (order, transaction) => {
  const deliveryData = {
    order_id: order.id,
    agency_id: null, 
    status: DELIVERY_STATUS.AVAILABLE, 
    pickup_address: order.delivery_address, // à ajuster si adresse du vendeur
    pickup_coords: order.delivery_coords,
    delivery_address: order.delivery_address,
    delivery_coords: order.delivery_coords,
    estimated_fee: order.delivery_fee, 
    actual_fee: 0, 
  };

  const newDelivery = await Delivery.create(deliveryData, { transaction }); 
  return newDelivery;
};

// ============================================================
// FONCTIONS DU CONTROLEUR POUR LES REQUÊTES HTTP
// ============================================================

exports.createDelivery = async (req, res) => {
  try {
    const newDelivery = await Delivery.create(req.body);
    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    // 🔥 GESTION SPÉCIALE POUR CANCELLED → AVAILABLE
    if (req.body.status === DELIVERY_STATUS.CANCELLED) {
      delivery.status = DELIVERY_STATUS.AVAILABLE;
      delivery.agency_id = null;
      delivery.accepted_at = null;
      await delivery.save();

      // Synchroniser la commande
      await updateOrderStatus(delivery.order_id, ORDER_STATUS.PENDING);

      return res.status(200).json(delivery);
    }

    // ❗️ Mise à jour normale
    await delivery.update(req.body);

    // ► Synchronisation des statuts
    if (req.body.status) {
      switch (req.body.status) {
        case DELIVERY_STATUS.ACCEPTED:
          await updateOrderStatus(delivery.order_id, ORDER_STATUS.ACCEPTED);
          break;
        case DELIVERY_STATUS.EN_ROUTE:
          await updateOrderStatus(delivery.order_id, ORDER_STATUS.IN_TRANSIT);
          break;
        case DELIVERY_STATUS.DELIVERED:
          await updateOrderStatus(delivery.order_id, ORDER_STATUS.DELIVERED);
          break;
      }
    }

    res.status(200).json(delivery);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deletedRows = await Delivery.destroy({ where: { id: req.params.id } });
    if (deletedRows === 0) return res.status(404).json({ error: 'Delivery not found' });
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ where: { order_id: req.params.order_id } });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found for this order' });
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      where: { status: DELIVERY_STATUS.AVAILABLE, agency_id: null },
      include: [{ model: Order, as: 'Order' }]
    });
    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons disponibles:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptDelivery = async (req, res) => {
  const deliveryId = req.params.deliveryId || req.params.id; 
  const { agency_id } = req.body;

  try {
    const delivery = await Delivery.findOne({ 
      where: { id: deliveryId, status: DELIVERY_STATUS.AVAILABLE, agency_id: null } 
    });

    if (!delivery) return res.status(409).json({ error: "Cette course n'est plus disponible." });

    delivery.agency_id = agency_id;
    delivery.status = DELIVERY_STATUS.ACCEPTED; 
    delivery.accepted_at = new Date();
    await delivery.save();

    res.status(200).json({ message: "Course acceptée avec succès", delivery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const { agency_id } = req.params;
    const deliveries = await Delivery.findAll({
      where: { agency_id },
      order: [['created_at', 'DESC']],
      include: [{ model: Order, as: 'Order' }]
    });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
