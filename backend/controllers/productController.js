const { Product, User } = require('../models'); // 💡 Importation de User

exports.createProduct = async (req, res) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    // 🎯 CORRECTION: Ajout de l'instruction 'include' pour charger le vendeur avec l'alias 'seller'
    const product = await Product.findByPk(req.params.id, {
      include: [
        { 
          model: User, 
          as: 'seller', 
          attributes: ['id', 'name', 'city', 'rating', 'total_ratings'] 
        }
      ]
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error in getProductById:', error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const [updatedRows] = await Product.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const updatedProduct = await Product.findByPk(req.params.id);
    res.status(200).json(updatedProduct);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const deletedRows = await Product.destroy({
      where: { id: req.params.id },
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'city'] }]
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getProductsBySellerId = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.params.seller_id },
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'city'] }]
    });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
