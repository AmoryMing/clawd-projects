/**
 * 测试用例 - PolicyAgent Core
 */

import { PolicyAgent, createAgent } from './core';
import { SmartCache } from './Cache';
import { StateManager } from './State';

describe('PolicyAgent', () => {
  let agent: PolicyAgent;

  beforeEach(() => {
    agent = createAgent({
      strictMode: false,
      enableHistory: true
    });
  });

  describe('意图识别', () => {
    it('应该识别 analyze 意图', async () => {
      const result = await agent.handle({
        user: { id: 'test', name: 'Test', roles: [] },
        message: '/analyze 企业报告内容',
        channel: 'slack',
        timestamp: new Date(),
        artifacts: []
      });

      expect(result.success).toBe(true);
    });

    it('应该识别 review 意图', async () => {
      const result = await agent.handle({
        user: { id: 'test', name: 'Test', roles: [] },
        message: '/review report-123',
        channel: 'slack',
        timestamp: new Date(),
        artifacts: []
      });

      expect(result.success).toBe(true);
    });

    it('应该识别 pricing 意图', async () => {
      const result = await agent.handle({
        user: { id: 'test', name: 'Test', roles: [] },
        message: '/price saas 100 5000 10',
        channel: 'slack',
        timestamp: new Date(),
        artifacts: []
      });

      expect(result.success).toBe(true);
    });

    it('应该识别 export 意图', async () => {
      const result = await agent.handle({
        user: { id: 'test', name: 'Test', roles: [] },
        message: '/export pdf',
        channel: 'slack',
        timestamp: new Date(),
        artifacts: []
      });

      expect(result.success).toBe(true);
    });
  });

  describe('链式调用', () => {
    it('应该支持 analyze 链式调用', async () => {
      const result = await agent
        .analyze('测试内容')
        .withCompany('测试公司')
        .withCategory('all')
        .execute();

      expect(result.success).toBe(true);
      expect(result.duration).toBeGreaterThan(0);
    });
  });
});

describe('SmartCache', () => {
  let cache: SmartCache<string, string>;

  beforeEach(() => {
    cache = new SmartCache({ maxSize: 3, ttlMs: 1000 });
  });

  it('应该支持基本的 get/set', () => {
    cache.set('key1', 'value1');
    expect(cache.get('key1')).toBe('value1');
  });

  it('应该支持 has 检查', () => {
    cache.set('key1', 'value1');
    expect(cache.has('key1')).toBe(true);
    expect(cache.has('key2')).toBe(false);
  });

  it('应该支持 LRU 淘汰', () => {
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.set('key4', 'value4'); // 触发淘汰

    expect(cache.has('key1')).toBe(false); // 被淘汰
    expect(cache.has('key2')).toBe(true);
    expect(cache.has('key4')).toBe(true);
  });

  it('应该支持 TTL 过期', async () => {
    cache = new SmartCache({ maxSize: 10, ttlMs: 100 });
    cache.set('key1', 'value1');

    expect(cache.has('key1')).toBe(true);

    // 等待过期
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(cache.has('key1')).toBe(false);
  });

  it('应该返回统计数据', () => {
    cache.set('key1', 'value1');
    cache.get('key1');
    cache.get('key1');

    const stats = cache.getStats();
    expect(stats.size).toBe(1);
    expect(stats.maxSize).toBe(3);
  });
});

describe('StateManager', () => {
  let state: StateManager;

  beforeEach(() => {
    state = new StateManager();
  });

  it('应该记录状态', () => {
    const entry = state.record({
      intent: { type: 'analyze', params: {}, confidence: 0.9 },
      result: { success: true },
      duration: 100,
      timestamp: new Date()
    });

    expect(entry.id).toBeDefined();
    expect(state.size()).toBe(1);
  });

  it('应该支持撤销', () => {
    state.record({ intent: { type: 'analyze', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });
    state.record({ intent: { type: 'review', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });

    expect(state.size()).toBe(2);

    const undone = state.undo();
    expect(undone).not.toBeNull();
    expect(state.size()).toBe(1);
  });

  it('应该支持重做', () => {
    state.record({ intent: { type: 'analyze', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });
    state.record({ intent: { type: 'review', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });

    state.undo();
    const redone = state.redo();

    expect(redone).not.toBeNull();
    expect(state.size()).toBe(2);
  });

  it('应该支持按类型搜索', () => {
    state.record({ intent: { type: 'analyze', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });
    state.record({ intent: { type: 'review', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });
    state.record({ intent: { type: 'analyze', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });

    const analyzeHistory = state.searchByIntentType('analyze');
    expect(analyzeHistory.length).toBe(2);
  });

  it('应该返回最近的记录', () => {
    for (let i = 0; i < 5; i++) {
      state.record({ intent: { type: 'analyze', params: {}, confidence: 0.9 }, result: { success: true }, duration: 100 });
    }

    const recent = state.recent(3);
    expect(recent.length).toBe(3);
  });
});
