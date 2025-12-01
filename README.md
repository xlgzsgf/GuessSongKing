
<p align="center">
  <img src="./static/logo.png" alt="Logo" width="150">
</p>

<p align="center">
  <img src="./static/title.png" alt="猜歌王" width="100">
</p>

![GuessSongKing](https://socialify.git.ci/xlgzsgf/GuessSongKing/image?language=1&owner=1&name=1&stargazers=1&theme=Light)

[![Build & Deploy](https://github.com/xlgzsgf/GuessSongKing/actions/workflows/main.yml/badge.svg)](https://github.com/xlgzsgf/GuessSongKing/actions/workflows/main.yml)

一款基于Vue 3和Vant UI框架开发的猜歌游戏。

## 技术栈

- Vue 3
- Vite
- Vant 4
- Vue Router

## 安装依赖

```bash
npm install
```

## 开发

```bash
npm run dev
```

## 构建

```bash
npm run build
```

## 预览

```bash
npm run preview
```

## 项目结构

```
├── src/
│   ├── views/          # 页面组件
│   │   ├── Home.vue    # 首页
│   │   └── GuessSong.vue # 猜歌页面
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函数
│   ├── App.vue         # 根组件
│   └── main.js         # 入口文件
├── public/
│   ├── Question/       # 题目和音频文件
│   └── static/         # 静态资源（音效、图标等）
├── scripts/            # 管理工具脚本
├── vite.config.js      # Vite配置文件
└── index.html          # HTML模板
```

## 音效文件说明

音效文件位于 `static/effect` 目录中：
- correct-answer.mp3 - 回答正确音效
- wrong-answer.mp3 - 回答错误音效
- skip-question.mp3 - 跳过题目音效

在构建过程中，这些音效文件会自动复制到构建输出目录中，确保在生产环境中可以正常使用。

## 题库管理

使用以下命令运行题库管理工具：

```bash
npm run manager
```

通过该工具可以：
- 添加新歌手
- 批量导入歌曲
- 手动添加歌曲
- 删除歌曲
- 设置歌手头像

详细使用说明请参考 [scripts/README.md](scripts/README.md)。

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=xlgzsgf/GuessSongKing&type=date&legend=top-left)](https://www.star-history.com/#xlgzsgf/GuessSongKing&type=date&legend=top-left)

