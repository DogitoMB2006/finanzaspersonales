const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback: (value: number) => void) => ipcRenderer.on('update-counter', (_event: any, value: any) => callback(value)),
  counterValue: (value: number) => ipcRenderer.invoke('counter-value', value),
})