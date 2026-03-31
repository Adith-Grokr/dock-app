/**
 * electron/preload.cjs — context bridge
 * Exposes a minimal, typed window.electron API to the renderer
 * (React app) without enabling full Node integration.
 *
 * All tray→renderer messages are one-way IPC events so the renderer
 * just registers callbacks; it never awaits a response from main.
 */
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  setIgnoreMouse:      (ignore) => ipcRenderer.send('set-ignore-mouse', ignore),
  quit:                ()       => ipcRenderer.send('quit'),
  updateAgents:        (agents) => ipcRenderer.send('update-agents', agents),
  onTrayAddAgent:      (cb) => ipcRenderer.on('tray-add-agent',    (_, type) => cb(type)),
  onTrayOpenCreator:   (cb) => ipcRenderer.on('tray-open-creator', ()        => cb()),
  onTrayFocusAgent:    (cb) => ipcRenderer.on('tray-focus-agent',  (_, id)   => cb(id)),
  onTrayRemoveAgent:   (cb) => ipcRenderer.on('tray-remove-agent', (_, id)   => cb(id)),
  removeAllListeners:  (ch) => ipcRenderer.removeAllListeners(ch),
});
