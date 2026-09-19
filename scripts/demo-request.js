const fs = require('fs');
const path = require('path');

const port = process.env.PORT || 3005;
const token = process.env.INTERNAL_SERVICE_TOKEN || 'change-me-internal-service-token';
const payloadPath = path.join(__dirname, '..', 'examples', 'attack-cluster.json');
const payload = JSON.parse(fs.readFileSync(payloadPath, 'utf8'));

async function main() {
  const response = await fetch(`http://127.0.0.1:${port}/api/v1/ai/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const body = await response.json();
  console.log(`HTTP ${response.status}`);
  console.log(JSON.stringify(body, null, 2));

  if (!response.ok) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
