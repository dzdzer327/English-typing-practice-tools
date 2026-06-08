const { app, BrowserWindow, Menu, shell, dialog } = require('electron');
const { spawn } = require('child_process');
const fs = require('fs');
const http = require('http');
const path = require('path');

// 开发环境判断
const isDev = !app.isPackaged;

let mainWindow;
let backendProcess = null;
const backendPort = process.env.TYPING_BACKEND_PORT || '8080';

function getResourcePath(...segments) {
  return isDev
    ? path.join(__dirname, '..', '..', ...segments)
    : path.join(process.resourcesPath, ...segments);
}

function getJavaCommand() {
  const bundledJava = process.platform === 'win32'
    ? getResourcePath('jre', 'bin', 'java.exe')
    : getResourcePath('jre', 'bin', 'java');

  return fs.existsSync(bundledJava) ? bundledJava : 'java';
}

function waitForBackend(timeoutMs = 30000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const ping = () => {
      const req = http.get(`http://127.0.0.1:${backendPort}/api/health`, (res) => {
        res.resume();
        if (res.statusCode === 200) {
          resolve();
        } else {
          retry();
        }
      });

      req.on('error', retry);
      req.setTimeout(1000, () => {
        req.destroy();
        retry();
      });
    };

    const retry = () => {
      if (Date.now() - startedAt > timeoutMs) {
        reject(new Error('后端启动超时'));
        return;
      }
      setTimeout(ping, 500);
    };

    ping();
  });
}

async function startBackend() {
  if (isDev) return;

  const backendJar = getResourcePath('backend', 'typing-practice.jar');
  if (!fs.existsSync(backendJar)) {
    throw new Error(`找不到后端文件: ${backendJar}`);
  }

  const dataDir = path.join(app.getPath('userData'), 'data');
  fs.mkdirSync(dataDir, { recursive: true });

  backendProcess = spawn(getJavaCommand(), [
    '-jar',
    backendJar,
    '--spring.profiles.active=standalone',
    `--server.port=${backendPort}`,
  ], {
    env: {
      ...process.env,
      TYPING_DATA_DIR: dataDir,
      TYPING_BACKEND_PORT: backendPort,
    },
    windowsHide: true,
    stdio: 'ignore',
  });

  backendProcess.on('exit', () => {
    backendProcess = null;
  });

  await waitForBackend();
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '英语打字练习',
    icon: path.join(__dirname, '../public/favicon.svg'),
    show: false, // 等加载完成后再显示
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // 加载完成后显示窗口
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 开发环境加载 Vite 开发服务器
  if (isDev) {
    const port = process.env.VITE_PORT || 3000;
    mainWindow.loadURL(`http://localhost:${port}`);
    // 需要调试时按 F12 打开 DevTools
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // 外部链接用浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 设置应用菜单
function createMenu() {
  const template = [
    {
      label: '文件',
      submenu: [
        { label: '退出', accelerator: 'CmdOrCtrl+Q', click: () => app.quit() },
      ],
    },
    {
      label: '视图',
      submenu: [
        { label: '重新加载', accelerator: 'CmdOrCtrl+R', click: () => mainWindow?.reload() },
        { label: '开发者工具', accelerator: 'F12', click: () => mainWindow?.webContents.toggleDevTools() },
        { type: 'separator' },
        { label: '全屏', accelerator: 'F11', click: () => mainWindow?.setFullScreen(!mainWindow?.isFullScreen()) },
        { type: 'separator' },
        { label: '放大', accelerator: 'CmdOrCtrl+=', click: () => {
          const zoom = mainWindow?.webContents.getZoomLevel() || 0;
          mainWindow?.webContents.setZoomLevel(zoom + 0.5);
        }},
        { label: '缩小', accelerator: 'CmdOrCtrl+-', click: () => {
          const zoom = mainWindow?.webContents.getZoomLevel() || 0;
          mainWindow?.webContents.setZoomLevel(zoom - 0.5);
        }},
        { label: '重置缩放', accelerator: 'CmdOrCtrl+0', click: () => {
          mainWindow?.webContents.setZoomLevel(0);
        }},
      ],
    },
    {
      label: '帮助',
      submenu: [
        { label: '关于', click: () => {
          const { dialog } = require('electron');
          dialog.showMessageBox(mainWindow, {
            type: 'info',
            title: '关于',
            message: '英语打字练习 v1.0.0',
            detail: '一款帮助你提升英文打字速度的桌面应用',
          });
        }},
      ],
    },
  ];
  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.whenReady().then(() => {
  startBackend()
    .then(() => {
      createMenu();
      createWindow();
    })
    .catch((error) => {
      dialog.showErrorBox('启动失败', `无法启动本地后端服务。\n\n${error.message}`);
      app.quit();
    });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  if (backendProcess) {
    backendProcess.kill();
    backendProcess = null;
  }
});
