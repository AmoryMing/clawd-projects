# Pricing Calculator Skill

## 描述
SaaS 产品定价计算器，基于成本、竞品和价值模型生成推荐定价方案。

## 触发词
- `price` - 计算定价
- `pricing` - 定价分析
- `定价` - 计算价格

## 使用方式
```
/price --product <产品类型> --users <用户数> --costs <成本>
```

## 输入参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| productType | string | 是 | 产品类型：saas/one-time/hybrid |
| targetUser | string | 是 | 目标用户：consumer/smb/enterprise |
| monthlyActiveUsers | number | 是 | 月活用户数 |
| fixedCost | number | 是 | 固定成本 |
| variableCost | number | 是 | 单位变动成本 |

## 输出结果
| 字段 | 类型 | 说明 |
|------|------|------|
| recommendedPrice | number | 推荐价格 |
| minPrice | number | 最低价格 |
| maxPrice | number | 溢价上限 |
| costBreakdown | object | 成本分解 |
| competitorComparison | array | 竞品对比 |

## 作者
- @eva02-cloud
