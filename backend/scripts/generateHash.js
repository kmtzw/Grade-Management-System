const path = require('path');

// Same explicit path fix as verifyLogin.js
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');

async function main() {
  const password = 'Password123';
  const hash     = await bcrypt.hash(password, 12);

  console.log('\nPassword:', password);
  console.log('Hash:    ', hash);
  console.log('\nCopy the hash above into your seed file.\n');
}

main();