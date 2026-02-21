const crypto = require('crypto');
const config = require('../config');

function generatePassword(salt, password) {
  return new Promise((resolve, reject) => {
    crypto.pbkdf2(
      password,
      salt,
      config.crypto.iterations,
      config.crypto.length,
      config.crypto.digest,
      (err, key) => {
        if (err) return reject(err);
        resolve(key.toString('hex'));
      }
    );
  });
}

function generateSalt() {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(config.crypto.length, (err, buffer) => {
      if (err) return reject(err);
      resolve(buffer.toString('hex'));
    });
  });
}

async function createPasswordHash(password) {
  const salt = await generateSalt();
  const passwordHash = await generatePassword(salt, password);
  return { salt, passwordHash };
}

async function verifyPassword(user, password) {
  if (!password || !user || !user.salt || !user.passwordHash) return false;
  const hash = await generatePassword(user.salt, password);
  return hash === user.passwordHash;
}

module.exports = {
  createPasswordHash,
  verifyPassword,
};
