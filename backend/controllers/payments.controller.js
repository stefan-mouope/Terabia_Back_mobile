const Transaction = require('../models/Transaction');
const Order = require('../models/Order');
// In a real app, you would import a payment gateway SDK/config here

exports.initiatePayment = async (req, res) => {
  try {
    const { orderId, amount, provider, buyerPhoneNumber } = req.body;
    const buyerId = req.user.id; // From authenticated token

    const order = await Order.findById(orderId);
    if (!order || order.buyerId !== buyerId || order.paymentStatus !== 'pending') {
      return res.status(400).json({ message: 'Invalid order for payment initiation.' });
    }

    // --- Simulate interaction with a Mobile Money Gateway ---
    const paymentReference = `TXN-${Date.now()}-${orderId}`; // Generate a unique reference
    const simulatedGatewayResponse = { success: true, transactionId: paymentReference }; // Mock response
    // In a real scenario, you would call the actual Mobile Money API here
    // e.g., MobileMoneySDK.initiatePayment({ amount, phoneNumber: buyerPhoneNumber, reference: paymentReference, callbackUrl: 'YOUR_WEBHOOK_URL' });
    // --------------------------------------------------------

    if (simulatedGatewayResponse.success) {
      const newTransaction = await Transaction.create({
        orderId,
        amount,
        provider,
        status: 'pending', // Status will be updated by webhook
        paymentReference,
      });

      // Update order payment status to pending_gateway or similar
      order.paymentStatus = 'pending_gateway'; // Example status
      order.updatedAt = new Date().toISOString();
      // In real app, save order to DB

      res.status(200).json({
        message: 'Payment initiated. Awaiting confirmation from provider.',
        transactionId: newTransaction.id,
        paymentReference,
      });
    } else {
      res.status(400).json({ message: 'Failed to initiate payment with provider.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.handleWebhook = async (req, res) => {
  try {
    // --- IMPORTANT: Verify webhook authenticity in a real application ---
    // e.g., check headers, signature, IP whitelist from payment provider
    // if (!isValidWebhook(req)) {
    //   return res.status(403).json({ message: 'Invalid webhook signature.' });
    // }

    const { paymentReference, status, providerSpecificData } = req.body; // Example webhook payload

    const transaction = await Transaction.findById(paymentReference); // Assuming paymentReference is unique and can be used to find transaction
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    let newTransactionStatus = 'failed';
    if (status === 'success') {
      newTransactionStatus = 'success';
    } else if (status === 'failed') {
      newTransactionStatus = 'failed';
    } else if (status === 'pending') {
      newTransactionStatus = 'pending';
    }

    await Transaction.updateStatus(transaction.id, newTransactionStatus);

    const order = await Order.findById(transaction.orderId);
    if (order) {
      order.paymentStatus = newTransactionStatus; // Update order payment status
      if (newTransactionStatus === 'success') {
        order.status = 'accepted'; // If payment success, mark order as accepted
      }
      order.updatedAt = new Date().toISOString();
      // In real app, save order to DB
    }

    res.status(200).json({ message: 'Webhook received and processed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(parseInt(id));

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    // Authorization: User can see their own transactions, Admin can see any
    // Simplified: Requires joining with Order and User to verify ownership
    // For in-memory, we'll allow admin to see any, and for buyer to see if their orderId matches
    const order = await Order.findById(transaction.orderId);
    if (!order || (order.buyerId !== req.user.id && req.user.role !== 'admin')) {
        return res.status(403).json({ message: 'Forbidden: You do not have access to this transaction.' });
    }

    res.status(200).json(transaction);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
