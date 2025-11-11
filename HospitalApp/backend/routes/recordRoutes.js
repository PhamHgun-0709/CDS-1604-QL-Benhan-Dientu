const express = require("express");
const router = express.Router();
const recordController = require("../controllers/recordController");
const { authenticate, authorize } = require('../middleware/auth');

// Tất cả routes cần authentication
router.get("/", authenticate, recordController.getAllRecords);
router.post("/", authenticate, authorize(['admin', 'doctor']), recordController.addRecord);
router.put("/:id", authenticate, authorize(['admin', 'doctor']), recordController.updateRecord);
router.delete("/:id", authenticate, authorize(['admin']), recordController.deleteRecord);

module.exports = router;
