const { Product } = require('../models');
const { User } = require('../models');
const cloudinary = require('cloudinary').v2;

/**
 * Créer un nouveau produit avec images
 * @route POST /api/products
 * @access Private
 */
exports.createProduct = async (req, res) => {
  console.log('=== CREATE PRODUCT ===');
  console.log('Body reçu :', req.body);
  console.log('Files reçus :', req.files);

  try {
    const {
      seller_id,
      title,
      description,
      price,
      stock,
      unit,
      category_id,
      location_city,
      is_active = 'true',
    } = req.body;

    // ─── VALIDATIONS ─────────────────────
    if (!title?.trim()) {
      return res.status(400).json({ success: false, message: 'Le titre est obligatoire' });
    }
    if (!price) {
      return res.status(400).json({ success: false, message: 'Le prix est obligatoire' });
    }
    if (!seller_id) {
      return res.status(400).json({ success: false, message: 'seller_id manquant' });
    }
    if (!category_id) {
      return res.status(400).json({ success: false, message: 'category_id manquant' });
    }
    if (!location_city?.trim()) {
      return res.status(400).json({ success: false, message: 'La ville est obligatoire' });
    }

    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return res.status(400).json({ success: false, message: 'Le prix doit être un nombre positif' });
    }

    // ─── DONNÉES À INSÉRER (doivent correspondre EXACTEMENT aux noms des colonnes) ───
    const productData = {
      seller_id: seller_id,
      title: title.trim(),
      description: description?.trim() || null,
      price: parsedPrice,
      stock: parseInt(stock, 10) || 0,
      unit: unit?.trim() || null,
      category_id: parseInt(category_id, 10),
      location_city: location_city.trim(),
      is_active: is_active === 'true' || is_active === true,
    };

    // ─── GESTION DES IMAGES CLOUDINARY ─────────────────────
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      productData.images = req.files.map(file => ({
        url: file.path,
        publicId: file.filename,
      }));
      productData.main_image = req.files[0].path; // ← vérifie que ta colonne s'appelle bien main_image
    } else {
      productData.images = [];
      productData.main_image = null;
    }

    // ─── CRÉATION DU PRODUIT ─────────────────────
    const newProduct = await Product.create(productData);

    // ─── RÉCUPÉRATION AVEC LE VENDEUR ─────────────────────
    const product = await Product.findByPk(newProduct.id, {
      include: [
        {
          model: User,
          as: 'seller', // change en 'user' si ton alias est différent
          attributes: ['id', 'name', 'phone', 'avatar_url', 'city'],
        },
      ],
    });

    return res.status(201).json({
      success: true,
      message: 'Produit créé avec succès',
      data: product,
    });

  } catch (error) {
    console.error('Erreur création produit :', error);

    // ─── NETTOYAGE CLOUDINARY EN CAS D'ERREUR ─────────────────────
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const deletePromises = req.files.map(file =>
        cloudinary.uploader.destroy(file.filename).catch(() => {})
      );
      await Promise.allSettled(deletePromises);
    }

    // ─── ERREURS SEQUELIZE ─────────────────────
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Erreur de validation des données',
        errors: error.errors.map(e => ({ field: e.path, message: e.message })),
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Un produit avec ce titre existe déjà',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la création du produit',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Autres méthodes (corrigées et propres)
// ─────────────────────────────────────────────────────────────────────────────

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'avatar_url', 'city', 'rating', 'is_verified'],
        },
      ],
    });

    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    console.error('Erreur getProductById:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const [updated] = await Product.update(req.body, {
      where: { id: req.params.id },
      individualHooks: true,
    });

    if (!updated) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    const updatedProduct = await Product.findByPk(req.params.id, {
      include: [{ model: User, as: 'seller', attributes: ['id', 'name', 'phone'] }],
    });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    console.error('Erreur updateProduct:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Produit non trouvé' });
    }

    // Suppression des images Cloudinary si elles existent
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(img =>
        cloudinary.uploader.destroy(img.publicId).catch(() => {})
      );
      await Promise.allSettled(deletePromises);
    }

    await product.destroy();

    res.status(200).json({ success: true, message: 'Produit supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deleteProduct:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// CORRIGÉ : getProductsBySellerId
exports.getProductsBySellerId = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { seller_id: req.params.seller_id },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'avatar_url'],
        },
      ],
      // CORRIGÉ : nom exact de la colonne dans la table SQLite
      order: [['created_at', 'DESC']], // ← underscore, pas camelCase
    });

    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Erreur getProductsBySellerId:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// CORRIGÉ : getAllProducts
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'phone', 'avatar_url'],
        },
      ],
      order: [['created_at', 'DESC']], // ← ici aussi !
    });
    res.status(200).json({ success: true, data: products });
  } catch (error) {
    console.error('Erreur getAllProducts:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};