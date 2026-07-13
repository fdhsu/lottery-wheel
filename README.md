# 大转盘抽奖

基于 Node.js + Express 的大转盘抽奖系统，支持自定义奖项、权重配置、中奖记录和管理后台。

## 功能

- 支持 2-12 个奖项自适应布局
- 自定义奖项名称和中奖概率（权重）
- 中奖记录自动保存
- 管理后台：配置奖项、查看记录
- 抽奖结果语音播报（女声）
- 控奖队列：可预设中奖结果

## 快速启动

```bash
cd /Users/hsu/DOC/lottery-v2
npm install
npm start
```

启动后访问：

- 抽奖页面：http://localhost:3000
- 管理后台：http://localhost:3000/admin.html

## 管理后台

默认密码：`raiyi321`

可通过环境变量自定义：

```bash
ADMIN_PASSWORD=your_password npm start
```

## 技术栈

- 后端：Node.js + Express
- 前端：原生 HTML/CSS/JS + Canvas
- 认证：JWT
- 存储：JSON 文件

## 项目结构

```
lottery-v2/
├── server/
│   ├── index.js      # 服务入口
│   ├── routes.js     # API 路由
│   ├── auth.js       # JWT 认证
│   └── db.js         # 数据存储
├── public/
│   ├── index.html    # 抽奖页面
│   └── admin.html    # 管理后台
├── data/             # 数据文件（自动创建）
── package.json
└── README.md
```
