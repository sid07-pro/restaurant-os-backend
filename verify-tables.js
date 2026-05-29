const http = require('http');

async function doFetch(path) {
  return new Promise((resolve, reject) => {
    // 1. First get login token
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    };
    
    const reqLogin = http.request(loginOptions, (resLogin) => {
      let dataLogin = '';
      resLogin.on('data', chunk => dataLogin += chunk);
      resLogin.on('end', () => {
        const token = JSON.parse(dataLogin).accessToken;
        
        // 2. Fetch tables
        const options = {
          hostname: 'localhost',
          port: 3000,
          path: '/api/v1/tables',
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          }
        };
        const req = http.request(options, (res) => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => {
            const parsed = JSON.parse(data);
            console.log(`\n=== API RESPONSE GET /api/v1/tables ===`);
            console.log(`Status: ${res.statusCode}`);
            console.log(`Table Count: ${parsed.length}`);
            console.log(JSON.stringify(parsed, null, 2));
            resolve();
          });
        });
        req.on('error', reject);
        req.end();
      });
    });
    reqLogin.on('error', reject);
    reqLogin.write(JSON.stringify({ email: 'admin@restaurantos.local', password: 'Admin@12345' }));
    reqLogin.end();
  });
}

doFetch().catch(console.error);
