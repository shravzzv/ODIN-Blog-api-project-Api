const User = require('../models/user')
const asyncHandler = require('express-async-handler')

exports.signup = asyncHandler(async (req, res) => {
  res.send('signup not implemented')
})

exports.signin = asyncHandler(async (req, res) => {
  res.send('signin not implemented')
})

exports.getUser = asyncHandler(async (req, res) => {
  res.send('getUser not implemented')
})
