import crypto from "crypto";
import fs, { readFileSync } from 'fs';
import { generateKeyPairSync } from 'crypto';
import jsonwebtoken from 'jsonwebtoken';
import 'dotenv/config'

/* 
  Helper function for generating a RSA private key on this machine. If a key already
  exists in the provided directory, operation is skipped. Otherwise a new pem
  file is created.
*/
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
      console.log(`$\x1b[32mPrivate key generated and saved to id_rsa_priv.pem.$\x1b[0m\n`);
    } catch (err) {
      console.error(`$\x1b[31mError generating or saving private key:${err}\x1b[0m`);
    }
  } else {
    console.log(`Private key already exists.\n`);
  }
}

// This function takes a plain text password and creates a salt and hash out of it. It then returns
// an object with the token and an expiration.
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

// Generations a salt and hash based on a provided password
export function genPassword(password: string): { salt: string, hash: string } {
  const salt = crypto.randomBytes(32).toString('hex');
  const genHash = crypto
    .pbkdf2Sync(password, salt, 10000, 64, 'sha512')
    .toString('hex');
  return { salt, hash: genHash };
}

// Validates whether a provided password matches a hash and salt
export function validPassword(password: string, hash: string, salt: string): boolean {
  const hashVerify = crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
  return hash === hashVerify;
}
