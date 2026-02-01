---
name: product-analyzer
description: "Analyze and generate comprehensive product teardown reports with competitive analysis. Use when user provides a product name, URL, or link to analyze. Performs web research to create detailed reports covering: product positioning, target users, core features, business model, growth strategy, competitive analysis, and actionable takeaways."
---

# Product Teardown Analyzer

Generate comprehensive product analysis reports by searching and synthesizing information from the web.

## Workflow

1. **Extract product name/identifier** from user input (URL → domain/name)
2. **Search for product information** using web_search:
   - Product website and official descriptions
   - Product Hunt listings and reviews
   - News articles and press coverage
   - Competitor comparisons
   - User reviews and testimonials
3. **Identify and research competitors**:
   - Find 3-5 key competitors
   - Compare pricing, features, target audience, market position
4. **Synthesize findings** into structured report with sections:
   - 产品定位 (Product Positioning)
   - 目标用户 (Target Users)
   - 核心功能 (Core Features)
   - 商业模式 (Business Model)
   - 增长策略 (Growth Strategy)
   - 竞品对比 (Competitive Analysis)
   - 可借鉴点 (Actionable Takeaways)

## Search Strategy

For each product, search for:
- `"[product name] product"`, `"[product name] features"`, `"[product name] pricing"`
- `"[product name] target audience"`, `"[product name] who is it for"`
- `"[product name] business model"`, `"[product name] how it makes money"`
- `"[product name] growth"`, `"[product name] marketing strategy"`
- `"[product name] review"`, `"[product name] Product Hunt"`

For competitors:
- `"[product name] alternatives"`
- `"[product name] vs [competitor]"`
- `"[product name] competitors"`
- `"best [category] tools/products"`

## Report Format

Use this structure for the output:

```markdown
# [Product Name] 产品拆解报告

## 产品定位
[2-3 sentences on what the product is and its unique value proposition]

## 目标用户
- [User segment 1]
- [User segment 2]
- [User segment 3]

## 核心功能
1. [Feature 1] - [brief description]
2. [Feature 2] - [brief description]
3. [Feature 3] - [brief description]

## 商业模式
- Revenue streams: [how they make money]
- Pricing model: [free/freemium/paid tiers]
- Unit economics: [if available]

## 增长策略
- [Strategy 1]
- [Strategy 2]
- [Strategy 3]

## 竞品对比分析

### 核心竞品概览

| 产品 | 定位 | 定价 | 核心优势 | 主要劣势 |
|------|------|------|----------|----------|
| [Product A] | xxx | Free/$xx | xxx | xxx |
| [Product B] | xxx | Free/$xx | xxx | xxx |
| [Product C] | xxx | Free/$xx | xxx | xxx |

### 关键差异分析

| 维度 | 本产品 | 竞品A | 竞品B |
|------|--------|-------|-------|
| 功能A | ⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐ |
| 易用性 | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐ |
| 价格 | $$$$ | $$ | $$$ |
| 生态 | 弱 | 强 | 中 |

### 差异化机会
- [Opportunity 1]
- [Opportunity 2]

## 可借鉴点
- [Takeaway 1]
- [Takeaway 2]
- [Takeaway 3]
```

## 竞品对比模块 (Competitive Analysis Module)

### 1. Identify 3-5 Key Competitors

- Direct competitors: Same target audience + similar features
- Indirect competitors: Same problem, different solution
- Potential disruptors: Emerging players, big tech entrants

### 2. Comparison Dimensions

- **定价策略** (Pricing): Free tier, paid plans, enterprise pricing
- **核心功能** (Core Features): Feature completeness, uniqueness
- **目标用户** (Target Audience): User segments, company size
- **技术壁垒** (Technical moat): Proprietary tech, data advantages
- **市场份额** (Market presence): MAU, funding, valuation
- **增长策略** (Growth strategy): Channels, retention tactics

### 3. Competitive Insights

After comparison, provide:
- **本产品的差异化机会**: Where can this product win?
- **竞品护城河**: What can't be easily copied?
- **市场空白**: Underserved user needs or segments
- **威胁预警**: Emerging competitors or disruptive trends

## Tips

- If product info is limited, search for founder interviews, blog posts, or case studies
- Include specific numbers/metrics when available (MAU, funding, revenue)
- Cite sources in parentheses when referencing specific claims
- Keep each section concise but substantive (2-4 sentences for narrative sections)
- For competitive analysis, prioritize direct competitors with >10M users or significant funding
- Always verify pricing on official sources (may change)
- Highlight 1-2 key "win conditions" where your target product has clear advantage
