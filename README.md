# Bing Wallpapers

每日 Bing 壁纸自动采集与静态站点生成项目。

## 功能

- 每日自动获取 Bing 壁纸元数据
- 支持多个市场区域（en-US、zh-CN 等）
- 生成静态网站展示壁纸画廊
- 自动归档历史壁纸数据
- 支持客户端搜索与暗色主题
- GitHub Actions 自动更新
- Vercel 静态站点部署

## 技术栈

- TypeScript 5.x
- Node.js 20 LTS
- pnpm
- Nunjucks 模板引擎
- Vitest 测试框架
- Biome 代码规范
- GitHub Actions
- Vercel

## 开发

```bash
# 安装依赖
pnpm install

# 类型检查
pnpm typecheck

# 运行测试
pnpm test

# 更新壁纸数据并生成站点
pnpm update

# 仅构建站点
pnpm build:site
```

## 部署

本项目支持 Vercel 自动部署。将代码推送到 GitHub 后，Vercel 会自动构建并部署静态站点。

## 许可证

[Apache License 2.0](LICENSE)

## 声明

本项目为独立实现，不隶属于 Microsoft Corporation。Bing 和相关商标归 Microsoft Corporation 所有。
