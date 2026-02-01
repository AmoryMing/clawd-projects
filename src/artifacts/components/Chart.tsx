/**
 * 📊 Artifact Chart Components - 图表组件库
 */

import React, { useMemo, useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════════
// 折线图
// ═══════════════════════════════════════════════════════

export interface LineChartProps {
  data: LineChartData;
  width?: number | string;
  height?: number | string;
  showPoints?: boolean;
  animate?: boolean;
  interactive?: boolean;
}

export interface LineChartData {
  labels: string[];
  datasets: LineDataset[];
}

export interface LineDataset {
  label: string;
  data: number[];
  color?: string;
  dashed?: boolean;
}

export function LineChart({
  data,
  width = '100%',
  height = 200,
  showPoints = true,
  animate = true,
  interactive = true
}: LineChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredPoint, setHoveredPoint] = useState<{ index: number; dataset: number } | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    // 清除画布
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const padding = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = canvasRef.current.width - padding.left - padding.right;
    const chartHeight = canvasRef.current.height - padding.top - padding.bottom;

    // 计算数据范围
    const allValues = data.datasets.flatMap(d => d.data);
    const minValue = Math.min(...allValues) * 0.9;
    const maxValue = Math.max(...allValues) * 1.1;

    // 绘制坐标轴
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;

    // Y轴
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.stroke();

    // X轴
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top + chartHeight);
    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.stroke();

    // 绘制Y轴标签
    ctx.fillStyle = '#6b7280';
    ctx.font = '10px sans-serif';
    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const value = minValue + (maxValue - minValue) * (i / ySteps);
      const y = padding.top + chartHeight - (chartHeight * (i / ySteps));
      ctx.fillText(Math.round(value).toString(), padding.left - 35, y + 4);
    }

    // 绘制X轴标签
    const xStep = chartWidth / (data.labels.length - 1);
    data.labels.forEach((label, i) => {
      const x = padding.left + xStep * i;
      ctx.fillText(label, x - 20, padding.top + chartHeight + 20);
    });

    // 绘制数据线
    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || `hsl(${datasetIndex * 137.5 % 360}, 70%, 50%)`;

      // 绘制线条
      ctx.beginPath();
      dataset.data.forEach((value, i) => {
        const x = padding.left + xStep * i;
        const y = padding.top + chartHeight - chartHeight * ((value - minValue) / (maxValue - minValue));

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      if (dataset.dashed) {
        ctx.setLineDash([5, 5]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();

      // 绘制数据点
      if (showPoints) {
        dataset.data.forEach((value, i) => {
          const x = padding.left + xStep * i;
          const y = padding.top + chartHeight - chartHeight * ((value - minValue) / (maxValue - minValue));

          ctx.beginPath();
          ctx.arc(x, y, 4, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.strokeStyle = 'white';
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
    });
  }, [data, width, height, showPoints]);

  return (
    <div className="chart-container" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={typeof width === 'number' ? width : 600}
        height={typeof height === 'number' ? height : 200}
        className="chart-canvas"
      />
      {interactive && hoveredPoint && (
        <div className="chart-tooltip">
          {data.labels[hoveredPoint.index]}: {
            data.datasets[hoveredPoint.dataset].data[hoveredPoint.index]
          }
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 柱状图
// ═══════════════════════════════════════════════════════

export interface BarChartProps {
  data: BarChartData;
  width?: number | string;
  height?: number | string;
  horizontal?: boolean;
  stacked?: boolean;
}

export interface BarChartData {
  labels: string[];
  datasets: BarDataset[];
}

export interface BarDataset {
  label: string;
  data: number[];
  color?: string;
}

export function BarChart({
  data,
  width = '100%',
  height = 200,
  horizontal = false,
  stacked = false
}: BarChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const padding = { top: 20, right: 20, bottom: 40, left: 50 };
    const chartWidth = canvasRef.current.width - padding.left - padding.right;
    const chartHeight = canvasRef.current.height - padding.top - padding.bottom;

    if (horizontal) {
      // 水平柱状图
      const barHeight = chartHeight / data.labels.length * 0.7;
      const barGap = chartHeight / data.labels.length * 0.3;

      const maxValue = Math.max(...data.datasets.flatMap(d => d.data));

      data.labels.forEach((label, i) => {
        const y = padding.top + (barHeight + barGap) * i;

        // 绘制标签
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, padding.left - 10, y + barHeight / 2 + 4);

        // 绘制柱子
        let currentX = padding.left;
        data.datasets.forEach((dataset, di) => {
          const value = dataset.data[i];
          const barWidth = (value / maxValue) * chartWidth;
          const color = dataset.color || `hsl(${di * 137.5 % 360}, 70%, 50%)`;

          ctx.fillStyle = color;
          ctx.fillRect(currentX, y + 2, barWidth, barHeight - 4);
          currentX += barWidth;
        });
      });
    } else {
      // 垂直柱状图
      const barWidth = chartWidth / data.labels.length * 0.7;
      const barGap = chartWidth / data.labels.length * 0.3;

      const maxValue = Math.max(...data.datasets.flatMap(d => d.data));

      data.labels.forEach((label, i) => {
        const x = padding.left + (barWidth + barGap) * i + barGap / 2;

        // 绘制柱子
        let currentY = padding.top + chartHeight;
        data.datasets.forEach((dataset, di) => {
          const value = dataset.data[i];
          const barHeight = (value / maxValue) * chartHeight;
          const color = dataset.color || `hsl(${di * 137.5 % 360}, 70%, 50%)`;

          ctx.fillStyle = color;
          ctx.fillRect(x, currentY - barHeight, barWidth, barHeight);
          currentY -= barHeight;
        });

        // 绘制标签
        ctx.fillStyle = '#374151';
        ctx.font = '12px sans-serif';
        ctx.fillText(label, x + barWidth / 2 - 20, padding.top + chartHeight + 20);
      });
    }
  }, [data, width, height, horizontal, stacked]);

  return (
    <div className="chart-container" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={typeof width === 'number' ? width : 600}
        height={typeof height === 'number' ? height : 200}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 饼图/环形图
// ═══════════════════════════════════════════════════════

export interface PieChartProps {
  data: PieChartData;
  width?: number | string;
  height?: number | string;
  donut?: boolean;
  showLabels?: boolean;
  showLegend?: boolean;
}

export interface PieChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export function PieChart({
  data,
  width = 200,
  height = 200,
  donut = true,
  showLabels = true,
  showLegend = true
}: PieChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const colors = data.colors || [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444',
    '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
  ];

  useEffect(() => {
    if (!canvasRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    const innerRadius = donut ? radius * 0.6 : 0;

    const total = data.values.reduce((sum, v) => sum + v, 0);
    let currentAngle = -Math.PI / 2;

    data.values.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.lineTo(centerX, centerY);
      ctx.closePath();

      ctx.fillStyle = colors[i % colors.length];
      ctx.fill();

      currentAngle += sliceAngle;
    });

    // 绘制中心文字（如果是环形图）
    if (donut) {
      ctx.fillStyle = '#374151';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(total.toString(), centerX, centerY - 5);
      ctx.font = '12px sans-serif';
      ctx.fillText('总计', centerX, centerY + 15);
    }
  }, [data, width, height, donut, colors]);

  return (
    <div className="chart-container" style={{ width, height }}>
      <canvas
        ref={canvasRef}
        width={typeof width === 'number' ? width : 200}
        height={typeof height === 'number' ? height : 200}
      />
      {showLegend && (
        <div className="chart-legend">
          {data.labels.map((label, i) => (
            <div key={i} className="legend-item">
              <span
                className="legend-color"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <span className="legend-label">{label}</span>
              <span className="legend-value">{data.values[i]}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 趋势指示器
// ═══════════════════════════════════════════════════════

export interface TrendIndicatorProps {
  value: number;
  previousValue: number;
  label: string;
  format?: 'percent' | 'number' | 'currency';
}

export function TrendIndicator({
  value,
  previousValue,
  label,
  format = 'percent'
}: TrendIndicatorProps) {
  const change = previousValue !== 0 ? ((value - previousValue) / previousValue) * 100 : 0;
  const isPositive = change >= 0;

  const formatValue = (v: number) => {
    switch (format) {
      case 'percent':
        return `${v.toFixed(1)}%`;
      case 'currency':
        return `¥${v.toFixed(2)}`;
      default:
        return v.toFixed(0);
    }
  };

  return (
    <div className="trend-indicator">
      <span className="trend-label">{label}</span>
      <span className="trend-value">{formatValue(value)}</span>
      <span className={`trend-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════

const styles = `
.chart-container {
  position: relative;
  margin: 16px 0;
}

.chart-canvas {
  border-radius: 8px;
}

.chart-tooltip {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 12px;
}

.chart-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 3px;
}

.legend-value {
  font-weight: 600;
  color: #374151;
}

.trend-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: #f9fafb;
  border-radius: 8px;
}

.trend-label {
  flex: 1;
  color: #6b7280;
  font-size: 13px;
}

.trend-value {
  font-weight: 700;
  font-size: 16px;
  color: #111827;
}

.trend-change {
  font-size: 13px;
  font-weight: 600;
}

.trend-change.positive {
  color: #10b981;
}

.trend-change.negative {
  color: #ef4444;
}
`;

export default LineChart;
