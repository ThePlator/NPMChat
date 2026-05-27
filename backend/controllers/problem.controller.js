import Problem from "../models/Problem.js"

// GET /api/v1/problems
// Query params: search, difficulty, category, page, limit
export const getProblems = async (req, res) => {
  try {
    const { search, difficulty, category, page = 1, limit = 20 } = req.query
    const query = { published: true }

    if (search) {
      query.$text = { $search: search }
    }
    if (difficulty) {
      query.difficulty = difficulty
    }
    if (category) {
      query.category = category
    }

    const skip = (Number(page) - 1) * Number(limit)

    // Only return list view fields to save bandwidth
    const problems = await Problem.find(query)
      .select("title slug difficulty category tags createdAt")
      .sort(search ? { score: { $meta: "textScore" } } : { createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    const total = await Problem.countDocuments(query)

    res.status(200).json({
      problems,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
    })
  } catch (error) {
    console.error("Error fetching problems:", error)
    res
      .status(500)
      .json({ message: "Internal server error while fetching problems." })
  }
}

// GET /api/v1/problems/:slug
export const getProblemBySlug = async (req, res) => {
  try {
    const { slug } = req.params
    const problem = await Problem.findOne({ slug, published: true })

    if (!problem) {
      return res.status(404).json({ message: "Problem not found." })
    }

    res.status(200).json({ problem })
  } catch (error) {
    console.error("Error fetching problem details:", error)
    res
      .status(500)
      .json({ message: "Internal server error while fetching problem." })
  }
}

// GET /api/v1/problems/categories
// Utility endpoint to get unique categories for the frontend filter
export const getCategories = async (req, res) => {
  try {
    const categories = await Problem.distinct("category", { published: true })
    res.status(200).json({ categories })
  } catch (error) {
    console.error("Error fetching categories:", error)
    res.status(500).json({ message: "Internal server error." })
  }
}
