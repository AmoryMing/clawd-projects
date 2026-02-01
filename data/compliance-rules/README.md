# 政策合规规则库

## 规则结构

```typescript
interface ComplianceRule {
  code: string;           // 规则代码
  description: string;    // 描述
  pattern?: string;       // 匹配模式
  severity: 'low' | 'medium' | 'high' | 'critical';
  law: string;           // 相关法律
  category: 'content' | 'data' | 'risk';
}
```

## 规则列表

### 内容合规规则 (content-rules.json)

| 代码 | 描述 | 严重程度 | 法律依据 |
|------|------|----------|----------|
| CONTENT_ACCURACY | 内容准确性 | high | 《企业信息公示暂行条例》 |
| SOURCE_AUTHORIZATION | 数据来源授权 | critical | 《征信业管理条例》第15条 |
| TIMELINESS | 信息时效性 | medium | 《企业信息公示暂行条例》 |
| DISCLAIMER_REQUIRED | 免责声明缺失 | low | 《广告法》 |

### 数据合规规则 (data-rules.json)

| 代码 | 描述 | 严重程度 | 法律依据 |
|------|------|----------|----------|
| PERSONAL_INFO | 个人信息保护 | critical | 《个人信息保护法》第32条 |
| DATA_LICENSE | 数据使用授权 | high | 《数据安全法》 |
| CROSS_BORDER | 跨境数据传输 | critical | 《网络安全法》 |
| DATA_RETENTION | 数据保存期限 | medium | 《征信业管理条例》 |

### 风险检测规则 (risk-rules.json)

| 代码 | 描述 | 严重程度 | 法律依据 |
|------|------|----------|----------|
| HIGH_RISK_INDUSTRY | 高风险行业 | high | 《商业银行法》 |
| RELATED_PARTY | 关联方交易 | medium | 《上市公司信息披露》 |
| LITIGATION_RISK | 诉讼风险 | high | 《民事诉讼法》 |
| FINANCIAL_RISK | 财务风险 | critical | 《企业会计准则》 |

## 使用方法

```typescript
import { loadComplianceRules } from './rules';

const rules = await loadComplianceRules('all');
const violations = detectViolations(content, rules);
```

## 规则更新

规则文件位于：
- `/data/compliance-rules/content-rules.json`
- `/data/compliance-rules/data-rules.json`
- `/data/compliance-rules/risk-rules.json`
