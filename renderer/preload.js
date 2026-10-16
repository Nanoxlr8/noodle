const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('noodle', {
  onPresent: cb => ipcRenderer.on('present', (_e, d) => cb(d)),
  onFinish: cb => ipcRenderer.on('finish', () => cb()),
  onHide: cb => ipcRenderer.on('hide', () => cb()),
  done: () => ipcRenderer.send('done'),
  stop: () => ipcRenderer.send('stop'),
  resize: h => ipcRenderer.send('resize', h),
  play: () => ipcRenderer.send('play')
});
