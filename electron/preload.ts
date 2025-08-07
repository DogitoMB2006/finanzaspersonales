import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  onUpdateCounter: (callback: (value: number) => void) => ipcRenderer.on('update-counter', (_event, value) => callback(value)),
  counterValue: (value: number) => ipcRenderer.invoke('counter-value', value),
})