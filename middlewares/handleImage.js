const fs = require('fs')
const cloudinaryUtils = require('../utils/cloudinary.util')

/**
 * Uploads a single image to cloudinary and stores the uploaded url in "req.uploadedUrl". If there is an error while uploading the image, stores the error in "req.uploadError".
 *
 * Also allows re-writing of an existing image. In that cases, the existing image url should be in the req.body.imgUrl.
 *
 * @param {Request} req - The Express request object.
 * @param {Response} res - The Express response object.
 * @param {NextFunction} next - The next function in the middleware chain.
 */
const handleImage = async (req, res, next) => {
  if (req.body.imgUrl) req.uploadedUrl = req.body.imgUrl

  if (req.file) {
    if (!req.file.mimetype.startsWith('image/')) {
      req.imageError = new Error('Please upload an image file.')
    } else {
      if (req.body.imgUrl)
        await cloudinaryUtils.deleteUploadedFile(req.body.imgUrl)

      req.uploadedUrl = await cloudinaryUtils.getUploadedUrl(req.file.path)
    }
    fs.unlink(req.file.path, (err) => err && console.log(err))
    next()
  } else next()
}

module.exports = handleImage
