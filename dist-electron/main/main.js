import { app as n, BrowserWindow as r } from "electron";
import { fileURLToPath as p } from "node:url";
import o from "node:path";
const t = o.dirname(p(import.meta.url));
process.env.APP_ROOT = o.join(t, "..");
const i = process.env.VITE_DEV_SERVER_URL, m = o.join(process.env.APP_ROOT, "dist-electron"), s = o.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = i ? o.join(process.env.APP_ROOT, "public") : s;
let e = null;
function l() {
  const a = n.isPackaged ? o.join(t, "../preload/preload.js") : o.join(t, "preload.js");
  e = new r({
    // Removido el icono por ahora
    webPreferences: {
      preload: a,
      nodeIntegration: !1,
      contextIsolation: !0
    },
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: "hidden",
    titleBarOverlay: {
      color: "#1f2937",
      symbolColor: "#ffffff"
    }
  }), i ? (e.loadURL(i), e.webContents.openDevTools()) : e.loadFile(o.join(s, "index.html")), e.webContents.on("did-finish-load", () => {
    e?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.setWindowOpenHandler(({ url: d }) => (require("electron").shell.openExternal(d), { action: "deny" }));
}
n.whenReady().then(l);
n.on("window-all-closed", () => {
  process.platform !== "darwin" && (n.quit(), e = null);
});
n.on("activate", () => {
  r.getAllWindows().length === 0 && l();
});
export {
  m as MAIN_DIST,
  s as RENDERER_DIST,
  i as VITE_DEV_SERVER_URL
};
