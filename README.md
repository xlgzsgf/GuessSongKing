# 猜歌王

![GuessSongKing](https://socialify.git.ci/xlgzsgf/GuessSongKing/image?language=1&owner=1&name=1&stargazers=1&theme=Light)

<div align="center" style="display: flex; justify-content: center; align-items: center; gap: 20px;">
  <img src="./static/logo.png" alt="Logo" width="100">
  <img src="./static/title.png" alt="猜歌王" width=150">
</div>

![](https://img.shields.io/badge/Chrome-4285F4?style=plastic&logo=GoogleChrome&logoColor=white)
![](https://img.shields.io/github/license/xlgzsgf/GuessSongKing.svg?logo=github)

[![Build & Deploy](https://github.com/xlgzsgf/GuessSongKing/actions/workflows/main.yml/badge.svg)](https://github.com/xlgzsgf/GuessSongKing/actions/workflows/main.yml)
[![releases](https://img.shields.io/github/release/xlgzsgf/GuessSongKing)](https://github.com/xlgzsgf/GuessSongKing/releases)
![](https://img.shields.io/github/issues/xlgzsgf/GuessSongKing?color=F48D73)
![](https://img.shields.io/github/stars/xlgzsgf/GuessSongKing)


一款基于Vue 3和Vant UI框架开发的猜歌游戏。

## 游戏预览

<img src="./docs/images/screenshot.png" alt="游戏界面" width="70%">

## 技术栈

- Vue 3
- Vite
- Vant 4
- Vue Router

## 安装依赖

本项目使用 pnpm 作为包管理器，请自行安装 pnpm。

```bash
pnpm install
```

## 开发

```bash
pnpm dev
```

## 构建

```bash
pnpm build
```

## 预览

```bash
pnpm preview
```

## 项目结构

```
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue    # 首页
│   │   ├── LibrarySelect.vue    # 曲库选择页面
│   │   └── GuessSong.vue # 猜歌页面
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/
│   ├── Question/       # 题库音频文件
│   └── effect/         # 音效
├── scripts/            # 管理工具脚本
├── vite.config.js      # Vite配置文件
└── index.html          # HTML模板
```

## 题库管理

使用以下命令运行题库管理工具：

```bash
pnpm manager
```

通过该工具可以：
- 添加新歌手
- 批量导入歌曲
- 手动添加歌曲
- 删除歌曲
- 设置歌手头像

详细使用说明请参考 [scripts/README.md](scripts/README.md)。

## Star历史

[![Star History Chart](https://api.star-history.com/svg?repos=xlgzsgf/GuessSongKing&type=date&legend=top-left)](https://www.star-history.com/#xlgzsgf/GuessSongKing&type=date&legend=top-left)

## 贡献者

![Contributor](https://contrib.rocks/image?repo=xlgzsgf/GuessSongKing)
