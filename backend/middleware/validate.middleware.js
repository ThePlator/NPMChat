export const validateBody = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      status: "fail",
      message: "Validation error",
      errors: result.error.issues.map((err) => ({
        field: err.path.join("."),
        message: err.message,
      })),
    })
  }

  req.body = result.data
  next()
}