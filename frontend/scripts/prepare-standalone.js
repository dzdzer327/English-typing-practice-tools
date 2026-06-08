const { copyFileSync, existsSync, mkdirSync } = require('fs');
const { join, resolve } = require('path');

const rootDir = resolve(__dirname, '..', '..');
const jarSource = join(rootDir, 'backend', 'target', 'typing-practice-1.0.0.jar');
const backendDir = join(__dirname, '..', 'electron-backend');
const jarTarget = join(backendDir, 'typing-practice.jar');

if (!existsSync(jarSource)) {
  console.error(`Backend jar not found: ${jarSource}`);
  process.exit(1);
}

mkdirSync(backendDir, { recursive: true });
copyFileSync(jarSource, jarTarget);

console.log(`Copied backend jar to ${jarTarget}`);
