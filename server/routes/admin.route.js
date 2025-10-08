const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('ADMIN'));

// Admin Routes
router.post('/create-user', asyncRouteHandler(adminController.createUser));
router.get('/fetch-users', asyncRouteHandler(adminController.getUsers));
router.get('/fetch-user/:userId', asyncRouteHandler(adminController.getUserById));
router.post('/update-user/:userId', asyncRouteHandler(adminController.updateUser));
router.post('/delete-user/:userId', asyncRouteHandler(adminController.deleteUser));

module.exports = router;
