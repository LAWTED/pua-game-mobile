# PUA Game Mobile

一个模拟学术PUA环境的文字RPG游戏，帮助用户了解和应对学术环境中的不当行为。

## 项目概述

这是一个基于Next.js的移动端文字角色扮演游戏，玩家扮演研究生面对学术PUA导师"郑凤教授"的各种压力和挑战。游戏采用像素风格设计，结合AI对话系统和数值管理机制。

## 技术栈

- **框架**: Next.js 15 + React 19 + TypeScript
- **UI**: Tailwind CSS + Vaul (抽屉组件)
- **AI**: AI SDK (支持OpenAI GPT-4和DeepSeek)
- **样式**: 像素风格设计

## 游戏特色

- 🎮 **5天生存挑战**: 每天3个回合，共15回合的游戏体验
- 🎲 **骰子机制**: d20系统决定行动成功与否
- 📊 **数值系统**: 学生和教授的多维数值管理
- 📱 **移动优化**: 专为移动设备设计的交互界面
- 🎨 **像素风格**: 复古游戏美学

## 快速开始

### 环境要求

- Node.js 18+ 
- pnpm (推荐) 或 npm

### 安装依赖

```bash
pnpm install
```

### 环境配置

1. 复制环境变量模板：
```bash
cp .env.example .env.local
```

2. 在 `.env.local` 中填入API密钥：
```bash
OPENAI_API_KEY=your_openai_api_key_here
DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

### 开发运行

```bash
pnpm dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建部署

```bash
pnpm build
pnpm start
```

## 游戏系统

### 角色选择
- **陆星河** (富二代): 金主爸爸技能，资源支援效果更佳
- **赵一鸣** (小镇做题家): 卷王技能，自律冲刺效果更佳

### 数值系统

**学生数值**:
- Ψ 心理值: 精神健康状态
- 🛠 进度值: 论文完成度  
- 📂 证据值: 掌握的实锤证据
- 🤝 网络值: 校内外援助资源
- 💰 金钱: 经济状况

**教授数值** (隐藏):
- ⚖️ 威权: 对学生的压制力
- 📉 风险: 被校方查处风险
- 😰 焦虑: 教授情绪状态

### 行动类型
- **服从**: 完成任务但损害心理
- **周旋**: 协商讨价还价
- **搜证**: 收集证据材料
- **自救**: 寻求心理支持
- **联动**: 寻求外部帮助
- **对抗**: 直接质疑反抗
- **资源支援**: 使用金钱解决问题

## 项目结构

```
├── app/                    # Next.js App Router
│   ├── api/pua-game/      # API路由
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主游戏页面
├── components/            # 组件
│   └── pua-game-mobile/   # 游戏相关组件
├── lib/                   # 工具库
└── public/               # 静态资源
```

## 开发指南

### 添加新功能

1. 游戏逻辑修改在 `app/page.tsx` 的 systemPrompt 中
2. UI组件修改在 `components/pua-game-mobile/` 目录下
3. API逻辑修改在 `app/api/pua-game/route.ts` 中

### 样式规范

项目使用像素风格设计，关键CSS类：
- `.pixel-bg`: 像素背景
- `.pixel-panel`: 像素面板
- `.pixel-button`: 像素按钮
- `.pixel-text`: 像素字体

## 教育意义

这个游戏旨在：
- 提高对学术PUA行为的认知
- 提供应对策略的思考空间
- 模拟真实情境下的决策后果
- 促进学术环境的健康发展

## 注意事项

- 游戏内容仅供教育和警示目的
- 如遇到真实的学术不当行为，请寻求专业帮助
- 建议在心理承受能力范围内游玩

## 许可证

MIT License