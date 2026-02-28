# Website images

Place hero, banner, and other images here. Filenames used by the app:

- `hero.jpg` – Home page hero (1200×600)
- `banner.jpg` – Banners (1200×400)
- `building.jpg` – About / use cases
- `security.jpg` – Security/DPDP section
- `office.jpg` – Office/society imagery
- `placeholder-card.jpg` – Card placeholders

**Application-relevant imagery:**  
For images that match VMS (reception, security, gates, visitor check-in), use the brief in **`docs/CONTENT-AND-IMAGES-PROMPT.md`**. It includes search terms and AI-image prompts for each file so visuals align with the product.

**Download placeholders (script tries Unsplash keywords, then Picsum):**

```bash
node scripts/download-images.js
```

Replace with your own or AI-generated images when ready; keep the same filenames.
