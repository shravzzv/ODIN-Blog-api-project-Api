const mongoose = require('mongoose')
const Schema = mongoose.Schema

const UserSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dateOfBirth: { type: Date, default: null },
    profilePicUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
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

UserSchema.virtual('dobFormatted').get(function () {
  const date = this.dateOfBirth
  const year = date.getFullYear()
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ]
  const month = monthNames[date.getMonth()]
  const day = date.getDate()

  //  (Month DD, YYYY) April 03, 2000
  const formattedDate = `${month} ${day.toString().padStart(2, '0')}, ${year}`
  return formattedDate
})

UserSchema.virtual('dobForInput').get(function () {
  const date = this.dateOfBirth
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  // (YYYY-MM-DD) 2000-04-03
  const formattedDate = `${year}-${month}-${day}`
  return formattedDate
})

module.exports = mongoose.model('Users', UserSchema)
