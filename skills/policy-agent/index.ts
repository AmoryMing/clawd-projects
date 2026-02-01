/**
 * Policy Agent Skill - 企业政策合规检测
 *
 * 功能：
 * 1. 分析文本内容的合规性
 * 2. 检测违规项并提供修正建议
 * 3. 查询相关政策文件
 */

import { SkillHandler } from '@clawdbot/core';

interface PolicyCheckInput {
  content: string;
  company?: string;
  category?: 'all' | 'content' | 'data' | 'risk';
  strictMode?: boolean;
}

interface Violation {
  code: string;
  description: string;
  law: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

interface PolicyResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  violations: Violation[];
  suggestions: string[];
  relevantPolicies: string[];
  analyzedAt: string;
}

export default {
  name: 'policy-agent',
  description: '企业政策合规检测智能体',
  version: '1.0.0',

  async handle(input: PolicyCheckInput): Promise<PolicyResult> {
    const { content, company, category = 'all', strictMode = false } = input;

    if (!content || content.trim().length === 0) {
      throw new Error('待检测内容不能为空');
    }

    // 1. 加载合规规则
    const rules = await this.loadComplianceRules(category);

    // 2. 执行合规检测
    const violations = await this.detectViolations(content, rules, strictMode);

    // 3. 计算风险评分
    const riskScore = this.calculateRiskScore(violations);

    // 4. 生成修正建议
    const suggestions = this.generateSuggestions(violations);

    // 5. 查询相关政策
    const relevantPolicies = await this.queryRelevantPolicies(violations);

    // 6. 返回结果
    return {
      riskScore,
      riskLevel: this.getRiskLevel(riskScore),
      violations,
      suggestions,
      relevantPolicies,
      analyzedAt: new Date().toISOString()
    };
  },

  /**
   * 加载合规规则
   */
  async loadComplianceRules(category: string) {
    // 规则库路径
    const rulesPath = '/home/devbox/clawd/data/compliance-rules/';

    // 加载对应类别的规则
    const rules = {
      content: await this.loadRulesFromFile(`${rulesPath}content-rules.json`),
      data: await this.loadRulesFromFile(`${rulesPath}data-rules.json`),
      risk: await this.loadRulesFromFile(`${rulesPath}risk-rules.json`),
      all: {
        content: await this.loadRulesFromFile(`${rulesPath}content-rules.json`),
        data: await this.loadRulesFromFile(`${rulesPath}data-rules.json`),
        risk: await this.loadRulesFromFile(`${rulesPath}risk-rules.json`)
      }
    };

    return rules[category] || rules.all;
  },

  /**
   * 从文件加载规则
   */
  async loadRulesFromFile(filePath: string) {
    try {
      const content = await readFile(filePath, 'utf-8');
      return JSON.parse(content);
    } catch {
      return [];
    }
  },

  /**
   * 检测违规项
   */
  async detectViolations(
    content: string,
    rules: any[],
    strictMode: boolean
  ): Promise<Violation[]> {
    const violations: Violation[] = [];

    // 使用 AI 模型分析内容
    const analysisPrompt = `
      请分析以下内容，检测是否符合合规要求：

      内容：${content}

      检测规则：
      ${JSON.stringify(rules, null, 2)}

      严格模式：${strictMode ? '是' : '否'}

      请返回检测到的违规项列表，每个违规项包含：
      - code: 违规代码
      - description: 违规描述
      - law: 违反的法律法规
      - severity: 严重程度（low/medium/high/critical）
    `;

    try {
      const aiResponse = await callAI(analysisPrompt, {
        model: 'claude-3-5-sonnet',
        maxTokens: 2000
      });

      // 解析 AI 返回结果
      const detectedViolations = JSON.parse(aiResponse);
      violations.push(...detectedViolations);
    } catch (error) {
      console.error('AI 分析失败:', error);
      // 降级：使用规则匹配
      const ruleMatches = this.matchRules(content, rules);
      violations.push(...ruleMatches);
    }

    return violations;
  },

  /**
   * 规则匹配（降级方案）
   */
  matchRules(content: string, rules: any[]): Violation[] {
    const violations: Violation[] = [];

    for (const rule of rules) {
      if (content.includes(rule.pattern)) {
        violations.push({
          code: rule.code,
          description: rule.description,
          law: rule.law,
          severity: rule.severity
        });
      }
    }

    return violations;
  },

  /**
   * 计算风险评分
   */
  calculateRiskScore(violations: Violation[]): number {
    const severityScores = {
      low: 10,
      medium: 30,
      high: 60,
      critical: 100
    };

    const totalScore = violations.reduce(
      (sum, v) => sum + severityScores[v.severity],
      0
    );

    // 归一化到 0-100
    const normalizedScore = Math.min(100, totalScore);

    return normalizedScore;
  },

  /**
   * 获取风险等级
   */
  getRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score < 20) return 'low';
    if (score < 50) return 'medium';
    if (score < 80) return 'high';
    return 'critical';
  },

  /**
   * 生成修正建议
   */
  generateSuggestions(violations: Violation[]): string[] {
    const suggestions = new Set<string>();

    for (const violation of violations) {
      // 基于违规类型生成建议
      const suggestionMap: Record<string, string> = {
        DATA_SOURCE_VIOLATION: '确认数据来源的合法性授权',
        PRIVACY_VIOLATION: '补充个人信息保护措施',
        CONTENT_MISMATCH: '核实内容准确性，引用官方数据源',
        COPYRIGHT_VIOLATION: '获取内容使用授权',
        MISSING_DISCLAIMER: '添加必要的免责声明'
      };

      const suggestion = suggestionMap[violation.code];
      if (suggestion) {
        suggestions.add(suggestion);
      } else {
        suggestions.add(`根据《${violation.law}》进行调整`);
      }
    }

    return Array.from(suggestions);
  },

  /**
   * 查询相关政策
   */
  async queryRelevantPolicies(violations: Violation[]): Promise<string[]> {
    const policies = new Set<string>();

    // 添加默认政策
    policies.add('《征信业管理条例》2026修订版');
    policies.add('《个人信息保护法》');

    // 基于违规项查询具体政策
    const policyQueries = violations.map(v => v.law);

    try {
      // 使用 web_search 查询最新政策
      for (const query of policyQueries) {
        const results = await web_search({
          query: `${query} 2026 最新版`,
          count: 3
        });

        for (const result of results) {
          policies.add(result.title);
        }
      }
    } catch (error) {
      console.error('政策查询失败:', error);
    }

    return Array.from(policies).slice(0, 10); // 最多返回10条
  }
} as SkillHandler;
