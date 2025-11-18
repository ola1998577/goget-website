const jwt = require('jsonwebtoken');

const generateToken = (userId) => {
  // Ensure BigInt (from Prisma) is stringified before signing
  const id = typeof userId === 'bigint' ? userId.toString() : String(userId);
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

module.exports = generateToken;
