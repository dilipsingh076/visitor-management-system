/**
 * Download VMS-relevant images using Pexels API.
 * Requires PEXELS_API_KEY environment variable.
 * Run: PEXELS_API_KEY=your_key node scripts/download-pexels-images.js
 * 
 * Sign up for free API key at: https://www.pexels.com/api/
 */
const fs = require("fs");
const path = require("path");
const https = require("https");

const API_KEY = process.env.PEXELS_API_KEY;
const PUBLIC_IMAGES = path.join(__dirname, "..", "public", "images");

const SEARCH_QUERIES = [
  { file: "hero.jpg", query: "office", orientation: "landscape" },
  { file: "banner.jpg", query: "security", orientation: "landscape" },
  { file: "building.jpg", query: "corporate", orientation: "landscape" },
  { file: "security.jpg", query: "reception", orientation: "landscape" },
  { file: "office.jpg", query: "business", orientation: "landscape" },
  { file: "placeholder-card.jpg", query: "technology", orientation: "landscape" },
  { file: "guard-dashboard.jpg", query: "computer", orientation: "landscape" },
  { file: "qr-checkin.jpg", query: "mobile", orientation: "square" },
];

function searchPexels(query, orientation = "landscape") {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=1`;
    const options = {
      headers: { Authorization: API_KEY },
    };
    https.get(url, options, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        try {
          const data = JSON.parse(Buffer.concat(chunks).toString());
          if (data.photos && data.photos.length > 0) {
            resolve(data.photos[0].src.large);
          } else {
            reject(new Error("No photos found"));
          }
        } catch (e) {
          reject(e);
        }
      });
      res.on("error", reject);
    }).on("error", reject);
  });
}

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  if (!API_KEY) {
    console.error("❌ PEXELS_API_KEY environment variable not set.");
    console.log("Sign up for free at: https://www.pexels.com/api/");
    console.log("Then run: PEXELS_API_KEY=your_key node scripts/download-pexels-images.js");
    process.exit(1);
  }

  if (!fs.existsSync(PUBLIC_IMAGES)) {
    fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  }

  console.log("🔍 Searching Pexels for VMS-relevant images...\n");

  for (const { file, query, orientation } of SEARCH_QUERIES) {
    const filePath = path.join(PUBLIC_IMAGES, file);
    try {
      console.log(`Searching: "${query}"...`);
      const imageUrl = await searchPexels(query, orientation);
      console.log(`  Found: ${imageUrl}`);
      const buffer = await downloadImage(imageUrl);
      fs.writeFileSync(filePath, buffer);
      console.log(`  ✅ Saved: ${file} (${(buffer.length / 1024).toFixed(1)} KB)\n`);
      // Rate limit: wait 1 second between requests (200 req/hour = ~3 req/min)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (e) {
      console.warn(`  ⚠️  Skip ${file}: ${e.message}\n`);
    }
  }

  console.log("✅ Done. Images are in public/images/");
  console.log("   Attribution: Photos from Pexels (https://www.pexels.com)");
}

main();
