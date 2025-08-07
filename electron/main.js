const { app, BrowserWindow } = require('electron')
const { fileURLToPath } = require('node:url')
const path = require('node:path')

const __dirname = path.dirname(fileURLToPath(import.meta.url))

process.env.APP_ROOT = path.join(__dirname, '..')

const VITE_DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL
const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win = null

function createWindow() {
  // Detectar ruta del preload según el entorno
  let preloadPath
  
  if (app.isPackaged) {
    // En producción (app empaquetada)
    preloadPath = path.join(process.resourcesPath, 'app.asar.unpacked', 'dist-electron', 'preload', 'preload.js')
  } else {
    // En desarrollo
    preloadPath = path.join(__dirname, '../preload/preload.js')
  }

  console.log('Preload path:', preloadPath)
  console.log('App is packaged:', app.isPackaged)

  win = new BrowserWindow({
    webPreferences: {
      preload: preloadPath,
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: false
  })

  // Mostrar ventana cuando esté lista
  win.once('ready-to-show', () => {
    win?.show()
    if (!app.isPackaged) {
      win?.webContents.openDevTools()
    }
  })

  // Error handling
  win.webContents.on('did-fail-load', (_event, errorCode, errorDescription) => {
    console.error('Failed to load:', errorCode, errorDescription)
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    const indexPath = path.join(RENDERER_DIST, 'index.html')
    console.log('Loading file:', indexPath)
    win.loadFile(indexPath)
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  })
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})