# PDF Workspace Website

This directory contains the independent static website for PDF Workspace.

## Publishing

GitHub Pages is intended to publish this directory as the site root. Configure it in:

**Repository → Settings → Pages → Build and deployment → Deploy from a branch → main → /website**

Do this after the website's initial files are ready. Until then, the project landing page and download links are not live.

## Planned structure

```text
website/
├── assets/
│   ├── images/
│   ├── icons/
│   └── stickers/
├── css/
├── js/
├── locales/
│   ├── ru/
│   ├── en/
│   └── es/
├── pages/
└── index.html
```

## Design direction

Match the Windows application:
- Native, restrained, minimal visual language.
- Balanced spacing and square geometry.
- System-accent-inspired highlight color.
- Light and dark themes.
- Strong typography and clear hierarchy.
- Compact navigation and purposeful motion.
- No excessive gradients, decorative clutter, or oversized rounded cards.

## Languages

Russian, English, and Spanish. Each language must have complete navigation, page titles, metadata, accessible labels, and content—not just a translated hero section.

## Planned content

- Product introduction and feature overview.
- Application screenshots and annotated interface previews.
- Download area connected to actual GitHub Releases.
- System requirements and installation guide.
- Changelog, documentation, support, and repository links.

## Asset rules

Use optimized SVG/WebP/PNG assets where appropriate. Keep attribution and license information for third-party assets. Do not add unlicensed sticker packs, icon sets, fonts, or stock images.

## Important

This folder is a website project, not part of the Tauri application frontend. Keep website assets and scripts separate from desktop app resources.
