## 📝 Pull Request Template

> Please complete all sections before submitting your PR. This helps
> reviewers understand the context and purpose of your changes.

---

## 📌 Description

_What does this PR do? Describe the purpose, changes made, and the problem it solves._

- Type: Bug Fix 

- Summary: 
Hey! I noticed the `/api/v1/auth/send-otp` route was missing the CAPTCHA check that the other auth routes have (like login and signup). This could allow bots to easily bypass the check and spam the OTP endpoint, which would eat up the email service quotas pretty fast.
I copied over the `verifyRecaptcha` block from the `forgotPassword` controller to fix this. It also skips the check in test mode so we don't break any existing tests. Let me know if you need anything else changed!

---

## 🔗 Related Issues
> Reference related issues (use #issue_number)

- Closes #139

- Related to #139

---

## ✅ Checklist

- [x] Code compiles and runs clean
- [ ] Added/Updated documentation
- [ ] Added/Updated tests
- [x] Linted and formatted code
- [x] Related issue linked
- [x] No sensitive data added

---

## 📸 Screenshots (if applicable)

_Add screenshots or video of the UI/terminal output if relevant._

---

## 💬 Notes for Reviewers

_Anything extra reviewers should know (edge cases, known issues, etc.)_
Skipped in test mode automatically!

---

## 🧪 How to Test This PR

- Pull this branch
- Run `npm install`
- Run `npm run dev`
- Try hitting `POST /api/v1/auth/send-otp` in Postman without a `captchaToken`. It should return a 400 Bad Request with `"CAPTCHA token is required."`
- Hit it with a valid CAPTCHA token and it should work.

---

## 📦 Tech Stack

- Node.js
- Express
- MongoDB
- Socket.IO
- React

---

## GSSoC 2026

This PR is submitted as part of GSSoC 2026.
