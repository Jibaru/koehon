/**
 * AES-128 Encryption Utility
 *
 * This module provides encryption and decryption functions for securing sensitive data
 * such as API keys stored in the database.
 *
 * SETUP:
 * 1. Generate a secure encryption key:
 *    node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
 *
 * 2. Add the key to your .env file:
 *    ENCRYPTION_KEY=your_generated_key_here
 *
 * IMPORTANT:
 * - Never commit the ENCRYPTION_KEY to version control
 * - Keep the same key across deployments to decrypt existing data
 * - Changing the key will make existing encrypted data unreadable
 * - Back up the key securely
 */

import crypto from "crypto";

const ALGORITHM = "aes-128-cbc";
const IV_LENGTH = 16;

/**
 * Get encryption key from environment variable
 * The key must be exactly 16 bytes (128 bits) for AES-128
 */
function getEncryptionKey(): Buffer {
  const key = process.env.ENCRYPTION_KEY;

  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }

  // Ensure the key is exactly 16 bytes for AES-128
  // If the key is a hex string, convert it to buffer
  // Otherwise, hash it to ensure consistent length
  if (key.length === 32 && /^[0-9a-fA-F]+$/.test(key)) {
    // It's a 32-character hex string (16 bytes)
    return Buffer.from(key, "hex");
  } else {
    // Hash the key to ensure it's exactly 16 bytes
    return crypto.createHash("md5").update(key).digest();
  }
}

/**
 * Encrypt a string using AES-128-CBC
 * @param text - The text to encrypt
 * @returns The encrypted text in format: iv:encryptedData (both hex encoded)
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Return IV and encrypted data separated by colon
  return `${iv.toString("hex")}:${encrypted}`;
}

/**
 * Decrypt a string using AES-128-CBC
 * @param encryptedText - The encrypted text in format: iv:encryptedData
 * @returns The decrypted text
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  const [ivHex, encryptedData] = encryptedText.split(":");

  if (!ivHex || !encryptedData) {
    throw new Error("Invalid encrypted text format");
  }

  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return decrypted;
}
