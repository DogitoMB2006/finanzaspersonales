import { app as o, BrowserWindow as i } from "electron";
import { fileURLToPath as d } from "node:url";
import n from "node:path";
const s = n.dirname(d(import.meta.url));
process.env.APP_ROOT = n.join(s, "..");
const t = process.env.VITE_DEV_SERVER_URL, w = n.join(process.env.APP_ROOT, "dist-electron"), r = n.join(process.env.APP_ROOT, "dist");
process.env.VITE_PUBLIC = t ? n.join(process.env.APP_ROOT, "public") : r;
let e = null;
function l() {
  e = new i({
    icon: process.env.VITE_PUBLIC ? n.join(process.env.VITE_PUBLIC, "vite.svg") : void 0,
    webPreferences: {
      preload: n.join(s, "preload.js"),
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
  }), t ? (e.loadURL(t), e.webContents.openDevTools()) : e.loadFile(n.join(r, "index.html")), e.webContents.on("did-finish-load", () => {
    e?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
  }), e.webContents.setWindowOpenHandler(({ url: a }) => (require("electron").shell.openExternal(a), { action: "deny" }));
}
o.whenReady().then(l);
o.on("window-all-closed", () => {
  process.platform !== "darwin" && (o.quit(), e = null);
});
o.on("activate", () => {
  i.getAllWindows().length === 0 && l();
});
export {
  w as MAIN_DIST,
  r as RENDERER_DIST,
  t as VITE_DEV_SERVER_URL
};
