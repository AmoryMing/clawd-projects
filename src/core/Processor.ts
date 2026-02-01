/**
 * Processor Interface - 可插拔处理器接口
 */

import { AgentContext, ProcessorResult } from './Agent';

export interface Processor {
  type: string;
  version?: string;
  execute(params: Record<string, any>, ctx: AgentContext): Promise<ProcessorResult>;
  validate?(params: Record<string, any>): boolean;
}

// ═══════════════════════════════════════════════════════
// 处理器注册表
// ═══════════════════════════════════════════════════════

export class ProcessorRegistry {
  private processors: Map<string, Processor> = new Map();

  register(processor: Processor): void {
    const key = `${processor.type}@${processor.version || 'latest'}`;
    this.processors.set(key, processor);
  }

  get(type: string, version?: string): Processor | undefined {
    const key = `${type}@${version || 'latest'}`;
    return this.processors.get(key);
  }

  getAll(): Processor[] {
    return Array.from(this.processors.values());
  }

  has(type: string, version?: string): boolean {
    const key = `${type}@${version || 'latest'}`;
    return this.processors.has(key);
  }
}

export type { ProcessorResult } from './Agent';
