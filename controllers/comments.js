const Comment = require('../models/comment')
const Post = require('../models/post')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')

/**
 * Gets all the comments in the database.
 * Allows for sorting as well.
 */
exports.getComments = asyncHandler(async (req, res) => {
  const { sort } = req.query

  const comments = await Comment.find().sort(sort?.split(',').join(' '))

  res.json(comments)
})

/**
 * Get a single comment using an id.
 */
exports.getComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)
  if (!comment) return res.status(404).send('Not found.')
  res.json(comment)
})

/**
 * Create a comment.
 */
exports.createComment = [
  body('content')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Content should be atleast 3 characters long')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { content } = matchedData(req, { onlyValidData: false })

    const newComment = new Comment({
      content,
      post: req.params.postId,
      author: req.user.id,
    })

    if (errors.isEmpty()) {
      await Promise.all([
        newComment.save(),

        Post.findByIdAndUpdate(req.params.postId, {
          $push: {
            comments: newComment.id,
          },
        }),
      ])

      res.json(newComment)
    } else {
      res.status(422).json(errors.array())
    }
  }),
]

/**
 * Updates a comment.
 */
exports.updateComment = [
  body('content')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Content should be atleast 3 characters long')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { content } = matchedData(req, { onlyValidData: false })
    const comment = await Comment.findById(req.params.id)

    const updatedComment = new Comment({
      ...comment._doc,
      content,
    })

    if (errors.isEmpty()) {
      await Comment.findByIdAndUpdate(req.params.id, updatedComment)
      res.json(updatedComment)
    } else {
      res.status(422).json(errors.array())
    }
  }),
]

/**
 * Deletes a comment and updates its corresponding post as well.
 */
exports.deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id)

  if (!comment) return res.status(404).send('Not found')

  // remove the comment from the post
  await Post.findByIdAndUpdate(comment.post, {
    $pull: { comments: req.params.id },
  })

  await Comment.findByIdAndDelete(req.params.id)

  res.status(200).send('Comment deleted successfully.')
})
