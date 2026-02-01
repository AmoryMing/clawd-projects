# Policy Agent Skill

## 描述
企业政策合规检测智能体，帮助用户检测企业报告、新闻内容是否符合最新政策要求。

## 触发词
- `analyze` - 分析内容
- `检测` - 检测合规性
- `审查` - 政策审查
- `compliance` - 合规检测

## 使用方式
```
/analyze <内容> - 分析文本的合规性
/analyze --file <报告文件> - 分析文件内容
/analyze --company <公司名> - 检查公司相关政策风险
```

## 输入参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| content | string | 是 | 待检测的文本内容 |
| company | string | 否 | 公司名称 |
| category | string | 否 | 检测类别：all/content/data/risk |
| strictMode | boolean | 否 | 是否开启严格模式 |

## 输出结果
| 字段 | 类型 | 说明 |
|------|------|------|
| riskScore | number | 风险评分 (0-100) |
| riskLevel | string | 风险等级：low/medium/high/critical |
| violations | array | 违规项列表 |
| suggestions | array | 修正建议 |
| relevantPolicies | array | 相关政策引用 |

## 示例
```json
{
  "riskScore": 45,
  "riskLevel": "medium",
  "violations": [
    {
      "code": "DATA_SOURCE_VIOLATION",
      "description": "数据来源未经授权",
      "law": "《征信业管理条例》第15条",
      "severity": "medium"
    }
  ],
  "suggestions": [
    "确认数据来源的合法性授权",
    "补充个人信息保护措施"
  ],
  "relevantPolicies": [
    "《征信业管理条例》2026修订版",
    "《个人信息保护法》第32条"
  ]
}
```

## 依赖
- `openai` - 用于文本分析
- `brave-search` - 用于政策查询
- `compliance-rules` - 本地规则库

## 权限
- `web_search` - 搜索最新政策
- `web_fetch` - 获取政策文档

## 版本
- v1.0.0 - 初始版本
- v1.1.0 - 添加文件分析能力
- v1.2.0 - 添加多类别检测

## 作者
- @eva02-cloud
