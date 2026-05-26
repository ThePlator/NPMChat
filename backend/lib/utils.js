import jwt from "jsonwebtoken"

export function generateToken(userId) {
  if (!userId) {
    throw new Error("User ID is required to generate a token")
  }

  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d", // Token validity period
  })

  return token
}

export const verifyRecaptcha = async (captchaToken) => {
  if (!captchaToken) return false;
  try {
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${captchaToken}`,
    });
    const data = await response.json();
    return data.success;
  } catch (error) {
    console.error("Recaptcha verification error:", error);
    return false;
  }
};
