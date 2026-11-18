const test = require('node:test');
const assert = require('node:assert/strict');
const http = require('node:http');

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => {
        const body = Buffer.concat(chunks).toString();
        try {
          resolve({ statusCode: res.statusCode, body: JSON.parse(body) });
        } catch (error) {
          resolve({ statusCode: res.statusCode, body });
        }
      });
    }).on('error', reject);
  });
}

test('server returns health info', async () => {
  const response = await getJson('http://localhost:3001/api/health');
  assert.equal(response.statusCode, 200);
  assert.equal(response.body.service, 'WHATIF backend');
});
