# 快速开始

## 安装

```bash
npm install
```

## 使用示例

### 1. 政策合规检测

```typescript
import { createAgent } from './core';

const agent = createAgent();

async function main() {
  const result = await agent
    .analyze('这家公司的注册资本为1亿元，但实缴资本只有100万元。')
    .withCompany('示例公司')
    .withCategory('all')
    .execute();

  console.log(result);
}
```

### 2. 在群聊中使用

```
/analyze 这家公司的注册资本为1亿元，但实缴资本只有100万元。
```

### 3. 导出报告

```
/export pdf --template compliance-report
```

## 目录结构

```
src/
├── core/              # 核心架构
│   ├── Agent.ts       # 策略 Agent
│   ├── Processor.ts   # 处理器接口
│   ├── Cache.ts       # 智能缓存
│   └── State.ts       # 状态管理
├── artifacts/         # Artifact 组件
│   └── components/    # UI 组件
│       ├── Card.tsx   # 卡片组件
│       ├── Chart.tsx  # 图表组件
│       └── Table.tsx  # 表格组件
├── skills/            # Skill 实现
│   ├── policy-agent/
│   ├── review-comments/
│   └── pricing-calculator/
└── docs/              # 文档
```

## 测试

```bash
npm test
```
