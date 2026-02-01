---
name: xiaohongshu-content-flow
description: "Generate Xiaohongshu (小红书) content with optimized copy, titles, and tags. Input: topic/theme. Output: full post copy + 3 title options + 10-15 tags. Also design Notion storage structure for content management."
---

# Xiaohongshu Content Workflow

Generate viral Xiaohongshu (小红书) content with optimized copy, titles, and hashtags. Also manage content in Notion.

## Workflow

1. **Analyze the topic** - Extract key themes, target audience, pain points
2. **Generate content** - Create Xiaohongshu-optimized copy with:
   - Hook (开头钩子) - Attention-grabbing first 3 lines
   - Body (正文) - Value-dense content with emojis and formatting
   - CTA (结尾引导) - Engagement prompts
3. **Create titles** - Generate 3 scroll-stopping title options
4. **Generate tags** - Create 10-15 relevant hashtags
5. **Notion storage** - Design and use Notion database structure

## Content Style Guide

### Xiaohongshu Best Practices

- **Hook (开头)**: 3 lines max, attention-grabbing, promise value
- **Length**: 500-1500 characters for optimal engagement
- **Emojis**: Use strategically (2-4 per paragraph, not overdone)
- **Line breaks**: Short paragraphs, easy to scan
- **Tone**: Conversational, authentic, relatable
- **CTA**: Encourage comments, saves, shares

### Content Structure

```markdown
## 标题（3选1）
[Title Option 1]
[Title Option 2]
[Title Option 3]

---

## 正文

### 开场钩子（3行内）
[Hook that promises value]

### 痛点/场景引入
[Relatable problem or scenario]

### 解决方案/核心内容
[Value-dense content with tips/steps/examples]

### 个人体验/案例
[Authentic personal story or case study]

### 总结金句
[Memorable closing thought]

### 互动引导
[Ask for comments: "你们觉得呢？""有问题评论区问我"等]

---

## 标签（10-15个）
#标签1 #标签2 #标签3 ...
```

### Title Formulas (标题公式)

| 公式 | 示例 |
|------|------|
| 数字+痛点 | "3年｜终于把胃养好了！" |
| 反常识 | "别再xxx了！真的没用" |
| 结果导向 | "xxx后终于实现了xxx" |
| 身份认同 | "xxx人一定要看！" |
| 悬念 | "xxx的内幕，全网没人敢说" |
| 对比 | "xxx vs xxx，差别太大了" |

### Tag Categories

Generate tags from these categories:
- **内容类型**: 干货、测评、教程、避坑、分享、好物
- **场景**: 职场、恋爱、婚姻、家庭、留学、租房
- **人群**: 打工人、宝妈、学生、考研、创业者
- **平台**: 小红书、抖音、B站、微信
- **情绪**: 焦虑、开心、崩溃、悟了、后悔
- **行业**: 互联网、金融、教育、医疗、美妆

### Tag Strategy

- **前3个标签**：精准定位（内容类型 + 场景 + 人群）
- **中间标签**：流量大标签（平台相关、热词）
- **后5个标签**：长尾精准标签（具体场景、问题）
- **总数**：10-15个最佳

## Notion Storage Structure

### Content Database Schema

Create a Notion database with these properties:

| Property | Type | Description |
|----------|------|-------------|
| 标题 | Title | Post title |
| 状态 | Select | 草稿/待发布/已发布/复盘 |
| 发布时间 | Date | Planned or actual publish date |
| 内容类型 | Select | 干货/测评/教程/避坑/好物/日常 |
| 目标人群 | Multi-select | Target audience segments |
| 预期流量 | Select | 低/中/高/爆款 |
| 实际数据 | Rollup | Views, likes, saves, comments |
| 选题来源 | Select | 灵感/热点/用户需求/竞品 |
| 标签 | Multi-select | Associated hashtags |
| 封面图 | Files & Media | Cover image |
| 备注 | Text | Additional notes |

### Content Workflow in Notion

```
选题库 (Topic Pool)
    ↓ 筛选通过
草稿箱 (Drafts)
    ↓ 审核通过
待发布 (Scheduled)
    ↓ 发布完成
已发布 (Published)
    ↓ 数据复盘
内容归档 (Archive)
```

### Page Template Structure

For each content piece in Notion:

```markdown
# [标题]

## 基本信息
- 状态: [[状态]]
- 发布时间: [[日期]]
- 内容类型: [[类型]]

## 内容大纲
- 核心卖点:
- 目标用户:
- 预期效果:

## 发布内容

### 标题选项
1. [标题1]
2. [标题2]
3. [标题3]

### 正文内容
[Full post copy]

### 标签
[All hashtags]

## 数据复盘
- 浏览量:
- 点赞:
- 收藏:
- 评论:
- 转发:

## 复盘总结
- 成功点:
- 改进点:
- 下次优化:
```

## Usage Examples

**Input**：
```
主题：租房避坑指南
目标人群：刚毕业的大学生、留学生
痛点：被中介骗、合同陷阱、房东违约
```

**Output**：
```markdown
## 标题（3选1）
1. "租房3年｜这份避坑指南让我少亏2万块"
2. "别再被中介坑了！租房必看保命清单"
3. "租房血泪史｜这7个陷阱90%的人都踩过"

---

## 正文

### 开场钩子（3行内）
刚毕业那年，我被中介坑了5000块押金。
研究了100+租房合同后，我总结这份保命清单。
希望你永远用不到，但一定要收藏！

### 痛点引入
找房的时候，你是不是也遇到过：
❌ 中介说"这个价很便宜了"，结果隔壁便宜800
❌ 合同密密麻麻，根本不敢仔细看
❌ 押金说好退，结果找各种理由扣钱

### 解决方案

**【看房必查】**
1. 查房产证/房东身份证
2. 查上次租房记录
3. 拍照留存房屋现状

**【合同必看】**
1. 租期和违约金条款
2. 维修责任划分
3. 能否转租

...

### 个人体验
我现在的房子，合同看了3遍才签。
虽然花了点时间，但住了2年从没扯皮。

### 总结
租房不怕，就怕不懂。
收藏这份清单，至少少亏5000！

### 互动引导
你们租房踩过什么坑？评论区聊聊～

---

## 标签（12个）
#租房避坑 #租房指南 #租房注意事项 #毕业生租房 #留学生租房 #租房避雷 #租房合同 #租房经验 #租房攻略 #租房避坑指南 #租房避坑攻略 #打工人租房
```

## Tips

- Always match tone to target audience
- Use concrete numbers (3年、5000块、90%) for credibility
- Include personal stories for authenticity
- Tags should be a mix of broad and niche
- Test different hooks with similar content
- Track data to optimize future posts

## Notion Integration

Use the `notion` skill to:
- Create content database
- Add new content entries
- Update status and track performance
- Query top-performing content for insights

### Sample Notion API Usage

```markdown
When creating new content:
1. Create page in "选题库" database
2. Fill in title, type, target audience
3. Add draft content in page body
4. Set status to "草稿"

When publishing:
1. Update status to "待发布"
2. Set publish date
3. After posting, update to "已发布"

When reviewing:
1. Query "已发布" entries from last 30 days
2. Analyze top performers
3. Add insights to "复盘总结"
```
