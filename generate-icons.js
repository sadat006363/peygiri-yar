// generate-icons.js
const sharp = require('sharp');

// تابع برای ساخت یک دایره ساده با حرف اول
async function generateIcon(size, outputPath) {
  const svg = `
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${size}" height="${size}" fill="#4F46E5" rx="${size * 0.2}" />
      <text x="50%" y="50%" font-family="Arial" font-size="${size * 0.5}" 
            fill="white" text-anchor="middle" dominant-baseline="central" 
            font-weight="bold">PY</text>
    </svg>
  `;
  
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outputPath);
  
  console.log(`✅ ${outputPath} created (${size}x${size})`);
}

// اجرا
generateIcon(192, 'public/icon-192.png');
generateIcon(512, 'public/icon-512.png');