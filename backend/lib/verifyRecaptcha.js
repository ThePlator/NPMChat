export const verifyRecaptcha = async (token) => {
  try {
    const response = await fetch(
      "https://www.google.com/recaptcha/api/siteverify",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          secret: process.env.RECAPTCHA_SECRET_KEY,
          response: token,
        }),
      },
    )

    const data = await response.json()

    return data.success
  } catch (error) {
    console.error("reCAPTCHA verification failed:", error)
    return false
  }
}
