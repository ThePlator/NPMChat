import jwt from 'jsonwebtoken';

export function generateToken(userId) {
  if (!userId) {
    throw new Error('User ID is required to generate a token');
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    console.error('JWT_SECRET is not set in environment variables');
    throw new Error('JWT_SECRET must be set in environment variables');
  }

  const token = jwt.sign({ id: userId }, jwtSecret, {
    expiresIn: '30d', // Token validity period
  });

  return token;
}
