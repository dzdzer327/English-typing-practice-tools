# 单机版打包说明

单机版使用 Electron 内置 Spring Boot 后端，并把数据保存到本机 H2 文件数据库。用户不需要安装 MySQL，也不需要连接服务器。

## 运行条件

当前版本仍需要用户电脑已安装 Java 17，并且 `java` 命令可用。后续可以用 `jlink` 打包精简 JRE，让用户完全不用单独安装 Java。

## 打包命令

生成 Windows 免安装目录版：

```powershell
cd frontend
npm run standalone:build
```

这会生成 `frontend/release/win-unpacked/`，里面的 `英语打字练习.exe` 可以直接运行。

如果需要生成安装器，可以运行：

```powershell
cd frontend
npm run standalone:installer
```

安装器构建可能会从 GitHub 下载 Electron Builder 的辅助工具，网络不稳定时会比较慢。

打包流程会自动：

1. 构建后端 jar
2. 复制后端 jar 到 Electron 打包资源目录
3. 构建前端静态文件
4. 生成 Electron 桌面应用产物

输出目录：

```text
frontend/release/
```

## 本地数据位置

用户数据保存到 Electron 的 `userData` 目录下：

```text
英语打字练习/data/
```

后端启动时会使用 `standalone` profile，并连接 H2 文件数据库。

## 后续可选优化

如果希望用户完全不需要安装 Java，可以用 `jlink` 生成精简 JRE，并在 `electron-builder` 里把 JRE 作为 `extraResources` 一起打包进去。当前 Electron 启动逻辑已经会优先寻找内置 `resources/jre/bin/java.exe`，找不到时才使用系统 `java`。
