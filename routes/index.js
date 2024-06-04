const express = require('express')
const router = express.Router()
const authMiddleware = require('../middlewares/auth.middleware')

/* GET home page. */
router.get('/', authMiddleware.redirectOnAuth, function (req, res, next) {
  res.json({ message: 'You are not authenticated.' })
})

/* authenticated home page */
router.get('/authenticated', authMiddleware.protect, function (req, res, next) {
  res.json({ message: 'authenticated route not implemented.' })
})

module.exports = router
