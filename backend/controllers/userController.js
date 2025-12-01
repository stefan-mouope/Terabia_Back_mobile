const { User, Product, Order, sequelize } = require('../models'); // Import Product and Order models, and sequelize instance

exports.createUser = async (req, res) => {
  try {
    const newUser = await User.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const [updatedRows] = await User.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const updatedUser = await User.findByPk(req.params.id);
    res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const deletedRows = await User.destroy({
      where: { id: req.params.id },
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// GET /api/users/me
exports.getCurrentUser = async (req, res) => {
  try {
    // On suppose que tu utilises un middleware d'auth qui ajoute req.userId
    const userId = req.userId;

    console.log('Fetching current user with ID:', userId);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await User.findByPk(userId, {
      attributes: { exclude: ['password', 'encrypted_password'] }, // ne pas renvoyer le mot de passe
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getSellerStats = async (req, res) => {
  try {
    const sellerId = req.params.id;

    // Total Products
    const totalProducts = await Product.count({
      where: { seller_id: sellerId },
    });

    // Active Products
    const activeProducts = await Product.count({
      where: { seller_id: sellerId, is_active: true },
    });

    // Total Orders and Revenue (Correction pour SQLite et json_each)
    const ordersStats = await sequelize.query(`
      SELECT
        COUNT(DISTINCT o.id) AS "totalOrders",
        -- 💡 CORRECTION: Utiliser item.value->>'unit_price' et item.value->>'quantity'
        SUM(CAST(item.value->>'unit_price' AS REAL) * CAST(item.value->>'quantity' AS INTEGER)) AS "totalRevenue"
      FROM orders AS o,
      json_each(o.items) AS item
      -- 💡 CORRECTION: Utiliser item.value->>'product_id' pour la jointure
      JOIN products AS p ON CAST(item.value->>'product_id' AS INTEGER) = p.id
      WHERE p.seller_id = :sellerId
    `, {
      replacements: { sellerId },
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      totalProducts,
      activeProducts,
      totalOrders: ordersStats[0].totalOrders || 0,
      totalRevenue: ordersStats[0].totalRevenue || 0,
    });
  } catch (error) {
    // Si l'erreur se produit ici, elle sera capturée et renvoyée en 500
    console.error("Erreur dans getSellerStats:", error.message);
    res.status(500).json({ error: error.message });
  }
};
