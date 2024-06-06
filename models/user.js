const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
)

UserSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`
})

UserSchema.virtual('url').get(function () {
  return `/users/${this._id}`
})

module.exports = mongoose.model('Users', UserSchema)
