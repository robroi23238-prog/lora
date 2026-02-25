import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWindows,
    ...options,
  });

  child.stdout.on('data', (chunk) => {
    process.stdout.write(`[${name}] ${chunk}`);
  });

  child.stderr.on('data', (chunk) => {
    process.stderr.write(`[${name}] ${chunk}`);
  });

  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });

  return child;
}

const backendCmd = isWindows ? 'python' : 'uvicorn';
const backendArgs = isWindows
  ? ['-m', 'uvicorn', 'app.main:app', '--reload', '--port', '8000']
  : ['app.main:app', '--reload', '--port', '8000'];

const backend = run('backend', backendCmd, backendArgs, { cwd: 'services/backend' });
const desktop = run('desktop', 'npm', ['--workspace', '@lora/desktop', 'run', 'dev']);

function shutdown(signal) {
  console.log(`\nShutting down (${signal})...`);
  backend.kill('SIGTERM');
  desktop.kill('SIGTERM');
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
