const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

const isDev = !app.isPackaged;
let backendProcess;

function backendCommand() {
  if (isDev) {
    if (process.platform === 'win32') {
      return { cmd: 'python', args: ['-m', 'uvicorn', 'app.main:app', '--host', '127.0.0.1', '--port', '8000'] };
    }
    return { cmd: 'uvicorn', args: ['app.main:app', '--host', '127.0.0.1', '--port', '8000'] };
  }

  const exeName = process.platform === 'win32' ? 'lora-backend.exe' : 'lora-backend';
  const candidate = path.join(process.resourcesPath, 'backend', exeName);
  return { cmd: candidate, args: [] };
}

function startBackend() {
  const { cmd, args } = backendCommand();
  const cwd = isDev
    ? path.resolve(__dirname, '../../../services/backend')
    : path.join(process.resourcesPath, 'backend');

  backendProcess = spawn(cmd, args, {
    cwd,
    stdio: 'pipe',
    shell: process.platform === 'win32' && isDev,
  });

  backendProcess.stdout.on('data', (chunk) => console.log(`[backend] ${chunk.toString().trim()}`));
  backendProcess.stderr.on('data', (chunk) => console.error(`[backend] ${chunk.toString().trim()}`));
  backendProcess.on('exit', (code) => console.log(`[backend] exited (${code})`));
}

function stopBackend() {
  if (!backendProcess || backendProcess.killed) return;
  backendProcess.kill('SIGTERM');
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 980,
    backgroundColor: '#101214',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
    },
  });

  const url = process.env.ELECTRON_START_URL || `file://${path.join(__dirname, '../dist/index.html')}`;
  win.loadURL(url);
}

app.whenReady().then(() => {
  startBackend();
  createWindow();
});

app.on('window-all-closed', () => {
  stopBackend();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => stopBackend());
