/**
 * 🎯 Policy Agent - 精巧架构 V2.0
 *
 * 设计原则：
 * 1. 单一入口，组合式处理器
 * 2. 链式调用，配置式设计
 * 3. 插件式扩展，状态可追溯
 */

import { SmartCache } from './Cache';
import { StateManager } from './State';
import { Processor, ProcessorResult } from './Processor';

// ═══════════════════════════════════════════════════════
// 核心类型定义
// ═══════════════════════════════════════════════════════

export interface AgentContext {
  user: UserInfo;
  message: string;
  channel: ChannelType;
  timestamp: Date;
  artifacts: ArtifactReference[];
}

export interface UserInfo {
  id: string;
  name: string;
  roles: string[];
}

export type ChannelType = 'slack' | 'discord' | 'telegram' | 'whatsapp' | 'imessage';

export interface ArtifactReference {
  id: string;
  type: string;
  createdAt: Date;
}

export interface Intent {
  type: IntentType;
  params: Record<string, any>;
  confidence: number;
}

export type IntentType =
  | 'analyze'      // 合规分析
  | 'review'       // 评论管理
  | 'pricing'      // 定价计算
  | 'export'       // 文件导出
  | 'help'         // 帮助查询
  | 'unknown';     // 未知意图

export interface AgentOptions {
  strictMode?: boolean;
  maxCacheSize?: number;
  enableHistory?: boolean;
  defaultChannel?: ChannelType;
}

// ═══════════════════════════════════════════════════════
// 策略模式：意图解析器
// ═══════════════════════════════════════════════════════

interface IntentRecognizer {
  recognize(message: string): Intent;
}

class IntentRecognizerImpl implements IntentRecognizer {
  private patterns: Record<IntentType, RegExp[]> = {
    analyze: [
      /^\/analyze/i,
      /分析|检测|审查/i,
      /合规|政策/i,
      /看看|检查/i
    ],
    review: [
      /^\/review/i,
      /评论|反馈/i,
      /待处理|待阅/i,
      /问题|意见/i
    ],
    pricing: [
      /^\/price/i,
      /定价|价格/i,
      /成本|费用/i,
      /多少钱/i
    ],
    export: [
      /^\/export/i,
      /导出|下载/i,
      /生成|创建/i,
      /PDF|DOCX|PPTX/i
    ],
    help: [
      /^\/help/i,
      /帮助|说明/i,
      /怎么用|如何/i
    ],
    unknown: []
  };

  private defaultIntent: IntentType = 'unknown';

  recognize(message: string): Intent {
    const trimmed = message.trim().toLowerCase();

    for (const [type, patterns] of Object.entries(this.patterns)) {
      if (type === 'unknown') continue;

      for (const pattern of patterns) {
        if (pattern.test(trimmed)) {
          return {
            type: type as IntentType,
            params: this.extractParams(message, type),
            confidence: 0.85 + Math.random() * 0.1 // 添加随机性避免确定性
          };
        }
      }
    }

    return {
      type: this.defaultIntent,
      params: { raw: message },
      confidence: 0.5
    };
  }

  private extractParams(message: string, type: IntentType): Record<string, any> {
    const params: Record<string, any> = {};

    switch (type) {
      case 'analyze':
        // 提取公司名称
        const companyMatch = message.match(/公司[:：]?\s*([^\s]+)/i);
        if (companyMatch) params.company = companyMatch[1];
        // 提取内容（引号内的内容）
        const contentMatch = message.match(/["'"]([^"']+)["']/);
        if (contentMatch) params.content = contentMatch[1];
        break;

      case 'review':
        // 提取报告ID
        const reportMatch = message.match(/报告[:：]?\s*([^\s]+)/i);
        if (reportMatch) params.reportId = reportMatch[1];
        break;

      case 'pricing':
        // 提取数字参数
        const priceMatch = message.match(/(\d+)/);
        if (priceMatch) params.amount = parseInt(priceMatch[1]);
        break;

      case 'export':
        // 提取格式
        if (/pdf/i.test(message)) params.format = 'pdf';
        else if (/docx/i.test(message)) params.format = 'docx';
        else if (/pptx/i.test(message)) params.format = 'pptx';
        break;
    }

    return params;
  }
}

// ═══════════════════════════════════════════════════════
// 核心 Agent 类 - 链式调用 + 配置式设计
// ═══════════════════════════════════════════════════════

export class PolicyAgent {
  private processors: Map<IntentType, Processor>;
  private intentRecognizer: IntentRecognizer;
  private cache: SmartCache<string, Artifact>;
  private stateManager: StateManager;
  private options: AgentOptions;

  // 插件系统
  private plugins: Plugin[] = [];

  constructor(options: AgentOptions = {}) {
    this.options = {
      strictMode: false,
      maxCacheSize: 100,
      enableHistory: true,
      defaultChannel: 'slack',
      ...options
    };

    this.processors = new Map();
    this.intentRecognizer = new IntentRecognizerImpl();
    this.cache = new SmartCache({ maxSize: this.options.maxCacheSize! });
    this.stateManager = new StateManager();

    this.initDefaultProcessors();
  }

  private initDefaultProcessors(): void {
    // 延迟加载处理器
    this.processors.set('analyze', this.createComplianceProcessor());
    this.processors.set('review', this.createReviewProcessor());
    this.processors.set('pricing', this.createPricingProcessor());
    this.processors.set('export', this.createExportProcessor());
  }

  // ═══════════════════════════════════════════════════════
  // 公共 API - 链式调用
  // ═══════════════════════════════════════════════════════

  /**
   * 创建合规分析构建器
   */
  analyze(content: string): AnalyzeBuilder {
    return new AnalyzeBuilder(content, this);
  }

  /**
   * 创建评论管理构建器
   */
  review(reportId: string): ReviewBuilder {
    return new ReviewBuilder(reportId, this);
  }

  /**
   * 创建定价计算构建器
   */
  price(params: PricingParams): PricingBuilder {
    return new PricingBuilder(params, this);
  }

  /**
   * 创建文件导出构建器
   */
  export(format: ExportFormat): ExportBuilder {
    return new ExportBuilder(format, this);
  }

  // ═══════════════════════════════════════════════════════
  // 配置式方法
  // ═══════════════════════════════════════════════════════

  configure(options: Partial<AgentOptions>): this {
    this.options = { ...this.options, ...options };
    return this;
  }

  /**
   * 插件式扩展
   */
  use(plugin: Plugin): this {
    plugin.install(this);
    this.plugins.push(plugin);
    return this;
  }

  /**
   * 注册自定义处理器
   */
  registerProcessor(type: IntentType, processor: Processor): this {
    this.processors.set(type, processor);
    return this;
  }

  // ═══════════════════════════════════════════════════════
  // 核心处理逻辑
  // ═══════════════════════════════════════════════════════

  /**
   * 单一入口点 - 处理任意消息
   */
  async handle(ctx: AgentContext): Promise<ProcessingResult> {
    const startTime = Date.now();

    try {
      // 1. 插件预处理
      for (const plugin of this.plugins) {
        await plugin.onBeforeProcess?.(ctx);
      }

      // 2. 意图识别
      const intent = this.intentRecognizer.recognize(ctx.message);

      // 3. 缓存检查
      const cacheKey = this.generateCacheKey(intent, ctx);
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey)!;
        return {
          success: true,
          artifact: cached,
          fromCache: true,
          duration: Date.now() - startTime
        };
      }

      // 4. 选择处理器
      const processor = this.processors.get(intent.type);
      if (!processor) {
        return {
          success: false,
          error: `未找到处理器: ${intent.type}`,
          duration: Date.now() - startTime
        };
      }

      // 5. 执行处理
      const result = await processor.execute(intent.params, ctx);

      // 6. 状态记录
      if (this.options.enableHistory) {
        this.stateManager.record({
          intent,
          result,
          timestamp: new Date(),
          duration: Date.now() - startTime
        });
      }

      // 7. 插件后处理
      for (const plugin of this.plugins) {
        await plugin.onAfterProcess?.(ctx, result);
      }

      // 8. 缓存存储
      if (result.artifact) {
        this.cache.set(cacheKey, result.artifact);
      }

      return {
        success: true,
        artifact: result.artifact,
        fromCache: false,
        duration: Date.now() - startTime
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        duration: Date.now() - startTime
      };
    }
  }

  // ═══════════════════════════════════════════════════════
  // 内部方法
  // ═══════════════════════════════════════════════════════

  private generateCacheKey(intent: Intent, ctx: AgentContext): string {
    return `${ctx.channel}:${intent.type}:${JSON.stringify(intent.params)}`;
  }

  private createComplianceProcessor(): Processor {
    return {
      type: 'compliance',
      async execute(params, ctx) {
        // 这里会调用实际的合规检测逻辑
        return {
          artifact: {
            id: `compliance-${Date.now()}`,
            type: 'compliance-report',
            data: params
          } as Artifact
        };
      }
    };
  }

  private createReviewProcessor(): Processor {
    return {
      type: 'review',
      async execute(params, ctx) {
        return {
          artifact: {
            id: `review-${Date.now()}`,
            type: 'review-comments',
            data: params
          } as Artifact
        };
      }
    };
  }

  private createPricingProcessor(): Processor {
    return {
      type: 'pricing',
      async execute(params, ctx) {
        return {
          artifact: {
            id: `pricing-${Date.now()}`,
            type: 'pricing-calculator',
            data: params
          } as Artifact
        };
      }
    };
  }

  private createExportProcessor(): Processor {
    return {
      type: 'export',
      async execute(params, ctx) {
        return {
          artifact: {
            id: `export-${Date.now()}`,
            type: 'file-export',
            data: params
          } as Artifact
        };
      }
    };
  }
}

// ═══════════════════════════════════════════════════════
// 链式构建器
// ═══════════════════════════════════════════════════════

export class AnalyzeBuilder {
  private content: string;
  private agent: PolicyAgent;
  private options: {
    company?: string;
    category?: string;
    strictMode?: boolean;
  } = {};

  constructor(content: string, agent: PolicyAgent) {
    this.content = content;
    this.agent = agent;
  }

  withCompany(company: string): this {
    this.options.company = company;
    return this;
  }

  withCategory(category: 'all' | 'content' | 'data' | 'risk'): this {
    this.options.category = category;
    return this;
  }

  strict(): this {
    this.options.strictMode = true;
    return this;
  }

  async execute(): Promise<ProcessingResult> {
    const context: AgentContext = {
      user: { id: 'default', name: 'User', roles: [] },
      message: `/analyze ${this.content}`,
      channel: 'slack',
      timestamp: new Date(),
      artifacts: []
    };

    return this.agent.handle(context);
  }
}

export class ReviewBuilder {
  private reportId: string;
  private agent: PolicyAgent;
  private options: {
    filter?: string;
    status?: string;
  } = {};

  constructor(reportId: string, agent: PolicyAgent) {
    this.reportId = reportId;
    this.agent = agent;
  }

  withFilter(filter: string): this {
    this.options.filter = filter;
    return this;
  }

  withStatus(status: string): this {
    this.options.status = status;
    return this;
  }

  async execute(): Promise<ProcessingResult> {
    const context: AgentContext = {
      user: { id: 'default', name: 'User', roles: [] },
      message: `/review ${this.reportId}`,
      channel: 'slack',
      timestamp: new Date(),
      artifacts: []
    };

    return this.agent.handle(context);
  }
}

export class PricingBuilder {
  private params: PricingParams;
  private agent: PolicyAgent;

  constructor(params: PricingParams, agent: PolicyAgent) {
    this.params = params;
    this.agent = agent;
  }

  async execute(): Promise<ProcessingResult> {
    const context: AgentContext = {
      user: { id: 'default', name: 'User', roles: [] },
      message: `/price`,
      channel: 'slack',
      timestamp: new Date(),
      artifacts: []
    };

    return this.agent.handle(context);
  }
}

export class ExportBuilder {
  private format: ExportFormat;
  private agent: PolicyAgent;
  private options: {
    template?: string;
    filename?: string;
  } = {};

  constructor(format: ExportFormat, agent: PolicyAgent) {
    this.format = format;
    this.agent = agent;
  }

  withTemplate(template: string): this {
    this.options.template = template;
    return this;
  }

  withFilename(filename: string): this {
    this.options.filename = filename;
    return this;
  }

  async execute(): Promise<ProcessingResult> {
    const context: AgentContext = {
      user: { id: 'default', name: 'User', roles: [] },
      message: `/export ${this.format}`,
      channel: 'slack',
      timestamp: new Date(),
      artifacts: []
    };

    return this.agent.handle(context);
  }
}

// ═══════════════════════════════════════════════════════
// 依赖类型
// ═══════════════════════════════════════════════════════

export interface PricingParams {
  productType: 'saas' | 'one-time' | 'hybrid';
  targetUser: 'consumer' | 'smb' | 'enterprise';
  monthlyActiveUsers: number;
  fixedCost: number;
  variableCost: number;
}

export type ExportFormat = 'pdf' | 'docx' | 'pptx';

export interface ProcessingResult {
  success: boolean;
  artifact?: Artifact;
  fromCache?: boolean;
  duration: number;
  error?: string;
}

export interface Artifact {
  id: string;
  type: string;
  data: Record<string, any>;
}

export interface Plugin {
  install(agent: PolicyAgent): void;
  onBeforeProcess?(ctx: AgentContext): Promise<void>;
  onAfterProcess?(ctx: AgentContext, result: ProcessorResult): Promise<void>;
}

// 导出单例工厂
export function createAgent(options?: AgentOptions): PolicyAgent {
  return new PolicyAgent(options);
}
