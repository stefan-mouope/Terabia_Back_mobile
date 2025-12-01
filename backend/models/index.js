const Sequelize = require('sequelize');
const sequelize = require('../config/sequelize');

const User = require('./userModel')(sequelize, Sequelize);
const Category = require('./categoryModel')(sequelize, Sequelize);
const Product = require('./productModel')(sequelize, Sequelize);
const Order = require('./orderModel')(sequelize, Sequelize);
const Delivery = require('./deliveryModel')(sequelize, Sequelize);
const Transaction = require('./transactionModel')(sequelize, Sequelize);
const Review = require('./reviewModel')(sequelize, Sequelize);
const AuthUser = require('./authUserModel')(sequelize, Sequelize);

// ================================================================
// DÉFINITION DES ASSOCIATIONS (CORRIGÉES ET EXPLICITES)
// ================================================================

// Authentification
AuthUser.hasOne(User, { foreignKey: 'id', onDelete: 'CASCADE' });
User.belongsTo(AuthUser, { foreignKey: 'id' });

// --- PRODUITS ---

// 🎯 CORRECTION: Ajout des alias 'seller' et 'soldProducts'
User.hasMany(Product, { foreignKey: 'seller_id', onDelete: 'CASCADE', as: 'soldProducts' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' }); 

Category.hasMany(Product, { foreignKey: 'category_id', as: 'products' });
Product.belongsTo(Category, { foreignKey: 'category_id', as: 'category' });

// --- COMMANDES ---

// L'acheteur (buyer)
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

// --- LIVRAISONS ---

// Agence / Livreur
User.hasMany(Delivery, { foreignKey: 'agency_id', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'agency_id', as: 'agency' });

// Livraison <-> Commande
Order.hasOne(Delivery, { foreignKey: 'order_id', onDelete: 'CASCADE', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });

// --- TRANSACTIONS ---

Order.hasMany(Transaction, { foreignKey: 'order_id', onDelete: 'CASCADE', as: 'transactions' });
Transaction.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// --- REVIEWS ---

Order.hasMany(Review, { foreignKey: 'order_id', as: 'reviews' });
Review.belongsTo(Order, { foreignKey: 'order_id', as: 'order' });

// Reviews données/reçues
User.hasMany(Review, { foreignKey: 'reviewer_id', as: 'givenReviews' });
Review.belongsTo(User, { foreignKey: 'reviewer_id', as: 'reviewer' });

User.hasMany(Review, { foreignKey: 'reviewee_id', as: 'receivedReviews' });
Review.belongsTo(User, { foreignKey: 'reviewee_id', as: 'reviewee' });


module.exports = {
  sequelize,
  User,
  Category,
  Product,
  Order,
  Delivery,
  Transaction,
  Review,
  AuthUser
};
