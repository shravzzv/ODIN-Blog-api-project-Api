const User = require('../models/user')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const bcrypt = require('bcryptjs')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage')
const passport = require('passport')

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
      next()
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

  asyncHandler(async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err)
      if (!user) {
        return res.status(401).json({ message: 'Login failed', errors: [info] })
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr)
        return res.send('Signup and authentication successfull.')
      })
    })(req, res, next)
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
    .custom(async (username) => {
      const user = await User.findOne({ username }, '_id')
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

  asyncHandler(async (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
      if (err) return next(err)
      if (!user) {
        return res.status(401).json({ message: 'Login failed', errors: [info] })
      }
      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr)
        // todo: handle JWT
        return res.send('Signin and authentication successfull')
      })
    })(req, res, next)
  }),
]

/**
 * Handle logout on POST.
 */
exports.logout = asyncHandler(async (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err)
    res.send('You are logged out.')
  })
})

/**
 * Get details of a single user.
 */
exports.getUser = asyncHandler(async (req, res) => {
  res.send('getUser not implemented')
})
