const axios = require('axios');

async function run(email, password) {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
    console.log('OK', res.data.user.email, 'token length', res.data.accessToken.length);
  } catch (e) {
    if (e.response) {
      console.error('FAIL', e.response.status, e.response.data);
    } else {
      console.error('ERR', e.message);
    }
    process.exitCode = 1;
  }
}

const [email, password] = process.argv.slice(2);
if (!email || !password) {
  console.error('usage: node scripts/testLogin.js <email> <password>');
  process.exit(2);
}
run(email, password);
