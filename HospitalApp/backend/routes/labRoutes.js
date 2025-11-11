const express = require('express');
const router = express.Router();
const labController = require('../controllers/labController');
const { authenticate, authorize } = require('../middleware/auth');

// Lab results routes - Tất cả routes cần authentication
router.get('/', authenticate, labController.getAllLabResults);
router.post('/', authenticate, authorize(['admin', 'doctor']), labController.addLabResult);
router.put('/:id', authenticate, authorize(['admin', 'doctor']), labController.updateLabResult);
router.delete('/:id', authenticate, authorize(['admin']), labController.deleteLabResult);

module.exports = router;
