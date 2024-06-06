const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const passportJWT = require('passport-jwt')
const JWTStrategy = passportJWT.Strategy
const ExtractJWT = passportJWT.ExtractJwt

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username }, '_id password')

      if (!user)
        return done(null, false, {
          message: `User with username "${username}" doesn't exist.`,
        })

      const match = await bcrypt.compare(password, user.password)
      if (!match)
        return done(null, false, {
          message: `Incorrect password.`,
        })

      return done(null, user)
    } catch (error) {
      return done(error)
    }
  })
)
passport.serializeUser((user, done) => {
  try {
    return done(null, user.id)
  } catch (error) {
    return done(error)
  }
})
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id)
    return done(null, user)
  } catch (error) {
    return done(error)
  }
})

passport.use(
  new JWTStrategy(
    {
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async function (jwtPayload, cb) {
      try {
        const user = await User.findById(jwtPayload.id)
        return cb(null, user)
      } catch (err) {
        return cb(err)
      }
    }
  )
)
