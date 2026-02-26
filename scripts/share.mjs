import { spawn, spawnSync } from 'node:child_process';

const isWindows = process.platform === 'win32';

function exists(bin) {
  const cmd = isWindows ? 'where' : 'which';
  const res = spawnSync(cmd, [bin], { stdio: 'ignore', shell: isWindows });
  return res.status === 0;
}

function run(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: isWindows,
    ...options,
  });

  child.stdout.on('data', (chunk) => process.stdout.write(`[${name}] ${chunk}`));
  child.stderr.on('data', (chunk) => process.stderr.write(`[${name}] ${chunk}`));
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[${name}] exited with code ${code}`);
    }
  });
  return child;
}

const app = run('app', 'npm', ['run', 'dev']);

let tunnel;
if (exists('cloudflared')) {
  tunnel = run('tunnel', 'cloudflared', ['tunnel', '--url', 'http://localhost:5173']);
  console.log('\nUsing cloudflared. Share the https://*.trycloudflare.com URL printed below.\n');
} else if (exists('ngrok')) {
  tunnel = run('tunnel', 'ngrok', ['http', '5173']);
  console.log('\nUsing ngrok. Share the forwarding https:// URL printed below.\n');
} else {
  console.error('No tunnel binary found. Install cloudflared or ngrok, then rerun `npm run share`.');
  app.kill('SIGTERM');
  process.exit(1);
}

function shutdown(signal) {
  console.log(`\nShutting down (${signal})...`);
  app.kill('SIGTERM');
  tunnel?.kill('SIGTERM');
  setTimeout(() => process.exit(0), 300);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
