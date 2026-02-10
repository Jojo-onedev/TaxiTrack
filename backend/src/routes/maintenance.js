// src/routes/maintenance.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Exemple : liste des maintenances
router.get('/', adminController.getMaintenanceHistory);
router.post('/', adminController.createMaintenance);
router.put('/:id', adminController.updateMaintenance);
router.delete('/:id', adminController.deleteMaintenance);


// router.put('/maintenance/:id', adminController.updateMaintenance);
// router.delete('/maintenance/:id', adminController.deleteMaintenance);



module.exports = router;



