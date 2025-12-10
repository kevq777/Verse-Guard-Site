# Verse Guard Website

A simple landing page for Verse Guard, ready to deploy on GitHub Pages.

## Structure

```
website/
├── index.html      # Main landing page
├── privacy.html    # Privacy policy page
├── styles.css      # All styles
└── assets/         # Icons and images
    ├── icon_16.png
    ├── icon_48.png
    └── icon_128.png
```

## Deploy to GitHub Pages

### Option 1: Deploy from /docs folder
1. Rename `website` folder to `docs`
2. Go to GitHub repo → Settings → Pages
3. Set source to "Deploy from a branch"
4. Select `main` branch, `/docs` folder
5. Save

### Option 2: Deploy from separate branch
1. Create a `gh-pages` branch
2. Copy website contents to root of that branch
3. Go to GitHub repo → Settings → Pages
4. Select `gh-pages` branch

## After Deployment

Update these with your actual URL:
1. Chrome Store Listing → Privacy Policy URL
2. Extension links that point to privacy policy

## Customize

- **Chrome Store Link**: Update the `#download` button href in `index.html`
- **GitHub Username**: Update footer GitHub link in both HTML files
- **Screenshots**: Add to `assets/` folder and embed in features section

