# Roadmap

The roadmap is a planning document. Items are goals, not completed features.

## Phase 0 — Foundation
- [x] Create the repository.
- [x] Establish the product direction and initial folder layout.
- [ ] Select and add the project license.
- [ ] Finalize the architecture decisions.
- [ ] Define visual design tokens and interaction rules.
- [ ] Define contribution and release policies.

## Phase 1 — Design
- [ ] Monic Control Bar interaction model.
- [ ] Main workspace and library wireframes.
- [ ] PDF viewer layout and compact/focus modes.
- [ ] Light and dark themes.
- [ ] Settings and toolbar customization.
- [ ] Website design system and page map.

## Phase 2 — Application foundation
- [ ] Tauri 2 + Rust project setup.
- [ ] WebView2 runtime and installer strategy.
- [ ] Secure IPC and filesystem boundaries.
- [ ] Local data location and SQLite schema.
- [ ] Window controls and native behavior.

## Phase 3 — PDF workspace
- [ ] Open and view PDF files.
- [ ] Search, zoom, page navigation, and thumbnails.
- [ ] Library import and recent-file history.
- [ ] Reading-state persistence.
- [ ] Overlay annotations and undo/redo.
- [ ] Notes, bookmarks, and favorites.
- [ ] Export annotated copies.

## Phase 4 — Personalization
- [ ] Configurable Monic Control Bar.
- [ ] Light/dark theme selection.
- [ ] Keyboard shortcuts.
- [ ] Compact and focus modes.
- [ ] User-selected data location.

## Phase 5 — Website and release
- [ ] Trilingual GitHub Pages website (RU / EN / ES).
- [ ] Screenshots and product illustrations.
- [ ] Release download links.
- [ ] Changelog and documentation.
- [ ] Automated build and release checks.
- [ ] Signed / integrity-checked update workflow.
- [ ] First public release.

## Release principles
- Never show a download button for a build that does not exist.
- Publish release notes and supported Windows versions.
- Verify installer artifacts before linking them.
- Keep the website's status and download information synchronized with GitHub Releases.
