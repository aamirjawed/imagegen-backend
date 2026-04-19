const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'templates');

if (!fs.existsSync(templatesDir)) {
    fs.mkdirSync(templatesDir);
}

const bgPath = path.join(templatesDir, 'sample-bg.png');

sharp({
  create: {
    width: 1080,
    height: 1080,
    channels: 4,
    background: { r: 200, g: 200, b: 200, alpha: 1 } // grey background
  }
})
.png()
.toFile(bgPath)
.then(() => {
  console.log('Dummy background image created at:', bgPath);
})
.catch(err => {
  console.error('Error creating background image:', err);
});
