const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { asyncRouteHandler } = require('../utils/route.utils');
const { authMiddleware } = require('../middleware/auth.middleware');

router.use(authMiddleware('USER'));

// User Routes
router.post('/add-note', asyncRouteHandler(userController.addNote));
router.get('/fetch-notes', asyncRouteHandler(userController.getNotes));
router.get('/fetch-note/:noteId', asyncRouteHandler(userController.getNoteById));
router.post('/update-note/:noteId', asyncRouteHandler(userController.updateNote));
router.post('/delete-note/:noteId', asyncRouteHandler(userController.deleteNote));

module.exports = router;
