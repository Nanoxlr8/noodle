const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');

const SHOT = process.argv.includes('--screenshot');
const ROOT = __dirname;
const PAD = 36, CARD_W = 420, MARGIN = 24;
const DATA = path.join(app.getPath('appData'), 'noodle');
const appStart = Date.now();
app.setName('noodle');

const readJSON = (p, d) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch (e) { return d; } };
const getCfg = () => Object.assign({ cooldown_min: 25, start_delay_sec: 20, port: 47321, walk_every_sessions: 3, walk_after_min: 90, screen_time: true, screen_time_min: 30, idle_reset_min: 5 }, readJSON(path.join(ROOT, 'config.json'), {}));
const loadEx = () => readJSON(path.join(ROOT, 'exercises.json'), []);

let state = readJSON(path.join(DATA, 'state.json'), { lastEnd: 0, lastWalk: 0, sessions: 0 });
const persist = (file, obj) => { if (SHOT) return; try { fs.mkdirSync(DATA, { recursive: true }); fs.writeFileSync(path.join(DATA, file), JSON.stringify(obj, null, 2)); } catch (e) {} };
const today = () => new Date().toISOString().slice(0, 10);
function bumpLog() {
  const f = path.join(DATA, 'log.json'); const log = readJSON(f, {});
  log[today()] = (log[today()] || 0) + 1; persist('log.json', log); return SHOT ? 1 : log[today()];
}

let activeSec = 0, screenTimeOn = null;
let win = null, castWin = null, tray = null, sess = null, pending = null, pausedUntil = 0, hideTimer = null, winVisible = false;

function place(cardH) {
  const wa = screen.getPrimaryDisplay().workArea;
  win.setBounds({ x: wa.x + wa.width - MARGIN - CARD_W - PAD, y: wa.y + MARGIN - PAD, width: CARD_W + 2 * PAD, height: cardH + 2 * PAD });
}

function createWin() {
  win = new BrowserWindow({
    width: CARD_W + 2 * PAD, height: 170 + 2 * PAD, transparent: true, frame: false, alwaysOnTop: true, skipTaskbar: true,
    resizable: false, show: false, focusable: true, hasShadow: false, backgroundColor: '#00000000',
    webPreferences: { preload: path.join(ROOT, 'renderer', 'preload.js'), contextIsolation: true }
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile(path.join(ROOT, 'renderer', 'card.html'));
  place(170);
}

function buildSession() {
  const ex = loadEx(), cfg = getCfg();
  state.sessions = (state.sessions || 0) + 1;
  const walk = ex.find(e => e.id === 'walk');
  const since = Date.now() - (state.lastWalk || appStart);
  if (walk && (state.sessions % cfg.walk_every_sessions === 0 || since > cfg.walk_after_min * 60000)) return { kind: 'walk', list: [walk], idx: 0 };
  return { kind: 'session', list: ex.filter(e => e.id !== 'walk').slice(0, 6), idx: 0 };
}

function present(first) {
  const ex = sess.list[sess.idx];
  const counter = sess.kind === 'walk' ? sess.todayCount + ' today' : (sess.idx + 1) + ' of ' + sess.list.length;
  win.webContents.send('present', { ex, counter, first });
}

function showCard() {
  if (sess) return;
  clearTimeout(hideTimer);
  sess = buildSession();
  if (sess.kind === 'walk') sess.todayCount = bumpLog();
  if (!winVisible) { place(170); win.showInactive(); winVisible = true; }
  present(true);
}

function endSession(markWalk) {
  state.lastEnd = Date.now(); activeSec = 0;
  if (sess && sess.kind === 'walk' || markWalk) state.lastWalk = Date.now();
  persist('state.json', state);
}
function hideCard() {
  if (win) win.webContents.send('hide');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => { if (win && !sess) { win.hide(); winVisible = false; } }, 350);
}

ipcMain.on('done', () => {
  if (!sess || sess.finishing) return;
  sess.idx++;
  if (sess.idx < sess.list.length) return present(false);
  sess.finishing = true; endSession();
  win.webContents.send('finish');
  setTimeout(() => { sess = null; hideCard(); }, 2000);
});
ipcMain.on('stop', () => {
  if (!sess || sess.finishing) return;
  endSession(); sess = null; hideCard();
});
ipcMain.on('resize', (_e, h) => { if (win && winVisible && h > 0) place(h); });
ipcMain.on('play', () => showCard());

function fire() {
  pending = null;
  if (sess) return;
  if (Date.now() < pausedUntil) return;
  if (Date.now() - (state.lastEnd || 0) < getCfg().cooldown_min * 60000) return;
  showCard();
}

// Screen time: count active (non-idle) seconds; a long enough idle gap counts as a natural break.
const TICK = 15;
function screenTimeTick() {
  const cfg = getCfg();
  if (screenTimeOn === null) screenTimeOn = !!cfg.screen_time;
  if (!screenTimeOn || sess) return;
  if (powerMonitor.getSystemIdleTime() >= cfg.idle_reset_min * 60) { activeSec = 0; return; }
  activeSec += TICK;
  if (activeSec >= cfg.screen_time_min * 60 && Date.now() >= pausedUntil) { activeSec = 0; showCard(); }
}
powerMonitor && app.whenReady().then(() => {
  powerMonitor.on('lock-screen', () => { activeSec = 0; });
  powerMonitor.on('suspend', () => { activeSec = 0; });
});

function startServer() {
  const cfg = getCfg();
  const srv = http.createServer((req, res) => {
    const u = req.url.split('?')[0];
    req.resume();
    let out = 'ok';
    if (req.method === 'POST' && u === '/start') {
      if (pending) clearTimeout(pending);
      if (!sess) pending = setTimeout(fire, getCfg().start_delay_sec * 1000);
    } else if (req.method === 'POST' && u === '/stop') {
      if (pending) { clearTimeout(pending); pending = null; }
    } else if (req.method === 'POST' && u === '/show') {
      showCard();
    } else if (req.method === 'GET' && u === '/status') {
      out = JSON.stringify({ open: !!sess, pending: !!pending, kind: sess && sess.kind, screenTime: screenTimeOn, activeMin: Math.round(activeSec / 6) / 10 });
    } else { res.statusCode = 404; out = 'not found'; }
    res.end(out);
  });
  srv.on('error', e => console.error('noodle server error', e.message));
  srv.listen(cfg.port, '127.0.0.1');
}

function openCast() {
  if (castWin && !castWin.isDestroyed()) { castWin.show(); castWin.focus(); return castWin; }
  castWin = new BrowserWindow({
    width: 1040, height: 860, title: 'The Noodle Cast', backgroundColor: '#F6F1E9', autoHideMenuBar: true,
    webPreferences: { preload: path.join(ROOT, 'renderer', 'preload.js'), contextIsolation: true }
  });
  castWin.loadFile(path.join(ROOT, 'cast.html'));
  return castWin;
}

async function makeTrayImage() {
  const f = path.join(ROOT, 'assets', 'tray.png');
  if (fs.existsSync(f)) return nativeImage.createFromPath(f);
  const w = new BrowserWindow({ width: 64, height: 64, show: false, transparent: true, frame: false, webPreferences: { offscreen: false } });
  const svg = await w.loadFile(path.join(ROOT, 'renderer', 'icon.html')).then(() => new Promise(r => setTimeout(r, 300)));
  const img = await w.webContents.capturePage();
  w.destroy();
  const small = img.resize({ width: 32, height: 32 });
  try { fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, small.toPNG()); } catch (e) {}
  return small;
}

async function createTray() {
  tray = new Tray(await makeTrayImage());
  tray.setToolTip('Noodle');
  const build = () => Menu.buildFromTemplate([
    { label: 'Show now', click: () => showCard() },
    { label: 'Open cast', click: () => openCast() },
    { label: 'Screen-time reminder (every ' + getCfg().screen_time_min + ' min)', type: 'checkbox', checked: !!screenTimeOn,
      click: m => { screenTimeOn = m.checked; activeSec = 0; } },
    { label: 'Next in ~' + Math.max(0, Math.ceil(getCfg().screen_time_min - activeSec / 60)) + ' min', enabled: false, visible: !!screenTimeOn },
    { label: 'Pause 1 hour', click: () => { pausedUntil = Date.now() + 3600000; } },
    { label: 'Start with Windows', type: 'checkbox', checked: app.getLoginItemSettings().openAtLogin,
      click: m => app.setLoginItemSettings({ openAtLogin: m.checked, path: process.execPath, args: [app.getAppPath()] }) },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() }
  ]);
  tray.setContextMenu(build());
  tray.on('right-click', () => tray.setContextMenu(build()));
  tray.on('double-click', () => showCard());
}

const sleep = ms => new Promise(r => setTimeout(r, ms));
async function shot(wc, name) {
  const img = await wc.capturePage();
  fs.mkdirSync(path.join(ROOT, 'screenshots'), { recursive: true });
  fs.writeFileSync(path.join(ROOT, 'screenshots', name), img.toPNG());
}
async function screenshots() {
  await sleep(800);
  const css = 'html{background:#D9D3C9 !important}';
  await win.webContents.insertCSS(css);
  showCard();
  await sleep(750); await shot(win.webContents, 'entry.png');
  await sleep(1900); await shot(win.webContents, 'card.png');
  await win.webContents.executeJavaScript("document.getElementById('howto').click()");
  await sleep(500); await shot(win.webContents, 'howto.png');
  const c = openCast(); c.show(); await sleep(2500);
  await shot(c.webContents, 'cast.png');
  await c.webContents.executeJavaScript('window.scrollTo(0, document.body.scrollHeight)');
  await sleep(400); await shot(c.webContents, 'cast2.png');
  app.quit();
}

if (!app.requestSingleInstanceLock()) { app.quit(); }
else {
  app.on('window-all-closed', e => e.preventDefault());
  app.whenReady().then(async () => {
    createWin();
    startServer();
    screenTimeOn = !!getCfg().screen_time;
    setInterval(screenTimeTick, TICK * 1000);
    try { await createTray(); } catch (e) { console.error('tray', e.message); }
    process.on('unhandledRejection', e => console.error('REJ', e && e.message));
    if (SHOT) screenshots();
  });
}
