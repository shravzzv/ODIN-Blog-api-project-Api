const express = require('express')
const router = express.Router()
const postsController = require('../controllers/posts')
const authMiddleware = require('../middlewares/auth.middleware')

router.use(authMiddleware.protect)

// GET all posts
router.get('/', postsController.getPosts)

// GET a single posts
router.get('/:id', postsController.getPost)

// Create a new post
router.post('/', postsController.createPost)

// Update a post
router.put('/:id', postsController.updatePost)

// Delete a posts
router.delete('/:id', postsController.deletePost)

module.exports = router
