const { existsSync } = require('fs');
const { join } = require('path');
const { spawnSync } = require('child_process');

const executableName = process.platform === 'win32' ? 'electron.exe' : 'electron';
const electronExecutable = join(__dirname, '..', 'node_modules', 'electron', 'dist', executableName);

if (existsSync(electronExecutable)) {
  process.exit(0);
}

const installScript = require.resolve('electron/install.js');
const result = spawnSync(process.execPath, [installScript], {
  cwd: join(__dirname, '..'),
  stdio: 'inherit',
});

if (result.status !== 0) {
  process.exit(result.status || 1);
}

if (!existsSync(electronExecutable)) {
  console.error(`Electron runtime was not found: ${electronExecutable}`);
  process.exit(1);
}
