/**
 * File Exporter - 文件导出模块
 *
 * 支持格式：
 * - PDF: 报告导出
 * - DOCX: Word 文档
 * - PPTX: PowerPoint 演示
 */

import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { jsPDF } from 'jspdf';

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface ExportOptions {
  format: 'pdf' | 'docx' | 'pptx';
  template: ExportTemplate;
  filename?: string;
  includeCharts?: boolean;
  includeMetadata?: boolean;
}

export type ExportTemplate =
  | 'compliance-report'
  | 'risk-analysis'
  | 'policy-summary'
  | 'executive-brief';

export interface ExportResult {
  success: boolean;
  filename: string;
  size: number;
  path: string;
  mimeType: string;
}

// ═══════════════════════════════════════════════════════
// 导出服务
// ═══════════════════════════════════════════════════════

export class FileExporter {
  private templates: Map<ExportTemplate, (data: any) => Promise<any>>;

  constructor() {
    this.templates = new Map([
      ['compliance-report', this.renderComplianceReport.bind(this)],
      ['risk-analysis', this.renderRiskAnalysis.bind(this)],
      ['policy-summary', this.renderPolicySummary.bind(this)],
      ['executive-brief', this.renderExecutiveBrief.bind(this)]
    ]);
  }

  /**
   * 导出文件
   */
  async export(data: any, options: ExportOptions): Promise<ExportResult> {
    const startTime = Date.now();
    const filename = options.filename || `export-${Date.now()}`;

    try {
      // 1. 渲染模板
      const content = await this.templates.get(options.template)!(data);

      // 2. 生成文件
      let result: ExportResult;
      
      switch (options.format) {
        case 'pdf':
          result = await this.generatePDF(content, filename, options);
          break;
        case 'docx':
          result = await this.generateDOCX(content, filename, options);
          break;
        case 'pptx':
          result = await this.generatePPTX(content, filename, options);
          break;
        default:
          throw new Error(`不支持的格式: ${options.format}`);
      }

      console.log(`[FileExporter] 导出成功: ${filename}.${options.format} (${result.size} bytes, ${Date.now() - startTime}ms)`);

      return result;
    } catch (error) {
      console.error('[FileExporter] 导出失败:', error);
      throw error;
    }
  }

  /**
   * 生成 PDF
   */
  private async generatePDF(
    content: any,
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const doc = new jsPDF();

    // 标题
    doc.setFontSize(20);
    doc.text(content.title || '报告', 20, 20);

    // 副标题
    if (content.subtitle) {
      doc.setFontSize(12);
      doc.text(content.subtitle, 20, 30);
    }

    // 内容
    let yPos = 50;
    doc.setFontSize(11);

    if (content.sections) {
      content.sections.forEach((section: any) => {
        // 小标题
        doc.setFontSize(14);
        doc.setFont(undefined, 'bold');
        doc.text(section.title, 20, yPos);
        yPos += 10;

        // 正文
        doc.setFontSize(11);
        doc.setFont(undefined, 'normal');

        const lines = doc.splitTextToSize(section.content || '', 170);
        lines.forEach((line: string) => {
          if (yPos > 270) {
            doc.addPage();
            yPos = 20;
          }
          doc.text(line, 20, yPos);
          yPos += 7;
        });

        yPos += 10;
      });
    }

    // 页脚
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `第 ${i} 页 / 共 ${pageCount} 页`,
        doc.internal.pageSize.width / 2,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }

    // 保存
    const pdfBlob = doc.output('blob');
    
    return {
      success: true,
      filename: `${filename}.pdf`,
      size: pdfBlob.size,
      path: `/exports/${filename}.pdf`,
      mimeType: 'application/pdf'
    };
  }

  /**
   * 生成 DOCX
   */
  private async generateDOCX(
    content: any,
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    const children: Paragraph[] = [];

    // 标题
    children.push(
      new Paragraph({
        text: content.title || '报告',
        heading: HeadingLevel.TITLE,
        spacing: { after: 400 }
      })
    );

    // 副标题
    if (content.subtitle) {
      children.push(
        new Paragraph({
          text: content.subtitle,
          spacing: { after: 200 }
        })
      );
    }

    // 内容段落
    if (content.sections) {
      content.sections.forEach((section: any) => {
        // 小标题
        children.push(
          new Paragraph({
            text: section.title,
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          })
        );

        // 正文
        if (section.content) {
          children.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: section.content,
                  size: 24 // 12pt
                })
              ],
              spacing: { after: 200 }
            })
          );
        }

        // 列表项
        if (section.items) {
          section.items.forEach((item: string) => {
            children.push(
              new Paragraph({
                text: item,
                bullet: { level: 0 },
                spacing: { after: 100 }
              })
            );
          });
        }
      });
    }

    // 创建文档
    const doc = new Document({
      sections: [{
        properties: {},
        children: children
      }]
    });

    // 生成
    const blob = await Packer.toBlob(doc);

    return {
      success: true,
      filename: `${filename}.docx`,
      size: blob.size,
      path: `/exports/${filename}.docx`,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
  }

  /**
   * 生成 PPTX（简化版）
   */
  private async generatePPTX(
    content: any,
    filename: string,
    options: ExportOptions
  ): Promise<ExportResult> {
    // PPTX 生成需要额外的库，这里用简化实现
    // 实际项目中可以使用 pptxgenjs

    // 创建简化版内容
    const slides = [];

    // 封面
    slides.push({
      title: content.title || '演示文稿',
      subtitle: content.subtitle || ''
    });

    // 内容页
    if (content.sections) {
      content.sections.forEach(section => {
        slides.push({
          title: section.title,
          content: section.content,
          bullets: section.items || []
        });
      });
    }

    // 导出为 JSON（实际应该生成真正的 PPTX）
    const jsonContent = JSON.stringify(slides, null, 2);
    const encoder = new TextEncoder();
    const data = encoder.encode(jsonContent);

    return {
      success: true,
      filename: `${filename}.json`, // 临时用 JSON，实际应该是 .pptx
      size: data.length,
      path: `/exports/${filename}.json`,
      mimeType: 'application/json'
    };
  }

  // ═══════════════════════════════════════════════════════
  // 模板渲染器
  // ═══════════════════════════════════════════════════════

  private async renderComplianceReport(data: any): Promise<any> {
    return {
      title: '合规检测报告',
      subtitle: `公司: ${data.company || '未命名'} | 日期: ${new Date().toLocaleDateString()}`,
      sections: [
        {
          title: '执行摘要',
          content: `风险评分: ${data.riskScore || 0}/100\n风险等级: ${data.riskLevel || '未知'}`,
          items: [
            `共检测 ${data.itemsChecked || 0} 项`,
            `发现 ${data.violations?.length || 0} 个问题`,
            `建议 ${data.suggestions?.length || 0} 条改进措施`
          ]
        },
        {
          title: '风险详情',
          content: data.violations?.map((v: any) =>
            `[${v.severity.toUpperCase()}] ${v.description}`
          ).join('\n') || '无违规项'
        },
        {
          title: '改进建议',
          content: data.suggestions?.join('\n\n') || '无建议'
        },
        {
          title: '相关政策',
          content: data.policies?.join('\n') || '无相关政策'
        }
      ]
    };
  }

  private async renderRiskAnalysis(data: any): Promise<any> {
    return {
      title: '风险分析报告',
      subtitle: `分析对象: ${data.subject || '未命名'}`,
      sections: [
        {
          title: '风险概览',
          content: `综合风险评分: ${data.overallRisk || 0}/100`,
          items: [
            `市场风险: ${data.marketRisk || 0}/100`,
            `运营风险: ${data.operationalRisk || 0}/100`,
            `财务风险: ${data.financialRisk || 0}/100`,
            `合规风险: ${data.complianceRisk || 0}/100`
          ]
        },
        {
          title: '风险因素',
          content: data.factors?.map((f: any) =>
            `${f.name}: ${f.score}/100`
          ).join('\n') || '无数据'
        }
      ]
    };
  }

  private async renderPolicySummary(data: any): Promise<any> {
    return {
      title: '政策摘要',
      subtitle: `生成时间: ${new Date().toLocaleString()}`,
      sections: [
        {
          title: '政策概览',
          content: `共收录 ${data.policies?.length || 0} 条政策`,
          items: data.policies?.map((p: any) =>
            `${p.name} (${p.effectiveDate || '待生效'})`
          ) || []
        },
        {
          title: '重点政策',
          content: data.keyPolicies?.map((p: any) =>
            `• ${p.title}\n  机构: ${p.agency}\n  影响: ${p.impact}`
          ).join('\n\n') || '无重点政策'
        }
      ]
    };
  }

  private async renderExecutiveBrief(data: any): Promise<any> {
    return {
      title: '高管简报',
      subtitle: `机密 | ${new Date().toLocaleDateString()}`,
      sections: [
        {
          title: '核心发现',
          content: data.keyFindings?.join('\n') || '无核心发现'
        },
        {
          title: '关键指标',
          content: data.metrics?.map((m: any) =>
            `${m.name}: ${m.value}${m.unit || ''}`
          ).join('\n') || '无数据'
        },
        {
          title: '行动建议',
          content: data.recommendations?.join('\n') || '无建议',
          items: data.actionItems || []
        }
      ]
    };
  }
}

// ═══════════════════════════════════════════════════════
// 便捷函数
// ═══════════════════════════════════════════════════════

export async function exportToPDF(
  data: any,
  template: ExportTemplate,
  filename?: string
): Promise<ExportResult> {
  const exporter = new FileExporter();
  return exporter.export(data, {
    format: 'pdf',
    template,
    filename
  });
}

export async function exportToDOCX(
  data: any,
  template: ExportTemplate,
  filename?: string
): Promise<ExportResult> {
  const exporter = new FileExporter();
  return exporter.export(data, {
    format: 'docx',
    template,
    filename
  });
}

export async function exportToPPTX(
  data: any,
  template: ExportTemplate,
  filename?: string
): Promise<ExportResult> {
  const exporter = new FileExporter();
  return exporter.export(data, {
    format: 'pptx',
    template,
    filename
  });
}

export default FileExporter;
