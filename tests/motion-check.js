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
    const mk = (pose, face) => { const h = document.createElement('div'); h.innerHTML = Noodle.toni(pose, face || 'smile'); document.body.append(h); return h; };
    const an = (h, sel) => getComputedStyle(h.querySelector(sel)).animationName;
    const walk = mk('walk'), neck = mk('neck_side'), chin = mk('chin_tuck'), door = mk('doorway'), rolls = mk('shoulder_rolls'), wrist = mk('wrist'), eyes = mk('eyes');
    const wave = Noodle.toni('wave', 'hello'); const staticBlink = Noodle.toni('idle', 'blink');
    return { motion: an(walk, '.walk-bob'), limb: an(walk, '.walk-leg-near'), wave: wave.includes('steps('), blink: staticBlink.includes('explicit-blink'),
      neck: an(neck, '.neck-head'), neckRoot: an(neck, '.motion-root'), chin: an(chin, '.chin-face'), door: an(door, '.pose-body'), rolls: an(rolls, '.roll-l'),
      wrist: an(wrist, '.wrist-hand-a'), eyes: an(eyes, '.eye-glide'), eyeBlink: an(eyes, '.eyes') };
  })()`);
  win.destroy(); return result;
}

(async () => {
  const normal = await inspect();
  const want = { motion: 'noodleWalkBob', limb: 'noodleWalk', neck: 'noodleNeck', neckRoot: 'none', chin: 'noodleChin', door: 'noodleLean', rolls: 'noodleRollL', wrist: 'noodleWristA', eyes: 'noodleLook', eyeBlink: 'noodleBlinkOnce' };
  for (const k of Object.keys(want)) if (normal[k] !== want[k]) fail(`motion layer ${k}: expected ${want[k]}, got ${normal[k]}`);
  if (normal.wave || !normal.blink) fail('wave/blink markup unexpected');
  const css = fs.readFileSync(path.join(__dirname, '..', 'renderer', 'mascot.js'), 'utf8');
  if (!css.includes('@media (prefers-reduced-motion:reduce)') || !css.includes('animation:none!important')) fail('reduced motion fallback is missing');
  fs.writeFileSync(path.join(__dirname, '..', '.motion-check-result.json'), JSON.stringify({ normal, reducedMotionRule: true }));
  console.log('motion checks passed');
  app.exit(process.exitCode || 0);
})().catch(error => { console.error(error); app.exit(1); });
