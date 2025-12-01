// backend/controllers/deliveryController.js
const { Delivery, Order } = require('../models');
const { DELIVERY_STATUS, ORDER_STATUS } = require('../constants/enums');
const orderService = require('../services/orderService');

// Crée une livraison à partir d'une commande (utilisée par orderController)
exports.createDeliveryFromOrder = async (order, transaction) => {
  const deliveryData = {
    order_id: order.id,
    agency_id: null,
    status: DELIVERY_STATUS.AVAILABLE,
    pickup_address: order.delivery_address,
    pickup_coords: order.delivery_coords,
    delivery_address: order.delivery_address,
    delivery_coords: order.delivery_coords,
    estimated_fee: order.delivery_fee,
    actual_fee: 0,
  };
  return Delivery.create(deliveryData, { transaction });
};

// CRUD Livraisons
exports.createDelivery = async (req, res) => {
  try {
    const newDelivery = await Delivery.create(req.body);
    res.status(201).json(newDelivery);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });
    res.json(delivery);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateDelivery = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) return res.status(404).json({ error: 'Delivery not found' });

    if (req.body.status === DELIVERY_STATUS.CANCELLED) {
      delivery.status = DELIVERY_STATUS.AVAILABLE;
      delivery.agency_id = null;
      delivery.accepted_at = null;
      await delivery.save();

      await orderService.updateOrderStatus(delivery.order_id, ORDER_STATUS.PENDING);
      return res.json(delivery);
    }

    await delivery.update(req.body);

    // Synchroniser les statuts
    if (req.body.status) {
      switch (req.body.status) {
        case DELIVERY_STATUS.ACCEPTED:
          await orderService.updateOrderStatus(delivery.order_id, ORDER_STATUS.ACCEPTED);
          break;
        case DELIVERY_STATUS.EN_ROUTE:
          await orderService.updateOrderStatus(delivery.order_id, ORDER_STATUS.IN_TRANSIT);
          break;
        case DELIVERY_STATUS.DELIVERED:
          await orderService.updateOrderStatus(delivery.order_id, ORDER_STATUS.DELIVERED);
          break;
      }
    }

    res.json(delivery);

  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deletedRows = await Delivery.destroy({ where: { id: req.params.id } });
    if (!deletedRows) return res.status(404).json({ error: 'Delivery not found' });
    res.json({ message: 'Delivery deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    res.json(deliveries);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({ where: { order_id: req.params.order_id } });
    if (!delivery) return res.status(404).json({ error: 'Delivery not found for this order' });
    res.json(delivery);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      where: { status: DELIVERY_STATUS.AVAILABLE, agency_id: null },
      include: [{ model: Order, as: 'Order' }]
    });
    res.json(deliveries);
  } catch (err) { res.status(500).json({ error: err.message }); }
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

    res.json({ message: "Course acceptée avec succès", delivery });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const { agency_id } = req.params;
    const deliveries = await Delivery.findAll({
      where: { agency_id },
      order: [['created_at', 'DESC']],
      include: [{ model: Order, as: 'Order' }]
    });
    res.json(deliveries);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
