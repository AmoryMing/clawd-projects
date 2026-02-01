/**
 * Core Module - 精巧架构核心模块导出
 */

export { PolicyAgent, createAgent } from './Agent';
export type {
  AgentContext,
  UserInfo,
  ChannelType,
  Intent,
  IntentType,
  AgentOptions,
  ProcessingResult,
  Artifact,
  Plugin
} from './Agent';

export { Processor, ProcessorRegistry } from './Processor';
export type { ProcessorResult } from './Processor';

export { SmartCache } from './Cache';
export type { CacheStats } from './Cache';

export { StateManager } from './State';
export type { StateEntry, StateResult, StateSnapshot } from './State';

// ═══════════════════════════════════════════════════════
// 便捷工厂函数
// ═══════════════════════════════════════════════════════

import { PolicyAgent, AgentOptions } from './Agent';
import { ProcessorRegistry } from './Processor';
import { SmartCache } from './Cache';
import { StateManager } from './State';

interface AgentInstance {
  agent: PolicyAgent;
  registry: ProcessorRegistry;
  cache: SmartCache<string, any>;
  state: StateManager;
}

/**
 * 创建完整的 Agent 实例
 */
export function createAgentInstance(options?: AgentOptions): AgentInstance {
  const agent = new PolicyAgent(options);
  const registry = new ProcessorRegistry();
  const cache = new SmartCache({ maxSize: 100 });
  const state = new StateManager();

  return { agent, registry, cache, state };
}

// 默认导出
export default {
  PolicyAgent,
  createAgent,
  ProcessorRegistry,
  SmartCache,
  StateManager,
  createAgentInstance
};
