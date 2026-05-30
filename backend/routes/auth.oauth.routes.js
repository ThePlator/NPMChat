import express from 'express'
import passport from '../lib/passport.js'
import { generateToken } from '../lib/utils.js'

const oauthRouter = express.Router()



oauthRouter.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)

oauthRouter.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id)
  
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`)
  }
)

 
oauthRouter.get(
  '/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
)

oauthRouter.get(
  '/github/callback',
  passport.authenticate('github', {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=oauth_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id)
    res.redirect(`${process.env.CLIENT_URL}/oauth-callback?token=${token}`)
  }
)

export default oauthRouter