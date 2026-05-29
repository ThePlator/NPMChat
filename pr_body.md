## Description

Fixes #128

The Socket.IO authentication middleware had a critical bypass vulnerability. After attempting JWT verification, it fell back to trusting a bare `userId` from the query string (`socket.handshake.query.userId`). This meant any client could supply an arbitrary `userId` and:

1. Hijack undelivered messages intended for that user (via the delivery sweep on connect)
2. Intercept live messages by being automatically joined to the victim's socket room
3. Impersonate the user in real-time chat

Since PR #122 recently updated the frontend to send the JWT in the `auth` object (`socket.handshake.auth.token`), this fallback is no longer needed.

## Changes Made

- **`backend/server.js`**: Removed the `socket.handshake.query.userId` fallback block.
- Made JWT verification mandatory for all WebSocket connections.
- Added safe optional chaining (`socket.handshake.auth?.token`) and robust error handling to return specific rejection reasons (e.g. `TokenExpiredError`) to clients connecting with invalid tokens.

## How it works

Now, any client connecting without a valid JWT token is rejected outright (`next(new Error("Authentication error: No token provided"))`), closing the bypass vulnerability.

## GSSoC 2026

This PR is submitted as part of GSSoC 2026. Closes #128.
