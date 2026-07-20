const https = require('https');

const binId = '6a5a442bf5f4af5e299ce6d0';
const binKey = '$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi';

const options = {
  hostname: 'api.jsonbin.io',
  path: `/v3/b/${binId}/latest`,
  method: 'GET',
  headers: {
    'X-Master-Key': binKey
  }
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', d => { data += d; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      if (json.record && json.record._compressed_v1) {
        console.log('JSONBin has COMPRESSED data. Size:', json.record._compressed_v1.length);
      } else {
        console.log('JSONBin has UNCOMPRESSED data. Keys:', Object.keys(json.record || {}));
      }
    } catch(e) {
      console.log('Parse error:', e);
    }
  });
});
req.end();
