# BraderPart - Sistem Manajemen Stok Barang

Modern inventory management dashboard with dark mode, employee management, department tracking, transaction log, and JSON backup/restore.

## Run locally
1. Open the project folder.
2. Start a simple server:
   ```bash
   python -m http.server 8000
   ```
3. Open in browser:
   ```text
   http://localhost:8000
   ```

## Build to Windows EXE
1. Double-click `build.bat`
2. Wait until the build completes
3. A file will be generated in `dist/BraderPart.exe`
4. Double-click `RUN.bat` to launch the app
5. Optional: run `INSTALL.bat` to create a desktop shortcut

## Files
- `index.html`
- `style.css`
- `app.js`
- `server.py`
- `build.py`
- `build.bat`
- `RUN.bat`
- `INSTALL.bat`

## Notes
- Data is stored in browser `localStorage` by default.
- You can export/import JSON for backup and restore.
- Dark mode is enabled by default.
