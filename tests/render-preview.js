const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
app.setName('noodle-motion-preview');
app.setPath('userData', path.join(__dirname, '..', '.preview-profile'));
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

(async () => {
  await app.whenReady();
  const win = new BrowserWindow({ width: 500, height: 300, show: false, transparent: false, webPreferences: { contextIsolation: true } });
  await win.loadFile(path.join(__dirname, '..', 'renderer', 'card.html'), { query: { preview: '1' } });
  const out = path.join(__dirname, '..', 'screenshots'); const docs = path.join(__dirname, '..', 'docs', 'images'); fs.mkdirSync(out, { recursive: true });
  const capture = async (name, docName) => { const png = (await win.webContents.capturePage()).toPNG(); fs.writeFileSync(path.join(out, name), png); if (docName) fs.writeFileSync(path.join(docs, docName), png); };
  const ex = { title: 'Neck side stretch', instruction: 'Ear toward shoulder, other shoulder stays down.', duration_sec: 40, duration_label: '20 sec each side', pose: 'neck_side', how_to: [] };
  await win.webContents.executeJavaScript(`window.__noodlePreview.present(${JSON.stringify({ ex, counter: '1 of 6', first: true })})`);
  await delay(320); await capture('motion-entry.png', 'entry.png');
  await delay(1500); await capture('motion-exercise.png', 'card.png');
  await win.webContents.executeJavaScript('window.__noodlePreview.finish()'); await delay(250); await capture('motion-success.png');
  win.destroy(); app.quit();
})().catch(error => { console.error(error); app.quit(); process.exitCode = 1; });
