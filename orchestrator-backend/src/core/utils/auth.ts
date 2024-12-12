import crypto from "crypto";
import fs, { readFileSync } from 'fs';
import { generateKeyPairSync } from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config'

const green = '\x1b[32m';
const red = '\x1b[31m';
const reset = '\x1b[0m';

// Private key generation
export function generatePrivateKey(path: string) {
  if (!fs.existsSync(path)) {
    try {
      const { privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        privateKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem',
        },
      });

      fs.writeFileSync(path, privateKey);
      console.log(`${green}Private key generated and saved to id_rsa_priv.pem.${reset}\n`);
    } catch (err) {
      console.error(`${red}Error generating or saving private key:`, err, reset);
    }
  } else {
    console.log(`Private key already exists.\n`);
  }
}

/**
 * -------------- HELPER FUNCTIONS ----------------
 */

/**
 *
 * @param password - The plain text password
 * @param hash - The hash stored in the database
 * @param salt - The salt stored in the database
 *
 * This function uses the crypto library to decrypt the hash using the salt and then compares
 * the decrypted hash/salt with the password that the user provided at login
 */

/**
 *
 * @param password - The password string that the user inputs to the password field in the register form
 *
 * This function takes a plain text password and creates a salt and hash out of it.  Instead of storing the plaintext
 * password in the database, the salt and hash are stored for security
 *
 * ALTERNATIVE: It would also be acceptable to just use a hashing algorithm to make a hash of the plain text password.
 * You would then store the hashed password in the database and then re-hash it to verify later (similar to what we do here)
 */

// JWT token issueing
export function issueJWT(user: { _id: string }, key_path: string): { token: string; expires: string } {
  const _id = user._id;
  const expiresIn = "1d";
  const private_key = readFileSync(key_path, "utf8");

  const payload = {
    sub: _id,
    iat: Date.now(),
  };

  if (!private_key) {
    throw new Error('Private key is missing');
  }

  const signedToken = jsonwebtoken.sign(payload, private_key, {
    expiresIn,
    algorithm: "RS256",
  });

  return {
    token: "Bearer " + signedToken,
    expires: expiresIn,
  };
}

// Password generation
export function genPassword(password: string): { salt: string, hash: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { salt, hash: genHash };
}

// Password validation
export function validPassword(password: string, hash: string, salt: string): boolean {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}
