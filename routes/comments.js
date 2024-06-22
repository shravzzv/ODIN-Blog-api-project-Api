const express = require('express')
const router = express.Router()
const commentsController = require('../controllers/comments')
const protect = require('../middlewares/protect.middleware')

router.use(protect)

// GET all comments
router.get('/', commentsController.getComments)

// GET a single comment
router.get('/:id', commentsController.getComment)

// Create a new comment
router.post('/:postId', commentsController.createComment)

// Update a comment
router.put('/:id', commentsController.updateComment)

// Delete a comment
router.delete('/:id', commentsController.deleteComment)

module.exports = router
