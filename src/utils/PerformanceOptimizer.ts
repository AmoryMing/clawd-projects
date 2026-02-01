/**
 * Performance Optimizer - 性能优化模块
 *
 * 功能：
 * - 代码分割与懒加载
 * - 缓存策略
 * - 渲染优化
 * - 资源压缩
 */

import { lazy, Suspense, memo, useMemo, useCallback, useRef, useEffect } from 'react';

// ═══════════════════════════════════════════════════════
// 1. 懒加载组件
// ═══════════════════════════════════════════════════════

// 动态导入组件
const LazyChart = lazy(() => import('../artifacts/components/Chart'));
const LazyTable = lazy(() => import('../artifacts/components/Table'));
const LazyCard = lazy(() => import('../artifacts/components/Card'));

// 加载占位符
export function LoadingPlaceholder({ message = '加载中...' }: { message?: string }) {
  return (
    <div className="loading-placeholder">
      <div className="loading-spinner" />
      <p>{message}</p>
    </div>
  );
}

// 懒加载包装器
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function LazyWrapper(props: P) {
    return (
      <Suspense fallback={fallback || <LoadingPlaceholder />}>
        <Component {...props} />
      </Suspense>
    );
  };
}

// ═══════════════════════════════════════════════════════
// 2. React.memo 优化
// ═══════════════════════════════════════════════════════

// 纯组件示例
const PureCard = memo(function PureCard({
  title,
  content,
  onClick
}: {
  title: string;
  content: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div className="pure-card" onClick={onClick}>
      <h4>{title}</h4>
      <div>{content}</div>
    </div>
  );
});

// 复杂组件使用 useMemo
interface DataDisplayProps {
  data: any[];
  filters: Record<string, any>;
  sortBy: string;
}

function DataDisplay({ data, filters, sortBy }: DataDisplayProps) {
  // 复杂计算使用 useMemo
  const processedData = useMemo(() => {
    let result = [...data];

    // 应用过滤
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(item => item[key] === value);
      }
    });

    // 排序
    result.sort((a, b) => {
      if (typeof a[sortBy] === 'number') {
        return a[sortBy] - b[sortBy];
      }
      return String(a[sortBy]).localeCompare(String(b[sortBy]));
    });

    return result;
  }, [data, filters, sortBy]);

  return (
    <div className="data-display">
      {processedData.map(item => (
        <PureCard
          key={item.id}
          title={item.name}
          content={item.description}
        />
      ))}
    </div>
  );
}

// 使用 useCallback 缓存回调
function useCachedCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: any[]
): T {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback, ...deps]);

  return useCallback(((...args: any[]) => {
    return callbackRef.current(...args);
  }) as T, deps);
}

// ═══════════════════════════════════════════════════════
// 3. 虚拟列表（大列表优化）
// ═══════════════════════════════════════════════════════

interface VirtualListProps {
  items: any[];
  itemHeight: number;
  visibleCount: number;
  renderItem: (item: any, index: number) => React.ReactNode;
}

function VirtualList({
  items,
  itemHeight,
  visibleCount,
  renderItem
}: VirtualListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalHeight = items.length * itemHeight;

  // 计算可见范围
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    items.length - 1,
    startIndex + visibleCount + 2
  );

  // 渲染可见项
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          height: itemHeight,
          width: '100%'
        }}
      >
        {renderItem(items[i], i)}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="virtual-list"
      onScroll={e => setScrollTop(e.currentTarget.scrollTop)}
      style={{ height: visibleCount * itemHeight, overflowY: 'auto' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 4. 图片优化
// ═══════════════════════════════════════════════════════

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  lazy?: boolean;
  placeholder?: string;
}

function OptimizedImage({
  src,
  alt,
  width,
  height,
  lazy = true,
  placeholder
}: OptimizedImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // Intersection Observer 实现懒加载
  useEffect(() => {
    if (!lazy) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && imgRef.current) {
            imgRef.current.src = src;
            observer.unobserve(imgRef.current);
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src, lazy]);

  return (
    <div
      className="optimized-image"
      style={{ width, height, background: placeholder || '#f0f0f0' }}
    >
      <img
        ref={imgRef}
        alt={alt}
        style={{
          opacity: loaded ? 1 : 0,
          transition: 'opacity 0.3s ease'
        }}
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
      {error && (
        <span className="error-placeholder">图片加载失败</span>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 5. 请求缓存
// ═══════════════════════════════════════════════════════

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class RequestCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5分钟

  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const entry = this.cache.get(key);

    if (entry && Date.now() - entry.timestamp < (ttl || this.defaultTTL)) {
      return entry.data;
    }

    const data = await fetcher();
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL
    });

    return data;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    };
  }
}

// 全局缓存实例
export const requestCache = new RequestCache();

// ═══════════════════════════════════════════════════════
// 6. Bundle 优化工具
// ═══════════════════════════════════════════════════════

interface BundleAnalyzerResult {
  size: number;
  chunks: { name: string; size: number }[];
  dependencies: string[];
}

function analyzeBundle(bundlePath: string): BundleAnalyzerResult {
  // 这里应该实现实际的 bundle 分析
  // 简化版返回示例数据
  return {
    size: 150000,
    chunks: [
      { name: 'main', size: 50000 },
      { name: 'vendor', size: 80000 },
      { name: 'runtime', size: 20000 }
    ],
    dependencies: [
      'react',
      'react-dom',
      'jspdf',
      'docx'
    ]
  };
}

// 建议的代码分割点
function getSuggestedSplitPoints(result: BundleAnalyzerResult): string[] {
  const suggestions: string[] = [];

  // 大的 chunk 应该分割
  result.chunks.forEach(chunk => {
    if (chunk.size > 50000) {
      suggestions.push(`建议分割 ${chunk.name} (${chunk.size} bytes)`);
    }
  });

  // 频繁更新的依赖应该分离
  result.dependencies.forEach(dep => {
    if (['jspdf', 'docx'].includes(dep)) {
      suggestions.push(`考虑动态导入 ${dep} (不常更新)`);
    }
  });

  return suggestions;
}

// ═══════════════════════════════════════════════════════
// 7. 性能监控
// ═══════════════════════════════════════════════════════

interface PerformanceMetrics {
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics | null = null;
  private observers: PerformanceObserver[] = [];

  start(): void {
    // 获取基础指标
    if (window.performance) {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        this.metrics = {
          ttfb: navigation.responseStart - navigation.requestStart,
          fcp: 0, // 需要专门的 observer
          lcp: 0,
          fid: 0,
          cls: 0
        };
      }
    }

    // 监听 LCP
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        if (this.metrics) {
          this.metrics.lcp = lastEntry.startTime;
        }
      });
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      this.observers.push(lcpObserver);
    } catch (e) {
      console.warn('LCP observer not supported');
    }

    // 监听 FID
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0 && this.metrics) {
          this.metrics.fid = (entries[0] as any).processingStart - entries[0].startTime;
        }
      });
      fidObserver.observe({ type: 'first-input', buffered: true });
      this.observers.push(fidObserver);
    } catch (e) {
      console.warn('FID observer not supported');
    }

    // 监听 CLS
    try {
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        if (this.metrics) {
          this.metrics.cls = clsValue;
        }
      });
      clsObserver.observe({ type: 'layout-shift', buffered: true });
      this.observers.push(clsObserver);
    } catch (e) {
      console.warn('CLS observer not supported');
    }
  }

  stop(): void {
    this.observers.forEach(obs => obs.disconnect());
    this.observers = [];
  }

  getMetrics(): PerformanceMetrics | null {
    return this.metrics;
  }

  getScore(): number {
    if (!this.metrics) return 0;

    // 简化的性能评分
    const scores = {
      fcp: this.metrics.fcp < 1800 ? 100 : this.metrics.fcp < 3000 ? 50 : 0,
      lcp: this.metrics.lcp < 2500 ? 100 : this.metrics.lcp < 4000 ? 50 : 0,
      fid: this.metrics.fid < 100 ? 100 : this.metrics.fid < 300 ? 50 : 0,
      cls: this.metrics.cls < 0.1 ? 100 : this.metrics.cls < 0.25 ? 50 : 0
    };

    return Math.round(
      (scores.fcp + scores.lcp + scores.fid + scores.cls) / 4
    );
  }

  getGrade(): 'A' | 'B' | 'C' | 'D' | 'F' {
    const score = this.getScore();
    if (score >= 90) return 'A';
    if (score >= 70) return 'B';
    if (score >= 50) return 'C';
    if (score >= 30) return 'D';
    return 'F';
  }
}

export const performanceMonitor = new PerformanceMonitor();

// ═══════════════════════════════════════════════════════
// 8. 使用示例
// ═══════════════════════════════════════════════════════

/*
// 在应用入口启动性能监控
performanceMonitor.start();

// 定期输出性能报告
setInterval(() => {
  const metrics = performanceMonitor.getMetrics();
  const grade = performanceMonitor.getGrade();
  console.log(`性能评分: ${grade} (${performanceMonitor.getScore()}分)`, metrics);
}, 60000);

// 缓存 API 请求
const data = await requestCache.getOrFetch(
  'policy-data-123',
  () => fetchPolicyData('123'),
  300000 // 5分钟缓存
);

// 使用虚拟列表渲染大列表
<VirtualList
  items={largeArray}
  itemHeight={60}
  visibleCount={10}
  renderItem={(item, index) => <div>{item.name}</div>}
/>
*/

export default {
  withLazyLoading,
  LoadingPlaceholder,
  VirtualList,
  OptimizedImage,
  requestCache,
  performanceMonitor,
  analyzeBundle,
  getSuggestedSplitPoints
};
