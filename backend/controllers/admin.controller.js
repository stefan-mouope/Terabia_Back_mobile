const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Transaction = require('../models/Transaction');
const Delivery = require('../models/Delivery');

exports.getGlobalStats = async (req, res) => {
  try {
    // In a real database, you'd perform aggregate queries
    const totalUsers = (await User.findByCriteria({})).length; // Placeholder method
    const totalProducts = (await Product.find()).length;
    const totalOrders = (await Order.find()).length;
    const completedOrders = (await Order.findByCriteria({ status: 'delivered' })).length;
    const totalTransactions = (await Transaction.find()).length; // Placeholder method

    res.status(200).json({
      totalUsers,
      totalProducts,
      totalOrders,
      completedOrders,
      totalTransactions,
      // ... more stats
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.suspendUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { isSuspended } = req.body;

    const user = await User.findById(parseInt(id));

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent admin from suspending themselves or other admins (optional rule)
    if (user.role === 'admin' && req.user.id !== parseInt(id)) { // An admin should not be able to suspend another admin
      return res.status(403).json({ message: 'Forbidden: Cannot suspend another admin.' });
    }
    if (user.id === req.user.id) {
        return res.status(403).json({ message: 'Forbidden: Cannot suspend your own account.' });
    }

    // In a real app, you'd update a `isSuspended` field in the User model in the DB
    user.isSuspended = isSuspended;
    user.updatedAt = new Date().toISOString();
    // For in-memory, we modify the user object directly

    res.status(200).json({ message: `User ${user.name} suspension status updated to ${isSuspended}.` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
