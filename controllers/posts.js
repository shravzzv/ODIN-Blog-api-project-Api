const Post = require('../models/post')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')

exports.getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find()
  res.json(posts)
})

exports.getPost = asyncHandler(async (req, res) => {
  res.send('getPost not implemented')
})

exports.createPost = [
  // validate and saitize data
  body('title')
    .trim()
    .isLength({ min: 3, max: 32 })
    .withMessage('Title should be 3-32 characters long')
    .escape(),

  body('content')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Content should be atleast 3 characters long')
    .escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const { title, content } = matchedData(req, { onlyValidData: false })

    const post = new Post({
      title,
      content,
      author: '665c258650974f64b5e2ddef',
      // todo: make author the signed in user
    })

    if (errors.isEmpty()) {
      await post.save()
      res.json(post)
    } else {
      res.status(422).json(errors.array())
    }
  }),
]

exports.updatePost = asyncHandler(async (req, res) => {
  res.send('updatePost not implemented')
})

exports.deletePost = asyncHandler(async (req, res) => {
  res.send('deletePost not implemented')
})
