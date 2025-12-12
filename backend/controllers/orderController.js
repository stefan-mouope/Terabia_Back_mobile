const { Order } = require('../models');
// 1. IMPORT NÉCESSAIRE DU CONTRÔLEUR DE LIVRAISON ET DE L'INSTANCE SEQUELIZE
const deliveryController = require('./deliveryController'); 
const sequelize = Order.sequelize; 

/**
 * Cré// backend/controllers/orderController.js

const { Order } = require('../models');
const { updateOrderStatus } = require('../services/orderService'); // ✔️ ajout

exports.createOrder = async (req, res) => {
  try {
    const { customer_id, product, quantity, status } = req.body;

    const order = await Order.create({
      customer_id,
      product,
      quantity,
      status: status || "pending"
    });

    res.status(201).json(order);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json(orders);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { product, quantity, status } = req.body;

    const [updatedRows] = await Order.update(
      { product, quantity, status },
      { where: { id } }
    );

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const updatedOrder = await Order.findByPk(id);
    res.status(200).json(updatedOrder);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ❌ L’ANCIENNE FONCTION updateOrderStatus a été supprimée ici
e une nouvelle commande et la livraison associée en utilisant une transaction.
 */
exports.createOrder = async (req, res) => {
  // Démarre la transaction pour lier la Commande et la Livraison
  const transaction = await sequelize.transaction();

  try {
    // 1. CRÉATION DE LA COMMANDE (dans la transaction)
    const newOrder = await Order.create(req.body, { transaction });

    // 2. CRÉATION AUTOMATIQUE DE LA LIVRAISON (dans la transaction)
    await deliveryController.createDeliveryFromOrder(newOrder, transaction); 

    // 3. VALIDER : Si les deux sont réussis, on valide les écritures
    await transaction.commit();
    
    // Réponse de succès
    res.status(201).json(newOrder);

  } catch (error) {
    // 4. ANNULER : Si l'une des étapes échoue, on annule toutes les modifications
    if (transaction) await transaction.rollback();
    
    console.error("Erreur critique lors de la création de la commande et de la livraison :", error.message);

    res.status(500).json({ 
      error: "La commande n'a pas pu être créée en raison d'une erreur interne (Rollback effectué).",
      details: error.message
    });
  }
};
exports.updateOrderStatus = async (order_id,status) => {
  try{
    const [updatedRows] = await Order.update({ status }, {
      where: { id: order_id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const updatedOrder = await Order.findByPk(order_id);
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

/**
 * Récupère une commande par son ID.
 */
exports.getOrderById = async (req, res) => {
  try {
    const order = await Order.findByPk(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Met à jour une commande par son ID.
 */
exports.updateOrder = async (req, res) => {
  try {
    const [updatedRows] = await Order.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const updatedOrder = await Order.findByPk(req.params.id);
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Supprime une commande par son ID.
 */
exports.deleteOrder = async (req, res) => {
  try {
    const deletedRows = await Order.destroy({
      where: { id: req.params.id },
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.status(200).json({ message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère toutes les commandes.
 */
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll();
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * Récupère toutes les commandes d'un acheteur spécifique.
 */
exports.getOrdersByBuyerId = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { buyer_id: req.params.buyer_id },
    });
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
