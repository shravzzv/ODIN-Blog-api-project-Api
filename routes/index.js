const express = require('express')
const router = express.Router()

// GET all posts
router.get('/', (req, res) => {
  res.render('index')
})

module.exports = router
