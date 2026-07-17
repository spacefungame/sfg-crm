const k = "$2a$10$ef5q0hmsrglb4cCJeE5mGebf9IdiM75IE.TW6EbK5kXQfg9sBiKIi";
fetch("https://api.jsonbin.io/v3/b/6a5a442bf5f4af5e299ce6d0", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "X-Master-Key": k
  },
  body: JSON.stringify({ test_put: 2, contacts: [] })
})
.then(async r => {
  console.log("PUT status:", r.status);
  console.log(await r.text());
})
.catch(console.error);
