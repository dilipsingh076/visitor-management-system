/**
 * Script to download professional images from Unsplash
 * Run: node scripts/download-images.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const IMAGES_DIR = path.join(__dirname, '..', 'public', 'images', 'website');

// Ensure directory exists
if (!fs.existsSync(IMAGES_DIR)) {
  fs.mkdirSync(IMAGES_DIR, { recursive: true });
}

// Professional images from Unsplash (direct URLs)
const images = [
  {
    name: 'hero-bg.jpg',
    // Modern office building with glass facade
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=80'
  },
  {
    name: 'society.jpg',
    // Gated residential community
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'
  },
  {
    name: 'office-lobby.jpg',
    // Corporate office reception
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&q=80'
  },
  {
    name: 'factory.jpg',
    // Industrial facility
    url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80'
  },
  {
    name: 'security.jpg',
    // Security professional
    url: 'https://images.unsplash.com/photo-1521791055366-0d553872125f?w=1200&q=80'
  },
  {
    name: 'mobile-app.jpg',
    // Person using smartphone
    url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=1200&q=80'
  },
  {
    name: 'dashboard.jpg',
    // Modern dashboard/analytics
    url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80'
  },
  {
    name: 'team-office.jpg',
    // Team collaboration
    url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&q=80'
  },
  {
    name: 'building-modern.jpg',
    // Modern architecture (previous URL 404'd; using stable Unsplash source)
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&q=80'
  },
  {
    name: 'reception.jpg',
    // Office reception desk
    url: 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=1200&q=80'
  },
  {
    name: 'qr-scan.jpg',
    // QR code scanning
    url: 'https://images.unsplash.com/photo-1595079676339-1534801ad6cf?w=1200&q=80'
  },
  {
    name: 'apartment-building.jpg',
    // Residential apartment
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&q=80'
  }
];

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    
    https.get(url, (response) => {
      // Handle redirect
      if (response.statusCode === 301 || response.statusCode === 302) {
        https.get(response.headers.location, (redirectResponse) => {
          redirectResponse.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        }).on('error', reject);
      } else {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadAll() {
  console.log('Downloading professional images from Unsplash...\n');
  
  for (const img of images) {
    const filepath = path.join(IMAGES_DIR, img.name);
    
    if (fs.existsSync(filepath)) {
      console.log(`✓ ${img.name} (already exists)`);
      continue;
    }
    
    try {
      process.stdout.write(`Downloading ${img.name}...`);
      await downloadImage(img.url, filepath);
      console.log(' ✓');
    } catch (err) {
      console.log(` ✗ Error: ${err.message}`);
    }
  }
  
  console.log('\nDone! Images saved to public/images/website/');
}

downloadAll();
