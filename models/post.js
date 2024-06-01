const mongoose = require('mongoose')
const Schema = mongoose.Schema

const PostSchema = new Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
    coverImgUrl: { type: String, default: '' },
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
)

PostSchema.virtual('url').get(function () {
  return `/posts/${this._id}`
})

module.exports = new mongoose.model('Post', PostSchema)
