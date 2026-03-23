const http = require('http');

async function trigger() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/admin/cleanup-imageless',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Body: ${body}`);
                resolve();
            });
        });

        req.on('error', (e) => reject(e));
        req.write('{}');
        req.end();
    });
}

trigger();
