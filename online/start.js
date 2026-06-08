const { spawn, execSync } = require('child_process');
const path = require('path');

const ROOT_DIR = __dirname;
const BACKEND_DIR = path.join(ROOT_DIR, 'backend');
const FRONTEND_DIR = path.join(ROOT_DIR, 'frontend');

console.log('================================');
console.log('  英语打字练习 - 一键启动');
console.log('================================\n');

// 检查后端是否已在运行
function isBackendRunning() {
  try {
    execSync('curl -s http://localhost:8080/api/auth/profile/1', { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

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

// 启动后端
function startBackend() {
  return new Promise((resolve) => {
    if (isBackendRunning()) {
      console.log('[1/3] 后端已在运行 ✅\n');
      resolve();
      return;
    }

    console.log('[1/3] 启动后端 (Spring Boot)...');
    const backend = spawn('mvn', ['spring-boot:run'], {
      cwd: BACKEND_DIR,
      shell: true,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    backend.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Started BackendApplication')) {
        console.log('  ✅ 后端启动成功 (http://localhost:8080)\n');
        resolve();
      }
    });

    // 超时处理
    setTimeout(() => {
      console.log('  ⏱️  后端启动超时，继续...\n');
      resolve();
    }, 30000);
  });
}

// 启动前端和 Electron
function startFrontend() {
  const port = findAvailablePort(3000);
  console.log(`[2/3] 启动前端 (端口: ${port})...`);

  const vite = spawn('npx', ['vite', '--port', port.toString()], {
    cwd: FRONTEND_DIR,
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe']
  });

  vite.stdout.on('data', (data) => {
    const text = data.toString();
    if (text.includes('Local:')) {
      console.log('  ✅ 前端启动成功\n');
    }
  });

  // 等待 Vite 启动后启动 Electron
  setTimeout(() => {
    console.log('[3/3] 启动桌面应用...\n');
    console.log('================================');
    console.log('  启动完成！');
    console.log('  用 test1 / 123456 登录');
    console.log('================================\n');

    const electron = spawn('npx', ['electron', '.'], {
      cwd: FRONTEND_DIR,
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

  return vite;
}

// 主流程
async function main() {
  await startBackend();
  startFrontend();
}

main();

// Ctrl+C 退出
process.on('SIGINT', () => {
  console.log('\n正在关闭...');
  process.exit(0);
});
