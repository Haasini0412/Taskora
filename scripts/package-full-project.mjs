import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const zip = new JSZip();

function addDirectoryToZip(dirPath, zipFolder, excludeDirs = ['node_modules', '.git', 'dist']) {
  const items = fs.readdirSync(dirPath);

  for (const item of items) {
    if (excludeDirs.includes(item)) continue;

    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // Don't recurse into public/SmartAlert-*.zip to avoid nesting zip inside zip
      if (item === 'public' && dirPath === '.') {
        const publicItems = fs.readdirSync('public').filter(f => !f.endsWith('.zip'));
        const sub = zipFolder.folder('public');
        for (const pItem of publicItems) {
          const pPath = path.join('public', pItem);
          if (!fs.statSync(pPath).isDirectory()) {
            sub.file(pItem, fs.readFileSync(pPath));
          }
        }
        continue;
      }

      const subFolder = zipFolder.folder(item);
      addDirectoryToZip(fullPath, subFolder, excludeDirs);
    } else {
      if (item.endsWith('.zip')) continue;
      const content = fs.readFileSync(fullPath);
      zipFolder.file(item, content);
    }
  }
}

console.log('Packaging complete project repository...');
addDirectoryToZip('.', zip);

// Also include the Android Studio project cleanly inside an "android-studio-project" folder
if (fs.existsSync('public/SmartAlert-Android-Project.zip')) {
  // Read Android zip and nest its files inside android-project/
  const androidZipBuffer = fs.readFileSync('public/SmartAlert-Android-Project.zip');
  const androidZip = await JSZip.loadAsync(androidZipBuffer);
  const androidFolder = zip.folder('android-studio-project');
  
  for (const [filename, fileObj] of Object.entries(androidZip.files)) {
    if (!fileObj.dir) {
      const data = await fileObj.async('nodebuffer');
      androidFolder.file(filename, data);
    }
  }
}

// Write the complete project zip to public/SmartAlert-Complete-Project.zip
fs.mkdirSync('public', { recursive: true });
const buffer = await zip.generateAsync({
  type: 'nodebuffer',
  compression: 'DEFLATE',
  compressionOptions: { level: 9 },
});

fs.writeFileSync('public/SmartAlert-Complete-Project.zip', buffer);
console.log(`Successfully generated public/SmartAlert-Complete-Project.zip (${(buffer.length / 1024).toFixed(1)} KB)`);
