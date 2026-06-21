const https = require('https');
const dns = require('dns');

const customAgent = new https.Agent({
  lookup: (hostname, options, callback) => {
    if (hostname === 'sentinelvault-snlx-q.fly.dev') {
      const isAll = typeof options === 'object' && options !== null && options.all;
      if (isAll) {
        callback(null, [{ address: '66.241.125.125', family: 4 }]);
      } else {
        callback(null, '66.241.125.125', 4);
      }
    } else {
      dns.lookup(hostname, options, callback);
    }
  }
});

const payload = JSON.stringify({
  email: "test5@test.com",
  password: "Password123!",
  confirmPassword: "Password123!",
  firstName: "Test",
  lastName: "User"
});

const req = https.request('https://sentinelvault-snlx-q.fly.dev/api/v1/Auth/register', {
  method: 'POST',
  agent: customAgent,
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Status:', res.statusCode, 'Data:', data));
});

req.on('error', err => console.error(err));
req.write(payload);
req.end();
