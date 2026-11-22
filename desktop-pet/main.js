// Love Bear: a little brown bear (with your face) that walks along the taskbar and keeps her company.
// The window is small and see-through; it moves around with the bear. Only the bear itself catches the mouse,
// so clicks everywhere else go straight through to whatever she is working on.
const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, powerMonitor } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE = process.argv.includes('--smoke-test');   // used by the build to check the app starts
const WIN_W = 300, WIN_H = 330;                        // the window around the bear (room for the speech bubble)

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null, tray = null, hiddenUntil = 0, hideTimer = null;
let settings = { sound: false, startWithWindows: true };

const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() {
  try { settings = Object.assign(settings, JSON.parse(fs.readFileSync(settingsFile(), 'utf8'))); } catch (e) { /* first run */ }
}
function saveSettings() {
  try { fs.writeFileSync(settingsFile(), JSON.stringify(settings, null, 2)); } catch (e) { /* read-only: ignore */ }
}
function applyStartup() {
  if (!app.isPackaged || SMOKE) return;                // only the installed app registers itself
  app.setLoginItemSettings({ openAtLogin: !!settings.startWithWindows });
}

function screenInfo() {
  const d = screen.getPrimaryDisplay();
  return { workArea: d.workArea, bounds: d.bounds, scaleFactor: d.scaleFactor, winW: WIN_W, winH: WIN_H };
}

function createWindow() {
  const s = screenInfo();
  win = new BrowserWindow({
    width: WIN_W, height: WIN_H,
    x: Math.round(s.workArea.x + s.workArea.width / 2 - WIN_W / 2), y: s.workArea.y + s.workArea.height - WIN_H,
    transparent: true, frame: false, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, alwaysOnTop: true, focusable: false, hasShadow: false, show: false,
    backgroundColor: '#00000000', title: 'Love Bear',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false, contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true, { forward: true });
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'pet.html'));
  win.once('ready-to-show', () => win.showInactive());
  win.on('closed', () => { win = null; });
}

function send(channel, data) { if (win && !win.isDestroyed()) win.webContents.send(channel, data); }

function hideForAnHour() {
  if (!win) return;
  hiddenUntil = Date.now() + 60 * 60 * 1000;
  win.hide();
  clearTimeout(hideTimer);
  hideTimer = setTimeout(showAgain, 60 * 60 * 1000);
  buildTrayMenu();
}
function showAgain() {
  clearTimeout(hideTimer); hiddenUntil = 0;
  if (win) { win.showInactive(); send('command', 'back'); }
  buildTrayMenu();
}

function trayIcon() {
  return nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));   // tray@2x.png is picked up on sharp screens
}
function buildTrayMenu() {
  if (!tray) return;
  const hidden = hiddenUntil > Date.now();
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Love Bear ❤', enabled: false },
    { type: 'separator' },
    { label: 'Say something', click: () => { if (hidden) showAgain(); send('command', 'say'); } },
    { label: 'Come here', click: () => { if (hidden) showAgain(); send('command', 'come'); } },
    hidden ? { label: 'Show him now', click: showAgain } : { label: 'Hide for 1 hour', click: hideForAnHour },
    { type: 'separator' },
    { label: 'Sound', type: 'checkbox', checked: !!settings.sound, click: (mi) => { settings.sound = mi.checked; saveSettings(); send('settings', settings); } },
    { label: 'Start with Windows', type: 'checkbox', checked: !!settings.startWithWindows, click: (mi) => { settings.startWithWindows = mi.checked; saveSettings(); applyStartup(); } },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]));
}
function createTray() {
  tray = new Tray(trayIcon());
  tray.setToolTip('Love Bear');
  tray.on('click', () => { if (hiddenUntil > Date.now()) showAgain(); else send('command', 'say'); });
  buildTrayMenu();
}

// ---- messages from the bear's page ----
ipcMain.handle('screen', () => screenInfo());
ipcMain.handle('settings', () => settings);
ipcMain.on('move', (e, p) => {
  if (!win || win.isDestroyed() || !p) return;
  const x = Math.round(p.x), y = Math.round(p.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  win.setBounds({ x, y, width: WIN_W, height: WIN_H });
});
ipcMain.on('click-through', (e, on) => { if (win && !win.isDestroyed()) win.setIgnoreMouseEvents(!!on, { forward: true }); });
ipcMain.on('hide', () => hideForAnHour());
ipcMain.on('quit', () => app.quit());
ipcMain.on('ready', () => {
  if (!SMOKE) return;
  console.log('SMOKE OK');
  setTimeout(() => {                                   // the build checks this file to be sure the bear really appeared
    const out = process.env.LOVE_BEAR_SMOKE_FILE;
    if (out) {
      try {
        fs.writeFileSync(out, JSON.stringify({ ok: true, visible: !!(win && win.isVisible()), bounds: win && win.getBounds(), workArea: screenInfo().workArea, tray: !!tray }));
      } catch (e) { /* ignore */ }
    }
    app.exit(0);
  }, 1500);
});

app.on('second-instance', () => { if (hiddenUntil) showAgain(); send('command', 'hello-again'); });

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('app.lovebear.desktop');
  loadSettings();
  applyStartup();
  createWindow();
  createTray();
  // is she at the laptop? (seconds since the last key press or mouse move) -> the bear naps while she's away
  setInterval(() => send('idle', powerMonitor.getSystemIdleTime()), 5000);
  powerMonitor.on('lock-screen', () => send('idle', 9999));
  powerMonitor.on('unlock-screen', () => send('idle', 0));
  powerMonitor.on('resume', () => send('idle', 0));
  const refresh = () => send('screen', screenInfo());
  screen.on('display-metrics-changed', refresh);
  screen.on('display-added', refresh);
  screen.on('display-removed', refresh);
  if (SMOKE) setTimeout(() => { console.log('SMOKE TIMEOUT'); app.exit(1); }, 30000);
});

app.on('window-all-closed', () => app.quit());
