// Renders the real card for every exercise, freezes the mascot at several moments of its loop and saves PNGs
// to tests/motion/<exercise>_<pct>.png plus a labelled contact sheet tests/motion/contact.png.
// Run with: npm run motion-shots
const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
app.setName('noodle-motion-shots');
app.setPath('userData', path.join(__dirname, '..', '.motion-profile'));
app.on('window-all-closed', () => {});
const delay = ms => new Promise(r => setTimeout(r, ms));
const OUT = path.join(__dirname, 'motion');
const ZOOM = 3;

// Moments (percent of one exercise duration) chosen to show each phase of the motion.
const MOMENTS = {
  neck_side: [0, 25, 50, 75],
  chin_tuck: [0, 2, 20, 31.5],
  doorway: [0, 6.5, 40, 90],
  shoulder_rolls: [0, 2.5, 5, 7.5, 52.5],
  wrist: [0, 25, 60, 80],
  eyes: [0, 10, 50, 90],
  walk: [0, 25, 50, 75],
  wave: [0, 25, 50, 75]
};
const CYCLE_MS = { walk: 1440, wave: 1640 }; // short loops are sampled over their own period, not the exercise length

(async () => {
  await app.whenReady();
  fs.mkdirSync(OUT, { recursive: true });
  for (const f of fs.readdirSync(OUT)) if (/\.(png|html)$/.test(f)) fs.unlinkSync(path.join(OUT, f));
  const exercises = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'exercises.json'), 'utf8'));
  const win = new BrowserWindow({ width: 1500, height: 780, useContentSize: true, show: false, backgroundColor: '#D9D3C9', webPreferences: { contextIsolation: true } });
  await win.loadFile(path.join(__dirname, '..', 'renderer', 'card.html'), { query: { preview: '1' } });
  win.webContents.setZoomFactor(ZOOM);
  await win.webContents.executeJavaScript("document.getElementById('card').classList.add('in')");
  const js = code => win.webContents.executeJavaScript(code);

  const rows = [];
  const items = exercises.map(ex => ({ name: ex.id, ex, cycle: CYCLE_MS[ex.id] || ex.duration_sec * 1000 }));
  items.push({ name: 'wave', wave: true, cycle: CYCLE_MS.wave });
  for (const it of items) {
    if (it.wave) await js("document.getElementById('tile').innerHTML = Noodle.toni('wave', 'hello')");
    else await js(`window.__noodlePreview.present(${JSON.stringify({ ex: it.ex, counter: '1 of 1', first: false })})`);
    await delay(900);
    await win.webContents.capturePage(); await delay(200);
    const row = [];
    for (const pct of MOMENTS[it.name]) {
      await js(`(() => { document.getElementById('tile').getAnimations({ subtree: true }).forEach(a => { a.pause(); a.currentTime = a.animationName === 'noodleBlink' ? 0 : ${pct / 100 * it.cycle}; }); })()`);
      await delay(150); await win.webContents.capturePage(); await delay(100);
      const r = await js("(() => { const b = document.getElementById('tile').getBoundingClientRect(); return [b.x, b.y, b.width, b.height]; })()");
      const img = await win.webContents.capturePage({ x: Math.round(r[0] * ZOOM), y: Math.round(r[1] * ZOOM), width: Math.round(r[2] * ZOOM), height: Math.round(r[3] * ZOOM) });
      const file = `${it.name}_${String(pct).replace('.', 'p')}.png`;
      fs.writeFileSync(path.join(OUT, file), img.toPNG());
      row.push({ file, pct });
    }
    rows.push({ name: it.name, row });
    console.log(it.name, row.map(c => c.file).join(' '));
  }
  win.destroy();

  const cols = Math.max(...rows.map(r => r.row.length)), cell = 220;
  const html = `<!doctype html><meta charset="utf-8"><style>body{margin:0;background:#fff;font:600 13px Inter,Segoe UI,sans-serif;color:#222}
table{border-collapse:collapse}td{padding:6px;text-align:center;border:1px solid #eee}td.n{width:120px;text-align:left;font-size:15px}img{width:${cell}px;height:${cell}px;display:block}</style>
<table>${rows.map(r => `<tr><td class="n">${r.name}</td>${r.row.map(c => `<td><img src="${c.file}"><div>${r.name} ${c.pct}%</div></td>`).join('')}${'<td></td>'.repeat(cols - r.row.length)}</tr>`).join('')}</table>`;
  fs.writeFileSync(path.join(OUT, 'contact.html'), html);
  const sheet = new BrowserWindow({ width: 800, height: 600, useContentSize: true, show: false, webPreferences: { contextIsolation: true } });
  await sheet.loadURL(require('url').pathToFileURL(path.join(OUT, 'contact.html')).href);
  sheet.setContentSize(140 + cols * (cell + 14), rows.length * (cell + 40));
  await delay(800);
  fs.writeFileSync(path.join(OUT, 'contact.png'), (await sheet.webContents.capturePage()).toPNG());
  sheet.destroy();
  console.log('contact sheet:', path.join(OUT, 'contact.png'));
  app.exit(0);
})().catch(e => { console.error(e); app.exit(1); });
