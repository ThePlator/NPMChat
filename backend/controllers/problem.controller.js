import Problem from "../models/Problem.js"

function isMissingTextIndexError(error) {
  if (!error) return false
  const msg = String(error.message || "")
  return (
    error.code === 27 || // MongoServerError: "IndexNotFound" for $text in some versions
    msg.includes("text index required") ||
    msg.includes("text index") && msg.includes("required") ||
    msg.includes("no text index")
  )
}

// GET /api/v1/problems
// Query params: search, difficulty, category, page, limit
export const getProblems = async (req, res) => {
  try {
    const { search, difficulty, category, page = 1, limit = 20 } = req.query
    const baseQuery = { published: true }
    if (difficulty) baseQuery.difficulty = difficulty
    if (category) baseQuery.category = category

    const skip = (Number(page) - 1) * Number(limit)

    const selectFields = "title slug difficulty category tags createdAt"

    let problems = []
    let total = 0

    if (search) {
      const textQuery = { ...baseQuery, $text: { $search: search } }
      try {
        problems = await Problem.find(textQuery)
          .select(selectFields)
          .sort({ score: { $meta: "textScore" } })
          .skip(skip)
          .limit(Number(limit))
        total = await Problem.countDocuments(textQuery)
      } catch (err) {
        if (!isMissingTextIndexError(err)) throw err

        // Fallback for environments where autoIndex is disabled or indexes aren't built yet.
        const safe = String(search).trim()
        const rx = safe ? new RegExp(safe.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i") : null
        const regexQuery = rx
          ? {
              ...baseQuery,
              $or: [{ title: rx }, { category: rx }, { tags: rx }],
            }
          : baseQuery

        problems = await Problem.find(regexQuery)
          .select(selectFields)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
        total = await Problem.countDocuments(regexQuery)
      }
    } else {
      problems = await Problem.find(baseQuery)
        .select(selectFields)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
      total = await Problem.countDocuments(baseQuery)
    }

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
