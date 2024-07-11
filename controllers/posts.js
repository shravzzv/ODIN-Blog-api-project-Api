const Post = require('../models/post')
const Comment = require('../models/comment')
const asyncHandler = require('express-async-handler')
const { body, validationResult, matchedData } = require('express-validator')
const multerUtils = require('../utils/multer.util')
const handleImage = require('../middlewares/handleImage')
const cloudinaryUtils = require('../utils/cloudinary.util')

/**
 * Gets all the posts from the collection.
 * Allows for sorting the posts using created time, updated time and the titles.
 * Allows for pagination and filtering as well.
 *
 * `limit` limits the number of results, if 0 or empty returns all and `skip` skips the results, if 0 or empty, doesn't skip anything.
 */
exports.getPosts = asyncHandler(async (req, res) => {
  const { sort, limit, skip, isPublished } = req.query
  const query = {}
  if (isPublished) {
    query.isPublished = isPublished === 'true'
  }

  const posts = await Post.find(query)
    .limit(limit)
    .skip(skip)
    .sort(sort?.split(',').join(' '))
    .populate('comments')

  res.json(posts)
})

/**
 * Gets a single post with its comments.
 */
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate({
    path: 'comments',
    populate: {
      path: 'author',
    },
  })

  if (!post) return res.status(404).json({ message: 'Not found.' })
  res.json(post)
})

/**
 * Creates a new post. It validates the user input and creates a new document only if there are no errors. If any errors are present, sends back the errors to the user.
 */
exports.createPost = [
  multerUtils.upload.single('file'),
  handleImage,

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
      author: '66766070634c7c7536fc2dca', // user id of user Sai Shravan with username shravzzv because only I can add new posts
      coverImgUrl: req.uploadedUrl || '',
      isPublished: req.body.isPublished || false,
    })

    if (errors.isEmpty() && !req.imageError) {
      await post.save()
      res.json(post)
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({ path: 'file', msg: req.imageError.message })

      res.status(422).json({ errors: allErrors })
    }
  }),
]

/**
 * Updates a post. It validates the new input and sends the appropriate responses based on the presence or absence of errors.
 */
exports.updatePost = [
  multerUtils.upload.single('file'),
  handleImage,

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
    const post = await Post.findById(req.params.id)

    const updatedPost = new Post({
      ...post._doc,
      title,
      content,
      coverImgUrl: req.uploadedUrl || req.body.coverImgUrl || '',
      isPublished: req.body.isPublished || false,
    })

    if (errors.isEmpty() && !req.imageError) {
      await Post.findByIdAndUpdate(req.params.id, updatedPost)
      res.json(updatedPost)
    } else {
      const allErrors = errors.array()
      if (req.imageError)
        allErrors.push({ path: 'file', msg: req.imageError.message })

      res.status(422).json({ errors: allErrors })
    }
  }),
]

/**
 * Deletes a post. If it has a cover image, also deletes it from the cloud.
 */
exports.deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
  if (!post) return res.status(404).json({ message: 'Post not found' })

  if (post.coverImgUrl)
    await cloudinaryUtils.deleteUploadedFile(post.coverImgUrl)

  // delete all comments as well if there are any
  if (post.comments.length) {
    post.comments.forEach(async (id) => await Comment.findByIdAndDelete(id))
  }

  await Post.findByIdAndDelete(req.params.id)

  res.json({ message: 'Post deleted successfully.' })
})
