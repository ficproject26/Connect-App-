const https = require('https');

function testHttpsEndpoint(urlStr, payload) {
  return new Promise((resolve) => {
    const url = new URL(urlStr);
    const postData = JSON.stringify(payload);

    const req = https.request({
      hostname: url.hostname,
      port: url.port || 443,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: 10000
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        resolve({ url: urlStr, status: res.statusCode, headers: res.headers, body });
      });
    });

    req.on('error', (err) => {
      resolve({ url: urlStr, error: err.message });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({ url: urlStr, error: 'Request timed out (10s)' });
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  const payload = { phone: '6379068721', mobileNumber: '6379068721', mobileOrEmail: '6379068721' };

  console.log('Testing Render OTP endpoint...');
  const res = await testHttpsEndpoint('https://connect-admin-96pc.onrender.com/api/auth/send-otp', payload);
  console.log('connect-admin-96pc.onrender.com ->', res);
}

run();
