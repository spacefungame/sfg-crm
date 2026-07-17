const k = '$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi';
fetch('https://api.jsonbin.io/v3/b/6a5a442bf5f4af5e299ce6d0/latest', {
  headers: { 'X-Master-Key': k }
})
.then(r => r.json())
.then(j => {
  if (j.record) {
    console.log("SUCCESS! Record found in JSONBin:");
    console.log(" - Contacts count:", (j.record.contacts || []).length);
    console.log(" - Templates count:", (j.record.emailTemplates || []).length);
    console.log(" - Users count:", (j.record.users || []).length);
    console.log(" - Last sync timestamp:", j.record.cloudConfig?.lastSync);
    console.log(" - Contacts samples:", (j.record.contacts || []).slice(0, 5).map(c => `${c.firstName || ''} ${c.lastName || c.name || ''} (${c.company || ''})`));
  } else {
    console.log("ERROR:", j);
  }
})
.catch(console.error);
