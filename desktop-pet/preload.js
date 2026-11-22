// The only things the bear's page can ask the app to do.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bear', {
  getScreen: () => ipcRenderer.invoke('screen'),
  getSettings: () => ipcRenderer.invoke('settings'),
  move: (x, y) => ipcRenderer.send('move', { x, y }),
  setClickThrough: (on) => ipcRenderer.send('click-through', !!on),
  ready: () => ipcRenderer.send('ready'),
  event: (data) => ipcRenderer.send('event', data),   // only recorded during the build's click test
  on: (channel, cb) => {
    if (!['screen', 'settings', 'idle', 'command', 'cursor', 'mouse-reset'].includes(channel)) return;
    ipcRenderer.on(channel, (e, data) => cb(data));
  },
});
