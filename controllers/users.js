const User = require('../models/user')
const Post = require('../models/post')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const bcrypt = require('bcryptjs')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage')
const passport = require('passport')
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

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)
    const sanitizedInput = matchedData(req, {
      onlyValidData: false,
      includeOptionals: true,
    })

    const user = new User({
      ...sanitizedInput,
      profilePicUrl: req.uploadedUrl || '',
    })

    if (errors.isEmpty() && !req.imageError) {
      const hashedPassword = await bcrypt.hash(matchedData(req).password, 10)
      user.password = hashedPassword

      await user.save()

      res.json({
        user,
        message: 'New account has been created, you can now sign in.',
      })
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
    .escape()
    .custom(async (username, { req }) => {
      const user = await User.findOne({ username }, '_id')
      if (user) req.body.userId = user.id
      if (!user) throw new Error(`Username doesn't exist.`)
    }),

  body('password')
    .trim()
    .isLength({ min: 8 })
    .withMessage('Password must be atleast 8 characters long.'),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req)

    if (errors.isEmpty()) {
      next()
    } else {
      return res.status(401).json({ message: 'Failed login', errors })
    }
  }),

  function (req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
      if (err || !user) {
        return res.status(400).json({
          message: 'Authentication failed',
          user: user,
          info,
        })
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err)
        }
        jwt.sign(
          { id: req.body.userId },
          process.env.JWT_SECRET,
          {
            expiresIn: '24h',
          },
          (err, token) => {
            res.json({ user, token })
          }
        )
      })
    })(req, res)
  },
]

/**
 * Get a single user with all of their posts and comments.
 */
exports.userGet = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)

  if (!user) return res.status(401).send('User does not exist.')

  const posts = await Post.find({ author: req.params.id }).populate('comments')

  res.json({ user, posts })
})
