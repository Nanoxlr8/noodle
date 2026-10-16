(function (g) {
  const C = { body: '#EDBB5F', light: '#F8D894', shade: '#E2A84E', ridge: '#CF9640', open: '#B9852E', blush: '#F2A58A', ink: '#2B2420', red: '#D9534F' };
  const INK = C.ink;
  let uid = 0;

  if (typeof document !== 'undefined' && !document.getElementById('noodle-mascot-css')) {
    const s = document.createElement('style');
    s.id = 'noodle-mascot-css';
    s.textContent = `
      .mascot{overflow:visible}.mascot .motion-root{transform-box:fill-box;transform-origin:center bottom;animation:noodleBreathe 3.6s ease-in-out infinite}
      .mascot .eyes{transform-box:fill-box;transform-origin:center;animation:noodleBlink 5.4s ease-in-out infinite}
      .mascot.explicit-blink .eyes{animation:none}.mascot .wavearm{transform-box:view-box;transform-origin:var(--wave-origin,center);animation:noodleWave .82s cubic-bezier(.42,0,.25,1) infinite alternate}
      .mascot.pose-walk .walk-arm-left,.mascot.pose-walk .walk-leg-right{transform-box:fill-box;transform-origin:top center;animation:noodleWalk .72s ease-in-out infinite alternate}
      .mascot.pose-walk .walk-arm-right,.mascot.pose-walk .walk-leg-left{transform-box:fill-box;transform-origin:top center;animation:noodleWalk .72s ease-in-out infinite alternate-reverse}
      .mascot.pose-walk .motion-root{animation:noodleWalkBob .72s ease-in-out infinite alternate}.mascot .pose-body{transform-box:view-box;transform-origin:100px 144px}.mascot.pose-neck_side .motion-root,.mascot.pose-doorway .motion-root{animation:none}.mascot.pose-neck_side .pose-body{animation:noodleNeck 3.4s ease-in-out infinite alternate}
      .mascot.pose-chin_tuck .face-wrap{transform-box:fill-box;transform-origin:center;animation:noodleChin 2.5s ease-in-out infinite}.mascot.pose-doorway .pose-body{animation:noodleLean 3s ease-in-out infinite}
      @keyframes noodleWave{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}@keyframes noodleBreathe{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(1px) scaleY(1.018)}}
      @keyframes noodleBlink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.08)}}@keyframes noodleWalk{from{transform:rotate(-17deg)}to{transform:rotate(17deg)}}@keyframes noodleWalkBob{from{transform:translateY(0) rotate(-1deg)}to{transform:translateY(3px) rotate(1deg)}}
      @keyframes noodleNeck{from{transform:rotate(-10deg)}to{transform:rotate(-6deg)}}@keyframes noodleChin{0%,34%,100%{transform:translateY(0)}50%,70%{transform:translateY(5px) scale(.96,1.04)}}@keyframes noodleLean{0%,100%{transform:rotate(12deg)}50%{transform:rotate(9deg) translateX(2px)}}
      @media (prefers-reduced-motion:reduce){.mascot *{animation:none!important}.mascot .motion-root{transform:none!important}}
    `;
    document.head.appendChild(s);
  }

  const limb = (d, w = 9) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const legsStd = (a = 89, b = 111, top = 144) => limb(`M${a} ${top} V172`, 8) + limb(`M${b} ${top} V172`, 8) + limb(`M${a - 7} 175 h14`, 10) + limb(`M${b - 7} 175 h14`, 10);

  function face(kind, cx, cy, s = 1, dx = 0) {
    const ex = 11;
    let eyes;
    if (kind === 'blink') {
      eyes = [-ex, ex].map(d => `<path d="M${cx + d - 5} ${cy} Q${cx + d} ${cy + 6} ${cx + d + 5} ${cy}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('');
    } else {
      eyes = `<g class="eyes">${[-ex, ex].map(d => `<ellipse cx="${cx + d}" cy="${cy}" rx="4" ry="5.5" fill="${INK}"/><circle cx="${cx + d + 1.3}" cy="${cy - 2}" r="1.5" fill="#fff"/>`).join('')}</g>`;
    }
    let mouth;
    if (kind === 'hello') mouth = `<ellipse cx="${cx}" cy="${cy + 18}" rx="6.5" ry="8" fill="${INK}"/>`;
    else if (kind === 'chin_tuck') mouth = `<path d="M${cx - 6} ${cy + 15} Q${cx} ${cy + 20} ${cx + 6} ${cy + 15}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 9} ${cy + 26} Q${cx} ${cy + 31} ${cx + 9} ${cy + 26}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
    else mouth = `<path d="M${cx - 10} ${cy + 11} H${cx + 10} Q${cx + 10} ${cy + 25} ${cx} ${cy + 25} Q${cx - 10} ${cy + 25} ${cx - 10} ${cy + 11} Z" fill="${INK}"/>`;
    const blush = `<ellipse cx="${cx - 21}" cy="${cy + 13}" rx="6" ry="4" fill="${C.blush}"/><ellipse cx="${cx + 21}" cy="${cy + 13}" rx="6" ry="4" fill="${C.blush}"/>`;
    return `<g class="face-wrap"><g transform="translate(${cx + dx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${blush}${eyes}${mouth}</g></g>`;
  }

  function tube(x, w, n) {
    const top = 36, bot = 144, h = bot - top, id = 'cp' + (++uid);
    let ridges = '';
    for (let i = 1; i <= n; i++) { const lx = x + w * i / (n + 1); ridges += `<line x1="${lx}" y1="${top + 6}" x2="${lx}" y2="${bot}" stroke="${C.ridge}" stroke-width="3"/>`; }
    return `<defs><clipPath id="${id}"><rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14"/></clipPath></defs>
<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14" fill="${C.body}"/>
<g clip-path="url(#${id})"><rect x="${x + w * 0.72}" y="${top}" width="${w * 0.3}" height="${h}" fill="${C.shade}"/>${ridges}<rect x="${x + 6}" y="${top + 16}" width="7" height="${h - 38}" rx="3.5" fill="${C.light}"/></g>
<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14" fill="none" stroke="${INK}" stroke-width="6"/>
<ellipse cx="${x + w / 2}" cy="${top}" rx="${w / 2}" ry="11" fill="${C.open}" stroke="${INK}" stroke-width="6"/>`;
  }

  function wrap(inner, o, defaultView) {
    const id = 'st' + (++uid);
    const view = o.crop ? o.crop.join(' ') : defaultView;
    const filter = o.nosticker ? '' : `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feOffset in="d" dx="4" dy="6" result="o"/><feGaussianBlur in="o" stdDeviation="3" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .32 0" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    const size = o.size ? ` width="${o.size}" height="${o.size}"` : ' width="100%" height="100%"';
    return `<svg class="mascot pose-${o.motionPose || 'idle'}${o.explicitBlink ? ' explicit-blink' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${view}"${size} style="display:block;overflow:visible"><defs>${filter}</defs><g${o.nosticker ? '' : ` filter="url(#${id})"`}><g class="motion-root">${inner}</g></g></svg>`;
  }

  function toni(pose = 'idle', faceKind = 'smile', o = {}) {
    const front = tube(70, 60, 4) + face(faceKind, 100, 80);
    const armL = 'M70 92 Q55 106 57 130', armR = 'M130 92 Q145 106 143 130';
    const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="${C.red}" stroke="#fff" stroke-width="2"/>`;
    const arrow = (x1, y, x2) => { const s = Math.sign(x2 - x1); return `<path d="M${x1} ${y} H${x2} M${x2 - 8 * s} ${y - 7} L${x2} ${y} L${x2 - 8 * s} ${y + 7}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`; };
    let pre = '', legs = legsStd(), grp = limb(armL) + limb(armR) + front, tr = '', post = '';
    switch (pose) {
      case 'wave':
        grp = limb(armL) + `<g class="wavearm" style="--wave-origin:130px 92px">${limb('M130 92 Q152 84 152 54')}</g>` + front; break;
      case 'doorway':
        pre = `<line x1="166" y1="20" x2="166" y2="180" stroke="#CFC8BC" stroke-width="7" stroke-linecap="round"/>`;
        tr = 'rotate(12 100 144)';
        grp = limb('M130 100 L160 106 L164 70') + limb('M130 92 L156 84 L164 50') + front;
        post = arrow(28, 112, 58); break;
      case 'chin_tuck':
        tr = 'rotate(-7 100 144)';
        grp = limb(armL) + limb(armR) + tube(70, 60, 4) + face('chin_tuck', 100, 80);
        post = arrow(168, 62, 140); break;
      case 'neck_side':
        tr = 'rotate(-10 100 144)';
        grp = limb(armL) + limb(armR) + front + dot(122, 62); break;
      case 'peek':
        legs = '';
        grp = `<g transform="translate(0 30)">${front}</g>`;
        post = `<rect x="30" y="136" width="140" height="78" rx="10" fill="#fff" stroke="#DDD7CC" stroke-width="4"/>` + limb('M72 136 h14 M114 136 h14', 10);
        break;
      case 'walk': {
        const b = tube(78, 44, 3) + face(faceKind, 112, 80, 0.8, -6);
        legs = `<g class="walk-leg-left">${limb('M98 144 L78 170', 8) + limb('M68 172 h14', 10)}</g><g class="walk-leg-right">${limb('M104 144 L128 168', 8) + limb('M122 171 h14', 10)}</g>`;
        grp = `<g class="walk-arm-left">${limb('M100 94 L80 114')}</g><g class="walk-arm-right">${limb('M100 94 L122 110')}</g>` + b;
        tr = 'rotate(4 100 144)';
        pre = [88, 104, 120].map((y, i) => `<path d="M${14 + i * 6} ${y} h${28 - i * 6}" stroke="#BDB6AA" stroke-width="4" stroke-linecap="round"/>`).join('');
        break;
      }
    }
    return wrap(`${pre}${legs}<g class="pose-body"${tr ? ` transform="${tr}"` : ''}>${grp}</g>${post}`, Object.assign({}, o, { motionPose: pose, explicitBlink: faceKind === 'blink' }), '0 0 200 220');
  }

  const SY = { body: '#F6DA7A', light: '#FCEDB0', shade: '#E8BE4A' };
  function sammy(pose = 'idle', faceKind = 'smile', o = {}) {
    const strand = 'M100 48 C84 62 116 78 100 96 S84 130 100 148';
    const curl = 'M100 48 C100 26 128 22 126 40 C125 52 110 50 114 40';
    const stroke = (d, w, c, t = '') => `<path d="${d}"${t} fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    let arms = limb('M84 104 Q62 112 62 134') + limb('M116 104 Q138 112 138 134');
    if (pose === 'wave') arms = limb('M84 104 Q62 112 62 134') + `<g class="wavearm" style="--wave-origin:116px 104px">${limb('M116 104 Q142 96 142 66')}</g>`;
    const body = stroke(strand, 46, INK) + stroke(curl, 22, INK) + stroke(strand, 34, SY.body) + stroke(curl, 10, SY.body) +
      stroke(strand, 4, SY.light, ' transform="translate(-9 0)"') + stroke(strand, 5, SY.shade, ' transform="translate(11 6)"') + face(faceKind, 100, 94, 0.72);
    return wrap(legsStd(92, 108, 148) + arms + body, Object.assign({}, o, { motionPose: pose, explicitBlink: faceKind === 'blink' }), '0 0 200 220');
  }

  g.Noodle = { toni, sammy, C, SY };
})(typeof window !== 'undefined' ? window : globalThis);
