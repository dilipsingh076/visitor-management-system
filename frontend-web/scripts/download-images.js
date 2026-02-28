/**
 * Download application-relevant placeholder images into public/images.
 * Tries Unsplash Source (keyword-based) first; falls back to Picsum.
 * Run from frontend-web: node scripts/download-images.js
 * See docs/CONTENT-AND-IMAGES-PROMPT.md for image brief and manual/AI alternatives.
 */
const fs = require("fs");
const path = require("path");
const https = require("https");
const http = require("http");

const PUBLIC_IMAGES = path.join(__dirname, "..", "public", "images");

const IMAGES = [
  { file: "hero.jpg", width: 1200, height: 600, keywords: "office,building,reception,lobby,entrance", seed: "vms-hero" },
  { file: "banner.jpg", width: 1200, height: 400, keywords: "security,gate,guard,reception", seed: "vms-banner" },
  { file: "building.jpg", width: 800, height: 600, keywords: "corporate,building,office,tower", seed: "vms-building" },
  { file: "security.jpg", width: 800, height: 500, keywords: "security,guard,reception,desk", seed: "vms-security" },
  { file: "office.jpg", width: 800, height: 600, keywords: "office,lobby,reception,visitor", seed: "vms-office" },
  { file: "placeholder-card.jpg", width: 400, height: 300, keywords: "tablet,reception,check-in,visitor", seed: "vms-card" },
];

function download(url, redirectCount = 0) {
  const maxRedirects = 5;
  const lib = url.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    lib.get(url, (res) => {
      if (res.statusCode >= 301 && res.statusCode <= 308 && res.headers.location) {
        if (redirectCount >= maxRedirects) return reject(new Error("Too many redirects"));
        const next = res.headers.location.startsWith("http") ? res.headers.location : new URL(res.headers.location, url).href;
        return download(next, redirectCount + 1).then(resolve).catch(reject);
      }
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => resolve(Buffer.concat(chunks)));
      res.on("error", reject);
    }).on("error", reject);
  });
}

async function main() {
  if (!fs.existsSync(PUBLIC_IMAGES)) {
    fs.mkdirSync(PUBLIC_IMAGES, { recursive: true });
  }

  for (const img of IMAGES) {
    const filePath = path.join(PUBLIC_IMAGES, img.file);
    const unsplashUrl = `https://source.unsplash.com/random/${img.width}x${img.height}/?${img.keywords}`;
    const picsumUrl = `https://picsum.photos/seed/${img.seed}/${img.width}/${img.height}`;
    try {
      let buf = await download(unsplashUrl);
      if (buf && buf.length > 1000) {
        fs.writeFileSync(filePath, buf);
        console.log("Saved (Unsplash):", img.file);
      } else {
        throw new Error("Empty or tiny response");
      }
    } catch (e) {
      try {
        const buf = await download(picsumUrl);
        fs.writeFileSync(filePath, buf);
        console.log("Saved (Picsum fallback):", img.file);
      } catch (e2) {
        console.warn("Skip", img.file, e.message, "| fallback:", e2.message);
      }
    }
  }

  console.log("Done. Images are in public/images/. See docs/CONTENT-AND-IMAGES-PROMPT.md for custom/AI images.");
}

main();
