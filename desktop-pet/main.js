// Love Bear: a little brown bear (with your face) that walks along the taskbar and keeps her company.
// The window is small and see-through; it moves around with the bear. Only the bear itself catches the mouse,
// so clicks everywhere else go straight through to whatever she is working on.
// To know when the mouse is over him, the app checks the cursor position itself many times a second
// (it doesn't rely on Windows mouse hooks, which Windows can silently drop after sleep or hide/show).
// Self-repair: after the laptop wakes up or is unlocked, and whenever his window stops working
// (swallows clicks, stops drawing, crashes), the app quietly builds him a fresh window.
const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage, powerMonitor, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

const SMOKE = process.argv.includes('--smoke-test');   // used by the build to check the app starts
const TEST_LOG = process.env.LOVE_BEAR_TEST_LOG || '';  // used by the build's click test (records what the bear does)
const WIN_W = 300, WIN_H = 330;                        // the window around the bear (room for the speech bubble)
const HOTKEY = 'Control+Alt+B', HOTKEY_LABEL = 'Ctrl+Alt+B';   // hides him / brings him back

if (!app.requestSingleInstanceLock()) { app.quit(); }

let win = null, tray = null, hidden = false, hotkeyOk = false;
let startInfo = { reason: 'start', x: null }, bearX = null, lastBeat = Date.now(), recreating = false, lastRecreate = 0, eatenFixes = [];
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
  const w = new BrowserWindow({
    width: WIN_W, height: WIN_H,
    x: Math.round(s.workArea.x + s.workArea.width / 2 - WIN_W / 2), y: s.workArea.y + s.workArea.height - WIN_H,
    transparent: true, frame: false, resizable: false, movable: false, minimizable: false, maximizable: false,
    fullscreenable: false, skipTaskbar: true, alwaysOnTop: true, focusable: false, hasShadow: false, show: false,
    backgroundColor: '#00000000', title: 'Love Bear',
    webPreferences: { preload: path.join(__dirname, 'preload.js'), backgroundThrottling: false, contextIsolation: true, nodeIntegration: false, sandbox: true },
  });
  w.setAlwaysOnTop(true, 'screen-saver');
  w.setIgnoreMouseEvents(true);
  w.setMenu(null);
  if (process.platform === 'win32') {
    // A working window never gets WM_MOUSEACTIVATE (it can't be activated). Getting one means Windows put the window
    // into a state where it throws clicks away: build a fresh window.
    w.hookWindowMessage(0x21, () => { testLog({ type: 'msg', name: 'WM_MOUSEACTIVATE' }); if (w === win) setTimeout(() => clicksEaten(), 0); });
    if (TEST_LOG) {                                  // test only: which other raw mouse messages reach the window
      for (const [msg, name] of [[0x201, 'WM_LBUTTONDOWN'], [0x204, 'WM_RBUTTONDOWN'], [0x210, 'WM_PARENTNOTIFY']]) w.hookWindowMessage(msg, () => testLog({ type: 'msg', name }));
    }
  }
  w.webContents.on('render-process-gone', () => { if (w === win) recreateWindow('page-crashed'); });
  w.on('unresponsive', () => { if (w === win) recreateWindow('page-frozen'); });
  w.loadFile(path.join(__dirname, 'pet.html'));
  w.once('ready-to-show', () => w.showInactive());
  w.on('closed', () => { if (win === w) win = null; });
  win = w;
  lastBeat = Date.now();
  return w;
}
// Replace his window with a brand-new one (same as restarting the app, but without quitting).
function recreateWindow(reason) {
  if (recreating || SMOKE || !app.isReady()) return;
  recreating = true; lastRecreate = Date.now();
  testLog({ type: 'recreate', reason });
  const old = win;
  startInfo = { reason, x: bearX };
  createWindow();                                    // the new window exists before the old one goes (the app must not quit)
  let done = false;
  const swap = () => { if (done) return; done = true; if (old && !old.isDestroyed()) old.destroy(); recreating = false; };
  win.once('ready-to-show', () => setTimeout(swap, 150));
  setTimeout(swap, 6000);
}
function clicksEaten() {
  const now = Date.now();
  eatenFixes = eatenFixes.filter((t) => now - t < 120000);
  if (eatenFixes.length >= 3) return;                 // didn't help 3 times in 2 minutes: stop trying (no endless restarts)
  eatenFixes.push(now);
  recreateWindow('clicks-swallowed');
}
function afterWake(reason) {                          // laptop opened / unlocked: give him a fresh window
  send('idle', 0);
  if (Date.now() - lastRecreate < 8000) return;
  setTimeout(() => recreateWindow(reason), 1500);
}

function send(channel, data) { if (win && !win.isDestroyed()) win.webContents.send(channel, data); }
function testLog(d) {                      // only during the build's click test
  if (!TEST_LOG) return;
  try { fs.appendFileSync(TEST_LOG, JSON.stringify(Object.assign({ t: Date.now(), hidden }, d)) + '\n'); } catch (e) { /* ignore */ }
}

// Hide / bring back: Ctrl+Alt+B, the Love Bear icon on the desktop, or the tray menu.
// The window itself is never hidden: on Windows, hiding and showing it again made it swallow clicks.
// Instead the page stops drawing him and lets every click through.
function hideBear() {
  if (!win || hidden) return;
  hidden = true;
  send('command', 'bye');                              // he waves bye, then disappears
  buildTrayMenu();
}
function showBear() {
  const wasHidden = hidden; hidden = false;
  if (win) { if (!win.isVisible()) win.showInactive(); resetMouse(); if (wasHidden) send('command', 'back'); }
  buildTrayMenu();
}
// Start the mouse handling fresh: clicks go through, until the cursor is over the bear again.
function resetMouse() {
  if (!win || win.isDestroyed()) return;
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setIgnoreMouseEvents(true);
  testLog({ type: 'reset' });
  cursorWasNear = false;
  send('mouse-reset');
}
// Where is the mouse? Sent to the bear's page while it's over (or just left) his window.
let cursorWasNear = false;
function pollCursor() {
  if (!win || win.isDestroyed() || hidden || !win.isVisible()) return;
  const p = screen.getCursorScreenPoint(), b = win.getBounds();
  const x = p.x - b.x, y = p.y - b.y, near = x >= -2 && y >= -2 && x <= b.width + 2 && y <= b.height + 2;
  if (near !== cursorWasNear) testLog({ type: 'near', near, cursor: p, win: b });
  if (near || cursorWasNear) send('cursor', { x, y, inside: near });
  cursorWasNear = near;
}
function toggleBear() { if (hidden) showBear(); else hideBear(); }

function trayIcon() {
  return nativeImage.createFromPath(path.join(__dirname, 'assets', 'tray.png'));   // tray@2x.png is picked up on sharp screens
}
function buildTrayMenu() {
  if (!tray) return;
  const key = hotkeyOk ? `   (${HOTKEY_LABEL})` : '';
  tray.setContextMenu(Menu.buildFromTemplate([
    { label: 'Love Bear ❤', enabled: false },
    { type: 'separator' },
    { label: 'Say something', click: () => { showBear(); send('command', 'say'); } },
    { label: 'Come here', click: () => { showBear(); send('command', 'come'); } },
    hidden ? { label: 'Bring him back' + key, click: showBear } : { label: 'Hide him' + key, click: hideBear },
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
  tray.on('click', () => { if (hidden) showBear(); else send('command', 'say'); });
  buildTrayMenu();
}

// ---- messages from the bear's page ----
ipcMain.handle('screen', () => screenInfo());
ipcMain.handle('settings', () => Object.assign({}, settings, { hotkey: hotkeyOk ? HOTKEY_LABEL : '', test: !!TEST_LOG, hidden, start: startInfo }));
const fromBear = (e) => win && !win.isDestroyed() && e.sender === win.webContents;   // ignore an old window that's being replaced
ipcMain.on('beat', (e, d) => { if (!fromBear(e)) return; lastBeat = Date.now(); if (d && Number.isFinite(d.x)) bearX = d.x; });
ipcMain.on('move', (e, p) => {
  if (!fromBear(e) || !p) return;
  const x = Math.round(p.x), y = Math.round(p.y);
  if (!Number.isFinite(x) || !Number.isFinite(y)) return;
  win.setBounds({ x, y, width: WIN_W, height: WIN_H });
});
ipcMain.on('click-through', (e, on) => {
  if (!fromBear(e)) return;
  win.setIgnoreMouseEvents(!!on);
  testLog({ type: 'ignore', on: !!on });
});
ipcMain.on('event', (e, d) => testLog(d));
ipcMain.on('ready', () => {
  if (!SMOKE) return;
  console.log('SMOKE OK');
  setTimeout(() => {                                   // the build checks this file to be sure the bear really appeared
    const out = process.env.LOVE_BEAR_SMOKE_FILE;
    if (out) {
      try {
        fs.writeFileSync(out, JSON.stringify({ ok: true, visible: !!(win && win.isVisible()), bounds: win && win.getBounds(), workArea: screenInfo().workArea, tray: !!tray, hotkey: hotkeyOk }));
      } catch (e) { /* ignore */ }
    }
    app.exit(0);
  }, 1500);
});

// Opening Love Bear again (desktop icon / Start menu) while he's running hides him or brings him back.
app.on('second-instance', (e, argv) => {
  if (TEST_LOG && argv.includes('--test-break')) { if (win) { win.hide(); win.showInactive(); } testLog({ type: 'test-break' }); return; }   // test only
  if (TEST_LOG && argv.includes('--test-wake')) { afterWake('wake'); return; }                                                           // test only
  toggleBear();
});

app.whenReady().then(() => {
  if (process.platform === 'win32') app.setAppUserModelId('app.lovebear.desktop');
  loadSettings();
  applyStartup();
  createWindow();
  try { hotkeyOk = globalShortcut.register(HOTKEY, toggleBear); } catch (e) { hotkeyOk = false; }
  createTray();
  // is she at the laptop? (seconds since the last key press or mouse move) -> the bear naps while she's away
  setInterval(() => send('idle', powerMonitor.getSystemIdleTime()), 5000);
  setInterval(pollCursor, 40);
  powerMonitor.on('lock-screen', () => send('idle', 9999));
  powerMonitor.on('unlock-screen', () => afterWake('wake'));
  powerMonitor.on('resume', () => afterWake('wake'));
  app.on('child-process-gone', (e, d) => { if (d && d.type === 'GPU') recreateWindow('graphics-crashed'); });
  // his page reports in every 2 seconds; if it stops (frozen), build a fresh window
  setInterval(() => { if (win && !recreating && Date.now() - lastBeat > 15000) recreateWindow('no-heartbeat'); }, 5000);
  const refresh = () => { send('screen', screenInfo()); resetMouse(); };
  screen.on('display-metrics-changed', refresh);
  screen.on('display-added', refresh);
  screen.on('display-removed', refresh);
  if (SMOKE) setTimeout(() => { console.log('SMOKE TIMEOUT'); app.exit(1); }, 30000);
});

app.on('window-all-closed', () => app.quit());
app.on('will-quit', () => globalShortcut.unregisterAll());
