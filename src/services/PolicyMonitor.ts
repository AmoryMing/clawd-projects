/**
 * Policy Monitor - 政策监控心跳服务
 *
 * 功能：
 * - 定期检查政策更新
 * - 自动发送提醒
 * - 风险预警
 */

import { CronJob } from 'cron';

// ═══════════════════════════════════════════════════════
// 配置
// ═══════════════════════════════════════════════════════

export interface PolicyMonitorConfig {
  // 检查频率
  checkInterval: string;  // Cron 表达式，默认 '0 9 * * *' (每天9点)
  
  // 监控范围
  monitoredCategories: string[];
  monitoredRegions: string[];
  
  // 通知设置
  notifyChannels: string[];
  notifyOnUpdate: boolean;
  notifyOnRisk: boolean;
  
  // 风险阈值
  riskThreshold: number;  // 0-100
}

export const defaultConfig: PolicyMonitorConfig = {
  checkInterval: '0 9 * * *',  // 每天上午9点
  monitoredCategories: ['compliance', 'data-security', 'finance'],
  monitoredRegions: ['china', 'global'],
  notifyChannels: ['slack'],
  notifyOnUpdate: true,
  notifyOnRisk: true,
  riskThreshold: 70
};

// ═══════════════════════════════════════════════════════
// 策略监控服务
// ═══════════════════════════════════════════════════════

export class PolicyMonitor {
  private config: PolicyMonitorConfig;
  private jobs: CronJob[] = [];
  private lastCheckResult: CheckResult | null = null;

  constructor(config: Partial<PolicyMonitorConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 启动监控
  start(): void {
    console.log('[PolicyMonitor] 启动政策监控服务...');

    // 主检查任务
    const mainJob = new CronJob(this.config.checkInterval, async () => {
      await this.performCheck();
    });

    mainJob.start();
    this.jobs.push(mainJob);

    // 立即执行一次检查
    this.performCheck();

    console.log(`[PolicyMonitor] 已启动，监控频率: ${this.config.checkInterval}`);
  }

  // 停止监控
  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
    console.log('[PolicyMonitor] 已停止');
  }

  // 执行检查
  async performCheck(): Promise<CheckResult> {
    const startTime = Date.now();

    console.log('[PolicyMonitor] 开始执行政策检查...');

    try {
      // 1. 获取最新政策列表
      const policyUpdates = await this.fetchPolicyUpdates();

      // 2. 分析风险
      const riskAnalysis = await this.analyzeRisks(policyUpdates);

      // 3. 生成结果
      const result: CheckResult = {
        timestamp: new Date(),
        duration: Date.now() - startTime,
        updatesFound: policyUpdates.length,
        riskLevel: riskAnalysis.level,
        riskScore: riskAnalysis.score,
        criticalIssues: riskAnalysis.critical,
        warnings: riskAnalysis.warnings,
        policies: policyUpdates,
        recommendations: riskAnalysis.recommendations
      };

      this.lastCheckResult = result;

      // 4. 发送通知
      if (riskAnalysis.level !== 'low' || policyUpdates.length > 0) {
        await this.sendNotification(result);
      }

      console.log(`[PolicyMonitor] 检查完成，发现 ${policyUpdates.length} 条更新，风险等级: ${riskAnalysis.level}`);

      return result;
    } catch (error) {
      console.error('[PolicyMonitor] 检查失败:', error);
      throw error;
    }
  }

  // 获取政策更新
  private async fetchPolicyUpdates(): Promise<PolicyUpdate[]> {
    const updates: PolicyUpdate[] = [];

    // 这里应该调用实际的 API
    // 示例数据
    const sampleUpdates: PolicyUpdate[] = [
      {
        id: 'policy-001',
        title: '《征信业管理条例》2026修订版',
        category: 'compliance',
        region: 'china',
        issuedBy: '中国人民银行',
        issuedAt: new Date('2026-01-15'),
        effectiveAt: new Date('2026-03-01'),
        summary: '加强对征信机构数据采集合规要求',
        impact: 'high',
        url: 'https://www.pbc.gov.cn/...'
      },
      {
        id: 'policy-002',
        title: '《个人信息保护法》实施细则',
        category: 'data-security',
        region: 'china',
        issuedBy: '国家网信办',
        issuedAt: new Date('2026-01-20'),
        effectiveAt: new Date('2026-04-01'),
        summary: '明确个人信息跨境传输细则',
        impact: 'high',
        url: 'https://www.cac.gov.cn/...'
      }
    ];

    // 过滤需要监控的类别和地区
    return sampleUpdates.filter(policy =>
      this.config.monitoredCategories.includes(policy.category) &&
      this.config.monitoredRegions.includes(policy.region)
    );
  }

  // 分析风险
  private async analyzeRisks(policies: PolicyUpdate[]): Promise<RiskAnalysis> {
    let criticalCount = 0;
    let warningCount = 0;
    const recommendations: string[] = [];

    policies.forEach(policy => {
      if (policy.impact === 'high') {
        criticalCount++;
        recommendations.push(`密切关注: ${policy.title}`);
        recommendations.push(`生效日期: ${policy.effectiveAt.toLocaleDateString()}`);
      } else if (policy.impact === 'medium') {
        warningCount++;
      }
    });

    // 计算风险分数
    const score = Math.min(100, criticalCount * 30 + warningCount * 10);

    // 确定风险等级
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (score >= 80) level = 'critical';
    else if (score >= 60) level = 'high';
    else if (score >= 30) level = 'medium';
    else level = 'low';

    return {
      level,
      score,
      critical: criticalCount,
      warnings: warningCount,
      recommendations
    };
  }

  // 发送通知
  private async sendNotification(result: CheckResult): Promise<void> {
    for (const channel of this.config.notifyChannels) {
      try {
        switch (channel) {
          case 'slack':
            await this.sendSlackNotification(result);
            break;
          case 'email':
            await this.sendEmailNotification(result);
            break;
        }
      } catch (error) {
        console.error(`[PolicyMonitor] ${channel} 通知发送失败:`, error);
      }
    }
  }

  private async sendSlackNotification(result: CheckResult): Promise<void> {
    const emoji = result.riskLevel === 'critical' ? '🚨' :
                 result.riskLevel === 'high' ? '⚠️' :
                 result.riskLevel === 'medium' ? '📢' : '✅';

    const message = `
${emoji} *政策监控报告*

*时间*: ${result.timestamp.toLocaleString()}
*耗时*: ${result.duration}ms

*更新统计*: ${result.updatesFound} 条新政策
*风险等级*: ${result.riskLevel.toUpperCase()} (${result.riskScore}分)

${result.criticalIssues > 0 ? `*⚠️ 高风险问题*: ${result.criticalIssues}` : ''}

${result.policies.slice(0, 5).map(p => `
• *${p.title}*
  机构: ${p.issuedBy}
  影响: ${p.impact}
  生效: ${p.effectiveAt.toLocaleDateString()}
`).join('')}

${result.recommendations.length > 0 ? `
*建议*:
${result.recommendations.slice(0, 3).map(r => `• ${r}`).join('\n')}
` : ''}
    `.trim();

    // 发送到 Slack
    console.log('[PolicyMonitor] 发送 Slack 通知:', message);
  }

  private async sendEmailNotification(result: CheckResult): Promise<void> {
    // 邮件通知实现
    console.log('[PolicyMonitor] 邮件通知已发送');
  }

  // 获取上次检查结果
  getLastResult(): CheckResult | null {
    return this.lastCheckResult;
  }

  // 手动触发检查
  async triggerCheck(): Promise<CheckResult> {
    return this.performCheck();
  }

  // 更新配置
  updateConfig(updates: Partial<PolicyMonitorConfig>): void {
    this.config = { ...this.config, ...updates };
    console.log('[PolicyMonitor] 配置已更新:', this.config);
  }
}

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface PolicyUpdate {
  id: string;
  title: string;
  category: string;
  region: string;
  issuedBy: string;
  issuedAt: Date;
  effectiveAt: Date;
  summary: string;
  impact: 'low' | 'medium' | 'high';
  url: string;
}

export interface CheckResult {
  timestamp: Date;
  duration: number;
  updatesFound: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  criticalIssues: number;
  warnings: number;
  policies: PolicyUpdate[];
  recommendations: string[];
}

export interface RiskAnalysis {
  level: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  critical: number;
  warnings: number;
  recommendations: string[];
}

// ═══════════════════════════════════════════════════════
// 使用示例
// ═══════════════════════════════════════════════════════

// 启动监控服务
const monitor = new PolicyMonitor({
  checkInterval: '0 9 * * *',  // 每天9点
  monitoredCategories: ['compliance', 'data-security'],
  monitoredRegions: ['china'],
  notifyChannels: ['slack'],
  notifyOnRisk: true,
  riskThreshold: 70
});

// 启动
monitor.start();

// 手动触发检查
// await monitor.triggerCheck();

// 获取上次结果
// const result = monitor.getLastResult();

// 停止
// monitor.stop();

export default PolicyMonitor;
