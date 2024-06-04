const asyncHandler = require('express-async-handler')

/**
 * Enforces authentication for protected routes. Redirects unauthenticated users to the signin page.
 */
exports.protect = asyncHandler((req, res, next) => {
  if (!req.user)
    return res
      .status(401)
      .send(
        'You are not authenticated. You need authentication to access this resource.'
      )
  else next()
})

/**
 * Redirects authenticated users to dashboard for specific routes (e.g., signin, signup, landing).
 */
exports.redirectOnAuth = (req, res, next) => {
  if (req.user)
    return res
      .status(401)
      .send('You cannot access this page while you are authenticated.')
  else next()
}
