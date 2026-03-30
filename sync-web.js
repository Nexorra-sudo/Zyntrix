const fs = require('fs');
const path = require('path');

const rootDir = __dirname;
const webDir = path.join(rootDir, 'www');
const filesToSync = ['index.html', 'app.js', 'styles.css', 'manifest.json', 'service-worker.js', 'offline.html', 'icon.svg'];

fs.mkdirSync(webDir, { recursive: true });

for (const file of filesToSync) {
  const source = path.join(rootDir, file);
  const target = path.join(webDir, file);

  if (!fs.existsSync(source)) {
    continue;
  }

  fs.copyFileSync(source, target);
  console.log(`synced ${file}`);
}
