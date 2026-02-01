/**
 * Pricing Calculator Artifact - 定价计算器
 *
 * 功能：
 * - SaaS/一次性/混合定价计算
 * - 成本分解分析
 * - 竞品对比
 * - 动态调参
 */

import React, { useState, useMemo, useEffect } from 'react';

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface PricingParams {
  productType: 'saas' | 'one-time' | 'hybrid';
  targetUser: 'consumer' | 'smb' | 'enterprise';
  monthlyActiveUsers: number;
  fixedCost: number;
  variableCost: number;
  growthRate?: number;        // 月增长率
  churnRate?: number;         // 月流失率
  targetMargin?: number;      // 目标利润率
}

export interface PricingResult {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  breakEvenMonths: number;
  costBreakdown: CostBreakdown;
  competitorComparison: CompetitorData[];
  unitEconomics: UnitEconomics;
}

export interface CostBreakdown {
  fixed: {
    amount: number;
    percent: number;
    items: { name: string; amount: number }[];
  };
  variable: {
    amount: number;
    percent: number;
    items: { name: string; amount: number }[];
  };
  total: number;
}

export interface CompetitorData {
  name: string;
  price: number;
  features: number;
  marketShare: number;
  rating: number;
}

export interface UnitEconomics {
  cac: number;              // 客户获取成本
  ltv: number;              // 客户生命周期价值
  ltvCacRatio: number;      // LTV/CAC 比率
  paybackMonths: number;    // 回本周期
  grossMargin: number;      // 毛利率
}

// ═══════════════════════════════════════════════════════
// 主组件：定价计算器
// ═══════════════════════════════════════════════════════

interface PricingCalculatorProps {
  initialParams?: Partial<PricingParams>;
  onCalculate?: (params: PricingParams, result: PricingResult) => void;
  onExport?: (result: PricingResult) => void;
}

export function PricingCalculator({
  initialParams,
  onCalculate,
  onExport
}: PricingCalculatorProps) {
  // 参数状态
  const [params, setParams] = useState<PricingParams>({
    productType: 'saas',
    targetUser: 'enterprise',
    monthlyActiveUsers: 100,
    fixedCost: 5000,
    variableCost: 10,
    growthRate: 5,
    churnRate: 2,
    targetMargin: 50,
    ...initialParams
  });

  // 计算结果
  const [result, setResult] = useState<PricingResult | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'comparison' | 'analysis'>('calculator');

  // 计算
  useEffect(() => {
    const calculated = calculatePricing(params);
    setResult(calculated);
    onCalculate?.(params, calculated);
  }, [params]);

  // 监听参数变化
  const updateParam = <K extends keyof PricingParams>(key: K, value: PricingParams[K]) => {
    setParams(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="pricing-calculator">
      {/* 头部 */}
      <header className="calculator-header">
        <h3>💰 定价计算器</h3>
        <div className="product-type-selector">
          <button
            className={params.productType === 'saas' ? 'active' : ''}
            onClick={() => updateParam('productType', 'saas')}
          >
            SaaS
          </button>
          <button
            className={params.productType === 'one-time' ? 'active' : ''}
            onClick={() => updateParam('productType', 'one-time')}
          >
            一次性
          </button>
          <button
            className={params.productType === 'hybrid' ? 'active' : ''}
            onClick={() => updateParam('productType', 'hybrid')}
          >
            混合
          </button>
        </div>
      </header>

      {/* Tab 导航 */}
      <nav className="tabs">
        <button
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          计算器
        </button>
        <button
          className={activeTab === 'comparison' ? 'active' : ''}
          onClick={() => setActiveTab('comparison')}
        >
          竞品对比
        </button>
        <button
          className={activeTab === 'analysis' ? 'active' : ''}
          onClick={() => setActiveTab('analysis')}
        >
          单元经济
        </button>
      </nav>

      {/* 内容区 */}
      <div className="calculator-content">
        {activeTab === 'calculator' && (
          <div className="calculator-panel">
            {/* 参数输入 */}
            <div className="params-section">
              <h4>参数设置</h4>

              <div className="param-grid">
                <ParamInput
                  label="目标用户"
                  value={params.targetUser}
                  options={[
                    { value: 'consumer', label: '消费者' },
                    { value: 'smb', label: '中小企业' },
                    { value: 'enterprise', label: '大企业' }
                  ]}
                  onChange={v => updateParam('targetUser', v)}
                />

                <ParamNumber
                  label="月活用户"
                  value={params.monthlyActiveUsers}
                  min={1}
                  max={1000000}
                  step={10}
                  onChange={v => updateParam('monthlyActiveUsers', v)}
                />

                <ParamNumber
                  label="固定成本 (¥/月)"
                  value={params.fixedCost}
                  min={0}
                  max={1000000}
                  step={100}
                  onChange={v => updateParam('fixedCost', v)}
                />

                <ParamNumber
                  label="单位变动成本 (¥)"
                  value={params.variableCost}
                  min={0}
                  max={10000}
                  step={1}
                  onChange={v => updateParam('variableCost', v)}
                />

                <ParamNumber
                  label="月增长率 (%)"
                  value={params.growthRate}
                  min={0}
                  max={100}
                  step={0.5}
                  onChange={v => updateParam('growthRate', v)}
                />

                <ParamNumber
                  label="月流失率 (%)"
                  value={params.churnRate}
                  min={0}
                  max={100}
                  step={0.1}
                  onChange={v => updateParam('churnRate', v)}
                />

                <ParamNumber
                  label="目标利润率 (%)"
                  value={params.targetMargin}
                  min={0}
                  max={100}
                  step={1}
                  onChange={v => updateParam('targetMargin', v)}
                />
              </div>
            </div>

            {/* 价格展示 */}
            {result && (
              <div className="price-section">
                <h4>定价建议</h4>
                <div className="price-cards">
                  <div className="price-card recommended">
                    <span className="price-label">推荐价格</span>
                    <span className="price-value">
                      ¥{result.recommendedPrice.toLocaleString()}
                      <small>/月</small>
                    </span>
                    <span className="price-desc">
                      基于 {params.targetMargin}% 利润目标
                    </span>
                  </div>

                  <div className="price-card range">
                    <span className="price-label">价格区间</span>
                    <div className="range-values">
                      <span>最低: ¥{result.minPrice.toLocaleString()}</span>
                      <span>最高: ¥{result.maxPrice.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="price-card revenue">
                    <span className="price-label">月收入</span>
                    <span className="price-value">
                      ¥{result.monthlyRevenue.toLocaleString()}
                    </span>
                    <span className="price-desc">
                      预计 {result.breakEvenMonths} 个月回本
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'comparison' && result && (
          <div className="comparison-panel">
            <h4>竞品对比</h4>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>竞品</th>
                  <th>价格</th>
                  <th>功能数</th>
                  <th>市场份额</th>
                  <th>评分</th>
                </tr>
              </thead>
              <tbody>
                {result.competitorComparison.map((comp, i) => (
                  <tr key={i} className={i === 0 ? 'highlight' : ''}>
                    <td>{comp.name}</td>
                    <td>¥{comp.price.toLocaleString()}/月</td>
                    <td>{comp.features}</td>
                    <td>{comp.marketShare}%</td>
                    <td>
                      <div className="rating">
                        {'⭐'.repeat(Math.floor(comp.rating))}
                        <span className="rating-value">{comp.rating.toFixed(1)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="comparison-chart">
              <PricingChart data={result.competitorComparison} />
            </div>
          </div>
        )}

        {activeTab === 'analysis' && result && (
          <div className="analysis-panel">
            <h4>单元经济分析</h4>

            <div className="metrics-grid">
              <MetricCard
                label="客户获取成本 (CAC)"
                value={`¥${result.unitEconomics.cac.toLocaleString()}`}
                desc="获取一个新客户的成本"
              />
              <MetricCard
                label="客户生命周期价值 (LTV)"
                value={`¥${result.unitEconomics.ltv.toLocaleString()}`}
                desc="客户全生命周期贡献"
              />
              <MetricCard
                label="LTV/CAC 比率"
                value={result.unitEconomics.ltvCacRatio.toFixed(1)}
                desc="健康值: >3"
                color={result.unitEconomics.ltvCacRatio >= 3 ? 'green' : 'yellow'}
              />
              <MetricCard
                label="回本周期"
                value={`${result.unitEconomics.paybackMonths.toFixed(1)} 个月`}
                desc="获客成本回收时间"
              />
              <MetricCard
                label="毛利率"
                value={`${result.unitEconomics.grossMargin}%`}
                desc="销售收入 - 变动成本"
                color={result.unitEconomics.grossMargin >= 50 ? 'green' : 'yellow'}
              />
            </div>

            <div className="cost-breakdown">
              <h5>成本分解</h5>
              <div className="breakdown-chart">
                <CostChart breakdown={result.costBreakdown} />
              </div>
              <ul className="breakdown-list">
                <li>
                  <span>固定成本: ¥{result.costBreakdown.fixed.amount.toLocaleString()}</span>
                  <span>{result.costBreakdown.fixed.percent}%</span>
                </li>
                {result.costBreakdown.fixed.items.map((item, i) => (
                  <li key={i} className="sub-item">
                    <span>{item.name}</span>
                    <span>¥{item.amount.toLocaleString()}</span>
                  </li>
                ))}
                <li>
                  <span>变动成本: ¥{result.costBreakdown.variable.amount.toLocaleString()}</span>
                  <span>{result.costBreakdown.variable.percent}%</span>
                </li>
                {result.costBreakdown.variable.items.map((item, i) => (
                  <li key={i} className="sub-item">
                    <span>{item.name}</span>
                    <span>¥{item.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* 底部操作 */}
      <footer className="calculator-footer">
        <button className="btn-primary" onClick={() => onExport?.(result!)}>
          导出方案
        </button>
        <button className="btn-secondary" onClick={() => {
          setParams({
            productType: 'saas',
            targetUser: 'enterprise',
            monthlyActiveUsers: 100,
            fixedCost: 5000,
            variableCost: 10,
            growthRate: 5,
            churnRate: 2,
            targetMargin: 50
          });
        }}>
          重置
        </button>
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 子组件：参数输入
// ═══════════════════════════════════════════════════════

function ParamInput({ label, value, options, onChange }: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div className="param-input">
      <label>{label}</label>
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}

function ParamNumber({ label, value, min, max, step, onChange }: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}) {
  return (
    <div className="param-number">
      <label>{label}</label>
      <input
        type="number"
        value={value}
        min={min}
        max={max}
        step={step}
        onChange={e => onChange(Number(e.target.value))}
      />
    </div>
  );
}

function MetricCard({ label, value, desc, color = 'blue' }: {
  label: string;
  value: string;
  desc: string;
  color?: 'blue' | 'green' | 'yellow' | 'red';
}) {
  const colors = {
    blue: 'border-blue-200 bg-blue-50',
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50',
    red: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`metric-card ${colors[color]}`}>
      <span className="metric-label">{label}</span>
      <span className="metric-value">{value}</span>
      <span className="metric-desc">{desc}</span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 子组件：图表
// ═══════════════════════════════════════════════════════

function PricingChart({ data }: { data: CompetitorData[] }) {
  const maxPrice = Math.max(...data.map(d => d.price)) * 1.2;

  return (
    <div className="pricing-chart">
      {data.map((item, i) => (
        <div key={i} className="chart-bar-row">
          <span className="bar-label">{item.name}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{ width: `${(item.price / maxPrice) * 100}%` }}
            />
          </div>
          <span className="bar-value">¥{item.price}</span>
        </div>
      ))}
    </div>
  );
}

function CostChart({ breakdown }: { breakdown: CostBreakdown }) {
  const total = breakdown.total;
  const fixedPercent = (breakdown.fixed.amount / total) * 100;
  const variablePercent = (breakdown.variable.amount / total) * 100;

  return (
    <div className="cost-chart">
      <div className="cost-bar">
        <div
          className="cost-fixed"
          style={{ width: `${fixedPercent}%` }}
        />
        <div
          className="cost-variable"
          style={{ width: `${variablePercent}%` }}
        />
      </div>
      <div className="cost-legend">
        <span className="legend-fixed">固定成本 {fixedPercent.toFixed(0)}%</span>
        <span className="legend-variable">变动成本 {variablePercent.toFixed(0)}%</span>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 核心计算逻辑
// ═══════════════════════════════════════════════════════

function calculatePricing(params: PricingParams): PricingResult {
  const {
    productType,
    targetUser,
    monthlyActiveUsers,
    fixedCost,
    variableCost,
    growthRate = 5,
    churnRate = 2,
    targetMargin = 50
  } = params;

  // 计算总成本
  const totalVariableCost = variableCost * monthlyActiveUsers;
  const totalCost = fixedCost + totalVariableCost;

  // 单位成本
  const costPerUser = totalCost / monthlyActiveUsers;

  // 基于目标利润计算价格
  const marginMultiplier = 1 / (targetMargin / 100);
  const recommendedPrice = costPerUser * marginMultiplier;

  // 价格区间
  const minPrice = costPerUser * 1.1;
  const maxPrice = recommendedPrice * 2;

  // 收入计算
  const monthlyRevenue = recommendedPrice * monthlyActiveUsers;
  const yearlyRevenue = monthlyRevenue * 12;

  // 回本周期
  const monthlyProfit = monthlyRevenue - totalCost;
  const breakEvenMonths = monthlyProfit > 0 ? fixedCost / monthlyProfit : 99;

  // 成本分解
  const costBreakdown: CostBreakdown = {
    fixed: {
      amount: fixedCost,
      percent: (fixedCost / totalCost) * 100,
      items: [
        { name: '服务器', amount: fixedCost * 0.4 },
        { name: '开发人员', amount: fixedCost * 0.4 },
        { name: '运营', amount: fixedCost * 0.2 }
      ]
    },
    variable: {
      amount: totalVariableCost,
      percent: (totalVariableCost / totalCost) * 100,
      items: [
        { name: 'API 调用', amount: totalVariableCost * 0.5 },
        { name: '存储', amount: totalVariableCost * 0.3 },
        { name: '客服', amount: totalVariableCost * 0.2 }
      ]
    },
    total: totalCost
  };

  // 竞品对比数据（示例）
  const competitorComparison: CompetitorData[] = [
    { name: '竞品 A', price: recommendedPrice * 0.9, features: 8, marketShare: 25, rating: 4.2 },
    { name: '竞品 B', price: recommendedPrice * 1.1, features: 9, marketShare: 20, rating: 4.5 },
    { name: '竞品 C', price: recommendedPrice, features: 7, marketShare: 15, rating: 4.0 },
    { name: '我们', price: recommendedPrice, features: 8, marketShare: 0, rating: 4.3 }
  ];

  // 单元经济
  const cac = totalCost / (monthlyActiveUsers * (1 - churnRate / 100));
  const ltv = cac * 3;
  const ltvCacRatio = ltv / cac;
  const paybackMonths = cac / (recommendedPrice - variableCost);
  const grossMargin = ((monthlyRevenue - totalVariableCost) / monthlyRevenue) * 100;

  return {
    recommendedPrice: Math.round(recommendedPrice),
    minPrice: Math.round(minPrice),
    maxPrice: Math.round(maxPrice),
    monthlyRevenue: Math.round(monthlyRevenue),
    yearlyRevenue: Math.round(yearlyRevenue),
    breakEvenMonths: Math.round(breakEvenMonths * 10) / 10,
    costBreakdown,
    competitorComparison,
    unitEconomics: {
      cac: Math.round(cac),
      ltv: Math.round(ltv),
      ltvCacRatio: Math.round(ltvCacRatio * 10) / 10,
      paybackMonths: Math.round(paybackMonths * 10) / 10,
      grossMargin: Math.round(grossMargin)
    }
  };
}

// ═══════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════

const styles = `
.pricing-calculator {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.calculator-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.calculator-header h3 {
  margin: 0;
}

.product-type-selector {
  display: flex;
  gap: 4px;
}

.product-type-selector button {
  padding: 6px 16px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.product-type-selector button.active {
  background: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.tabs button {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  font-size: 14px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
}

.tabs button.active {
  border-bottom-color: #3b82f6;
  color: #3b82f6;
  font-weight: 600;
}

.calculator-content {
  padding: 20px;
}

.params-section h4,
.price-section h4,
.comparison-panel h4,
.analysis-panel h4 {
  margin: 0 0 16px;
  font-size: 14px;
  color: #374151;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.param-input label,
.param-number label {
  display: block;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 4px;
}

.param-input select,
.param-number input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}

.price-cards {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.price-card {
  padding: 20px;
  border-radius: 12px;
  text-align: center;
}

.price-card.recommended {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
}

.price-card.range {
  background: #f3f4f6;
}

.price-card.revenue {
  background: #d1fae5;
}

.price-label {
  display: block;
  font-size: 12px;
  opacity: 0.8;
  margin-bottom: 8px;
}

.price-value {
  display: block;
  font-size: 28px;
  font-weight: 700;
}

.price-value small {
  font-size: 14px;
  font-weight: 400;
}

.price-desc {
  display: block;
  font-size: 11px;
  margin-top: 8px;
  opacity: 0.8;
}

.range-values {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 14px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.comparison-table th,
.comparison-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
}

.comparison-table th {
  background: #f9fafb;
  font-weight: 600;
}

.comparison-table tr.highlight {
  background: #dbeafe;
}

.rating {
  color: #fbbf24;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 16px;
  border-radius: 8px;
  text-align: center;
}

.metric-label {
  display: block;
  font-size: 11px;
  color: #6b7280;
  margin-bottom: 4px;
}

.metric-value {
  display: block;
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 4px;
}

.metric-desc {
  font-size: 11px;
  color: #9ca3af;
}

.breakdown-chart {
  margin-bottom: 16px;
}

.cost-bar {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #e5e7eb;
}

.cost-fixed {
  background: #3b82f6;
}

.cost-variable {
  background: #10b981;
}

.cost-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 8px;
  font-size: 12px;
}

.breakdown-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.breakdown-list li {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid #f3f4f6;
  font-size: 13px;
}

.breakdown-list li.sub-item {
  padding-left: 16px;
  font-size: 12px;
  color: #6b7280;
}

.calculator-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding: 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.btn-primary {
  padding: 10px 24px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.btn-secondary {
  padding: 10px 24px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.pricing-chart {
  margin-top: 16px;
}

.chart-bar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.bar-label {
  width: 80px;
  font-size: 13px;
}

.bar-track {
  flex: 1;
  height: 20px;
  background: #e5e7eb;
  border-radius: 10px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: #3b82f6;
  border-radius: 10px;
}

.bar-value {
  width: 80px;
  font-size: 13px;
  text-align: right;
}
`;

export default PricingCalculator;
