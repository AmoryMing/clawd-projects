# API 文档

## PolicyAgent

### 创建实例

```typescript
import { PolicyAgent, createAgent } from './core';

const agent = new PolicyAgent({
  strictMode: false,
  maxCacheSize: 100,
  enableHistory: true,
  defaultChannel: 'slack'
});
```

### 链式调用

```typescript
// 合规分析
agent
  .analyze('企业报告内容')
  .withCompany('示例公司')
  .withCategory('all')
  .strict()
  .execute();

// 评论管理
agent
  .review('report-123')
  .withFilter('pending')
  .execute();

// 定价计算
agent
  .price({
    productType: 'saas',
    targetUser: 'enterprise',
    monthlyActiveUsers: 1000,
    fixedCost: 5000,
    variableCost: 10
  })
  .execute();

// 文件导出
agent
  .export('pdf')
  .withTemplate('compliance-report')
  .withFilename('report-20260201')
  .execute();
```

## 组件

### Card

```tsx
import { Card, RiskCard, PolicyCard } from './components/Card';

<Card
  title="标题"
  subtitle="副标题"
  variant="default" | "success" | "warning" | "error"
  expandable
  defaultExpanded
>
  内容
</Card>

<RiskCard
  score={75}
  level="low" | "medium" | "high" | "critical"
  title="风险检测"
  details={[{ label: '标签', value: '值', severity: 'low' }]}
  suggestions={['建议1', '建议2']}
/>
```

### Chart

```tsx
import { LineChart, BarChart, PieChart } from './components/Chart';

<LineChart
  data={{
    labels: ['1月', '2月', '3月'],
    datasets: [{
      label: '销量',
      data: [100, 200, 300],
      color: '#3b82f6'
    }]
  }}
  width="100%"
  height={200}
/>

<BarChart
  data={{
    labels: ['A', 'B', 'C'],
    datasets: [{ label: '数量', data: [10, 20, 30] }]
  }}
  horizontal={false}
/>

<PieChart
  data={{
    labels: ['已修复', '待处理', '已忽略'],
    values: [50, 30, 20]
  }}
  donut={true}
/>
```

### Table

```tsx
import { Table, RiskTable, CommentTable } from './components/Table';

<Table
  columns={[
    { key: 'name', title: '名称', sortable: true },
    { key: 'value', title: '值', align: 'right' }
  ]}
  data={items}
  pagination={{ page: 1, pageSize: 20, total: 100 }}
  onRowClick={(row) => console.log(row)}
/>

<RiskTable risks={riskItems} />

<CommentTable
  comments={comments}
  onResolve={(id) => resolveComment(id)}
  onFeedback={(id, text) => addFeedback(id, text)}
/>
```

## Skill

### 政策检测 Skill

```typescript
import { PolicyAgent } from './skills/policy-agent';

const skill = new PolicyAgentSkill();

// 输入
const input = {
  content: '待检测的企业报告内容',
  company: '公司名称',
  category: 'all' | 'content' | 'data' | 'risk',
  strictMode: false
};

// 输出
const result = {
  riskScore: 45,
  riskLevel: 'medium',
  violations: [{
    code: 'DATA_SOURCE_VIOLATION',
    description: '数据来源未经授权',
    law: '《征信业管理条例》第15条',
    severity: 'medium'
  }],
  suggestions: [
    '确认数据来源的合法性授权',
    '补充个人信息保护措施'
  ],
  relevantPolicies: [
    '《征信业管理条例》2026修订版',
    '《个人信息保护法》'
  ]
};
```

## 配置

```typescript
// agent-options.ts
export const agentOptions = {
  strictMode: false,           // 严格模式
  maxCacheSize: 100,           // 最大缓存数
  enableHistory: true,         // 启用历史记录
  defaultChannel: 'slack',     // 默认频道
  cacheTTL: 300000,            // 缓存过期时间 (5分钟)
  maxHistorySize: 100          // 最大历史记录数
};
```
