import swaggerJsdoc from "swagger-jsdoc"

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "NPMChat API",
      version: "1.0.0",
      description: "API documentation for the NPMChat backend.",
    },
    servers: [
      {
        url: "http://localhost:8080",
        description: "Local development server",
      },
    ],
    security: [{ bearerAuth: [] }],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "665f7d4c8f3a7f0012a45678" },
            email: { type: "string", format: "email", example: "user@example.com" },
            name: { type: "string", example: "Alex Chen" },
            avatarUrl: { type: "string", example: "https://example.com/avatar.png" },
            bio: { type: "string", example: "Building chat apps." },
          },
        },
        Message: {
          type: "object",
          properties: {
            _id: { type: "string", example: "665f7d4c8f3a7f0012a45679" },
            senderId: { type: "string", example: "665f7d4c8f3a7f0012a45678" },
            receiverId: { type: "string", example: "665f7d4c8f3a7f0012a45670" },
            text: { type: "string", example: "Hey, are you free today?" },
            image: { type: "string", example: "https://example.com/image.png" },
            seen: { type: "boolean", example: false },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: { type: "string", example: "Internal server error." },
          },
        },
      },
    },
  },
  apis: ["./routes/*.js"],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export default swaggerSpec