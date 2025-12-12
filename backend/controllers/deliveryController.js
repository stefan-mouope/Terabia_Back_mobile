// backend/controllers/deliveryController.js

const { Delivery, Order } = require('../models');
const { updateOrderStatus } = require('../services/orderService'); // ✔️ correction ici

exports.createDelivery = async (req, res) => {
  try {
    const { order_id, address, delivery_date } = req.body;

    const delivery = await Delivery.create({
      order_id,
      address,
      delivery_date
    });

    // Mise à jour du statut de la commande
    await updateOrderStatus(order_id, "processing");

    res.status(201).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, order_id } = req.body;

    const [updatedRows] = await Delivery.update({ status }, { where: { id } });

    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Met aussi à jour la commande associée
    if (order_id) {
      await updateOrderStatus(order_id, status);
    }

    const updatedDelivery = await Delivery.findByPk(id);
    res.status(200).json(updatedDelivery);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
