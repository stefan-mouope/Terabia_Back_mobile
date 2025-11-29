const Delivery = require('../models/Delivery');
const Order = require('../models/Order');

exports.getAvailableDeliveries = async (req, res) => {
  try {
    const availableDeliveries = await Delivery.findAvailable();
    res.status(200).json(availableDeliveries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.acceptDelivery = async (req, res) => {
  try {
    const { id } = req.params;
    const agencyId = req.user.id; // Delivery agency ID from authenticated token

    const acceptedDelivery = await Delivery.acceptDelivery(parseInt(id), agencyId);

    if (!acceptedDelivery) {
      return res.status(400).json({ message: 'Delivery not available or already accepted.' });
    }

    // Update the corresponding order's deliveryAgencyId
    const order = await Order.findById(acceptedDelivery.orderId);
    if (order) {
      order.deliveryAgencyId = agencyId;
      order.updatedAt = new Date().toISOString();
      // In real app, save order to DB
    }

    res.status(200).json({ message: 'Delivery accepted successfully', delivery: acceptedDelivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateDeliveryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const agencyId = req.user.id; // Delivery agency ID from authenticated token

    const delivery = await Delivery.findById(parseInt(id));

    if (!delivery) {
      return res.status(404).json({ message: 'Delivery not found.' });
    }

    // Authorization: Only assigned delivery agency or admin can update status
    if (delivery.agencyId !== agencyId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your assigned deliveries.' });
    }

    const updatedDelivery = await Delivery.updateStatus(parseInt(id), status);

    res.status(200).json({ message: 'Delivery status updated successfully', delivery: updatedDelivery });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
// rien