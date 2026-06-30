# DMAF 多模态图文情感分析平台

一个可直接落地的前端分析平台骨架，用于对接实验室服务器上的 Python DMAF 推理服务，覆盖图文数据上传、异步任务轮询、历史记录查询、结果表格分析和可视化看板。

## 技术栈

- React 19
- TypeScript
- Ant Design 5
- React Router 7
- TanStack Query
- ECharts

## 核心能力

- 支持 CSV / Excel 文件与图片压缩包上传
- 支持大文件分片上传与上传进度展示
- 支持长耗时异步任务状态轮询
- 支持历史任务检索、任务详情查看、结果筛选与下载
- 支持正负面占比、类别分布、低置信度样本等可视化
- 内置 `mock` 模式，后端未接入前也能演示前端流程

## 启动

1. 安装依赖

```bash
npm install
```

2. 复制环境变量

```bash
copy .env.example .env
```

3. 启动开发环境

```bash
npm run dev
```

如果 PowerShell 执行策略阻止 `npm`，请使用：

```bash
npm.cmd install
npm.cmd run dev
```

## 目录结构

```text
src/
  api/            接口定义、HTTP 客户端、mock 服务
  components/     上传、图表、列表、状态组件
  hooks/          查询与轮询逻辑
  layouts/        应用布局
  pages/          首页、上传、历史、详情页面
  router/         路由配置
  styles/         全局样式
  utils/          上传切片、格式化、下载工具
docs/
  architecture.md 可落地整体架构与接口设计说明
```

## 后端对接思路

前端默认通过 `/api` 代理请求 Python 服务。推荐后端使用 FastAPI 暴露上传、任务、结果、下载接口，并将 DMAF 推理封装为异步任务。

