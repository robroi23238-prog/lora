const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    backgroundColor: '#101214',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  const url = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  win.loadURL(url);
}

app.whenReady().then(createWindow);
