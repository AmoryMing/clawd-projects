/**
 * Product Integrator - 产品功能整合模块
 *
 * 功能：
 * - 产品配置
 * - 功能路由
 * - 权限管理
 * - 统一导出
 */

import React, { Suspense, lazy } from 'react';

// ═══════════════════════════════════════════════════════
// 产品配置
// ═══════════════════════════════════════════════════════

export interface ProductConfig {
  id: string;
  name: string;
  version: string;
  features: FeatureConfig[];
  permissions: PermissionConfig[];
  theme: ThemeConfig;
}

export interface FeatureConfig {
  id: string;
  name: string;
  path: string;
  component: React.ComponentType<any>;
  enabled: boolean;
  requiresAuth: boolean;
  icon?: string;
  description?: string;
}

export interface PermissionConfig {
  role: string;
  features: string[];
}

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  darkMode: boolean;
  compactMode: boolean;
}

// 默认产品配置
export const defaultProductConfig: ProductConfig = {
  id: 'policy-assistant',
  name: '政策助手',
  version: '1.0.0',
  features: [
    {
      id: 'compliance-check',
      name: '合规检测',
      path: '/compliance',
      component: lazy(() => import('../artifacts/components/Card')),
      enabled: true,
      requiresAuth: false,
      icon: '🔍',
      description: '检测企业报告合规性'
    },
    {
      id: 'risk-analysis',
      name: '风险分析',
      path: '/risk',
      component: lazy(() => import('../artifacts/components/Chart')),
      enabled: true,
      requiresAuth: false,
      icon: '⚠️',
      description: '分析企业风险等级'
    },
    {
      id: 'review-comments',
      name: '评论区',
      path: '/review',
      component: lazy(() => import('../artifacts/components/ReviewComments')),
      enabled: true,
      requiresAuth: false,
      icon: '💬',
      description: '管理评论和反馈'
    },
    {
      id: 'pricing-calculator',
      name: '定价计算',
      path: '/pricing',
      component: lazy(() => import('../artifacts/components/PricingCalculator')),
      enabled: true,
      requiresAuth: false,
      icon: '💰',
      description: '计算最优定价'
    },
    {
      id: 'policy-monitor',
      name: '政策监控',
      path: '/monitor',
      component: lazy(() => import('../services/PolicyMonitor')),
      enabled: true,
      requiresAuth: true,
      icon: '📊',
      description: '监控政策更新'
    },
    {
      id: 'file-export',
      name: '文件导出',
      path: '/export',
      component: lazy(() => import('../services/FileExporter')),
      enabled: true,
      requiresAuth: false,
      icon: '📤',
      description: '导出报告文件'
    }
  ],
  permissions: [
    { role: 'guest', features: ['compliance-check', 'risk-analysis', 'pricing-calculator'] },
    { role: 'user', features: ['compliance-check', 'risk-analysis', 'review-comments', 'pricing-calculator', 'file-export'] },
    { role: 'admin', features: ['compliance-check', 'risk-analysis', 'review-comments', 'pricing-calculator', 'policy-monitor', 'file-export'] }
  ],
  theme: {
    primaryColor: '#3b82f6',
    accentColor: '#10b981',
    darkMode: false,
    compactMode: false
  }
};

// ═══════════════════════════════════════════════════════
// 产品路由器
// ═══════════════════════════════════════════════════════

export class ProductRouter {
  private config: ProductConfig;
  private currentPath: string = '/';

  constructor(config: ProductConfig = defaultProductConfig) {
    this.config = config;
  }

  // 获取所有启用的功能
  getEnabledFeatures(): FeatureConfig[] {
    return this.config.features.filter(f => f.enabled);
  }

  // 根据路径获取功能
  getFeatureByPath(path: string): FeatureConfig | undefined {
    return this.config.features.find(f => f.path === path);
  }

  // 根据 ID 获取功能
  getFeatureById(id: string): FeatureConfig | undefined {
    return this.config.features.find(f => f.id === id);
  }

  // 导航到功能
  navigate(path: string): void {
    this.currentPath = path;
    // 这里应该更新浏览器 URL
    window.history.pushState({}, '', path);
  }

  // 检查权限
  canAccess(featureId: string, userRole: string = 'guest'): boolean {
    const permission = this.config.permissions.find(p => p.role === userRole);
    if (!permission) return false;

    const feature = this.getFeatureById(featureId);
    if (!feature) return false;

    return permission.features.includes(featureId);
  }

  // 获取用户可访问的功能列表
  getAccessibleFeatures(userRole: string = 'guest'): FeatureConfig[] {
    const permission = this.config.permissions.find(p => p.role === userRole);
    if (!permission) return [];

    return this.config.features.filter(
      f => f.enabled && permission.features.includes(f.id)
    );
  }

  // 获取配置
  getConfig(): ProductConfig {
    return this.config;
  }
}

// ═══════════════════════════════════════════════════════
// 统一产品组件
// ═══════════════════════════════════════════════════════

interface ProductAppProps {
  config?: ProductConfig;
  userRole?: string;
  onFeatureChange?: (feature: FeatureConfig) => void;
}

export function ProductApp({
  config = defaultProductConfig,
  userRole = 'guest',
  onFeatureChange
}: ProductAppProps) {
  const router = new ProductRouter(config);
  const [currentFeature, setCurrentFeature] = React.useState<FeatureConfig | null>(null);

  const accessibleFeatures = router.getAccessibleFeatures(userRole);

  const handleFeatureSelect = (feature: FeatureConfig) => {
    setCurrentFeature(feature);
    router.navigate(feature.path);
    onFeatureChange?.(feature);
  };

  return (
    <div className="product-app">
      {/* 功能导航 */}
      <nav className="feature-nav">
        {accessibleFeatures.map(feature => (
          <button
            key={feature.id}
            className={`feature-nav-item ${currentFeature?.id === feature.id ? 'active' : ''}`}
            onClick={() => handleFeatureSelect(feature)}
          >
            <span className="feature-icon">{feature.icon}</span>
            <span className="feature-name">{feature.name}</span>
          </button>
        ))}
      </nav>

      {/* 主内容区 */}
      <main className="feature-content">
        {currentFeature ? (
          <Suspense fallback={<div className="loading">加载中...</div>}>
            <currentFeature.component />
          </Suspense>
        ) : (
          <div className="empty-state">
            <h2>欢迎使用 {config.name}</h2>
            <p>选择上方功能开始使用</p>
          </div>
        )}
      </main>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 产品使用示例数据
// ═══════════════════════════════════════════════════════

export const usageExamples = {
  // 合规检测示例
  complianceCheck: {
    input: {
      company: '示例科技公司',
      report: '该公司注册资本1亿元，主要从事软件开发业务。'
    },
    output: {
      riskScore: 45,
      riskLevel: 'medium',
      violations: [
        {
          code: 'CONTENT_ACCURACY',
          description: '建议核实注册资本信息',
          law: '《企业信息公示暂行条例》',
          severity: 'medium'
        }
      ],
      suggestions: [
        '建议核实注册资本的实缴情况',
        '补充公司经营范围详情'
      ]
    }
  },

  // 风险分析示例
  riskAnalysis: {
    input: {
      company: '示例公司',
      industry: '互联网',
      employees: 500,
      revenue: 10000000
    },
    output: {
      overallRisk: 35,
      marketRisk: 40,
      operationalRisk: 30,
      financialRisk: 25,
      complianceRisk: 45
    }
  },

  // 定价计算示例
  pricingCalculator: {
    input: {
      productType: 'saas',
      targetUser: 'enterprise',
      monthlyActiveUsers: 1000,
      fixedCost: 10000,
      variableCost: 5
    },
    output: {
      recommendedPrice: 25,
      minPrice: 15,
      maxPrice: 50,
      monthlyRevenue: 25000,
      breakEvenMonths: 8
    }
  }
};

// ═══════════════════════════════════════════════════════
// 快速启动函数
// ═══════════════════════════════════════════════════════

export function createProduct(config?: Partial<ProductConfig>): ProductConfig {
  return {
    ...defaultProductConfig,
    ...config,
    features: config?.features || defaultProductConfig.features,
    permissions: config?.permissions || defaultProductConfig.permissions,
    theme: config?.theme || defaultProductConfig.theme
  };
}

export function createRouter(config?: ProductConfig): ProductRouter {
  return new ProductRouter(config);
}

// 初始化产品
export async function initializeProduct(config?: Partial<ProductConfig>): Promise<{
  config: ProductConfig;
  router: ProductRouter;
}> {
  const productConfig = createProduct(config);
  const router = createRouter(productConfig);

  console.log('[Product] 产品初始化完成:', productConfig.name, productConfig.version);

  return { config: productConfig, router };
}

export default {
  ProductConfig: defaultProductConfig,
  ProductRouter,
  ProductApp,
  initializeProduct,
  createProduct,
  createRouter,
  usageExamples
};
