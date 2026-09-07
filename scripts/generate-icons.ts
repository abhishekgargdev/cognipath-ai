import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// 1. Standard Brand SVG (1024x1024)
const standardSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Cream Background -->
  <rect width="1024" height="1024" rx="128" fill="#F9F7F2"/>
  
  <!-- Outer Academic Frame -->
  <rect x="64" y="64" width="896" height="896" rx="96" fill="none" stroke="#8B2635" stroke-width="16" stroke-opacity="0.25"/>
  <rect x="96" y="96" width="832" height="832" rx="72" fill="none" stroke="#8B2635" stroke-width="8" stroke-opacity="0.15"/>

  <!-- Center Emblem: Monogram 'C' with AI Spark -->
  <g transform="translate(512, 512)">
    <!-- Main Crimson Circle Seal -->
    <circle r="340" fill="#8B2635"/>
    <circle r="310" fill="none" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.4"/>
    
    <!-- Serif 'C' Monogram -->
    <path d="M 120 -150 C 70 -220 -30 -240 -110 -190 C -200 -130 -240 -10 -210 100 C -180 200 -60 250 50 220 C 120 200 170 140 180 80 L 80 80 C 70 110 40 140 -10 140 C -70 140 -120 90 -130 20 C -140 -60 -90 -140 -20 -150 C 40 -160 80 -120 100 -80 Z" fill="#F9F7F2"/>

    <!-- AI Node Spark Accent -->
    <g transform="translate(140, -110)">
      <path d="M 0 -70 Q 0 0 70 0 Q 0 0 0 70 Q 0 0 -70 0 Q 0 0 0 -70 Z" fill="#F9F7F2"/>
      <circle r="16" fill="#8B2635"/>
    </g>

    <!-- Node Connection Lines -->
    <circle cx="-160" cy="-160" r="14" fill="#F9F7F2"/>
    <circle cx="160" cy="160" r="14" fill="#F9F7F2"/>
    <circle cx="-180" cy="120" r="12" fill="#F9F7F2" opacity="0.8"/>
    <line x1="-160" y1="-160" x2="-100" y2="-100" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.6"/>
    <line x1="160" y1="160" x2="100" y2="100" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.6"/>
  </g>
</svg>`;

// 2. Maskable SVG (1024x1024 with 20% safe zone padding)
const maskableSvg = `<svg width="1024" height="1024" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
  <!-- Full Bleed Cream Background for Maskable Icons -->
  <rect width="1024" height="1024" fill="#F9F7F2"/>
  
  <!-- Scaled Down Content to fit 80% Safe Zone -->
  <g transform="translate(512, 512) scale(0.75)">
    <!-- Main Crimson Circle Seal -->
    <circle r="340" fill="#8B2635"/>
    <circle r="310" fill="none" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.4"/>
    
    <!-- Serif 'C' Monogram -->
    <path d="M 120 -150 C 70 -220 -30 -240 -110 -190 C -200 -130 -240 -10 -210 100 C -180 200 -60 250 50 220 C 120 200 170 140 180 80 L 80 80 C 70 110 40 140 -10 140 C -70 140 -120 90 -130 20 C -140 -60 -90 -140 -20 -150 C 40 -160 80 -120 100 -80 Z" fill="#F9F7F2"/>

    <!-- AI Node Spark Accent -->
    <g transform="translate(140, -110)">
      <path d="M 0 -70 Q 0 0 70 0 Q 0 0 0 70 Q 0 0 -70 0 Q 0 0 0 -70 Z" fill="#F9F7F2"/>
      <circle r="16" fill="#8B2635"/>
    </g>

    <!-- Node Connection Lines -->
    <circle cx="-160" cy="-160" r="14" fill="#F9F7F2"/>
    <circle cx="160" cy="160" r="14" fill="#F9F7F2"/>
    <circle cx="-180" cy="120" r="12" fill="#F9F7F2" opacity="0.8"/>
    <line x1="-160" y1="-160" x2="-100" y2="-100" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.6"/>
    <line x1="160" y1="160" x2="100" y2="100" stroke="#F9F7F2" stroke-width="6" stroke-opacity="0.6"/>
  </g>
</svg>`;

async function generateAssets() {
  const publicDir = path.join(process.cwd(), 'public');

  console.log('Generating CogniPath AI brand icon suite...');

  const standardBuffer = Buffer.from(standardSvg);
  const maskableBuffer = Buffer.from(maskableSvg);

  // 1. Save SVGs
  fs.writeFileSync(path.join(publicDir, 'icon-source.svg'), standardSvg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), standardSvg);

  // 2. Output icon-192.png & icon-512.png
  await sharp(standardBuffer).resize(192, 192).toFile(path.join(publicDir, 'icon-192.png'));
  await sharp(standardBuffer).resize(512, 512).toFile(path.join(publicDir, 'icon-512.png'));

  // 3. Output icon-192-maskable.png & icon-512-maskable.png
  await sharp(maskableBuffer).resize(192, 192).toFile(path.join(publicDir, 'icon-192-maskable.png'));
  await sharp(maskableBuffer).resize(512, 512).toFile(path.join(publicDir, 'icon-512-maskable.png'));

  // 4. Output apple-touch-icon.png (180x180)
  await sharp(standardBuffer).resize(180, 180).toFile(path.join(publicDir, 'apple-touch-icon.png'));

  // 5. Output favicon.ico & favicon.png
  await sharp(standardBuffer).resize(48, 48).toFile(path.join(publicDir, 'favicon.ico'));
  await sharp(standardBuffer).resize(32, 32).toFile(path.join(publicDir, 'favicon.png'));

  console.log('✓ All CogniPath AI brand icon assets generated in /public:');
  console.log('  - favicon.ico (48x48)');
  console.log('  - favicon.png (32x32)');
  console.log('  - apple-touch-icon.png (180x180)');
  console.log('  - icon-192.png & icon-512.png');
  console.log('  - icon-192-maskable.png & icon-512-maskable.png');
}

generateAssets().catch((err) => {
  console.error('❌ Failed to generate icon assets:', err);
  process.exit(1);
});
