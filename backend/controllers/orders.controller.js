const Order = require('../models/Order');
const Product = require('../models/Product'); // Needed to verify product existence/price

exports.createOrder = async (req, res) => {
  try {
    const { items } = req.body;
    const buyerId = req.user.id; // From authenticated token

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || product.stock < item.qty) {
        return res.status(400).json({ message: `Product ${item.productId} not found or insufficient stock.` });
      }
      orderItems.push({ productId: item.productId, qty: item.qty, price: product.price });
      total += product.price * item.qty;

      // Decrement product stock (in-memory for now)
      await Product.update(item.productId, { stock: product.stock - item.qty });
    }

    const newOrder = await Order.create({
      buyerId,
      items: orderItems,
      total,
      status: 'pending', // Initial status
      paymentStatus: 'pending', // Initial payment status
    });

    res.status(201).json({ message: 'Order created successfully', order: newOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findById(parseInt(id));

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Authorization check: Buyer can see their own order, Seller can see orders for their products, Admin/Delivery can see any
    if (order.buyerId !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'delivery') {
      // For sellers, a more complex check would be needed to see if any product in the order belongs to them
      // For simplicity in this in-memory model, we'll allow admin/delivery to see any, and buyer to see their own.
      return res.status(403).json({ message: 'Forbidden: You do not have access to this order.' });
    }

    res.status(200).json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getOrders = async (req, res) => {
  try {
    const { buyerId, sellerId, status } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;

    let orders;
    if (userRole === 'admin') {
      // Admin can filter by any criteria
      orders = await Order.findByCriteria({ buyerId, sellerId, status });
    } else if (userRole === 'buyer') {
      // Buyer can only see their own orders
      orders = await Order.findByCriteria({ buyerId: userId, status });
    } else if (userRole === 'seller') {
      // Seller can only see orders related to their products (simplified, needs product join in real DB)
      // For in-memory, we'll return all orders and expect frontend filtering or more complex in-memory logic
      orders = await Order.find(); // Placeholder: in a real app, join with products to filter by sellerId
    } else if (userRole === 'delivery') {
      // Delivery can only see orders assigned to them or available for pickup (simplified)
      orders = await Order.find(); // Placeholder: in a real app, filter by deliveryAgencyId
    } else {
      orders = [];
    }

    // Additional filtering for seller/delivery based on req.user.id would be done here
    // For in-memory, we assume the findByCriteria handles basic filtering.

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findById(parseInt(id));

    if (!order) {
      return res.status(404).json({ message: 'Order not found.' });
    }

    // Authorization: Seller/Admin can accept/cancel, Delivery can update to in_transit/delivered
    if (req.user.role === 'seller' && (status === 'accepted' || status === 'cancelled')) {
      // For sellers, need to check if products in order belong to them
      // Simplification: assume seller can update their related orders
    } else if (req.user.role === 'delivery' && (status === 'en_route' || status === 'delivered')) {
      // For delivery, need to check if order is assigned to them
      // Simplification: assume delivery can update orders assigned to them
    } else if (req.user.role === 'admin') {
      // Admin can update any status
    } else {
      return res.status(403).json({ message: 'Forbidden: You do not have permission to update this order status.' });
    }

    const updatedOrder = await Order.updateStatus(parseInt(id), status);

    res.status(200).json({ message: 'Order status updated successfully', order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
