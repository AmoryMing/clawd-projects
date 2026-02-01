// Bidata API 服务
// 凭证: QBK / 2MZ8SOL8
// 基础 URL: https://api.bidata.com.cn

import axios from 'axios';

const API_BASE = 'https://api.bidata.com.cn';
const AUTH = { username: 'QBK', password: '2MZ8SOL8' };

export class BidataAPIService {
  private client;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE,
      auth: AUTH,
      timeout: 30000,
    });
  }

  // 企业信息查询
  async getCompanyInfo(companyName: string) {
    try {
      const response = await this.client.get('/v1/company/info', {
        params: { name: companyName }
      });
      return response.data;
    } catch (error) {
      console.error('企业信息查询失败:', error);
      return null;
    }
  }

  // 风险信息查询
  async getRiskInfo(companyName: string) {
    try {
      const response = await this.client.get('/v1/company/risk', {
        params: { name: companyName }
      });
      return response.data;
    } catch (error) {
      console.error('风险信息查询失败:', error);
      return null;
    }
  }

  // 司法信息查询
  async getLegalInfo(companyName: string) {
    try {
      const response = await this.client.get('/v1/company/legal', {
        params: { name: companyName }
      });
      return response.data;
    } catch (error) {
      console.error('司法信息查询失败:', error);
      return null;
    }
  }

  // 合规检测
  async checkCompliance(content: string, category: string = 'all') {
    try {
      const response = await this.client.post('/v1/compliance/check', {
        content,
        category
      });
      return response.data;
    } catch (error) {
      console.error('合规检测失败:', error);
      return null;
    }
  }

  // 批量查询
  async batchQuery(queries: string[]) {
    const results = await Promise.all(
      queries.map(q => this.getCompanyInfo(q))
    );
    return results;
  }
}

export const bidataService = new BidataAPIService();
