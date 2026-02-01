/**
 * Pricing Calculator Skill - SaaS 定价计算器
 */

import { SkillHandler } from '@clawdbot/core';

interface PricingInput {
  productType: 'saas' | 'one-time' | 'hybrid';
  targetUser: 'consumer' | 'smb' | 'enterprise';
  monthlyActiveUsers: number;
  fixedCost: number;
  variableCost: number;
}

export default {
  name: 'pricing-calculator',
  description: 'SaaS 产品定价计算器',
  version: '1.0.0',

  async handle(input: PricingInput): Promise<any> {
    const {
      productType,
      targetUser,
      monthlyActiveUsers,
      fixedCost,
      variableCost
    } = input;

    // 1. 计算基础成本
    const totalCost = fixedCost + variableCost * monthlyActiveUsers;
    const costPerUser = totalCost / monthlyActiveUsers;

    // 2. 计算推荐定价
    const margins = {
      consumer: 0.3,
      smb: 0.5,
      enterprise: 0.7
    };

    const margin = margins[targetUser];
    const recommendedPrice = costPerUser / margin;
    const minPrice = costPerUser * 1.1;
    const maxPrice = recommendedPrice * 2;

    // 3. 成本分解
    const costBreakdown = {
      fixed: {
        amount: fixedCost,
        percent: (fixedCost / totalCost * 100).toFixed(1),
        items: ['服务器', '开发人员', '运营']
      },
      variable: {
        amount: variableCost * monthlyActiveUsers,
        percent: ((variableCost * monthlyActiveUsers) / totalCost * 100).toFixed(1),
        items: ['API 调用', '存储', '客服']
      }
    };

    // 4. 竞品对比（示例数据）
    const competitorComparison = [
      { name: '竞品 A', price: recommendedPrice * 0.9, features: 8 },
      { name: '竞品 B', price: recommendedPrice * 1.1, features: 9 },
      { name: '竞品 C', price: recommendedPrice, features: 7 }
    ];

    return {
      productType,
      targetUser,
      monthlyActiveUsers,
      recommendedPrice: Math.round(recommendedPrice),
      minPrice: Math.round(minPrice),
      maxPrice: Math.round(maxPrice),
      costBreakdown,
      competitorComparison,
      calculatedAt: new Date().toISOString()
    };
  }
} as SkillHandler;
