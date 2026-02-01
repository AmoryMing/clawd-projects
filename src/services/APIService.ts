/**
 * API Service Layer - API 服务层
 *
 * 功能：
 * - API 客户端封装
 * - 请求/响应拦截
 * - 错误处理
 * - 重试机制
 */

import { requestCache } from './PerformanceOptimizer';

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface APIConfig {
  baseURL: string;
  timeout: number;
  retries: number;
  headers: Record<string, string>;
}

export interface RequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  data?: any;
  params?: Record<string, any>;
  headers?: Record<string, string>;
  useCache?: boolean;
  cacheTTL?: number;
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: APIError;
  meta?: ResponseMeta;
}

export interface APIError {
  code: string;
  message: string;
  details?: any;
}

export interface ResponseMeta {
  timestamp: string;
  requestId: string;
  version: string;
}

// ═══════════════════════════════════════════════════════
// API 客户端
// ═══════════════════════════════════════════════════════

export class APIClient {
  private config: APIConfig;
  private requestId: number = 0;

  constructor(config: Partial<APIConfig> = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 30000,
      retries: config.retries || 3,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers
      }
    };
  }

  /**
   * 发起请求
   */
  async request<T = any>(options: RequestOptions): Promise<APIResponse<T>> {
    const { method, path, data, params, headers, useCache, cacheTTL } = options;

    // 构建 URL
    const url = this.buildURL(path, params);

    // 检查缓存
    if (method === 'GET' && useCache) {
      const cacheKey = `${method}:${url}`;
      try {
        const cached = await requestCache.getOrFetch(cacheKey, () =>
          this.fetch<T>(method, url, data, headers)
        , cacheTTL);
        return cached;
      } catch (e) {
        // 缓存失败，继续请求
      }
    }

    return this.fetchWithRetry(method, url, data, headers);
  }

  /**
   * 带重试的请求
   */
  private async fetchWithRetry<T>(
    method: RequestOptions['method'],
    url: string,
    data?: any,
    headers?: Record<string, string>,
    attempt: number = 1
  ): Promise<APIResponse<T>> {
    try {
      return await this.fetch<T>(method, url, data, headers);
    } catch (error) {
      if (attempt < this.config.retries && this.isRetryable(error)) {
        // 指数退避
        const delay = Math.pow(2, attempt) * 1000;
        await this.sleep(delay);
        return this.fetchWithRetry(method, url, data, headers, attempt + 1);
      }
      throw error;
    }
  }

  /**
   * 实际请求
   */
  private async fetch<T>(
    method: RequestOptions['method'],
    url: string,
    data?: any,
    headers?: Record<string, string>
  ): Promise<APIResponse<T>> {
    const requestId = `req_${++this.requestId}_${Date.now()}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          ...this.config.headers,
          'X-Request-ID': requestId,
          ...headers
        },
        body: data ? JSON.stringify(data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeout);

      // 解析响应
      const result = await response.json();

      // 检查业务错误
      if (!result.success) {
        throw {
          code: result.error?.code || 'UNKNOWN_ERROR',
          message: result.error?.message || '未知错误',
          details: result.error?.details
        };
      }

      return result;
    } catch (error) {
      clearTimeout(controller);

      // 处理错误
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw {
            code: 'TIMEOUT',
            message: `请求超时 (${this.config.timeout}ms)`,
            details: { requestId }
          };
        }
        throw {
          code: 'NETWORK_ERROR',
          message: error.message,
          details: { requestId }
        };
      }

      throw error;
    }
  }

  /**
   * 构建 URL
   */
  private buildURL(path: string, params?: Record<string, any>): string {
    const url = new URL(path, window.location.origin);
    url.pathname = `${this.config.baseURL}${path}`;

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  /**
   * 检查是否可重试
   */
  private isRetryable(error: any): boolean {
    // 网络错误可重试
    if (error.code === 'NETWORK_ERROR') return true;

    // 5xx 错误可重试
    if (error.code >= 500 && error.code < 600) return true;

    // 超时可重试
    if (error.code === 'TIMEOUT') return true;

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // ═══════════════════════════════════════════════════════
  // 便捷方法
  // ═══════════════════════════════════════════════════════

  get<T = any>(path: string, params?: Record<string, any>, options?: Partial<RequestOptions>>) {
    return this.request<T>({
      method: 'GET',
      path,
      params,
      ...options
    });
  }

  post<T = any>(path: string, data?: any, options?: Partial<RequestOptions>>) {
    return this.request<T>({
      method: 'POST',
      path,
      data,
      ...options
    });
  }

  put<T = any>(path: string, data?: any, options?: Partial<RequestOptions>>) {
    return this.request<T>({
      method: 'PUT',
      path,
      data,
      ...options
    });
  }

  delete<T = any>(path: string, options?: Partial<RequestOptions>>) {
    return this.request<T>({
      method: 'DELETE',
      path,
      ...options
    });
  }

  patch<T = any>(path: string, data?: any, options?: Partial<RequestOptions>>) {
    return this.request<T>({
      method: 'PATCH',
      path,
      data,
      ...options
    });
  }
}

// ═══════════════════════════════════════════════════════
// API 服务定义
// ═══════════════════════════════════════════════════════

// 合规检测服务
export class ComplianceService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async analyze(content: string, options?: { company?: string; category?: string }) {
    return this.client.post('/compliance/analyze', {
      content,
      ...options
    });
  }

  async getRules(category?: string) {
    return this.client.get('/compliance/rules', { category });
  }

  async checkReport(reportId: string) {
    return this.client.get(`/compliance/reports/${reportId}`);
  }
}

// 政策服务
export class PolicyService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async search(query: string, options?: { category?: string; region?: string }) {
    return this.client.get('/policies/search', { q: query, ...options });
  }

  async getDetail(policyId: string) {
    return this.client.get(`/policies/${policyId}`);
  }

  async getUpdates(since?: string) {
    return this.client.get('/policies/updates', { since });
  }
}

// 评论服务
export class ReviewService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async listComments(reportId: string, options?: { status?: string; type?: string }) {
    return this.client.get(`/reviews/${reportId}/comments`, options);
  }

  async addComment(reportId: string, data: { type: string; content: string; position?: any }) {
    return this.client.post(`/reviews/${reportId}/comments`, data);
  }

  async resolveComment(commentId: string) {
    return this.client.post(`/reviews/comments/${commentId}/resolve`);
  }

  async addReply(commentId: string, content: string) {
    return this.client.post(`/reviews/comments/${commentId}/replies`, { content });
  }
}

// 定价服务
export class PricingService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async calculate(params: {
    productType: string;
    targetUser: string;
    monthlyActiveUsers: number;
    fixedCost: number;
    variableCost: number;
  }) {
    return this.client.post('/pricing/calculate', params);
  }

  async getCompetitors() {
    return this.client.get('/pricing/competitors');
  }
}

// 文件导出服务
export class ExportService {
  private client: APIClient;

  constructor(client: APIClient) {
    this.client = client;
  }

  async export(data: any, format: string, template: string) {
    return this.client.post('/export', { data, format, template });
  }

  async getHistory(userId: string) {
    return this.client.get(`/export/history/${userId}`);
  }

  async download(fileId: string) {
    return this.client.get(`/export/download/${fileId}`);
  }
}

// ═══════════════════════════════════════════════════════
// 服务工厂
// ═══════════════════════════════════════════════════════

export function createAPIServices(config?: Partial<APIConfig>): {
  client: APIClient;
  compliance: ComplianceService;
  policy: PolicyService;
  review: ReviewService;
  pricing: PricingService;
  export: ExportService;
} {
  const client = new APIClient(config);

  return {
    client,
    compliance: new ComplianceService(client),
    policy: new PolicyService(client),
    review: new ReviewService(client),
    pricing: new PricingService(client),
    export: new ExportService(client)
  };
}

// ═══════════════════════════════════════════════════════
// 全局实例
// ═══════════════════════════════════════════════════════

export const apiServices = createAPIServices();

export default {
  APIClient,
  ComplianceService,
  PolicyService,
  ReviewService,
  PricingService,
  ExportService,
  createAPIServices,
  apiServices
};
