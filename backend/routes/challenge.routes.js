import express from "express"
import {
  createChallenge,
  getChallenges,
  getChallengeById,
  submitSolution,
} from "../controllers/challenge.controller.js"
import { protectRoute as authenticate } from "../middleware/auth.js"

const router = express.Router()

router.post("/", authenticate, createChallenge)
router.get("/", getChallenges)
router.get("/:id", getChallengeById)
router.post("/:id/submit", authenticate, submitSolution)

export default router
