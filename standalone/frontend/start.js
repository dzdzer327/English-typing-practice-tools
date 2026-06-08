const { spawn, execSync } = require('child_process');

console.log('==============================');
console.log('  英语打字练习 - 启动中...');
console.log('==============================\n');

// 找一个可用端口
function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port++) {
    try {
      execSync(`netstat -ano | findstr :${port}`, { stdio: 'pipe' });
    } catch {
      return port;
    }
  }
  return startPort;
}

const port = findAvailablePort(3000);
console.log(`使用端口: ${port}\n`);

// 启动 Vite
console.log('[1/2] 启动 Vite 开发服务器...');
const vite = spawn('npx', ['vite', '--port', port.toString()], {
  cwd: __dirname,
  shell: true,
  stdio: 'inherit'
});

// 等待 Vite 启动后启动 Electron
setTimeout(() => {
  console.log(`\n[2/2] 启动 Electron (端口: ${port})...\n`);

  const electron = spawn('npx', ['electron', '.'], {
    cwd: __dirname,
    shell: true,
    env: { ...process.env, VITE_PORT: port.toString() },
    stdio: 'inherit'
  });

  electron.on('close', () => {
    console.log('\n正在关闭...');
    vite.kill();
    process.exit(0);
  });
}, 3000);

// Ctrl+C 退出
process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  vite.kill();
  process.exit(0);
});
