const fs = require('fs');
const path = require('path');

function copyFolderSync(from, to) {
  if (!fs.existsSync(from)) return;
  if (!fs.existsSync(to)) fs.mkdirSync(to, { recursive: true });
  fs.readdirSync(from).forEach((element) => {
    const stat = fs.lstatSync(path.join(from, element));
    if (stat.isFile()) {
      fs.copyFileSync(path.join(from, element), path.join(to, element));
    } else if (stat.isDirectory()) {
      copyFolderSync(path.join(from, element), path.join(to, element));
    }
  });
}

const standaloneDir = path.join(__dirname, '.next', 'standalone');
if (!fs.existsSync(standaloneDir)) {
  console.error('.next/standalone not found. Please run "npm run build" first.');
  process.exit(1);
}

// 1. Copy .next/static to .next/standalone/.next/static
console.log('Copying .next/static into standalone package...');
copyFolderSync(path.join(__dirname, '.next', 'static'), path.join(standaloneDir, '.next', 'static'));

// 2. Copy public to .next/standalone/public
console.log('Copying public assets into standalone package...');
copyFolderSync(path.join(__dirname, 'public'), path.join(standaloneDir, 'public'));

// 3. Ensure app.js exists for cPanel / Phusion Passenger compatibility
fs.writeFileSync(
  path.join(standaloneDir, 'app.js'),
  "// Entry point for cPanel / Phusion Passenger Node.js environments\nrequire('./server.js');\n"
);

console.log('Standalone package prepared successfully in .next/standalone!');
