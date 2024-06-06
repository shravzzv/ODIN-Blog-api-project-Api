const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users')

// Create a user
router.post('/signup', usersController.signup)

// Login a user
router.post('/signin', usersController.signin)

// Get a user
router.get('/:id', usersController.userGet)

module.exports = router
