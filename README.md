# English Typing Practice Tools

一个英语打字练习工具仓库，当前同时保留两个版本：

```text
English-typing-practice-tools/
├─ online/       联机版：Spring Boot + MySQL + React/Electron
└─ standalone/   单机版：Electron 内置 Spring Boot + 本地 H2 数据库
```

## 版本选择

| 版本 | 适合场景 | 数据存储 |
| --- | --- | --- |
| `online/` | 想要部署后端、连接 MySQL、后续支持多用户或服务器使用 | MySQL |
| `standalone/` | 想要下载后直接在本机使用，不依赖服务器和 MySQL | 本机 H2 文件数据库 |

## 功能概览

- 单词、句子、文章打字练习
- 英文单词中文翻译提示
- 练习记录、速度、准确率统计
- 每日打卡、连续打卡天数、打卡日历
- 桌面端窗口封装

## 联机版运行

在仓库根目录启动联机版后端：

```powershell
cd online/backend
mvn spring-boot:run
```

后端默认连接本机 MySQL：

```text
jdbc:mysql://localhost:3306/typing_practice
username: root
password: 123456
```

如果你的 MySQL 账号或密码不同，请修改：

```text
online/backend/src/main/resources/application.yml
```

在另一个终端启动联机版前端：

```powershell
cd online/frontend
npm install
npm run start
```

## 单机版运行与打包

进入单机版前端目录：

```powershell
cd standalone/frontend
```

生成免安装桌面版：

```powershell
npm install
npm run standalone:build
```

输出目录：

```text
standalone/frontend/release/win-unpacked/
```

运行其中的：

```text
英语打字练习.exe
```

当前单机版仍需要电脑已安装 Java 17，并且 `java` 命令可用。后续可以继续加入内置精简 JRE，让用户完全不需要单独安装 Java。

## 开发环境

- JDK 17
- Maven
- Node.js / npm
- MySQL，联机版需要

## 仓库说明

- `online/` 保留服务器 + MySQL 的联机版本。
- `standalone/` 保留本地 H2 数据库的单机版本。
- `dist/`、`release/`、`node_modules/`、`target/` 等构建产物不会提交到 Git。
