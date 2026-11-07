# DotNet Interview Tracker

React app built from your Excel workbook with **persistent local storage**.

## Quick start

1. **Double-click** `DotNet Interview Tracker` on your Desktop  
   *(run `setup-desktop.ps1` once if the shortcut is missing)*

2. Or from this folder:
   ```bat
   launch.bat
   ```

## Data persistence

Your progress is saved automatically to:

`data/tracker-state.json`

Close and reopen the app anytime — all status, checkboxes, and notes are kept.

## Sheets / tabs

| Tab | Excel sheet |
|-----|-------------|
| Start Here | START HERE |
| Daily Tracker | Daily Topic Tracker |
| Topic Master | Topic Master |
| Weekly Plan | Weekly Plan |
| Physical Tracker | Physical Tracker |
| Subject Progress | Subject Progress (auto-calculated) |
| Course Map | Course Map |
| Milestones | Interview Milestones |

## Re-import from Excel

If you update the Excel file:

```bat
python scripts/import-excel.py
```

This updates `data/seed.json`. Your saved progress in `tracker-state.json` is preserved.

## Development

```bat
npm install
cd client && npm install && cd ..
npm run dev
```

- Frontend: http://localhost:5173  
- API: http://localhost:3847
