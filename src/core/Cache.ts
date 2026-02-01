/**
 * SmartCache - 智能缓存，支持 LRU 和 TTL
 */

export interface CacheOptions {
  maxSize?: number;
  ttlMs?: number; // Time to live in milliseconds
  prefix?: string;
}

export interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  accessCount: number;
  lastAccessed: number;
}

export class SmartCache<K extends string, V> {
  private cache: Map<K, CacheEntry<V>> = new Map();
  private options: Required<CacheOptions>;

  constructor(options: CacheOptions = {}) {
    this.options = {
      maxSize: 100,
      ttlMs: 5 * 60 * 1000, // 5 minutes default
      prefix: '',
      ...options
    };
  }

  /**
   * 设置缓存
   */
  set(key: K, value: V): void {
    // LRU 淘汰：如果超出最大容量，删除最久未使用的
    if (this.cache.size >= this.options.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.options.ttlMs,
      accessCount: 0,
      lastAccessed: Date.now()
    });
  }

  /**
   * 获取缓存
   */
  get(key: K): V | undefined {
    const entry = this.cache.get(key);
    if (!entry) return undefined;

    // 检查是否过期
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return undefined;
    }

    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.value;
  }

  /**
   * 检查是否存在
   */
  has(key: K): boolean {
    return this.get(key) !== undefined;
  }

  /**
   * 删除缓存
   */
  delete(key: K): boolean {
    return this.cache.delete(key);
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取统计信息
   */
  getStats(): CacheStats {
    return {
      size: this.cache.size,
      maxSize: this.options.maxSize,
      hitRate: this.calculateHitRate(),
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * LRU 淘汰策略
   */
  private evictLRU(): void {
    let lruKey: K | null = null;
    let lruAccessCount = Infinity;
    let lruTime = Infinity;

    for (const [key, entry] of this.cache) {
      // 优先淘汰访问次数少的
      if (entry.accessCount < lruAccessCount) {
        lruKey = key;
        lruAccessCount = entry.accessCount;
        lruTime = entry.lastAccessed;
      } else if (entry.accessCount === lruAccessCount) {
        // 访问次数相同时，淘汰最久未访问的
        if (entry.lastAccessed < lruTime) {
          lruKey = key;
          lruTime = entry.lastAccessed;
        }
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * 计算命中率
   */
  private hitCount = 0;
  private missCount = 0;

  private calculateHitRate(): number {
    const total = this.hitCount + this.missCount;
    return total > 0 ? this.hitCount / total : 0;
  }

  /**
   * 预估内存使用
   */
  private estimateMemoryUsage(): number {
    // 粗略估算
    let bytes = 0;
    for (const [key, entry] of this.cache) {
      bytes += key.length * 2; // UTF-16
      bytes += JSON.stringify(entry.value).length * 2;
    }
    return bytes;
  }
}

export interface CacheStats {
  size: number;
  maxSize: number;
  hitRate: number;
  memoryUsage: number;
}
