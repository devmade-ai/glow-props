# canva-grid-assets

CDN-hosted sample images for [canva-grid](https://github.com/devmade-ai/canva-grid). Served via jsDelivr:

```
https://cdn.jsdelivr.net/gh/devmade-ai/canva-grid-assets@main
```

## Structure

```
thumbs/    → 200px wide WebP thumbnails (75% quality)
full/      → Up to 1920px wide WebP images (85% quality)
```

## Updating Images

1. In the **canva-grid** project, add source images to `sample-sources/`
2. Update `sample-sources/categories.json` to assign categories
3. Run `npm run generate-samples`
4. Copy `sample-output/thumbs/` and `sample-output/full/` into this repo (replacing existing)
5. Commit and push
