const fs = require('fs');
const path = require('path');

const files = [
  'C:\\Users\\henke\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\070161.ldb',
  'C:\\Users\\henke\\AppData\\Local\\Google\\Chrome\\User Data\\Profile 1\\Local Storage\\leveldb\\001743.ldb',
  'C:\\Users\\henke\\AppData\\Local\\Google\\Chrome\\User Data\\Default\\Local Storage\\leveldb\\070221.ldb'
];

files.forEach(fp => {
  if (!fs.existsSync(fp)) return;
  try {
    const buf = fs.readFileSync(fp);
    ['utf8', 'utf16le'].forEach(enc => {
      const str = buf.toString(enc);
      let idx = str.indexOf('"contacts":[');
      while (idx !== -1) {
        // find start of object
        const start = str.lastIndexOf('{', idx);
        if (start !== -1) {
          // try to parse substring up to reasonable lengths
          for (let len = 10000; len <= 500000; len += 10000) {
            try {
              const sub = str.substring(start, start + len);
              // find last matching brace
              const lastBrace = sub.lastIndexOf('}');
              if (lastBrace !== -1) {
                const candidate = sub.substring(0, lastBrace + 1);
                const parsed = JSON.parse(candidate);
                if (parsed.contacts && parsed.contacts.length > 0) {
                  const demoIds = ['c-101', 'c-102', 'c-103', 'c-104', 'c-105', 'c-1'];
                  const realContacts = parsed.contacts.filter(c => !demoIds.includes(c.id));
                  if (realContacts.length > 0) {
                    console.log(`=== FOUND in ${path.basename(fp)} (${enc}) ===`);
                    console.log('Total real contacts:', realContacts.length);
                    realContacts.forEach(c => {
                      console.log(` - [${c.id}] ${c.firstName || ''} ${c.lastName || c.name || ''} (${c.company || c.email || ''}) [status: ${c.status}]`);
                    });
                    // Save best candidate to a file right away
                    fs.writeFileSync('recovered_data.json', JSON.stringify(parsed, null, 2));
                    console.log('Saved to recovered_data.json!');
                    return;
                  }
                }
              }
            } catch(e) {}
          }
        }
        idx = str.indexOf('"contacts":[', idx + 15);
      }
    });
  } catch(e) {
    console.error(e);
  }
});
