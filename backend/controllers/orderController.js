// backend/controllers/orderController.js
const { Order } = require('../models');
const deliveryController = require('./deliveryController');
const sequelize = Order.sequelize;
const orderService = require('../services/orderService');

// Crée une commande avec livraison
exports.createOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const newOrder = await Order.create(req.body, { transaction });
    await deliveryController.createDeliveryFromOrder(newOrder, transaction);
    await transaction.commit();
    res.status(201).json(newOrder);
  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Erreur création commande :", error.message);
    res.status(500).json({ error: error.message });
  }
};

// Met à jour le statut d'une commande
exports.updateOrderStatus = async (order_id, status, res) => {
  try {
    const updatedRows = await orderService.updateOrderStatus(order_id, status);
    if (!updatedRows) return res.status(404).json({ error: 'Order not found' });

    const updatedOrder = await Order.findByPk(order_id);
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer commande par ID
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Met à jour une commande
exports.updateOrder = async (req, res) => {
  try {
    const [updated] = await Order.update(req.body, { where: { id: req.params.id } });
    if (!updated) return res.status(404).json({ error: 'Order not found' });

    const updatedOrder = await Order.findByPk(req.params.id);
    res.json(updatedOrder);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Supprimer commande
exports.deleteOrder = async (req, res) => {
  try {
    const deletedRows = await Order.destroy({ where: { id: req.params.id } });
    if (!deletedRows) return res.status(404).json({ error: 'Order not found' });
    res.json({ message: 'Order deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Toutes les commandes
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// Commandes d’un acheteur
exports.getOrdersByBuyerId = async (req, res) => {
  try {
    const orders = await Order.findAll({ where: { buyer_id: req.params.buyer_id } });
    res.json(orders);
  } catch (err) { res.status(500).json({ error: err.message }); }
};
