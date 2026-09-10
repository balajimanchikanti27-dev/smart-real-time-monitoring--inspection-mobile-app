const fs = require('fs');
const path = require('path');

const directory = './src';

function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
  });
}

walk(directory, function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.html') || filePath.endsWith('.json')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace visible text
    content = content.replace(/NIRIKSHAN/g, 'SMART INSPECTION');
    content = content.replace(/Nirikshan/g, 'Smart Inspection');
    
    // Also change index.html if found
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
});

let indexHtmlPath = './index.html';
if (fs.existsSync(indexHtmlPath)) {
    let content = fs.readFileSync(indexHtmlPath, 'utf8');
    let original = content;
    content = content.replace(/NIRIKSHAN/g, 'SMART INSPECTION');
    content = content.replace(/Nirikshan/g, 'Smart Inspection');
    if (content !== original) {
      fs.writeFileSync(indexHtmlPath, content, 'utf8');
      console.log(`Updated: ${indexHtmlPath}`);
    }
}
