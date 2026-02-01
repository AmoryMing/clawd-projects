// 模拟数据服务 - 用于演示和测试
// 当 bidata API 不可用时使用

export interface CompanyData {
  name: string;
  registrationNumber: string;
  legalPerson: string;
  registeredCapital: string;
  establishmentDate: string;
  address: string;
  businessScope: string[];
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  risks: RiskItem[];
  complianceStatus: ComplianceStatus;
}

export interface RiskItem {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  date: string;
}

export interface ComplianceStatus {
  overall: 'passed' | 'warning' | 'failed';
  items: ComplianceItem[];
}

export interface ComplianceItem {
  code: string;
  description: string;
  status: 'passed' | 'warning' | 'failed';
  suggestion: string;
}

// 模拟企业数据
export const mockCompanies: CompanyData[] = [
  {
    name: '北京创新科技有限公司',
    registrationNumber: '91110108MA01XXXXX',
    legalPerson: '张三',
    registeredCapital: '1000万元人民币',
    establishmentDate: '2019-03-15',
    address: '北京市海淀区中关村大街1号',
    businessScope: ['技术开发', '软件销售', '信息技术咨询'],
    riskScore: 25,
    riskLevel: 'low',
    risks: [
      {
        type: '工商变更',
        description: '2025年Q4发生注册资本变更',
        severity: 'low',
        source: '工商系统',
        date: '2025-10-15'
      }
    ],
    complianceStatus: {
      overall: 'passed',
      items: [
        {
          code: 'CONTENT_ACCURACY',
          description: '企业信息公示准确性',
          status: 'passed',
          suggestion: '无'
        },
        {
          code: 'SOURCE_AUTHORIZATION',
          description: '数据来源授权合规',
          status: 'passed',
          suggestion: '无'
        }
      ]
    }
  },
  {
    name: '上海贸易有限公司',
    registrationNumber: '91310000MA1HXXXXX',
    legalPerson: '李四',
    registeredCapital: '5000万元人民币',
    establishmentDate: '2015-06-20',
    address: '上海市浦东新区陆家嘴环路1000号',
    businessScope: ['货物进出口', '技术进出口', '批发贸易'],
    riskScore: 68,
    riskLevel: 'medium',
    risks: [
      {
        type: '司法诉讼',
        description: '涉及3起合同纠纷案件',
        severity: 'medium',
        source: '法院公开数据',
        date: '2025-08-10'
      },
      {
        type: '行政处罚',
        description: '2025年7月因税务问题被处罚',
        severity: 'high',
        source: '税务局',
        date: '2025-07-20'
      }
    ],
    complianceStatus: {
      overall: 'warning',
      items: [
        {
          code: 'CONTENT_ACCURACY',
          description: '企业信息公示准确性',
          status: 'passed',
          suggestion: '无'
        },
        {
          code: 'DATA_LICENSE',
          description: '跨境数据传输合规',
          status: 'warning',
          suggestion: '建议补充跨境数据合规审查'
        },
        {
          code: 'PERSONAL_INFO',
          description: '个人信息保护措施',
          status: 'passed',
          suggestion: '无'
        }
      ]
    }
  },
  {
    name: '深圳金融信息服务有限公司',
    registrationNumber: '91440300MA5FXXXXX',
    legalPerson: '王五',
    registeredCapital: '8000万元人民币',
    establishmentDate: '2018-09-01',
    address: '深圳市南山区科技园南路1008号',
    businessScope: ['金融信息服务', '投资咨询', '资产管理'],
    riskScore: 85,
    riskLevel: 'critical',
    risks: [
      {
        type: '司法风险',
        description: '涉及非法集资诉讼',
        severity: 'critical',
        source: '法院公开数据',
        date: '2025-11-01'
      },
      {
        type: '监管处罚',
        description: '被银保监会处罚500万元',
        severity: 'critical',
        source: '银保监会',
        date: '2025-09-15'
      },
      {
        type: '经营异常',
        description: '列入经营异常名录',
        severity: 'high',
        source: '市场监督管理局',
        date: '2025-10-20'
      }
    ],
    complianceStatus: {
      overall: 'failed',
      items: [
        {
          code: 'HIGH_RISK_INDUSTRY',
          description: '金融行业高风险业务合规',
          status: 'failed',
          suggestion: '立即停止违规业务，接受监管整改'
        },
        {
          code: 'RELATED_PARTY',
          description: '关联方交易披露',
          status: 'failed',
          suggestion: '补充关联方交易披露信息'
        },
        {
          code: 'PERSONAL_INFO',
          description: '个人信息保护措施',
          status: 'warning',
          suggestion: '加强用户数据保护措施'
        }
      ]
    }
  }
];

export function getRandomCompany(): CompanyData {
  return mockCompanies[Math.floor(Math.random() * mockCompanies.length)];
}

export function generateRiskTrend(days: number = 30): { date: string; score: number }[] {
  const data = [];
  const today = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    data.push({
      date: date.toISOString().split('T')[0],
      score: Math.floor(Math.random() * 100)
    });
  }
  
  return data;
}
