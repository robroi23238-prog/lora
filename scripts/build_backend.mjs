import { spawn } from 'node:child_process';

const isWindows = process.platform === 'win32';

function run(cmd, args, cwd) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, {
      cwd,
      shell: isWindows,
      stdio: 'inherit',
    });
    child.on('exit', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`))));
  });
}

async function main() {
  const cwd = 'services/backend';
  await run('python', ['-m', 'pip', 'install', '-r', 'requirements-build.txt'], cwd);
  await run('pyinstaller', ['--clean', '--noconfirm', 'backend.spec'], cwd);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
