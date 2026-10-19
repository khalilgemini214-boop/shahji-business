// Copies the single-file app plus its vendored assets into www/.
// Capacitor uses www/ as the web bundle that gets packaged into the APK.
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'www');

function copyDir(src, dest) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    }
}

fs.rmSync(outDir, { recursive: true, force: true });
fs.mkdirSync(outDir, { recursive: true });

fs.copyFileSync(path.join(root, 'index.html'), path.join(outDir, 'index.html'));
copyDir(path.join(root, 'vendor'), path.join(outDir, 'vendor'));

// The live-update system uses this to decide whether the applied web bundle
// is older than the published one.
fs.writeFileSync(
    path.join(outDir, 'version.json'),
    JSON.stringify({
        webVersion: Number(process.env.WEB_VERSION || 0),
        generatedAt: new Date().toISOString()
    }, null, 2)
);

console.log('Web assets prepared in www/');
