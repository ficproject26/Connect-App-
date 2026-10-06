// Entry point for PM2 and cloud deployments executing `node server.js`
const fs = require('fs');
const path = require('path');

const distIndex = path.join(__dirname, 'dist', 'index.js');
const srcIndex = path.join(__dirname, 'src', 'index.ts');

// Check if source files were updated without re-running 'npm run build'
if (fs.existsSync(srcIndex) && fs.existsSync(distIndex)) {
  try {
    const srcMtime = fs.statSync(srcIndex).mtimeMs;
    const distMtime = fs.statSync(distIndex).mtimeMs;
    if (srcMtime > distMtime) {
      console.log('[Server Startup]: src/index.ts is newer than dist/index.js. Attempting automatic compilation...');
      try {
        require('child_process').execSync('npx tsc', { cwd: __dirname, stdio: 'inherit', timeout: 30000 });
        console.log('[Server Startup]: Automatic compilation succeeded.');
      } catch (compileErr) {
        console.warn('[Server Startup Warning]: Automatic compilation skipped or failed, using existing dist:', compileErr.message);
      }
    }
  } catch (statErr) {
    // Ignore stat error and proceed to load dist
  }
}

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
