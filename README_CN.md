# Policy Assistant - 政策助手

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

**企业政策合规智能助手**

[English](./README_EN.md) | 中文

</div>

---

## ✨ 功能特性

| 功能 | 描述 | 状态 |
|------|------|------|
| 🔍 合规检测 | 自动检测企业报告合规性 | ✅ 已完成 |
| ⚠️ 风险分析 | 多维度风险评估与可视化 | ✅ 已完成 |
| 💬 评论区 | Bot-First 协作评论管理 | ✅ 已完成 |
| 💰 定价计算 | SaaS 定价策略计算器 | ✅ 已完成 |
| 📊 政策监控 | 心跳机制自动监控政策更新 | ✅ 已完成 |
| 📤 文件导出 | PDF/DOCX/PPTX 多格式导出 | ✅ 已完成 |
| 📱 移动端适配 | 响应式设计，触摸优化 | ✅ 已完成 |
| 🚀 性能优化 | 懒加载、虚拟列表、缓存 | ✅ 已完成 |

---

## 📁 项目结构

```
src/
├── core/                    # 核心架构
│   ├── Agent.ts             # 策略 Agent
│   ├── Processor.ts         # 处理器接口
│   ├── Cache.ts             # 智能缓存
│   └── State.ts             # 状态管理
│
├── artifacts/               # Artifact 组件
│   └── components/          # UI 组件
│       ├── Card.tsx         # 卡片组件
│       ├── Chart.tsx        # 图表组件
│       ├── Table.tsx        # 表格组件
│       ├── ReviewComments.tsx
│       └── PricingCalculator.tsx
│
├── services/                # 服务层
│   ├── APIService.ts        # API 客户端
│   ├── FileExporter.ts      # 文件导出
│   └── PolicyMonitor.ts     # 政策监控
│
├── utils/                   # 工具模块
│   ├── PerformanceOptimizer.ts
│   └── MobileAdapter.ts
│
├── skills/                  # Skill 实现
│   ├── policy-agent/
│   ├── review-comments/
│   └── pricing-calculator/
│
├── data/                    # 数据文件
│   └── compliance-rules/    # 合规规则库
│
├── docs/                    # 文档
│   ├── README.md
│   └── api.md
│
└── __tests__/               # 测试用例
```

---

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

### 构建

```bash
npm run build
```

### 测试

```bash
npm test
```

---

## 📖 使用指南

### 1. 合规检测

```typescript
import { createAgent } from './core';

const agent = createAgent();

const result = await agent
  .analyze('企业报告内容...')
  .withCompany('公司名称')
  .withCategory('all')
  .execute();

// 结果
// {
//   riskScore: 45,
//   riskLevel: 'medium',
//   violations: [...],
//   suggestions: [...]
// }
```

### 2. 风险分析

```typescript
// 在群聊中使用
/analyze 这家公司的注册资本为1亿元
```

### 3. 定价计算

```typescript
const result = await agent
  .price({
    productType: 'saas',
    targetUser: 'enterprise',
    monthlyActiveUsers: 1000,
    fixedCost: 5000,
    variableCost: 10
  })
  .execute();

// 推荐价格: ¥25/月
```

### 4. 文件导出

```typescript
import { exportToPDF } from './services/FileExporter';

const result = await exportToPDF(
  reportData,
  'compliance-report',
  'my-report'
);
// 生成 PDF 文件
```

---

## 🎨 组件使用

### Card 组件

```tsx
import { Card, RiskCard } from './components/Card';

<Card
  title="标题"
  subtitle="副标题"
  variant="default"
  expandable
>
  内容
</Card>

<RiskCard
  score={75}
  level="low"
  title="风险检测"
  suggestions={['建议1', '建议2']}
/>
```

### Chart 组件

```tsx
import { LineChart, BarChart, PieChart } from './components/Chart';

<LineChart
  data={chartData}
  width="100%"
  height={200}
/>

<PieChart
  data={pieData}
  donut={true}
/>
```

---

## ⚙️ 配置

### Agent 配置

```typescript
const agent = new Agent({
  strictMode: false,        // 严格模式
  maxCacheSize: 100,        // 最大缓存数
  enableHistory: true,      // 启用历史记录
  defaultChannel: 'slack'   // 默认频道
});
```

### 监控配置

```typescript
const monitor = new PolicyMonitor({
  checkInterval: '0 9 * * *',  // 每天9点检查
  monitoredCategories: ['compliance', 'data-security'],
  notifyChannels: ['slack'],
  riskThreshold: 70
});

monitor.start();
```

---

## 📊 代码统计

```
TypeScript:    ~190 KB
模块数:        15+
测试覆盖率:    80%+
```

---

## 🧪 测试

```bash
# 运行所有测试
npm test

# 运行指定测试
npm test -- --grep "Agent"

# 生成覆盖率报告
npm run test:coverage
```

---

## 📝 文档

- [API 文档](./docs/api.md)
- [合规规则说明](./data/compliance-rules/README.md)

---

## 🤝 贡献

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

## 👥 作者

- **@eva02-cloud** - 核心架构、组件开发
- **@Clawdbot** - 渲染引擎、集成开发

---

<div align="center">

**用 ❤️ 构建**

</div>
