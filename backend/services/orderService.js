// backend/services/orderService.js

const { Order } = require('../models');

/**
 * Met à jour le statut d'une commande
 * @param {number} order_id 
 * @param {string} status 
 * @returns {Promise<Order>}
 */
exports.updateOrderStatus = async (order_id, status) => {
  await Order.update({ status }, { where: { id: order_id } });
  return await Order.findByPk(order_id);
};
