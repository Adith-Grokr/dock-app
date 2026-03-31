/**
 * electron/main.cjs — Electron main process
 *
 * Creates a transparent, frameless, always-on-top BrowserWindow that
 * overlays the entire primary display and passes mouse events through
 * to windows underneath (setIgnoreMouseEvents).
 *
 * Tray:
 *   • Programmatically draws a 22×22 stick-figure template image
 *   • "Add Agent…"   → sends 'tray-open-creator' IPC to renderer
 *   • "Quick Add"    → sends 'tray-add-agent' with type string
 *   • Agent list     → sends 'tray-focus-agent' with agent id
 *   • "Remove Agent" → sends 'tray-remove-agent' with agent id
 *
 * IPC handlers:
 *   set-ignore-mouse  — toggle mouse pass-through (forwarded by hover events)
 *   quit              — app.quit()
 *   update-agents     — rebuild tray context menu with current agent list
 */
const { app, BrowserWindow, screen, ipcMain, Tray, Menu, nativeImage } = require('electron');
const path = require('path');

let win;
let tray;
let agentList = [];

// ─── Tray Icon: programmatic stick figure (22×22 template image) ──────────────
function createTrayIcon() {
  const size = 22;
  const buf = Buffer.alloc(size * size * 4, 0);

  function px(x, y) {
    if (x < 0 || x >= size || y < 0 || y >= size) return;
    const i = (y * size + x) * 4;
    buf[i] = 0; buf[i+1] = 0; buf[i+2] = 0; buf[i+3] = 255;
  }

  function circle(cx, cy, r) {
    for (let dy = -r; dy <= r; dy++)
      for (let dx = -r; dx <= r; dx++)
        if (dx*dx + dy*dy <= r*r) px(cx+dx, cy+dy);
  }

  function line(x0, y0, x1, y1) {
    let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0);
    let sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx - dy, x = x0, y = y0;
    for (let i = 0; i < 60; i++) {
      px(x, y);
      if (x === x1 && y === y1) break;
      const e2 = 2*err;
      if (e2 > -dy) { err -= dy; x += sx; }
      if (e2 <  dx) { err += dx; y += sy; }
    }
  }

  circle(11, 4, 2);     // head
  line(11, 7, 11, 14);  // body
  line(7, 10, 15, 10);  // arms
  line(11, 14, 7, 20);  // left leg
  line(11, 14, 15, 20); // right leg

  const img = nativeImage.createFromBuffer(buf, { width: size, height: size });
  img.setTemplateImage(true);
  return img;
}

// ─── Build dynamic tray context menu ─────────────────────────────────────────
function buildTrayMenu() {
  if (!tray) return;

  const statusIcon = { idle: '○', working: '●', thinking: '◑', done: '✓', failed: '✗' };

  const agentItems = agentList.length > 0
    ? agentList.map(a => ({
        label: `${statusIcon[a.status] || '○'} ${a.name}  (${a.type})${a.currentTask ? `  — ${a.currentTask.title.slice(0, 22)}` : ''}`,
        click: () => {
          win?.show();
          win?.webContents.send('tray-focus-agent', a.id);
        },
      }))
    : [{ label: 'No agents running', enabled: false }];

  const removeItems = agentList.length > 0
    ? agentList.map(a => ({
        label: `${a.name} (${a.type})`,
        click: () => win?.webContents.send('tray-remove-agent', a.id),
      }))
    : [{ label: 'No agents', enabled: false }];

  const menu = Menu.buildFromTemplate([
    { label: 'Desktop Agents', enabled: false },
    { type: 'separator' },
    ...agentItems,
    { type: 'separator' },
    {
      label: '✦ Add Agent…',
      click: () => {
        win?.show();
        win?.webContents.send('tray-open-creator');
      },
    },
    {
      label: 'Quick Add',
      submenu: [
        { label: 'Architect', click: () => win?.webContents.send('tray-add-agent', 'architect') },
        { label: 'Pilot',     click: () => win?.webContents.send('tray-add-agent', 'pilot')    },
        { label: 'Cyclist',   click: () => win?.webContents.send('tray-add-agent', 'cyclist')  },
      ],
    },
    { label: 'Remove Agent', submenu: removeItems },
    { type: 'separator' },
    { label: 'Quit Desktop Agents', click: () => app.quit() },
  ]);

  tray.setContextMenu(menu);
}

// ─── Main window ──────────────────────────────────────────────────────────────
function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  win = new BrowserWindow({
    width, height, x: 0, y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  win.setIgnoreMouseEvents(true, { forward: true });
  win.on('blur', () => win?.setAlwaysOnTop(true));
  win.loadURL('http://localhost:5173');
}

// ─── Tray ─────────────────────────────────────────────────────────────────────
function createTray() {
  tray = new Tray(createTrayIcon());
  tray.setToolTip('Desktop Agents');
  buildTrayMenu();
}

// ─── IPC handlers ─────────────────────────────────────────────────────────────
ipcMain.on('set-ignore-mouse', (_, ignore) => {
  win?.setIgnoreMouseEvents(ignore, { forward: true });
});

ipcMain.on('quit', () => app.quit());

ipcMain.on('update-agents', (_, agents) => {
  agentList = agents;
  buildTrayMenu();
});

// ─── Boot ─────────────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  createTray();
});

app.on('window-all-closed', () => app.quit());
