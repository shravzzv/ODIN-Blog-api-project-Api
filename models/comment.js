const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CommentSchema = new Schema(
  {
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
)

CommentSchema.virtual('url').get(function () {
  return `/comments/${this._id}`
})

module.exports = new mongoose.model('Comment', CommentSchema)
