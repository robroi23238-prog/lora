import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(cmd, args, cwd = '.') {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, shell: isWindows, stdio: 'inherit' });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  await run('node', ['scripts/build_backend.mjs']);
  await run('npm', ['--workspace', '@lora/desktop', 'run', 'pack:win']);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
