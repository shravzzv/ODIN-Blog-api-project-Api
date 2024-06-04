const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users')
const authMiddleware = require('../middlewares/auth.middleware')

// Create a user
router.post('/signup', authMiddleware.redirectOnAuth, usersController.signup)

// Login a user
router.post('/signin', authMiddleware.redirectOnAuth, usersController.signin)

// Logout a user
router.post('/logout', authMiddleware.protect, usersController.logout)

// Get a user
router.get('/:id', authMiddleware.protect, usersController.getUser)

module.exports = router
