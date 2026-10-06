// Entry point for PM2 and cloud deployments executing `node server.js`
const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, 'dist', 'index.js');
const srcIndex = path.join(__dirname, 'src', 'index.ts');


if (fs.existsSync(distIndex)) {
  require(distIndex);
} else {
  try {
    require('ts-node/register');
    require('./src/index.ts');
  } catch (err) {
    console.error("Could not load backend entry point. Please run 'npm run build' first:", err);
    process.exit(1);
  }
}
