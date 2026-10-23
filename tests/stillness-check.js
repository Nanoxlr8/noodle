// Steps every exercise card through its whole duration and measures the longest stretch with no visible mascot
// motion (pixel diff between 250 ms frames). Fails if any exercise stays frozen for longer than MAX_STILL_MS.
// Run with: npm run stillness
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
app.setName('noodle-stillness-check');
app.setPath('userData', path.join(__dirname, '..', '.stillness-profile'));
app.on('window-all-closed', () => {});
const STEP_MS = 250, MAX_STILL_MS = 1500, MIN_CHANGED = 12;

(async () => {
  await app.whenReady();
  const exercises = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'exercises.json'), 'utf8'));
  const win = new BrowserWindow({ width: 492, height: 300, show: false, webPreferences: { contextIsolation: true } });
  await win.loadFile(path.join(__dirname, '..', 'renderer', 'card.html'), { query: { preview: '1' } });
  const js = code => win.webContents.executeJavaScript(code);
  await js("document.getElementById('card').classList.add('in')");
  let failed = 0;
  for (const ex of exercises) {
    await js(`document.getElementById('tile').innerHTML = Noodle.toni(${JSON.stringify(ex.pose)}, 'smile', { dur: ${ex.duration_sec} });
      document.getElementById('tile').getAnimations({ subtree: true }).forEach(a => a.pause());`);
    const rect = await js("(() => { const r = document.getElementById('tile').getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }; })()");
    let prev = null, still = 0, longest = 0, moving = 0, frames = 0;
    for (let t = 0; t <= ex.duration_sec * 1000; t += STEP_MS) {
      await js(`document.getElementById('tile').getAnimations({ subtree: true }).forEach(a => { a.currentTime = ${t}; })`);
      await new Promise(r => setTimeout(r, 16));
      const buf = (await win.webContents.capturePage(rect)).toBitmap();
      if (prev) {
        let changed = 0;
        for (let i = 0; i < buf.length; i += 4) if (Math.abs(buf[i] - prev[i]) + Math.abs(buf[i + 1] - prev[i + 1]) + Math.abs(buf[i + 2] - prev[i + 2]) > 24) changed++;
        frames++;
        if (changed >= MIN_CHANGED) { moving++; still = 0; } else { still += STEP_MS; longest = Math.max(longest, still); }
      }
      prev = buf;
    }
    const ok = longest <= MAX_STILL_MS;
    if (!ok) failed++;
    console.log(`${ok ? 'PASS' : 'FAIL'} ${ex.id.padEnd(15)} moving ${String(Math.round(moving / frames * 100)).padStart(3)}% of frames, longest still ${longest} ms`);
  }
  console.log(failed ? `${failed} exercise(s) freeze for more than ${MAX_STILL_MS} ms` : 'stillness checks passed');
  app.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); app.exit(1); });
