// backend/routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/deliveryController');

// ============================================================
// 1️⃣ ROUTES SPÉCIFIQUES (À METTRE EN PREMIER)
// ============================================================

// Récupérer toutes les livraisons disponibles (Status 'AVAILABLE' & sans livreur)
router.get('/available', deliveryController.getAvailableDeliveries);

// Récupérer l'historique des missions d'un livreur spécifique
router.get('/mine/:agency_id', deliveryController.getMyDeliveries);

// Trouver une livraison par l'ID de la commande associée
router.get('/order/:order_id', deliveryController.getDeliveryByOrderId);

// ============================================================
// 2️⃣ ROUTES D'ACTION
// ============================================================

// Accepter une livraison (Logique "Premier arrivé")
router.post('/:id/accept', deliveryController.acceptDelivery);

// ============================================================
// 3️⃣ ROUTES CRUD CLASSIQUES (À LA FIN)
// ============================================================

// Créer une livraison
router.post('/', deliveryController.createDelivery);

// Récupérer toutes les livraisons
router.get('/', deliveryController.getAllDeliveries);

// Récupérer une livraison par ID
router.get('/:id', deliveryController.getDeliveryById);

// Mettre à jour une livraison
router.put('/:id', deliveryController.updateDelivery);

// Supprimer une livraison
router.delete('/:id', deliveryController.deleteDelivery);

module.exports = router;
