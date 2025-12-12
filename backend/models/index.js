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
// DÉFINITION DES ASSOCIATIONS (CORRIGÉES AVEC ALIAS)
// ================================================================

// Authentification
AuthUser.hasOne(User, { foreignKey: 'id', onDelete: 'CASCADE' });
User.belongsTo(AuthUser, { foreignKey: 'id' });

// Produits & Vendeur
User.hasMany(Product, { foreignKey: 'seller_id', as: 'products', onDelete: 'CASCADE' });
Product.belongsTo(User, { foreignKey: 'seller_id', as: 'seller' });

Category.hasMany(Product, { foreignKey: 'category_id' });
Product.belongsTo(Category, { foreignKey: 'category_id' });

// Commandes
User.hasMany(Order, { foreignKey: 'buyer_id', as: 'orders' });
Order.belongsTo(User, { foreignKey: 'buyer_id', as: 'buyer' });

// Agence / Livreur
// ⚠️ AJOUT DE 'as: agency' et 'as: deliveries'
User.hasMany(Delivery, { foreignKey: 'agency_id', as: 'deliveries' });
Delivery.belongsTo(User, { foreignKey: 'agency_id', as: 'agency' });

// Livraison <-> Commande
// ⚠️ C'EST ICI QUE TU AVAIS L'ERREUR 500 !
// J'ai ajouté "as: 'Order'" pour matcher avec le contrôleur.
Order.hasOne(Delivery, { foreignKey: 'order_id', onDelete: 'CASCADE', as: 'delivery' });
Delivery.belongsTo(Order, { foreignKey: 'order_id', as: 'Order' });

// Transactions
Order.hasMany(Transaction, { foreignKey: 'order_id', onDelete: 'CASCADE' });
Transaction.belongsTo(Order, { foreignKey: 'order_id' });

// Reviews
Order.hasMany(Review, { foreignKey: 'order_id' });
Review.belongsTo(Order, { foreignKey: 'order_id' });

User.hasMany(Review, { foreignKey: 'reviewer_id' });
Review.belongsTo(User, { foreignKey: 'reviewer_id' });

User.hasMany(Review, { foreignKey: 'reviewee_id' });
Review.belongsTo(User, { foreignKey: 'reviewee_id' });


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
