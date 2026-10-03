# HP Inventory Pro

Modern inventory management dashboard for HP and device inventory, built as a single-page app with dark mode, localStorage persistence, transaction tracking, and export/import features.

## Features
- Dashboard overview
- Device inventory list
- User/employee management
- Department management
- Transaction log
- Dark mode toggle
- JSON export / restore
- Responsive layout

## Run locally
1. Open the project folder.
2. Start a simple server:
   ```bash
   python -m http.server 8000
   ```
3. Open in the browser:
   ```text
   http://localhost:8000
   ```

## Files
- `index.html`
- `style.css`
- `app.js`

## Notes
- Data is stored in browser `localStorage` by default.
- You can export/import JSON for backup and restore.
- Dark mode is enabled by default.

