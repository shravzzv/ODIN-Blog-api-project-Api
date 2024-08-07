const User = require('../models/user')
const Post = require('../models/post')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const bcrypt = require('bcryptjs')
const multerUtils = require('../utils/multer.util')
const cloudinaryUtils = require('../utils/cloudinary.util')
const handleImage = require('../middlewares/handleImage')
const jwt = require('jsonwebtoken')

/**
 * Creates a new user.
 */
exports.signup = [
  multerUtils.upload.single('file'),
  handleImage,

  body('firstName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('First name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('First name must be a maximum of 20 characters long.')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Last name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Last name must be a maximum of 20 characters long.')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not a valid email address.')
    .escape()
    .custom(async (email) => {
      const existingUser = await User.findOne({ email }, '_id')
      if (existingUser) throw new Error(`E-mail already in use.`)
    }),

  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .escape()
    .custom(async (username) => {
      const existingUser = await User.findOne({ username }, '_id')
      if (existingUser) throw new Error(`Username already in use.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  body('passwordConfirm')
    .trim()
    .notEmpty()
    .withMessage('Password confirm must not be empty.')
    .bail()
    .custom((value, { req }) => {
      return value === req.body.password
    })
    .withMessage(`Doesn't match the password.`),

  body('bio').trim().optional().escape(),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)
    const sanitizedInput = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const newUser = new User({
      ...sanitizedInput,
      profilePicUrl: req.uploadedUrl || '',
    })

    if (errors.isEmpty() && !req.imageError) {
      const hashedPassword = await bcrypt.hash(matchedData(req).password, 10)
      newUser.password = hashedPassword

      await newUser.save()

      const token = jwt.sign({ id: newUser.id }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      })

      res.json({ token, userId: newUser.id })
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({
          msg: req.imageError.message,
          path: 'file',
        })

      return res
        .status(401)
        .json({ message: 'Failed signup', errors: allErrors })
    }
  }),
]

/**
 * Signin a user.
 */
exports.signin = [
  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .bail()
    .escape()
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username }, '_id password')
      if (user) req.user = user
      if (!user) throw new Error(`Username ${username} doesn't exist.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.')
    .bail()
    .custom(async (password, { req }) => {
      if (req.user && !(await bcrypt.compare(password, req.user.password))) {
        throw new Error('Incorrect password.')
      }
    }),

  asyncHandler(async (req, res) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, {
        expiresIn: '12h',
      })

      res.json({ token, userId: req.user.id })
    } else {
      return res
        .status(401)
        .json({ message: 'Failed login', errors: errors.array() })
    }
  }),
]

/**
 * Get a single user with all of their posts and comments.
 */
exports.userGet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) return res.status(401).json({ message: 'User does not exist.' })

  const posts = await Post.find({ author: req.params.id }).populate('comments')

  res.json({ user, posts })
})

/**
 * Update a user.
 * Can update every detail of the user except for the password.
 */
exports.userUpdate = [
  multerUtils.upload.single('file'),
  handleImage,

  body('firstName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('First name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('First name must be a maximum of 20 characters long.')
    .escape(),

  body('lastName')
    .trim()
    .isLength({ min: 3 })
    .withMessage('Last name must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('Last name must be a maximum of 20 characters long.')
    .escape(),

  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email must not be empty.')
    .bail()
    .isEmail()
    .withMessage('Email is not a valid email address.')
    .escape()
    .custom(async (email, { req }) => {
      const existingEmail = req.user.email
      if (email === existingEmail) return true

      const existingUser = await User.findOne({ email }, '_id')
      if (existingUser) throw new Error(`E-mail already in use.`)
    }),

  body('username')
    .trim()
    .isLength({ min: 3 })
    .withMessage('username must be atleast 3 characters long.')
    .bail()
    .isLength({ max: 20 })
    .withMessage('username must be a maximum of 20 characters long.')
    .escape()
    .custom(async (username, { req }) => {
      const currentUsername = req.user.username
      if (username === currentUsername) return true

      const existingUser = await User.findOne({ username }, '_id')
      if (existingUser) throw new Error(`Username already in use.`)
    }),

  body('bio').trim().optional().escape(),

  asyncHandler(async (req, res) => {
    if (req.user.id !== req.params.id)
      return res.status(401).json({
        message: 'Unauthorized. You can update your own account only.',
      })

    const errors = validationResult(req)
    const sanitizedData = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const updatedUser = new User({
      ...req.user._doc,
      ...sanitizedData,
      profilePicUrl: req.uploadedUrl,
    })

    if (req.uploadedUrl && req.uploadedUrl !== req.user.profilePicUrl) {
      await User.findByIdAndUpdate(req.user.id, {
        $set: { profilePicUrl: req.uploadedUrl },
      })
    }

    if (errors.isEmpty() && !req.imageError) {
      await User.findByIdAndUpdate(req.user.id, updatedUser)
      res.json({ message: 'User updated successfully.', updatedUser })
    } else {
      const allErrors = errors.array()

      if (req.imageError)
        allErrors.push({
          msg: req.imageError.message,
          path: 'file',
        })

      res
        .status(401)
        .json({ message: 'Update user failed.', errors: allErrors })
    }
  }),
]

/**
 * Deletes a user.
 */
exports.userDelete = asyncHandler(async (req, res) => {
  if (req.user.id !== req.params.id)
    return res.status(401).json({
      message: 'Unauthorized. You can delete your own account only.',
    })

  // delete user profilePicture from cloudinary if present
  if (req.user.profilePicUrl) {
    await cloudinaryUtils.deleteUploadedFile(req.user.profilePicUrl)
  }

  await User.findByIdAndDelete(req.user.id)
  res.json({ message: 'User deleted successfully.' })
})
