## Description

Fixes #129

There was a logical casing mismatch in `backend/controllers/user.controller.js` during the signup process. When verifying the `emailVerificationToken`, the backend compared the `decoded.email` (from the JWT) with the `email` from the signup request payload using a strict equality check (`!==`). 

If a user started the OTP process using uppercase letters (e.g. `TEST@example.com`), the MongoDB schema for OTPs lowercased it, causing the JWT to be signed with `test@example.com`. However, when they submitted the signup form, the payload might still contain the uppercase email, causing the strict equality check to fail with:
> "Email verification session does not match this signup email."

## Changes Made
- Added `.toLowerCase()` to both sides of the email comparison in the `signup` controller function. This normalizes the casing before comparison and allows legitimate users to sign up without errors regardless of how they capitalized their email in the form.
- Added a new unit test `POST /api/v1/auth/signup - should succeed even with case differences in email` in `backend/tests/auth.test.js` to prevent regressions.

## GSSoC 2026
This PR is submitted as part of GSSoC 2026. Closes #129.
