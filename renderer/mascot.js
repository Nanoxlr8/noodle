(function (g) {
  const C = { body: '#EDBB5F', light: '#F8D894', shade: '#E2A84E', ridge: '#CF9640', open: '#B9852E', blush: '#F2A58A', ink: '#2B2420', red: '#D9534F' };
  const INK = C.ink;
  let uid = 0;

  const RLR = 8, RN = 24, RROLLS = 10;
  // Shoulder-roll path: 10 rolls (5 back, 5 forward) sampled on a circle; side = +1 right shoulder, -1 left.
  function rollKF(side) {
    let out = '';
    for (let i = 0; i <= RROLLS * RN; i++) {
      const r = Math.min(Math.floor(i / RN), RROLLS - 1); let p = i === RROLLS * RN ? 1 : (i % RN) / RN;
      if (r === 4 || r === 9) p = Math.sin(p * Math.PI / 2); else if (r === 0 || r === 5) p = 1 - Math.cos(p * Math.PI / 2);
      const dir = r < RROLLS / 2 ? 1 : -1, th = 2 * Math.PI * p;
      out += `${(i / (RROLLS * RN) * 100).toFixed(3)}%{transform:translate(${(side * dir * RLR * Math.sin(th)).toFixed(2)}px,${(-RLR * (1 - Math.cos(th))).toFixed(2)}px)}`;
    }
    return out;
  }

  if (typeof document !== 'undefined' && !document.getElementById('noodle-mascot-css')) {
    const s = document.createElement('style');
    s.id = 'noodle-mascot-css';
    const EASE = 'cubic-bezier(.45,0,.55,1)';
    s.textContent = `
      .mascot{overflow:visible}.mascot .motion-root{transform-box:fill-box;transform-origin:center bottom;animation:noodleBreathe 3.6s ease-in-out infinite}
      .mascot .eyes{transform-box:fill-box;transform-origin:center;animation:noodleBlink 5.4s ease-in-out infinite}
      .mascot.explicit-blink .eyes{animation:none}.mascot .wavearm{animation:noodleWave .82s cubic-bezier(.42,0,.25,1) infinite alternate}
      .mascot.pose-walk .motion-root{animation:none}
      .mascot.pose-walk .walk-leg-near,.mascot.pose-walk .walk-arm-far{animation:noodleWalk .45s ease-in-out infinite alternate}
      .mascot.pose-walk .walk-leg-far,.mascot.pose-walk .walk-arm-near{animation:noodleWalk .45s ease-in-out infinite alternate-reverse}
      .mascot.pose-walk .walk-arm-near,.mascot.pose-walk .walk-arm-far{animation-name:noodleArm}
      .mascot.pose-walk .walk-foot-near{animation:noodleWalkInv .45s ease-in-out infinite alternate}.mascot.pose-walk .walk-foot-far{animation:noodleWalkInv .45s ease-in-out infinite alternate-reverse}
      .mascot.pose-walk .walk-bob{animation:noodleWalkBob .45s ease-in-out infinite}.mascot.pose-walk .walk-lines{animation:noodleLines .9s ease-in-out infinite}
      .mascot.pose-neck_side .motion-root,.mascot.pose-chin_tuck .motion-root,.mascot.pose-thoracic .motion-root,.mascot.pose-doorway .motion-root,.mascot.pose-shoulder_rolls .motion-root,.mascot.pose-wrist .motion-root,.mascot.pose-eyes .motion-root{animation:none}
      .mascot .neck-head{animation:noodleNeck var(--dur,40s) ${EASE} infinite}.mascot .nk-a{animation:noodleNeckA var(--dur,40s) ease infinite}.mascot .nk-b{animation:noodleNeckB var(--dur,40s) ease infinite}
      .mascot .ct-head{transform-box:view-box;animation:noodleCtHead calc(var(--dur,30s) / 3) cubic-bezier(.45,0,.25,1) infinite}.mascot .ct-neck{transform-box:view-box;transform-origin:100px 108px;animation:noodleCtNeck calc(var(--dur,30s) / 3) cubic-bezier(.45,0,.25,1) infinite}.mascot .chin-cue,.mascot .chin-fold{animation:noodleChinCue calc(var(--dur,30s) / 3) ease infinite}
      .mascot .pose-body.lean{animation:noodleLean var(--dur,30s) ${EASE} infinite}.mascot .chest-glow{animation:noodleGlow var(--dur,30s) ease infinite}
      .mascot .roll-l{animation:noodleRollL var(--dur,20s) linear infinite}.mascot .roll-r{animation:noodleRollR var(--dur,20s) linear infinite}
      .mascot .roll-a{animation:noodleRollA var(--dur,20s) ease infinite}.mascot .roll-b{animation:noodleRollB var(--dur,20s) ease infinite}
      .mascot .th-arch{transform-box:view-box;transform-origin:100px 140px;animation:noodleArch calc(var(--dur,40s) / 10) cubic-bezier(.45,0,.25,1) infinite}.mascot .th-cue{animation:noodleArchCue calc(var(--dur,40s) / 10) ease infinite}.mascot .wrist-a{animation:noodleWristShowA var(--dur,30s) ease infinite}.mascot .wrist-b{animation:noodleWristShowB var(--dur,30s) ease infinite}
      .mascot .wrist-hand-a{animation:noodleWristA var(--dur,30s) ${EASE} infinite}.mascot .wrist-hand-b{animation:noodleWristB var(--dur,30s) ${EASE} infinite}
      .mascot .eye-glide{animation:noodleLook var(--dur,20s) ${EASE} infinite}.mascot.pose-eyes .eyes{animation:noodleBlinkOnce var(--dur,20s) ease-in-out infinite}
      .mascot .far-obj{animation:noodleFar var(--dur,20s) ease infinite}
      .mascot .breath{transform-box:fill-box;transform-origin:50% 100%;animation:noodleHold 3.2s ease-in-out infinite}.mascot .pulse{transform-box:fill-box;transform-origin:center;animation:noodlePulse 1.4s ease-in-out infinite}
      .mascot .door-arm-a{animation:noodleDoorA var(--dur,30s) ${EASE} infinite}.mascot .door-arm-b{animation:noodleDoorB var(--dur,30s) ${EASE} infinite}
      @keyframes noodleHold{0%,100%{transform:translateY(0) scale(1,1)}50%{transform:translateY(-1.5px) scale(1.012,1.024)}}@keyframes noodlePulse{0%,100%{opacity:.6;transform:scale(.9)}50%{opacity:1;transform:scale(1.08)}}
      @keyframes noodleDoorA{0%,100%{d:path('M104 90 L60 90 L60 54')}13.3%,80%{d:path('M118.7 91.5 L60 90 L60 54')}}@keyframes noodleDoorB{0%,100%{d:path('M100 94 L64 94 L64 58')}13.3%,80%{d:path('M114.1 94.7 L64 94 L64 58')}}
      @keyframes noodleWave{from{transform:rotate(-14deg)}to{transform:rotate(16deg)}}@keyframes noodleBreathe{0%,100%{transform:translateY(0) scaleY(1)}50%{transform:translateY(1px) scaleY(1.018)}}
      @keyframes noodleBlink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.08)}}@keyframes noodleWalk{from{transform:rotate(-24deg)}to{transform:rotate(24deg)}}@keyframes noodleWalkInv{from{transform:rotate(24deg)}to{transform:rotate(-24deg)}}@keyframes noodleArm{from{transform:rotate(-38deg)}to{transform:rotate(38deg)}}@keyframes noodleLines{0%{opacity:0;transform:translateX(6px)}50%{opacity:.9;transform:translateX(0)}100%{opacity:0;transform:translateX(-8px)}}@keyframes noodleWalkBob{0%,100%{transform:translateY(2.5px)}50%{transform:translateY(0)}}
      @keyframes noodleNeck{0%{transform:rotate(0)}4%,46%{transform:rotate(-18deg)}50%{transform:rotate(0)}54%,96%{transform:rotate(18deg)}100%{transform:rotate(0)}}
      @keyframes noodleNeckA{0%{opacity:0}4%,46%{opacity:1}50%,100%{opacity:0}}@keyframes noodleNeckB{0%,50%{opacity:0}54%,96%{opacity:1}100%{opacity:0}}
      @keyframes noodleCtHead{0%{transform:translateX(0)}18%,82%{transform:translateX(-14px)}100%{transform:translateX(0)}}@keyframes noodleCtNeck{0%{transform:skewX(0)}18%,82%{transform:skewX(41deg)}100%{transform:skewX(0)}}@keyframes noodleArch{0%,8%{transform:rotate(0)}40%,62%{transform:rotate(-20deg)}94%,100%{transform:rotate(0)}}@keyframes noodleArchCue{0%,10%,90%,100%{opacity:.15}40%,62%{opacity:1}}@keyframes noodleChin{0%{transform:translateX(0)}18%,82%{transform:translateX(-7px)}100%{transform:translateX(0)}}@keyframes noodleChinCue{0%,100%{opacity:.2}14%,86%{opacity:1}}
      @keyframes noodleLean{0%{transform:rotate(0)}13.3%,80%{transform:rotate(10deg)}100%{transform:rotate(0)}}@keyframes noodleGlow{0%{opacity:0}13.3%,80%{opacity:.95}100%{opacity:0}}
      @keyframes noodleRollL{${rollKF(-1)}}@keyframes noodleRollR{${rollKF(1)}}
      @keyframes noodleRollA{0%,44%{opacity:1}56%,94%{opacity:0}100%{opacity:1}}@keyframes noodleRollB{0%,44%{opacity:0}56%,94%{opacity:1}100%{opacity:0}}
      @keyframes noodleWristShowA{0%,44%{opacity:1}52%,96%{opacity:0}100%{opacity:1}}@keyframes noodleWristShowB{0%,44%{opacity:0}52%,96%{opacity:1}100%{opacity:0}}
      @keyframes noodleWristA{0%{transform:rotate(90deg)}10%,42%{transform:rotate(-12deg)}50%,54%{transform:rotate(90deg)}64%,94%{transform:rotate(-12deg)}100%{transform:rotate(90deg)}}@keyframes noodleWristCue{0%,6%{opacity:0}12%,42%{opacity:1}48%,58%{opacity:0}66%,94%{opacity:1}100%{opacity:0}}@keyframes noodleWristB{0%,50%{transform:rotate(0)}58%,92%{transform:rotate(-55deg)}100%{transform:rotate(0)}}
      @keyframes noodleLook{0%{transform:translateX(0)}5%,95%{transform:translateX(7px)}100%{transform:translateX(0)}}
      @keyframes noodleBlinkOnce{0%,46%{transform:scaleY(1)}50%{transform:scaleY(.08)}54%,100%{transform:scaleY(1)}}
      @keyframes noodleFar{0%,3%{opacity:0;transform:scale(.5)}9%,91%{opacity:1;transform:scale(1)}97%,100%{opacity:0;transform:scale(.5)}}
      .mascot .neck-head,.mascot .th-arch,.mascot .ct-head,.mascot .ct-neck,.mascot .pose-body.lean,.mascot .roll-l,.mascot .roll-r,.mascot .wrist-hand,.mascot .eye-glide,.mascot .far-obj,.mascot .wavearm,.mascot [class^=walk-]{will-change:transform}.mascot .walk-lines{will-change:opacity,transform}
      .mascot .nk-a,.mascot .nk-b,.mascot .chest-glow,.mascot .roll-a,.mascot .roll-b,.mascot .wrist-a,.mascot .wrist-b,.mascot .chin-cue{will-change:opacity}
      #tile.paused .mascot *{animation-play-state:paused!important}
      @media (prefers-reduced-motion:reduce){.mascot *{animation:none!important}.mascot .motion-root{transform:none!important}
        .mascot .neck-head{transform:rotate(-18deg)}.mascot .ct-head{transform:translateX(-14px)}.mascot .ct-neck{transform:skewX(41deg)}.mascot .chin-fold{opacity:1}.mascot .pose-body.lean{transform:rotate(10deg)}.mascot .door-arm-a{d:path('M118.7 91.5 L60 90 L60 54')}.mascot .door-arm-b{d:path('M114.1 94.7 L64 94 L64 58')}.mascot .chest-glow{opacity:.95}
        .mascot .wrist-hand{transform:rotate(-12deg)}.mascot .th-arch{transform:rotate(-20deg)}.mascot .th-cue{opacity:1}.mascot .wrist-cue,.mascot .wrist-help{opacity:1}.mascot .eye-glide{transform:translateX(7px)}}
    `;
    document.head.appendChild(s);
  }

  const limb = (d, w = 9) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
  const legsStd = (a = 89, b = 111, top = 144) => limb(`M${a} ${top} V172`, 8) + limb(`M${b} ${top} V172`, 8) + limb(`M${a - 7} 175 h14`, 10) + limb(`M${b - 7} 175 h14`, 10);
  // Animated group that rotates/scales around (x, y): the CSS class goes on the animated <g>, whose origin is the joint.
  const pivot = (x, y, cls, inner, attrs = '') => `<g transform="translate(${x} ${y})"><g class="${cls}"${attrs}><g transform="translate(${-x} ${-y})">${inner}</g></g></g>`;
  const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="6" fill="${C.red}" stroke="#fff" stroke-width="2"/>`;
  const arrow = (x1, y, x2) => { const s = Math.sign(x2 - x1); return `<path d="M${x1} ${y} H${x2} M${x2 - 8 * s} ${y - 7} L${x2} ${y} L${x2 - 8 * s} ${y + 7}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`; };
  const arrowDown = (x, y1, y2) => `<path d="M${x} ${y1} V${y2} M${x - 7} ${y2 - 8} L${x} ${y2} L${x + 7} ${y2 - 8}" fill="none" stroke="${C.red}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`;
  const DUR = { neck_side: 40, chin_tuck: 30, doorway: 30, shoulder_rolls: 20, thoracic: 40, eyes: 20 };

  function face(kind, cx, cy, s = 1, dx = 0, glide = false) {
    const ex = 11;
    let eyes;
    if (kind === 'blink') {
      eyes = [-ex, ex].map(d => `<path d="M${cx + d - 5} ${cy} Q${cx + d} ${cy + 6} ${cx + d + 5} ${cy}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`).join('');
    } else {
      eyes = `<g class="eyes">${[-ex, ex].map(d => `<ellipse cx="${cx + d}" cy="${cy}" rx="4" ry="5.5" fill="${INK}"/><circle cx="${cx + d + 1.3}" cy="${cy - 2}" r="1.5" fill="#fff"/>`).join('')}</g>`;
      if (glide) eyes = `<g class="eye-glide">${eyes}</g>`;
    }
    let mouth;
    if (kind === 'hello') mouth = `<ellipse cx="${cx}" cy="${cy + 18}" rx="6.5" ry="8" fill="${INK}"/>`;
    else if (kind === 'chin_tuck') mouth = `<path d="M${cx - 6} ${cy + 15} Q${cx} ${cy + 20} ${cx + 6} ${cy + 15}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M${cx - 9} ${cy + 26} Q${cx} ${cy + 31} ${cx + 9} ${cy + 26}" fill="none" stroke="${INK}" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
    else mouth = `<path d="M${cx - 10} ${cy + 11} H${cx + 10} Q${cx + 10} ${cy + 25} ${cx} ${cy + 25} Q${cx - 10} ${cy + 25} ${cx - 10} ${cy + 11} Z" fill="${INK}"/>`;
    const blush = `<ellipse cx="${cx - 21}" cy="${cy + 13}" rx="6" ry="4" fill="${C.blush}"/><ellipse cx="${cx + 21}" cy="${cy + 13}" rx="6" ry="4" fill="${C.blush}"/>`;
    return `<g class="face-wrap"><g transform="translate(${cx + dx} ${cy}) scale(${s}) translate(${-cx} ${-cy})">${blush}${eyes}${mouth}</g></g>`;
  }

  // Side-profile face for a tube centred on x=100 (front edge at x=122): one eye, blush, profile mouth.
  function profileFace(cy = 80) {
    return `<ellipse cx="101" cy="${cy + 13}" rx="5.5" ry="3.8" fill="${C.blush}"/>` +
      `<g class="eyes"><ellipse cx="108" cy="${cy}" rx="3.8" ry="5.5" fill="${INK}"/><circle cx="109.2" cy="${cy - 2}" r="1.4" fill="#fff"/></g>` +
      `<path d="M122 ${cy + 1} Q137 ${cy + 9} 122 ${cy + 17} Z" fill="${C.body}" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>` +
      `<path d="M113 ${cy + 23} Q118 ${cy + 26} 122 ${cy + 22}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round"/>`;
  }
  const ear = (x, y) => `<path d="M${x} ${y - 6} Q${x - 6} ${y} ${x} ${y + 7}" fill="none" stroke="${C.ridge}" stroke-width="3.5" stroke-linecap="round"/>`;

  // clip = [x, y, w, h] keeps only that part of the tube (used to split head and body).
  function tube(x, w, n, clip) {
    const top = 36, bot = 144, h = bot - top, id = 'cp' + (++uid);
    let ridges = '';
    for (let i = 1; i <= n; i++) { const lx = x + w * i / (n + 1); ridges += `<line x1="${lx}" y1="${top + 6}" x2="${lx}" y2="${bot}" stroke="${C.ridge}" stroke-width="3"/>`; }
    const out = `<defs><clipPath id="${id}"><rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14"/></clipPath></defs>
<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14" fill="${C.body}"/>
<g clip-path="url(#${id})"><rect x="${x + w * 0.72}" y="${top}" width="${w * 0.3}" height="${h}" fill="${C.shade}"/>${ridges}<rect x="${x + 6}" y="${top + 16}" width="7" height="${h - 38}" rx="3.5" fill="${C.light}"/></g>
<rect x="${x}" y="${top}" width="${w}" height="${h}" rx="14" fill="none" stroke="${INK}" stroke-width="6"/>
<ellipse cx="${x + w / 2}" cy="${top}" rx="${w / 2}" ry="11" fill="${C.open}" stroke="${INK}" stroke-width="6"/>`;
    if (!clip) return out;
    const cid = 'cp' + (++uid);
    return `<defs><clipPath id="${cid}"><rect x="${clip[0]}" y="${clip[1]}" width="${clip[2]}" height="${clip[3]}"/></clipPath></defs><g clip-path="url(#${cid})">${out}</g>`;
  }

  function wrap(inner, o, defaultView) {
    const id = 'st' + (++uid);
    const view = o.crop ? o.crop.join(' ') : defaultView;
    const filter = o.nosticker ? '' : `<filter id="${id}" x="-25%" y="-25%" width="150%" height="150%"><feMorphology in="SourceAlpha" operator="dilate" radius="5" result="d"/><feFlood flood-color="#fff"/><feComposite in2="d" operator="in" result="w"/><feOffset in="d" dx="4" dy="6" result="o"/><feGaussianBlur in="o" stdDeviation="3" result="b"/><feColorMatrix in="b" type="matrix" values="0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .32 0" result="sh"/><feMerge><feMergeNode in="sh"/><feMergeNode in="w"/><feMergeNode in="SourceGraphic"/></feMerge></filter>`;
    const size = o.size ? ` width="${o.size}" height="${o.size}"` : ' width="100%" height="100%"';
    const dur = o.dur || DUR[o.motionPose] || 20;
    return `<svg class="mascot pose-${o.motionPose || 'idle'}${o.explicitBlink ? ' explicit-blink' : ''}" xmlns="http://www.w3.org/2000/svg" viewBox="${view}"${size} style="display:block;overflow:visible;--dur:${dur}s"><defs>${filter}</defs><g${o.nosticker ? '' : ` filter="url(#${id})"`}><g class="motion-root">${inner}</g></g></svg>`;
  }

  function toni(pose = 'idle', faceKind = 'smile', o = {}) {
    const front = tube(70, 60, 4) + face(faceKind, 100, 80);
    const armL = 'M70 92 Q55 106 57 130', armR = 'M130 92 Q145 106 143 130';
    let pre = '', legs = legsStd(), grp = limb(armL) + limb(armR) + front, tr = '', post = '';
    const opts = Object.assign({}, o, { motionPose: pose, explicitBlink: faceKind === 'blink' });
    const out = inner => wrap(inner, opts, '0 0 200 220');
    switch (pose) {
      case 'wave':
        grp = limb(armL) + pivot(130, 92, 'wavearm', limb('M130 92 Q152 84 152 54')) + front; break;
      case 'neck_side': {
        // Head and body are separate: the head group bends around the neck pivot, the body and legs stay still.
        const head = tube(70, 60, 4, [60, 20, 80, 84]) + face(faceKind, 100, 80);
        const mk = (cls, op, sx, dx) => `<g class="${cls}" opacity="${op}"><g class="pulse">${arrowDown(sx, 62, 84)}</g><g class="pulse">${dot(dx, 98)}</g></g>`;
        return out(legs + limb('M73 92 Q55 106 57 130') + limb('M127 92 Q145 106 143 130') + tube(70, 60, 4, [60, 92, 80, 70]) + pivot(100, 92, 'neck-head', `<g class="breath">${head}</g>`) + mk('nk-a', 1, 146, 122) + mk('nk-b', 0, 54, 78));
      }
      case 'chin_tuck': {
        // Side profile, like the promo: the noodle bends at the neck. The head band slides straight back (no nod) while a
        // short neck band skews to join it, so the tube kinks instead of splitting. A small double-chin fold shows when held.
        const lg = limb('M94 144 V172', 8) + limb('M106 144 V172', 8) + limb('M90 175 h14', 10) + limb('M102 175 h14', 10);
        const face = profileFace().replace(/<path d="M122 [^>]*Z"[^>]*\/>/, '') + ear(97, 90);
        const head = `<g class="ct-head">${tube(78, 44, 3, [50, 0, 100, 93])}${face}</g>`;
        const neck = `<g class="ct-neck">${tube(78, 44, 3, [50, 91.5, 100, 17.5])}</g>`;
        const lower = tube(78, 44, 3, [50, 107.5, 100, 61]);
        const fold = `<g class="chin-fold"><path d="M108 104 Q115 109 121 105" fill="none" stroke="${C.ridge}" stroke-width="3" stroke-linecap="round"/></g>`;
        const armBack = limb('M84 112 Q78 126 82 138', 8) + `<circle cx="82" cy="140" r="6" fill="${INK}"/>`;
        return out(lg + lower + neck + head + fold + armBack + `<g class="chin-cue"><g class="pulse">${arrow(158, 72, 134)}</g></g>`);
      }
      case 'doorway': {
        // Side profile facing right. The frame stays behind the shoulders and both forearms stay planted on it
        // (elbows at shoulder height) while the body leans forward from the feet, opening the chest (glow).
        const gid = 'gl' + (++uid);
        const door = `<line x1="60" y1="14" x2="60" y2="182" stroke="#CFC8BC" stroke-width="9" stroke-linecap="round"/><line x1="64" y1="16" x2="64" y2="180" stroke="#BDB6AA" stroke-width="2"/>`;
        const lg = limb('M94 144 L86 172', 8) + limb('M108 144 L120 172', 8);
        const glow = `<defs><radialGradient id="${gid}"><stop offset="0" stop-color="${C.red}" stop-opacity=".8"/><stop offset="1" stop-color="${C.red}" stop-opacity="0"/></radialGradient></defs><ellipse class="chest-glow" opacity="0" cx="116" cy="112" rx="15" ry="26" fill="url(#${gid})"/>`;
        const armA = limb('M104 90 L60 90 L60 54').replace('<path', '<path class="door-arm-a"');
        const armB = limb('M100 94 L64 94 L64 58').replace('<path', '<path class="door-arm-b"');
        const bodyG = `<g class="breath">${tube(78, 44, 3)}${glow}${profileFace()}</g>`;
        const feet = limb('M82 175 h14', 10) + limb('M113 175 h14', 10);
        return out(door + armA + feet + pivot(103, 175, 'pose-body lean', lg + bodyG) + armB + `<g class="pulse">${arrow(150, 112, 176)}</g>`);
      }
      case 'shoulder_rolls': {
        const cx = 156, cy = 70, a = `<path d="M${cx} ${cy + 12} A12 12 0 1 0 ${cx - 12} ${cy}" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round"/><path d="M${cx - 18} ${cy - 6} L${cx - 12} ${cy + 2} L${cx - 6} ${cy - 6}" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/>`;
        return out(legs + `<g class="roll-l">${limb('M73 92 Q55 106 57 130')}</g><g class="roll-r">${limb('M127 92 Q145 106 143 130')}</g>` + front +
          `<g class="roll-a"><g class="pulse">${a}</g></g><g class="roll-b" opacity="0"><g transform="translate(${2 * cx} 0) scale(-1 1)">${a}</g></g>`);
      }
      case 'thoracic': {
        // Seated thoracic extension, side profile facing right (from the promo): Toni sits on a chair with hands laced
        // behind the head, elbows forward, and arches the upper back over the chair back, 10 slow reps.
        const CH = '#C9C2B6';
        const chair = limb('M72 92 V178', 6).replace(INK, CH) + limb('M70 141 H120', 6).replace(INK, CH) + limb('M116 141 V178', 5).replace(INK, CH) + limb('M76 141 V178', 5).replace(INK, CH);
        const legsSeat = limb('M106 138 H138', 10) + limb('M138 138 V172', 9) + limb('M135 175 h15', 10);
        const face = profileFace().replace(/<path d="M122 [^>]*Z"[^>]*\/>/, '') + ear(97, 90);
        // Hands are behind the head, so only the elbow pokes out in front of the face and a hand peeks out behind.
        const eid = 'thel' + (++uid);
        const elbow = `<defs><clipPath id="${eid}"><rect x="121" y="40" width="40" height="60"/></clipPath></defs><path clip-path="url(#${eid})" d="M112 52 L138 70 L112 90 Z" fill="${INK}"/>`;
        const handBack = `<circle cx="78" cy="58" r="7" fill="${INK}"/>`;
        const upper = `<g class="th-arch">${handBack}${tube(78, 44, 3)}${face}${elbow}</g>`;
        const cue = `<g class="th-cue"><g class="pulse"><path d="M62 24 Q40 24 34 46" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round"/><path d="M27 40 L34 47 L41 40" fill="none" stroke="${C.red}" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></g></g>`;
        return out(chair + upper + legsSeat + cue);
      }
      case 'eyes': {
        const sun = `<circle cx="178" cy="34" r="6" fill="#F5C86B" stroke="${INK}" stroke-width="3"/>`;
        const mt = `<path d="M148 60 L160 40 L168 52 L174 44 L186 60 Z" fill="#9DB08E" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
        return out(legs + `<g class="breath">${limb(armL) + limb(armR) + tube(70, 60, 4) + face(faceKind, 100, 80, 1, 0, true)}</g>` + pivot(167, 48, 'far-obj', `<g class="pulse">${sun}</g>` + mt));
      }
      case 'peek':
        legs = '';
        grp = `<g transform="translate(0 30)">${front}</g>`;
        post = `<rect x="30" y="136" width="140" height="78" rx="10" fill="#fff" stroke="#DDD7CC" stroke-width="4"/>` + limb('M72 136 h14 M114 136 h14', 10);
        break;
      case 'walk': {
        // Side-view walk toward the right. Hip pivot at (100,144), shoulder pivot at (100,98); far limbs are thinner and muted.
        const FAR = '#6B5B4E';
        const limbC = (d, w, c, op = 1) => `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" opacity="${op}"/>`;
        const leg = (cls, fcls, w, c) => pivot(100, 140, cls, limbC('M100 140 V169', w, c) + pivot(100, 172, fcls, limbC('M97 174 h14', w + 2, c)));
        const arm = (cls, w, c) => pivot(100, 100, cls, limbC('M100 100 Q98 116 101 128', w, c) + `<circle cx="101" cy="130" r="${w / 2 + 2}" fill="${c}"/>`);
        const bodyW = tube(78, 44, 3) + profileFace().replace(/<path d="M122 [^>]*Z"[^>]*\/>/, '') + ear(97, 90); // walk: no nose
        pre = `<g class="walk-lines">` + [88, 104, 120].map((y, i) => `<path d="M${14 + i * 6} ${y} h${28 - i * 6}" stroke="#BDB6AA" stroke-width="4" stroke-linecap="round"/>`).join('') + `</g>`;
        legs = leg('walk-leg-far', 'walk-foot-far', 6, FAR);
        grp = `<g transform="rotate(3 100 175)"><g class="walk-bob">${arm('walk-arm-far', 6, FAR) .replace('','')}</g></g>`;
        // draw order: far leg, body, far arm, near arm, near leg
        const upper = `<g transform="rotate(3 100 175)"><g class="walk-bob">${arm('walk-arm-far', 7, FAR)}${bodyW}${arm('walk-arm-near', 8, INK)}</g></g>`;
        return out(pre + legs + upper + leg('walk-leg-near', 'walk-foot-near', 8, INK));
      }
    }
    return out(`${pre}${legs}<g class="pose-body"${tr ? ` transform="${tr}"` : ''}>${grp}</g>${post}`);
  }

  const SY = { body: '#F6DA7A', light: '#FCEDB0', shade: '#E8BE4A' };
  function sammy(pose = 'idle', faceKind = 'smile', o = {}) {
    const strand = 'M100 48 C84 62 116 78 100 96 S84 130 100 148';
    const curl = 'M100 48 C100 26 128 22 126 40 C125 52 110 50 114 40';
    const stroke = (d, w, c, t = '') => `<path d="${d}"${t} fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
    let arms = limb('M84 104 Q62 112 62 134') + limb('M116 104 Q138 112 138 134');
    if (pose === 'wave') arms = limb('M84 104 Q62 112 62 134') + pivot(116, 104, 'wavearm', limb('M116 104 Q142 96 142 66'));
    const body = stroke(strand, 46, INK) + stroke(curl, 22, INK) + stroke(strand, 34, SY.body) + stroke(curl, 10, SY.body) +
      stroke(strand, 4, SY.light, ' transform="translate(-9 0)"') + stroke(strand, 5, SY.shade, ' transform="translate(11 6)"') + face(faceKind, 100, 94, 0.72);
    return wrap(legsStd(92, 108, 148) + arms + body, Object.assign({}, o, { motionPose: pose, explicitBlink: faceKind === 'blink' }), '0 0 200 220');
  }

  g.Noodle = { toni, sammy, C, SY };
})(typeof window !== 'undefined' ? window : globalThis);
