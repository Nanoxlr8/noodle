# Noodle

A floating stretch-break card with Toni the Rigatoni. Windows 11, Electron 44.7.2.

## Run
    npm install
    npm start            (or double-click start-noodle.cmd for a silent background start)

A tray icon (Toni) gives: Show now, Open cast, Pause 1 hour, Start with Windows, Quit.
Test it: `Invoke-WebRequest -Method Post http://127.0.0.1:47321/show`
Other endpoints: POST /start, POST /stop, GET /status.

## Claude Code hooks
Replace `<path-to-noodle>` in `hooks/settings-snippet.json` with your local Noodle folder, then merge its "hooks" block into `~/.claude/settings.json`.
/start begins a 20 s timer, /stop cancels it. If it fires, the card shows (unless in the 25 min cooldown).

## Edit exercises / settings
- `exercises.json`: id, title, instruction, duration_sec, duration_label, pose, how_to. Read at each session.
- `config.json`: cooldown_min, start_delay_sec, port, walk_every_sessions, walk_after_min.
- Daily count: `%APPDATA%\noodle\log.json`.
- `npm run screenshots` writes PNGs to `screenshots/`.
