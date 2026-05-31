const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const assetsDir = path.join(__dirname, 'glyde', 'assets');
const inputPath  = 'C:\\Users\\PC\\.gemini\\antigravity-ide\\brain\\9e722e18-6d76-40dc-8ca7-378a259e80af\\card2_updated_1780152317061.png';
const logoPath   = path.join(assetsDir, 'logo.svg');
const tmpPath    = path.join(assetsDir, 'card2_tmp.png');
const outputPath = path.join(assetsDir, 'card2.png');

async function main() {
  const wipeSvg = `
    <svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
      <polygon points="400,330 560,335 575,650 420,650" fill="white" />
    </svg>
  `;

  // Make the logo smaller so it fits nicely
  const logoW = 55;
  const logoH = Math.round(logoW * (314.37 / 268.74));
  
  // Center logo horizontally in the wiped area (center is ~485)
  // Center logo vertically in the upper part (center is ~420)
  const logoLeft = 485 - Math.round(logoW / 2);
  const logoTop  = 420 - Math.round(logoH / 2);

  const logoPng = await sharp(logoPath)
    .resize(logoW, logoH, { fit: 'fill' })
    .png()
    .toBuffer();

  await sharp(inputPath)
    .composite([
      { input: Buffer.from(wipeSvg), left: 0, top: 0, blend: 'over' },
      { input: logoPng, left: logoLeft, top: logoTop, blend: 'over' }
    ])
    .png()
    .toFile(tmpPath);

  fs.renameSync(tmpPath, outputPath);
  console.log('✅  Done! Saved to: ' + outputPath);
}
main();
