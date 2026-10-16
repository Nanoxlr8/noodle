const $ = id => document.getElementById(id);
const api = window.noodle || { onPresent() {}, onFinish() {}, onHide() {}, done() {}, stop() {}, resize() {} };
let run = 0, exStart = 0, cardHidden = false, tick = null, typing = null, typeDone = null, swapTimers = [];
const reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function setTile(pose, face, ex) { $('tile').innerHTML = Noodle.toni(pose, face || 'smile', ex ? { dur: ex.duration_sec } : {}); }
// Keep the mascot loop locked to the countdown; pause it while the card is hidden or the page is not visible.
function syncAnimations(elapsedMs) {
  try { $('tile').getAnimations({ subtree: true }).forEach(a => { a.currentTime = elapsedMs; }); } catch (e) {}
}
function syncPause() { $('tile').classList.toggle('paused', cardHidden || document.hidden); }
document.addEventListener('visibilitychange', () => { syncPause(); if (!document.hidden && exStart && !cardHidden) syncAnimations(Date.now() - exStart); });
function clearPendingVisuals() {
  swapTimers.forEach(clearTimeout); swapTimers = [];
  $('tile').classList.remove('swapping');
  if (typing) clearInterval(typing); typing = null;
  if (typeDone) { typeDone(); typeDone = null; }
}
function swapTile(pose, face, token = run, ex = null) {
  const t = $('tile'); t.classList.add('swapping');
  const timer = setTimeout(() => {
    swapTimers = swapTimers.filter(x => x !== timer);
    if (token !== run) return;
    setTile(pose, face, ex); t.classList.remove('swapping');
    if (ex && exStart) syncAnimations(Date.now() - exStart);
  }, reducedMotion ? 0 : 180);
  swapTimers.push(timer);
}
function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
const wait = ms => new Promise(r => setTimeout(r, ms));

function setEntry(title, subtitle = '') { $('entry').querySelector('.entry-title').textContent = title; $('entry').querySelector('.entry-sub').textContent = subtitle; }
function typeText(text) {
  clearPendingVisuals(); const el = $('entry').querySelector('.entry-title'); el.textContent = ''; let i = 0;
  if (reducedMotion) { setEntry(text, 'A short reset for your body.'); return Promise.resolve(); }
  return new Promise(res => {
    typeDone = () => res();
    typing = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(typing); typing = null; typeDone = null; res(); } }, 32);
  });
}

function showContent(ex, counter, token = run) {
  if (token !== run) return;
  clearInterval(tick);
  $('title').textContent = ex.title; $('counter').textContent = counter;
  $('instr').textContent = ex.instruction; $('dur').textContent = ex.duration_label;
  $('steps').innerHTML = (ex.how_to || []).map(s => '<li>' + s + '</li>').join('');
  $('card').classList.remove('open');
  $('entry').style.opacity = 0; $('content').style.opacity = 1;
  exStart = Date.now(); swapTile(ex.pose, 'smile', token, ex);
  const bar = $('bar'); bar.style.animation = 'none'; void bar.offsetWidth;
  bar.style.animation = 'fill ' + ex.duration_sec + 's linear forwards';
  const end = exStart + ex.duration_sec * 1000;
  const upd = () => { if (token !== run) return; const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); $('left').textContent = fmt(left) + ' left'; if (left <= 0) { clearInterval(tick); api.done(); } };
  upd(); tick = setInterval(upd, 250);
}

async function presentCard({ ex, counter, first }) {
  const my = ++run; clearInterval(tick); clearPendingVisuals(); cardHidden = false; exStart = 0; syncPause();
  if (first) {
    const c = $('card'); c.classList.remove('in', 'open'); void c.offsetWidth;
    $('content').style.opacity = 0; $('entry').style.opacity = 1; $('bar').style.animation = 'none';
    setTile('wave', 'hello'); c.classList.add('in');
    setEntry('', 'A short reset for your body.');
    await typeText("It's time to stretch!"); if (my !== run) return;
    await wait(reducedMotion ? 1500 : 850); if (my !== run) return;
    showContent(ex, counter, my);
  } else showContent(ex, counter, my);
}
function finishCard() {
  run++; exStart = 0; clearInterval(tick); clearPendingVisuals(); $('bar').style.animation = 'none';
  $('content').style.opacity = 0; $('entry').style.opacity = 1; setEntry('Nice! Back to work.', 'Your body will thank you.');
  swapTile('wave', 'hello', run);
}
function hideCard() { run++; exStart = 0; cardHidden = true; syncPause(); clearInterval(tick); clearPendingVisuals(); $('card').classList.remove('in'); }
api.onPresent(presentCard);
api.onFinish(finishCard);
api.onHide(hideCard);
if (new URLSearchParams(location.search).has('preview')) window.__noodlePreview = { present: presentCard, finish: finishCard, hide: hideCard };

$('done').onclick = () => api.done();
$('stop').onclick = () => api.stop();
$('howto').onclick = () => $('card').classList.toggle('open');
new ResizeObserver(() => api.resize(Math.ceil($('card').getBoundingClientRect().height))).observe($('card'));
