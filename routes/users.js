const express = require('express')
const router = express.Router()
const usersController = require('../controllers/users')
const protect = require('../middlewares/protect.middleware')

// Create a user
router.post('/signup', usersController.signup)

// Login a user
router.post('/signin', usersController.signin)

// Get a user
router.get('/:id', usersController.userGet)

// protect the routes
router.use(protect)

// Update a user
router.put('/:id', usersController.userUpdate)

// Delete a user
router.delete('/:id', usersController.userDelete)

module.exports = router
