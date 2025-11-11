const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { authenticate, authorize } = require('../middleware/auth');

// Public endpoints
router.post('/register', userController.register);
router.post('/login', userController.login);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

// Protected: current user profile
router.get('/me', authenticate, userController.getMe);
router.put('/me', authenticate, userController.updateMe);
router.post('/change-password', authenticate, userController.changePassword);

// Protected: only admin can manage users
router.get('/', authenticate, authorize(['admin']), userController.getAllUsers);
router.post('/', authenticate, authorize(['admin']), userController.addUser);
router.put('/:id', authenticate, authorize(['admin']), userController.updateUser);
router.delete('/:id', authenticate, authorize(['admin']), userController.deleteUser);

module.exports = router;
