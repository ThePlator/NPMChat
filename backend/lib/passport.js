
import passport from "passport"
import { Strategy as GoogleStrategy } from "passport-google-oauth20"
import { Strategy as GitHubStrategy } from "passport-github2"
import User from "../models/User.js"

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || "/api/v1/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id })
        if (!user) {
          user = await User.findOne({ email: profile.emails?.[0]?.value })
          if (user) {
            user.googleId = profile.id
            await user.save()
          } else {
            user = await User.create({
              googleId: profile.id,
              email: profile.emails?.[0]?.value,
              name: profile.displayName,
              avatarUrl: profile.photos?.[0]?.value || "",
              bio: "",
            })
          }
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    },
  ))
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL || "/api/v1/auth/github/callback",
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ githubId: profile.id })
        if (!user) {
          const email = profile.emails?.[0]?.value
          user = email ? await User.findOne({ email }) : null
          if (user) {
            user.githubId = profile.id
            await user.save()
          } else {
            user = await User.create({
              githubId: profile.id,
              email: profile.emails?.[0]?.value || "",
              name: profile.displayName || profile.username,
              avatarUrl: profile.photos?.[0]?.value || "",
              bio: "",
            })
          }
        }
        return done(null, user)
      } catch (err) {
        return done(err)
      }
    },
  ))
}

export default passport