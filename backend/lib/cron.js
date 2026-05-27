import cron from "node-cron"
import sgMail from "@sendgrid/mail"
import ChallengeRoom from "../models/ChallengeRoom.js"
import Problem from "../models/Problem.js"
import User from "../models/User.js"

// Ensure you set SENDGRID_API_KEY in your .env
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

// Helper to get a random problem
const getRandomProblem = async () => {
  const count = await Problem.countDocuments()
  const random = Math.floor(Math.random() * count)
  return Problem.findOne().skip(random)
}

// Runs every Sunday at midnight (0 0 * * 0)
const initCronJobs = () => {
  console.log("Initializing cron jobs...")

  cron.schedule("0 0 * * 0", async () => {
    console.log("Running weekly automated challenge generator...")
    try {
      const problem = await getRandomProblem()

      if (!problem) {
        console.error("No problems found in DB to create weekly challenge.")
        return
      }

      const challenge = await ChallengeRoom.create({
        title: `Weekly Challenge: ${problem.title}`,
        problemId: problem._id,
        timeLimit: 60, // 1 hour
        isPublic: true,
        isAutomatedWeekly: true,
        startTime: Date.now(),
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      })

      console.log(`Created Weekly Challenge: ${challenge.title}`)

      // Fetch subscribers to notify them
      if (process.env.SENDGRID_API_KEY) {
        const subscribers = await User.find({
          isWeeklySubscriber: true,
        }).select("email name")

        const emails = subscribers.map((user) => ({
          to: user.email,
          from: process.env.SENDGRID_FROM_EMAIL || "noreply@npmchat.com",
          subject: "New Weekly Coding Challenge is Live!",
          text: `Hi ${user.name},\n\nA new weekly coding challenge "${problem.title}" is now live! Join the public room and compete on the leaderboard.\n\nGood luck!`,
          html: `<p>Hi ${user.name},</p><p>A new weekly coding challenge <strong>${problem.title}</strong> is now live!</p><p>Join the public room and compete on the leaderboard.</p><p>Good luck!</p>`,
        }))

        if (emails.length > 0) {
          // Send in batches to avoid rate limits
          await sgMail.send(emails)
          console.log(
            `Sent notification emails to ${emails.length} subscribers.`,
          )
        }
      } else {
        console.log("SENDGRID_API_KEY not set. Skipping email notifications.")
      }
    } catch (error) {
      console.error("Error running weekly automated challenge:", error)
    }
  })
}

export default initCronJobs
