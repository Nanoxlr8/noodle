const { app, BrowserWindow } = require('electron');
const path = require('path');
const fs = require('fs');
app.setName('noodle-motion-check');
app.setPath('userData', path.join(__dirname, '..', '.test-profile'));

const fail = message => { console.error(message); process.exitCode = 1; };
async function inspect() {
  await app.whenReady();
  const win = new BrowserWindow({ show: false, webPreferences: { contextIsolation: true } });
  await win.loadFile(path.join(__dirname, '..', 'renderer', 'card.html'));
  const result = await win.webContents.executeJavaScript(`(() => {
    const host = document.createElement('div'); host.innerHTML = Noodle.toni('walk', 'smile'); document.body.append(host);
    const doorway = document.createElement('div'); doorway.innerHTML = Noodle.toni('doorway', 'smile'); document.body.append(doorway);
    const wave = Noodle.toni('wave', 'hello'); const staticBlink = Noodle.toni('idle', 'blink');
    const motion = host.querySelector('.motion-root'); const limb = host.querySelector('.walk-leg-left');
    return { motion: getComputedStyle(motion).animationName, limb: getComputedStyle(limb).animationName,
      wave: wave.includes('steps('), blink: staticBlink.includes('explicit-blink'), intro: document.querySelector('.entry-title').textContent,
      doorwayRoot: getComputedStyle(doorway.querySelector('.motion-root')).animationName, doorwayBody: getComputedStyle(doorway.querySelector('.pose-body')).animationName };
  })()`);
  win.destroy(); return result;
}

(async () => {
  const normal = await inspect();
  if (normal.motion !== 'noodleWalkBob' || normal.limb !== 'noodleWalk' || normal.doorwayRoot !== 'none' || normal.doorwayBody !== 'noodleLean' || normal.wave || !normal.blink) fail('normal motion layers were not rendered as expected');
  const css = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'mascot.js'), 'utf8');
  if (!css.includes('@media (prefers-reduced-motion:reduce)') || !css.includes('animation:none!important')) fail('reduced motion fallback is missing');
  fs.writeFileSync(path.join(__dirname, '..', '.motion-check-result.json'), JSON.stringify({ normal, reducedMotionRule: true }));
  console.log('motion checks passed');
  app.exit(process.exitCode || 0);
})().catch(error => { console.error(error); app.exit(1); });
