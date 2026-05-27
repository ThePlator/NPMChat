import express from "express"
import {
  getProblems,
  getProblemBySlug,
  getCategories,
} from "../controllers/problem.controller.js"

const router = express.Router()

// NOTE: Problem library is public for SEO, so we don't necessarily need protectRoute here
// Users can browse problems without being logged in
router.get("/categories", getCategories)
router.get("/", getProblems)
router.get("/:slug", getProblemBySlug)

export default router
