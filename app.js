const express = require('express')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const compression = require('compression')
const RateLimit = require('express-rate-limit')
const cors = require('cors')
require('dotenv').config()

require('./config/db.config')
require('./config/cloudinary.config')
const indexRouter = require('./routes/index')
const usersRouter = require('./routes/users')
const postsRouter = require('./routes/posts')
const commentsRouter = require('./routes/comments')

const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.use(compression())
app.use(
  RateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
  })
) // 30 requests per minute

app.use('/', indexRouter)
app.use('/users', usersRouter)
app.use('/posts', postsRouter)
app.use('/comments', commentsRouter)

module.exports = app
