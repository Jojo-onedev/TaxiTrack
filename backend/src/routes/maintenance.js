// src/routes/maintenance.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

/**
 * @swagger
 * /admin/maintenance:
 *   get:
 *     summary: Liste de l'historique de maintenance
 *     tags: [Maintenance]
 *     responses:
 *       200:
 *         description: Historique récupéré
 */
router.get('/', adminController.getMaintenanceHistory);

/**
 * @swagger
 * /admin/maintenance:
 *   post:
 *     summary: Ajouter une nouvelle maintenance
 *     tags: [Maintenance]
 *     responses:
 *       201:
 *         description: Créé
 */
router.post('/', adminController.createMaintenance);

/**
 * @swagger
 * /admin/maintenance/{id}:
 *   put:
 *     summary: Modifier une maintenance
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Mis à jour
 */
router.put('/:id', adminController.updateMaintenance);

/**
 * @swagger
 * /admin/maintenance/{id}:
 *   delete:
 *     summary: Supprimer une maintenance
 *     tags: [Maintenance]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Supprimé
 */
router.delete('/:id', adminController.deleteMaintenance);



module.exports = router;



