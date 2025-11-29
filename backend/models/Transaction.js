let transactions = []; // In-memory "database"
let nextTransactionId = 1;

class Transaction {
  constructor(orderId, amount, provider, status, paymentReference) {
    this.id = nextTransactionId++;
    this.orderId = orderId;
    this.amount = amount;
    this.provider = provider;
    this.status = status || 'pending';
    this.paymentReference = paymentReference;
    this.createdAt = new Date().toISOString();
    this.updatedAt = new Date().toISOString();
  }

  static async create({ orderId, amount, provider, status, paymentReference }) {
    const newTransaction = new Transaction(orderId, amount, provider, status, paymentReference);
    transactions.push(newTransaction);
    return newTransaction;
  }

  static async findById(id) {
    return transactions.find(tx => tx.id === id);
  }

  static async updateStatus(id, newStatus) {
    const transaction = await this.findById(id);
    if (!transaction) return null;
    transaction.status = newStatus;
    transaction.updatedAt = new Date().toISOString();
    return transaction;
  }
}

module.exports = Transaction;
