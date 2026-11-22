# PDF Workspace — Architecture

**Status:** initial proposal; implementation has not started.

## 1. Product direction

PDF Workspace is a free, Windows-first, offline-first PDF workspace. The application should prioritize the document canvas and keep controls compact, discoverable, and customizable.

### Confirmed interface decisions
- Windows Native visual direction.
- Balanced density.
- Windows system accent color.
- Square geometry; no decorative corner rounding.
- Light and dark themes, selected during installation and changeable later.
- Adaptive Monic Control Bar.
- Toolbar actions are user-configurable: visibility, order, grouping, and presentation.
- The PDF viewing area receives the largest practical share of the window.

## 2. Planned technology

| Layer | Direction | Responsibility |
|---|---|---|
| Desktop shell | Tauri 2 | Window, native integration, packaging |
| Backend | Rust | Files, storage, commands, export, updates |
| Web runtime | WebView2 | Windows web-based interface |
| Frontend | TypeScript | Application UI and interactions |
| PDF rendering | PDF.js | PDF pages, text layer, search |
| Annotation layer | SVG / Canvas | Overlay tools and selections |
| Local database | SQLite | Metadata, settings, history, bookmarks |
| Build tooling | Cargo + Vite | Development and packaging |

The frontend framework is not selected yet. Vanilla TypeScript and Svelte remain candidates.

All dependency licenses, export capabilities, and compatibility requirements must be checked before implementation.

## 3. Planned repository layout

```text
pdf-workspace/
├── app/
│   ├── src/                         # Frontend application (future)
│   │   ├── components/
│   │   │   └── monic-control-bar/
│   │   ├── pages/
│   │   ├── pdf/
│   │   ├── annotations/
│   │   ├── library/
│   │   ├── settings/
│   │   ├── styles/
│   │   └── main.ts
│   └── src-tauri/                   # Rust + Tauri backend (future)
│       ├── src/
│       │   ├── commands/
│       │   ├── database/
│       │   ├── library/
│       │   ├── annotations/
│       │   ├── export/
│       │   ├── updates/
│       │   └── main.rs
│       ├── capabilities/
│       └── icons/
├── website/                         # Independent GitHub Pages site
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── stickers/
│   ├── css/
│   ├── js/
│   ├── locales/
│   │   ├── ru/
│   │   ├── en/
│   │   └── es/
│   ├── pages/
│   └── index.html
├── docs/
│   ├── ARCHITECTURE.md
│   ├── ROADMAP.md
│   └── decisions/
├── .github/
│   └── workflows/
├── .gitignore
├── LICENSE                         # Pending license decision
└── README.md
```

This is a target layout, not a claim that the application or website has already been implemented. Empty future directories may not appear in Git until they contain files.

## 4. Application areas

### Main workspace
- Home / start page
- PDF library
- Recent documents
- Favorites
- Bookmarks
- Notes
- PDF viewer
- Settings

### Monic Control Bar
- Adaptive layout based on the active area and available width.
- User-defined actions, order, visibility, groups, and icon/label presentation.
- Overflow menu for less-used actions.
- Keyboard navigation and accessible tooltips.
- Custom Windows titlebar behavior must preserve drag, resize, minimize, maximize/restore, close, and snap behavior.

### Document handling
- **Open** keeps the source file in its original location and adds it to recent history.
- **Add to library** imports a managed copy into the user's chosen library.
- Removing an item from the library must not silently delete the original source file.
- Store document metadata separately from PDF bytes.
- Remember last page, zoom, and reading position.

### Annotations
- Store annotations separately from the original PDF.
- Use stable PDF-page coordinates, not CSS pixel coordinates.
- Support undo/redo and crash recovery.
- Export an annotated copy; preserve the original file.
- Allow annotations to be hidden to inspect the original page.

### Data location
During setup, the user should be able to choose a data location. Candidate modes:
- Portable folder near the application.
- User Documents folder.
- Custom folder or drive.

A possible data layout:

```text
PDF Workspace Data/
├── Library/
├── Database/
├── Annotations/
├── Thumbnails/
├── Backups/
└── Cache/
```

The final paths and migration behavior are not decided yet.

## 5. Website

The website is a separate static project under `website/`, intended for GitHub Pages. It must not be bundled into the desktop application's runtime.

### Languages
- Russian (`ru`)
- English (`en`)
- Spanish (`es`)

### Planned pages and sections
- Product landing page
- Features
- Interface preview / screenshots
- Download page with release links
- System requirements
- Changelog
- Documentation and support
- GitHub and contribution links

### Website requirements
- Match the desktop application's design language.
- Responsive and fast, including on weaker devices.
- Accessible navigation and visible keyboard focus.
- Language selector with persistent preference.
- Download buttons must point to real published releases only.
- No fake download counters, fabricated reviews, or placeholder claims presented as facts.
- Images, icons, and stickers must have clear licensing and optimized formats.

GitHub Pages should be configured to publish from the `website/` directory on the selected branch, once the website is ready.

## 6. Security and reliability

- Use narrowly scoped Tauri capabilities and permissions.
- Validate paths and file operations in the Rust backend.
- Do not expose unrestricted filesystem access to the WebView.
- Treat PDFs and imported files as untrusted input.
- Verify update signatures / integrity before installation.
- Keep originals safe during annotation and export operations.
- Provide recoverable local backups for user-created data.

## 7. Open decisions

- Frontend framework: Vanilla TypeScript or Svelte.
- Multi-document experience: tabs, split view, or both.
- Exact annotation toolset for the first release.
- Autosave strategy and recovery interval.
- Portable-mode behavior and data migration.
- PDF export library and its license compatibility.
- Installer strategy and WebView2 runtime handling.
- Project license.
