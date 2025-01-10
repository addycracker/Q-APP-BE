const bcrypt = require('bcryptjs');

async function generateHash(password) {
  const salt = await bcrypt.genSalt(2);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
}

async function verifyHash(password, hashedPassword) {
  const passwordMatch = await bcrypt.compare(password, hashedPassword);
  return passwordMatch;
}

module.exports = { generateHash, verifyHash };
