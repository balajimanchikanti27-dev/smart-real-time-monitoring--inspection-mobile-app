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

const replacements = [
  { regex: /SMART INSPECTION/g, replace: 'Smart Inspect' },
  { regex: /Smart Inspection/g, replace: 'Smart Inspect' },
  { regex: /Smart Real-Time Monitoring & Inspection Portal/g, replace: 'Real-Time Inspection & Monitoring' }
];

function processFile(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts') || filePath.endsWith('.html') || filePath.endsWith('.json')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    for (const r of replacements) {
      content = content.replace(r.regex, r.replace);
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated: ${filePath}`);
    }
  }
}

walk(directory, processFile);

let indexHtmlPath = './index.html';
if (fs.existsSync(indexHtmlPath)) {
    processFile(indexHtmlPath);
}
