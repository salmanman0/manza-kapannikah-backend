const crypto = require('crypto');

/**
 * Generates a cryptographically secure 6-digit OTP.
 * Uses crypto.randomBytes to avoid Math.random() predictability.
 */
const generateOtp = () => {
  const buffer = crypto.randomBytes(3);
  const otp = parseInt(buffer.toString('hex'), 16) % 1_000_000;
  return String(otp).padStart(6, '0');
};

/**
 * Hashes an OTP using SHA-256 for secure DB storage.
 */
const hashOtp = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Compares a plain OTP against a stored hash using timing-safe comparison
 * to prevent timing attacks.
 */
const verifyOtp = (plainOtp, hashedOtp) => {
  const hash = crypto.createHash('sha256').update(plainOtp).digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(hash, 'hex'),
      Buffer.from(hashedOtp, 'hex')
    );
  } catch {
    return false;
  }
};

module.exports = { generateOtp, hashOtp, verifyOtp };
