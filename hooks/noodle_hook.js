// Usage: node noodle_hook.js start|stop  -- never throws, never prints, always exits 0.
try {
  const http = require('http');
  const kind = process.argv[2] === 'stop' ? 'stop' : 'start';
  process.on('uncaughtException', () => process.exit(0));
  try { process.stdin.on('data', () => {}); process.stdin.on('error', () => {}); process.stdin.resume(); } catch (e) {}
  const hard = setTimeout(() => process.exit(0), 450);
  hard.unref && hard.unref();
  const req = http.request({ host: '127.0.0.1', port: 47321, path: '/' + kind, method: 'POST', timeout: 300 }, (res) => {
    res.on('data', () => {});
    res.on('end', () => process.exit(0));
    res.on('error', () => process.exit(0));
  });
  req.on('timeout', () => { req.destroy(); process.exit(0); });
  req.on('error', () => process.exit(0));
  req.end();
} catch (e) { process.exit(0); }
