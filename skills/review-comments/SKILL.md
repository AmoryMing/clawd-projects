# Review Comments Skill

## 描述
企业报告评论区管理系统，支持多评论员协作、状态跟踪和批量操作。

## 触发词
- `review` - 查看评论
- `comment` - 添加评论
- `resolve` - 解决评论

## 使用方式
```
/review --report <报告ID> - 查看报告评论
/comment --report <报告ID> --type <类型> <内容> - 添加评论
/resolve --comment <评论ID> - 解决评论
```

## 输入参数
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| action | string | 是 | 操作：list/add/resolve/update |
| reportId | string | 是 | 报告ID |
| commentType | string | 否 | 评论类型：content/data/risk |
| content | string | 否 | 评论内容 |
| commentId | string | 否 | 评论ID |

## 输出结果
| 字段 | 类型 | 说明 |
|------|------|------|
| comments | array | 评论列表 |
| stats | object | 统计信息 |
| report | object | 报告信息 |

## 作者
- @eva02-cloud
