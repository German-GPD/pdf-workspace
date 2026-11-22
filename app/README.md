# PDF Workspace — Windows application

The functional desktop MVP uses Tauri 2, Rust, TypeScript, Vite and PDF.js.

## Current MVP

- Open local PDF files and render pages with PDF.js.
- Navigate pages and change zoom.
- Keep a local recent-files list.
- Copy PDFs into the app-managed Library folder.
- Light, dark and system theme selection.
- Check for signed updates and install them from inside the app.
- Build a Windows NSIS EXE installer.

Annotations, SQLite migration, advanced search, export and full Monic Control Bar customization remain planned work.

## Run locally

Requirements: Windows 10/11, Node.js 22+, Rust stable/MSVC toolchain and Microsoft C++ Build Tools.

```powershell
cd app
npm install
npm run tauri dev
```

Build a Windows installer:

```powershell
npm run tauri build -- --bundles nsis
```

Output: app/src-tauri/target/release/bundle/nsis/.

## Signed in-app updates

Tauri verifies each update with the Minisign public key embedded in src-tauri/tauri.conf.json. The matching private key must never be committed.

Add this GitHub Actions secret under Settings → Secrets and variables → Actions:

- TAURI_SIGNING_PRIVATE_KEY — paste the complete contents of the private key file linked in the project setup message. This key uses an empty password, so no password secret is required.

The private key file is provided separately. Keep it in a password manager and never upload it to the repository. Do not rotate this key after the first public release: installed copies trust this exact public key.

Create a release by pushing a matching tag:

```powershell
git tag v0.1.0
git push origin v0.1.0
```

GitHub Actions builds the NSIS installer, signs the updater bundle, publishes the installer and generates latest.json. The app checks for updates on launch and from Check for updates in the sidebar. On Windows, the updater starts the installer and exits the current app while applying the update.

Keep versions synchronized in app/package.json, app/src-tauri/Cargo.toml and app/src-tauri/tauri.conf.json. Use a matching vX.Y.Z Git tag.

## Security

- Never commit the private signing key or place it in frontend code.
- Updates are signature-verified before installation.
- PDF files are treated as untrusted local input.
- Adding a PDF to the managed library stores a separate copy; the source file is preserved.
