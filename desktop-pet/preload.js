// The only things the bear's page can ask the app to do.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('bear', {
  getScreen: () => ipcRenderer.invoke('screen'),
  getSettings: () => ipcRenderer.invoke('settings'),
  move: (x, y) => ipcRenderer.send('move', { x, y }),
  setClickThrough: (on) => ipcRenderer.send('click-through', !!on),
  ready: () => ipcRenderer.send('ready'),
  on: (channel, cb) => {
    if (!['screen', 'settings', 'idle', 'command'].includes(channel)) return;
    ipcRenderer.on(channel, (e, data) => cb(data));
  },
});
