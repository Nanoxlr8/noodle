const $ = id => document.getElementById(id);
const api = window.noodle || { onPresent() {}, onFinish() {}, onHide() {}, done() {}, stop() {}, resize() {} };
let run = 0, tick = null, typing = null;

function setTile(pose, face) { $('tile').innerHTML = Noodle.toni(pose, face || 'smile'); }
function swapTile(pose, face) { const t = $('tile'); t.style.opacity = 0; setTimeout(() => { setTile(pose, face); t.style.opacity = 1; }, 180); }
function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
const wait = ms => new Promise(r => setTimeout(r, ms));

function typeText(text) {
  clearInterval(typing); const el = $('entry'); el.textContent = ''; let i = 0;
  return new Promise(res => { typing = setInterval(() => { el.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(typing); res(); } }, 40); });
}

function showContent(ex, counter) {
  clearInterval(tick);
  $('title').textContent = ex.title; $('counter').textContent = counter;
  $('instr').textContent = ex.instruction; $('dur').textContent = ex.duration_label;
  $('steps').innerHTML = (ex.how_to || []).map(s => '<li>' + s + '</li>').join('');
  $('card').classList.remove('open');
  $('entry').style.opacity = 0; $('content').style.opacity = 1;
  swapTile(ex.pose, 'smile');
  const bar = $('bar'); bar.style.animation = 'none'; void bar.offsetWidth;
  bar.style.animation = 'fill ' + ex.duration_sec + 's linear forwards';
  const end = Date.now() + ex.duration_sec * 1000;
  const upd = () => { const left = Math.max(0, Math.ceil((end - Date.now()) / 1000)); $('left').textContent = fmt(left) + ' left'; if (left <= 0) { clearInterval(tick); api.done(); } };
  upd(); tick = setInterval(upd, 250);
}

api.onPresent(async ({ ex, counter, first }) => {
  const my = ++run; clearInterval(tick);
  if (first) {
    const c = $('card'); c.classList.remove('in', 'open'); void c.offsetWidth;
    $('content').style.opacity = 0; $('entry').style.opacity = 1; $('bar').style.animation = 'none';
    setTile('wave', 'hello'); c.classList.add('in');
    await typeText("It's time"); if (my !== run) return;
    await wait(1000); if (my !== run) return;
    showContent(ex, counter);
  } else showContent(ex, counter);
});
api.onFinish(() => {
  run++; clearInterval(tick); $('bar').style.animation = 'none';
  $('content').style.opacity = 0; $('entry').style.opacity = 1; $('entry').textContent = 'Nice! Back to work.';
  swapTile('wave', 'hello');
});
api.onHide(() => { run++; clearInterval(tick); clearInterval(typing); $('card').classList.remove('in'); });

$('done').onclick = () => api.done();
$('stop').onclick = () => api.stop();
$('howto').onclick = () => $('card').classList.toggle('open');
new ResizeObserver(() => api.resize(Math.ceil($('card').getBoundingClientRect().height))).observe($('card'));
