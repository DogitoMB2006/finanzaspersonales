import { app as n, BrowserWindow as s } from "electron";
import { fileURLToPath as w } from "node:url";
import o from "node:path";
const l = o.dirname(w(import.meta.url));
process.env.APP_ROOT = o.join(l, "..");
const r = process.env.VITE_DEV_SERVER_URL, R = o.join(process.env.APP_ROOT, "dist-electron"), a = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = r ? o.join(process.env.APP_ROOT, "public") : a;
let e = null;
function d() {
  let i;
  if (n.isPackaged ? i = o.join(process.resourcesPath, "app.asar", "dist-electron", "preload", "preload.js") : i = o.join(l, "../preload/preload.js"), console.log("Preload path:", i), e = new s({
    webPreferences: {
      preload: i,
      nodeIntegration: !1,
      contextIsolation: !0,
      webSecurity: !0
    },
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    show: !1
  }), e.once("ready-to-show", () => {
    e?.show(), n.isPackaged || e?.webContents.openDevTools();
  }), e.webContents.on("did-fail-load", (t, c, p) => {
    console.error("Failed to load:", c, p);
  }), r)
    e.loadURL(r);
  else {
    const t = o.join(a, "index.html");
    console.log("Loading file:", t), e.loadFile(t);
  }
  e.webContents.setWindowOpenHandler(({ url: t }) => (require("electron").shell.openExternal(t), { action: "deny" }));
}
n.whenReady().then(d);
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  s.getAllWindows().length === 0 && d();
});
export {
  R as MAIN_DIST,
  a as RENDERER_DIST,
  r as VITE_DEV_SERVER_URL
};
