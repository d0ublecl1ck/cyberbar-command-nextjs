# 网吧管理系统

这是一个基于 [Next.js](https://nextjs.org) 的网吧管理系统,使用 [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) 构建。

## 开始使用

首先,运行开发服务器:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 功能模块

### 用户模块
- 用户登录/注册
  - 支持身份证号/手机号登录
  - 自动分配空闲机器
- 个人信息管理
  - 查看个人基本信息
  - 修改密码
- 余额查询和充值
  - 实时余额显示
  - 在线充值功能
- 上机/下机操作
  - 一键上机
  - 自动计费
  - 余额不足提醒
- 商品购买
  - 在线商品浏览
  - 购物车功能
  - 订单管理
  - 库存显示

### 管理员模块
- 机器管理
  - 机器状态实时监控
  - 价格设置
  - 区域分配
  - 故障标记
- 用户管理
  - 用户信息查询
  - 充值操作
  - 账户状态管理（封禁/解封）
  - 消费记录查询
- 区域管理
  - 区域创建/编辑/删除
  - 机器分配调整
  - 区域状态监控
- 商品管理
  - 商品增删改查
  - 库存管理
  - 价格调整
  - 销售统计
- 订单管理
  - 订单状态更新
  - 订单查询
  - 订单处理

## 技术栈

- **框架**: Next.js 14
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **状态管理**: React Hooks
- **数据请求**: Fetch API
- **类型检查**: TypeScript
- **开发语言**: TypeScript/JavaScript
- **构建工具**: Next.js 内置构建工具

## 项目结构

```
app/
├── admin/                 # 管理员相关页面
│   ├── commodities/      # 商品管理
│   ├── computer-zones/   # 区域管理
│   ├── login/           # 管理员登录
│   └── page.tsx         # 管理员仪表板
├── login/                # 用户登录
├── user-dashboard/       # 用户仪表板
└── page.tsx             # 首页
components/              # 可复用组件
├── ui/                  # UI 基础组件
└── dynamic-clock.tsx    # 动态时钟组件
contexts/                # 全局状态管理
lib/                     # 工具函数和配置
└── api-config.ts        # API 配置
styles/                  # 样式文件
└── globals.css         # 全局样式
```

## 样式配置

项目使用了全局样式文件 `styles/globals.css`，该文件包含：
- Tailwind CSS 的基础配置
- 全局颜色变量设置
- 响应式深色模式支持
- 基础样式设置

## API 配置

API 相关配置位于 `lib/api-config.ts`，包含：
- API 基础 URL 配置
- RESTful API 端点定义
- 接口路径常量
- 环境变量配置

## 组件说明

### DynamicClock
实时显示当前时间和日期的组件，支持：
- 24小时制时间显示
- 农历日期显示
- 自动更新
- 可配置显示格式

### Toast 通知
使用自定义的 toast hook 实现的通知系统，特性：
- 支持多种通知类型（成功、错误、警告、信息）
- 自动消失
- 可自定义显示时间
- 支持队列显示

### 数据表格
基于 shadcn/ui 的表格组件，支持：
- 排序功能
- 搜索过滤
- 分页显示
- 响应式布局

## 环境要求

- Node.js 18.0 或更高版本
- npm 7.0 或更高版本
- 现代浏览器支持

## 开发指南

1. 克隆项目
```bash
git clone [项目地址]
```

2. 安装依赖
```bash
npm install
```

3. 配置环境变量
```bash
cp .env.example .env.local
```

4. 启动开发服务器
```bash
npm run dev
```

## 部署

推荐使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署。

## 贡献指南

1. Fork 项目
2. 创建特性分支
3. 提交改动
4. 推送到分支
5. 创建 Pull Request

## 许可证

[MIT](LICENSE)

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

# 项目设置说明

## 功能模块

### 用户模块
- 用户登录/注册
- 个人信息管理
- 余额查询和充值
- 上机/下机操作
- 商品购买

### 管理员模块
- 机器管理
  - 机器状态监控
  - 价格设置
  - 区域分配
- 用户管理
  - 用户信息查询
  - 充值操作
  - 账户状态管理
- 区域管理
  - 区域创建/编辑
  - 机器分配

## 技术栈

- **框架**: Next.js 14
- **样式**: Tailwind CSS
- **UI组件**: shadcn/ui
- **状态管理**: React Hooks
- **数据请求**: Fetch API
- **类型检查**: TypeScript

## 样式配置

项目使用了全局样式文件 `styles/globals.css`，该文件包含：
- Tailwind CSS 的基础配置
- 全局颜色变量设置
- 响应式深色模式支持
- 基础样式设置

## API 配置

API 相关配置位于 `lib/api-config.ts`，包含：
- API 基础 URL
- 各个接口的端点配置
- 请求超时设置

## 组件说明

### DynamicClock
实时显示当前时间和日期的组件，支持：
- 24小时制时间显示
- 农历日期显示
- 自动更新

### Toast 通知
使用自定义的 toast hook 实现的通知系统，特性：
- 支持多种通知类型
- 自动消失
- 可自定义显示时间

## 部署

推荐使用 [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) 部署，它是 Next.js 的创建者开发的平台。

查看 [Next.js 部署文档](https://nextjs.org/docs/app/building-your-application/deploying) 了解更多部署细节。

## 了解更多

要了解更多关于 Next.js 的信息，请查看以下资源：

- [Next.js 文档](https://nextjs.org/docs) - 了解 Next.js 特性和 API
- [Learn Next.js](https://nextjs.org/learn) - 交互式 Next.js 教程

欢迎查看 [Next.js GitHub 仓库](https://github.com/vercel/next.js)，我们欢迎您的反馈和贡献！

## 目录结构
