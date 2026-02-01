/**
 * 🎨 Artifact Card Component - 通用卡片组件
 */

export interface CardProps {
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  actions?: CardAction[];
  variant?: 'default' | 'success' | 'warning' | 'error';
  expandable?: boolean;
  defaultExpanded?: boolean;
}

export interface CardAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
}

export function Card({
  title,
  subtitle,
  content,
  actions = [],
  variant = 'default',
  expandable = false,
  defaultExpanded = false
}: CardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const variantStyles = {
    default: 'border-gray-200 bg-white',
    success: 'border-green-200 bg-green-50',
    warning: 'border-yellow-200 bg-yellow-50',
    error: 'border-red-200 bg-red-50'
  };

  const iconColors = {
    default: 'text-gray-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <div className={`card ${variantStyles[variant]}`}>
      <div className="card-header" onClick={() => expandable && setExpanded(!expanded)}>
        <div className="card-title-row">
          <span className="card-title">{title}</span>
          {expandable && (
            <span className={`expand-icon ${expanded ? 'expanded' : ''}`}>
              ▼
            </span>
          )}
        </div>
        {subtitle && <span className="card-subtitle">{subtitle}</span>}
      </div>

      {(!expandable || expanded) && (
        <>
          <div className="card-content">{content}</div>

          {actions.length > 0 && (
            <div className="card-actions">
              {actions.map((action, index) => (
                <button
                  key={index}
                  className={`action-btn ${action.variant || 'secondary'}`}
                  onClick={action.onClick}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 风险状态卡片
// ═══════════════════════════════════════════════════════

export interface RiskCardProps {
  score: number;
  level: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  details?: RiskDetail[];
  suggestions?: string[];
}

interface RiskDetail {
  label: string;
  value: string | number;
  severity?: 'low' | 'medium' | 'high';
}

export function RiskCard({ score, level, title, details = [], suggestions = [] }: RiskCardProps) {
  const levelConfig = {
    low: { color: 'green', label: '低风险', icon: '✓' },
    medium: { color: 'yellow', label: '中风险', icon: '⚠' },
    high: { color: 'orange', label: '高风险', icon: '!' },
    critical: { color: 'red', label: '严重', icon: '✕' }
  };

  const config = levelConfig[level];

  return (
    <Card
      title={title}
      subtitle={`风险评分: ${score}/100 • ${config.label}`}
      variant={
        level === 'low' ? 'success' :
        level === 'medium' ? 'warning' : 'error'
      }
      expandable
      defaultExpanded
    >
      <div className="risk-gauge">
        <div className="gauge-track">
          <div
            className="gauge-fill"
            style={{
              width: `${score}%`,
              backgroundColor: level === 'low' ? '#10b981' :
                              level === 'medium' ? '#f59e0b' :
                              level === 'high' ? '#f97316' : '#ef4444'
            }}
          />
        </div>
        <span className="gauge-label">{score}</span>
      </div>

      {details.length > 0 && (
        <div className="risk-details">
          <h4>风险详情</h4>
          <table className="details-table">
            <tbody>
              {details.map((detail, index) => (
                <tr key={index}>
                  <td className="detail-label">{detail.label}</td>
                  <td className="detail-value">
                    {detail.severity && (
                      <span className={`severity-badge ${detail.severity}`}>
                        {detail.severity}
                      </span>
                    )}
                    {detail.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {suggestions.length > 0 && (
        <div className="suggestions">
          <h4>修正建议</h4>
          <ul>
            {suggestions.map((suggestion, index) => (
              <li key={index}>{suggestion}</li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

// ═══════════════════════════════════════════════════════
// 政策引用卡片
// ═══════════════════════════════════════════════════════

export interface PolicyCardProps {
  policies: PolicyInfo[];
}

interface PolicyInfo {
  name: string;
  issuedBy: string;
  date: string;
  relevance: number;
}

export function PolicyCard({ policies }: PolicyCardProps) {
  return (
    <Card title="相关政策" expandable defaultExpanded={false}>
      <div className="policy-list">
        {policies.map((policy, index) => (
          <div key={index} className="policy-item">
            <div className="policy-name">{policy.name}</div>
            <div className="policy-meta">
              <span className="policy-issuer">{policy.issuedBy}</span>
              <span className="policy-date">{policy.date}</span>
              <span className="policy-relevance">相关性: {policy.relevance}%</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// 样式注入
const styles = `
.card {
  border-radius: 12px;
  border: 1px solid;
  padding: 16px;
  margin: 8px 0;
  transition: all 0.2s ease;
}

.card-header {
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-weight: 600;
  font-size: 14px;
}

.card-subtitle {
  font-size: 12px;
  color: #666;
}

.expand-icon {
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(180deg);
}

.card-content {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.action-btn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.risk-gauge {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gauge-track {
  flex: 1;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.gauge-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.gauge-label {
  font-weight: 700;
  font-size: 18px;
  min-width: 40px;
}

.details-table {
  width: 100%;
  font-size: 13px;
}

.detail-label {
  padding: 4px 8px 4px 0;
  color: #666;
}

.detail-value {
  padding: 4px 0;
}

.severity-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  margin-right: 6px;
  text-transform: uppercase;
}

.severity-badge.low { background: #d1fae5; color: #065f46; }
.severity-badge.medium { background: #fef3c7; color: #92400e; }
.severity-badge.high { background: #fee2e2; color: #991b1b; }

.suggestions, .risk-details {
  margin-top: 12px;
}

.suggestions h4, .risk-details h4 {
  font-size: 12px;
  color: #666;
  margin-bottom: 8px;
}

.suggestions ul {
  padding-left: 16px;
  margin: 0;
}

.suggestions li {
  font-size: 13px;
  margin-bottom: 4px;
}

.policy-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.policy-item {
  padding: 8px;
  background: #f9fafb;
  border-radius: 6px;
}

.policy-name {
  font-weight: 500;
  font-size: 13px;
}

.policy-meta {
  display: flex;
  gap: 12px;
  margin-top: 4px;
  font-size: 11px;
  color: #666;
}
`;

export default Card;
