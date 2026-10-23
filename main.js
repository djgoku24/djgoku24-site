const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const { startServer } = require('./server');

let mainWindow;
let server;

async function createWindow() {
  server = await startServer();
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 650,
    backgroundColor: '#030914',
    title: 'DJ GOKU 24 Radio',
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });
  mainWindow.loadURL(`http://127.0.0.1:${server.address().port}`);
  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https://www.twitch.tv/') || url.startsWith('https://twitch.tv/')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });
});
app.on('before-quit', () => { if (server) server.close(); });
