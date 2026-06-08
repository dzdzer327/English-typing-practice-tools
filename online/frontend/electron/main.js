const { app, BrowserWindow, Menu, shell } = require('electron');
const path = require('path');

// 开发环境判断
const isDev = !app.isPackaged;

let mainWindow;

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
  createMenu();
  createWindow();

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
