import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import User from '../models/User.js'

passport.use(new GoogleStrategy(
  {
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/v1/auth/google/callback`,
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id })

      if (!user) {
        const email = profile.emails?.[0]?.value
        user = email ? await User.findOne({ email }) : null

        if (user) {
          // Link Google to existing email/password account
          user.googleId = profile.id
          if (!user.avatarUrl) user.avatarUrl = profile.photos?.[0]?.value || ""  // ✅ fallback
          await user.save()
        } else {
          // Brand new user via Google
          user = await User.create({
            googleId:  profile.id,
            email:     profile.emails?.[0]?.value,
            name:      profile.displayName || profile.emails?.[0]?.value?.split('@')[0] || 'User',
            avatarUrl: profile.photos?.[0]?.value || "",   // ✅ fallback
            password:  null,
          })
        }
      }

      done(null, user)
    } catch (err) {
      done(err, null)
    }
  }
))

passport.use(new GitHubStrategy(
  {
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/v1/auth/github/callback`,
    scope:        ['user:email'],
  },
  async (_accessToken, _refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id })

      if (!user) {
        const email = profile.emails?.[0]?.value
        user = email ? await User.findOne({ email }) : null

        if (user) {
          // Link GitHub to existing email/password account
          user.githubId = profile.id
          if (!user.avatarUrl) user.avatarUrl = profile.photos?.[0]?.value || ""  // ✅ fallback
          await user.save()
        } else {
          // Brand new user via GitHub
          user = await User.create({
            githubId:  profile.id,
            email:     profile.emails?.[0]?.value,
            name:      profile.displayName || profile.username || profile.emails?.[0]?.value?.split('@')[0] || 'User',
            avatarUrl: profile.photos?.[0]?.value || "",   // ✅ fallback
            password:  null,
          })
        }
      }

      done(null, user)
    } catch (err) {
      done(err, null)
    }
  }
))

export default passport