const express = require('express')
const router = express.Router()
const postsController = require('../controllers/posts')
const protect = require('../middlewares/protect.middleware')

// GET all posts
router.get('/', postsController.getPosts)

// GET a single posts
router.get('/:id', postsController.getPost)

// protect the routes below
router.use(protect)

// Create a new post
router.post('/', postsController.createPost)

// Update a post
router.put('/:id', postsController.updatePost)

// Delete a posts
router.delete('/:id', postsController.deletePost)

module.exports = router
