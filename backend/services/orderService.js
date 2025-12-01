// backend/services/orderService.js
const { Order } = require('../models');

exports.updateOrderStatus = async (order_id, status) => {
  const [updatedRows] = await Order.update(
    { status },
    { where: { id: order_id } }
  );
  return updatedRows;
};
