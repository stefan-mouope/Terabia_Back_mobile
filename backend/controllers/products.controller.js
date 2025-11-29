const Product = require('../models/Product');

exports.getProducts = async (req, res) => {
  try {
    const { category, price, city, q, page = 1, limit = 10 } = req.query;
    const products = await Product.filter({ category, price, city, q });

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedProducts = products.slice(startIndex, endIndex);

    res.status(200).json({
      products: paginatedProducts,
      total: products.length,
      page: parseInt(page),
      limit: parseInt(limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(parseInt(id));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, currency, stock, categoryId, images, location } = req.body;
    const sellerId = req.user.id; // From authenticated token

    const newProduct = await Product.create({
      sellerId,
      title,
      description,
      price,
      currency,
      stock,
      categoryId,
      images,
      location,
    });

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const sellerId = req.user.id; // From authenticated token

    const product = await Product.findById(parseInt(id));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Ensure only the owner (sellerId) or admin can update the product
    if (product.sellerId !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only update your own products.' });
    }

    const updatedProduct = await Product.update(parseInt(id), updates);

    res.status(200).json({ message: 'Product updated successfully', product: updatedProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const sellerId = req.user.id; // From authenticated token

    const product = await Product.findById(parseInt(id));

    if (!product) {
      return res.status(404).json({ message: 'Product not found.' });
    }

    // Ensure only the owner (sellerId) or admin can delete the product
    if (product.sellerId !== sellerId && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: You can only delete your own products.' });
    }

    const deleted = await Product.delete(parseInt(id));

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found or could not be deleted.' });
    }

    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
