const express = require("express");
const router = express.Router();
const prescriptionController = require("../controllers/prescriptionController");
const { authenticate, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.get("/", authenticate, prescriptionController.getAllPrescriptions);
router.post("/", authenticate, authorize(['admin', 'doctor']), prescriptionController.addPrescription);
router.put("/:id", authenticate, authorize(['admin', 'doctor']), prescriptionController.updatePrescription);
router.delete("/:id", authenticate, authorize(['admin']), prescriptionController.deletePrescription);

module.exports = router;
