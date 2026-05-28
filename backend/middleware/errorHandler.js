export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next)
}

export const notFoundHandler = (req, res, next) => {
  if (res.headersSent) return next()

  res.status(404).json({
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  })
}

export const globalErrorHandler = (err, req, res, next) => {
  if (res.headersSent) return next(err)

  const statusCode = err.statusCode || err.status || 500
  const isServerError = statusCode >= 500

  if (isServerError) {
    console.error("Unhandled API error:", err)
  }

  res.status(statusCode).json({
    message: isServerError ? "Internal server error." : err.message,
    ...(process.env.NODE_ENV === "development" && {
      error: err.message,
      stack: err.stack,
    }),
  })
}
