# PDF Workspace — Windows application

**Current version: 0.2.0 · Early functional MVP**

PDF Workspace is a local-first Windows PDF workspace built with Tauri 2, Rust, TypeScript, Vite and PDF.js.

[![Download for Windows](https://img.shields.io/badge/Download-Windows%20Installer-254d35?style=for-the-badge&logo=windows&logoColor=white)](https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe)

[Download the latest `.exe` installer](https://github.com/German-GPD/pdf-workspace/releases/latest/download/PDF-Workspace-setup.exe) · [All releases](https://github.com/German-GPD/pdf-workspace/releases)

## Working now

- Open PDF files from Windows and render pages locally.
- Navigate pages, enter a page number, zoom in/out and fit the page to the available width.
- Search text across the whole document and move between matches.
- Draw freehand annotations with a pen or highlighter.
- Undo the latest annotation on the current page or clear that page.
- Automatically save annotations locally per document.
- Export an annotated copy as a separate PDF; the source file is not overwritten.
- Keep a recent-files list and copy documents into the app-managed Library.
- Light, dark and system themes.
- Check for signed updates and install them from inside the app.
- Build a Windows NSIS `.exe` installer.

## Run locally

Requirements: Windows 10/11, Node.js 22+, Rust stable/MSVC toolchain, Microsoft C++ Build Tools and NSIS.

```powershell
cd app
npm install
npm run tauri dev
```

Build an unsigned test installer:

```powershell
npm run tauri build -- --bundles nsis
```

Output: `app/src-tauri/target/release/bundle/nsis/`.

GitHub Actions also builds the installer on Windows and stores it as a 14-day workflow artifact. The public download button points to the latest GitHub Release and becomes a direct installer link after the first release is published.

## Signed in-app updates

Tauri verifies updates using the Minisign public key embedded in `src-tauri/tauri.conf.json`. The matching private key must never be committed.

Add this repository secret under **Settings → Secrets and variables → Actions**:

- `TAURI_SIGNING_PRIVATE_KEY` — the complete contents of the private key that matches `plugins.updater.pubkey` in `src-tauri/tauri.conf.json`.
- `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — only if that key was created with a password; otherwise leave it empty.

Keep the private key out of Git. Do not replace the public key after publishing the first release: installed copies trust the embedded key. If the matching private key is unavailable before the first release, generate a new key pair with `npm run tauri signer generate -- -w $HOME/.tauri/pdf-workspace.key`, replace the public key in `tauri.conf.json`, and add the generated private key as the repository secret before publishing.

Keep these versions synchronized before a release:
- `app/package.json`
- `app/src-tauri/Cargo.toml`
- `app/src-tauri/tauri.conf.json`

Then push a matching tag, for example:

```powershell
git tag v0.2.0
git push origin v0.2.0
```

GitHub Actions builds the NSIS installer, signs the updater bundle, publishes the installer and generates `latest.json`. The app checks for updates on launch and from **Проверить обновления**. On Windows, Tauri downloads and verifies the update, runs the installer and closes the old app while applying it.

## Still planned

- Full Monic Control Bar customization.
- Bookmarks and document/page notes.
- Folders, collections, favorites and library management.
- Rotation, two-page view, shapes, text notes and eraser.
- Reading-position restoration and richer workspace settings.
- More extensive Windows testing and accessibility polish.

## Security

- Private update signing keys are never stored in the repository.
- Updates are signature-verified before installation.
- PDF files are treated as untrusted local input.
- Adding a PDF to the managed library stores a separate copy; the source file is preserved.
