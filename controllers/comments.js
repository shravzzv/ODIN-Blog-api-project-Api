const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')

exports.getComments = asyncHandler(async (req, res) => {
  const posts = await Comment.find()
  res.json(posts)
})

exports.getComment = asyncHandler(async (req, res) => {
  res.send('getComment not implemented')
})

exports.createComment = asyncHandler(async (req, res) => {
  res.send('createComment not implemented')
})

exports.updateComment = asyncHandler(async (req, res) => {
  res.send('updateComment not implemented')
})

exports.deleteComment = asyncHandler(async (req, res) => {
  res.send('deleteComment not implemented')
})
