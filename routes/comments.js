const express = require('express')
const router = express.Router()
const commentsController = require('../controllers/comments')
const passport = require('passport')

router.use(passport.authenticate('jwt', { session: false }))

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
