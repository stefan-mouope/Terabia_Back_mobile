const { Delivery, Order } = require('../models');
const { DELIVERY_STATUS } = require('../constants/enums'); 

/**
 * NOUVELLE FONCTION : Crée un enregistrement de livraison à partir d'un objet Order.
 * Elle est appelée par orderController.createOrder.
 */
exports.createDeliveryFromOrder = async (order, transaction) => {
  
  // NOTE IMPORTANTE : L'adresse de ramassage (pickup_address) est temporairement
  // définie comme l'adresse de livraison de la commande. Vous devez l'ajuster
  // pour qu'elle corresponde à l'adresse du vendeur.

  const deliveryData = {
    order_id: order.id,
    agency_id: null,
    status: DELIVERY_STATUS.AVAILABLE, 
    
    // CHAMPS D'ADRESSE
    pickup_address: order.delivery_address, // À revoir si l'adresse est celle du vendeur
    pickup_coords: order.delivery_coords,
    delivery_address: order.delivery_address,
    delivery_coords: order.delivery_coords,
    
    // CHAMPS FINANCIERS
    estimated_fee: order.delivery_fee, 
    actual_fee: 0, 
  };

  const newDelivery = await Delivery.create(deliveryData, { transaction }); 
  
  return newDelivery;
};


// =================================================================
// FONCTIONS DU CONTROLEUR POUR LES REQUÊTES HTTP
// =================================================================

exports.createDelivery = async (req, res) => {
  try {
    const newDelivery = await Delivery.create(req.body);
    res.status(201).json(newDelivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryById = async (req, res) => {
  try {
    const delivery = await Delivery.findByPk(req.params.id);
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDelivery = async (req, res) => {
  try {
    const [updatedRows] = await Delivery.update(req.body, {
      where: { id: req.params.id },
    });
    if (updatedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    const updatedDelivery = await Delivery.findByPk(req.params.id);
    res.status(200).json(updatedDelivery);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDelivery = async (req, res) => {
  try {
    const deletedRows = await Delivery.destroy({
      where: { id: req.params.id },
    });
    if (deletedRows === 0) {
      return res.status(404).json({ error: 'Delivery not found' });
    }
    res.status(200).json({ message: 'Delivery deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll();
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDeliveryByOrderId = async (req, res) => {
  try {
    const delivery = await Delivery.findOne({
      where: { order_id: req.params.order_id },
    });
    if (!delivery) {
      return res.status(404).json({ error: 'Delivery not found for this order' });
    }
    res.status(200).json(delivery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.getAvailableDeliveries = async (req, res) => {
  try {
    const deliveries = await Delivery.findAll({
      where: {
        status: DELIVERY_STATUS.AVAILABLE, 
        agency_id: null
      },
      include: [{ model: Order, as: 'Order' }] 
    });
    res.status(200).json(deliveries);
  } catch (error) {
    console.error("Erreur lors de la récupération des livraisons disponibles:", error.message);
    res.status(500).json({ error: error.message });
  }
};

exports.acceptDelivery = async (req, res) => {
  const deliveryId = req.params.deliveryId || req.params.id; 
  const { agency_id } = req.body;

  try {
    const delivery = await Delivery.findOne({ 
      where: { 
        id: deliveryId, 
        status: DELIVERY_STATUS.AVAILABLE, 
        agency_id: null 
      } 
    });

    if (!delivery) {
      return res.status(409).json({ error: "Cette course n'est plus disponible." });
    }

    // Mise à jour
    delivery.agency_id = agency_id;
    delivery.status = DELIVERY_STATUS.ACCEPTED; 
    delivery.accepted_at = new Date();
    
    await delivery.save();

    res.status(200).json({ message: "Course acceptée avec succès", delivery });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyDeliveries = async (req, res) => {
  try {
    const { agency_id } = req.params;
    const deliveries = await Delivery.findAll({
      where: { agency_id: agency_id },
      order: [['created_at', 'DESC']],
      include: [{ model: Order, as: 'Order' }]
    });
    res.status(200).json(deliveries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};