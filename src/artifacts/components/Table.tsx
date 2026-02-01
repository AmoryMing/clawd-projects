/**
 * 📋 Artifact Table Component - 表格组件
 */

import React, { useState, useMemo, useCallback } from 'react';

// ═══════════════════════════════════════════════════════
// 基础表格
// ═══════════════════════════════════════════════════════

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: number | string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  rowKey?: string;
  striped?: boolean;
  bordered?: boolean;
  hoverable?: boolean;
  size?: 'small' | 'medium' | 'large';
  pagination?: PaginationConfig;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  rowKey = 'id',
  striped = true,
  bordered = false,
  hoverable = true,
  size = 'medium',
  pagination,
  sortable = false,
  filterable = false,
  selectable = false,
  onRowClick,
  onSelectionChange
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [filterText, setFilterText] = useState('');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());

  // 排序和过滤
  const processedData = useMemo(() => {
    let result = [...data];

    // 过滤
    if (filterText) {
      result = result.filter(row =>
        Object.values(row).some(val =>
          String(val).toLowerCase().includes(filterText.toLowerCase())
        )
      );
    }

    // 排序
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        const comparison = aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
        return sortConfig.direction === 'asc' ? comparison : -comparison;
      });
    }

    return result;
  }, [data, filterText, sortConfig]);

  // 分页
  const paginatedData = useMemo(() => {
    if (!pagination) return processedData;

    const start = (pagination.page - 1) * pagination.pageSize;
    return processedData.slice(start, start + pagination.pageSize);
  }, [processedData, pagination]);

  // 排序处理
  const handleSort = (key: string) => {
    if (!sortable && !columns.find(c => c.key === key)?.sortable) return;

    setSortConfig(prev => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  // 选择处理
  const handleSelect = (row: T) => {
    const key = row[rowKey];
    const newSelected = new Set(selectedRows);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter(r => newSelected.has(r[rowKey])));
  };

  // 全选
  const handleSelectAll = () => {
    if (selectedRows.size === paginatedData.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const keys = new Set(paginatedData.map(r => r[rowKey]));
      setSelectedRows(keys);
      onSelectionChange?.(paginatedData);
    }
  };

  const sizeClasses = {
    small: 'table-sm',
    medium: 'table-md',
    large: 'table-lg'
  };

  return (
    <div className={`artifact-table ${sizeClasses[size]}`}>
      {/* 工具栏 */}
      {(filterable || selectable) && (
        <div className="table-toolbar">
          {filterable && (
            <input
              type="text"
              placeholder="搜索..."
              value={filterText}
              onChange={e => setFilterText(e.target.value)}
              className="table-search"
            />
          )}
          {selectable && selectedRows.size > 0 && (
            <span className="selection-info">
              已选择 {selectedRows.size} 项
            </span>
          )}
        </div>
      )}

      {/* 表格主体 */}
      <div className={`table-wrapper ${bordered ? 'bordered' : ''}`}>
        <table>
          <thead>
            <tr>
              {selectable && (
                <th className="checkbox-col">
                  <input
                    type="checkbox"
                    checked={paginatedData.length > 0 && selectedRows.size === paginatedData.length}
                    onChange={handleSelectAll}
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={col.key}
                  style={{ width: col.width, textAlign: col.align }}
                  onClick={() => handleSort(col.key)}
                  className={col.sortable || sortable ? 'sortable' : ''}
                >
                  {col.title}
                  {sortConfig?.key === col.key && (
                    <span className="sort-icon">
                      {sortConfig.direction === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, index) => (
              <tr
                key={row[rowKey]}
                className={`
                  ${striped && index % 2 === 1 ? 'striped' : ''}
                  ${hoverable ? 'hoverable' : ''}
                `}
                onClick={() => onRowClick?.(row, index)}
              >
                {selectable && (
                  <td className="checkbox-col">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(row[rowKey])}
                      onChange={() => handleSelect(row)}
                    />
                  </td>
                )}
                {columns.map(col => (
                  <td key={col.key} style={{ textAlign: col.align }}>
                    {col.render
                      ? col.render(row[col.key], row, index)
                      : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 分页 */}
      {pagination && (
        <div className="table-pagination">
          <span className="pagination-info">
            显示 {(pagination.page - 1) * pagination.pageSize + 1} -
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} 条，
            共 {pagination.total} 条
          </span>
          <div className="pagination-buttons">
            <button
              disabled={pagination.page === 1}
              onClick={() => pagination.onChange?.(pagination.page - 1, pagination.pageSize)}
            >
              上一页
            </button>
            <span className="pagination-page">{pagination.page}</span>
            <button
              disabled={pagination.page * pagination.pageSize >= pagination.total}
              onClick={() => pagination.onChange?.(pagination.page + 1, pagination.pageSize)}
            >
              下一页
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 风险详情表格
// ═══════════════════════════════════════════════════════

export interface RiskTableProps {
  risks: RiskItem[];
}

export interface RiskItem {
  id: string;
  category: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'fixed' | 'ignored';
  createdAt: string;
}

export function RiskTable({ risks }: RiskTableProps) {
  const columns: TableColumn<RiskItem>[] = [
    {
      key: 'category',
      title: '类别',
      width: 100,
      render: (val, row) => (
        <span className={`category-badge ${val.toLowerCase()}`}>
          {val}
        </span>
      )
    },
    {
      key: 'description',
      title: '风险描述',
      render: val => <span className="risk-description">{val}</span>
    },
    {
      key: 'severity',
      title: '严重程度',
      width: 100,
      align: 'center',
      render: val => (
        <span className={`severity-badge ${val}`}>
          {val.toUpperCase()}
        </span>
      )
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      render: val => (
        <span className={`status-badge ${val}`}>
          {val === 'pending' ? '待处理' : val === 'fixed' ? '已修复' : '已忽略'}
        </span>
      )
    },
    {
      key: 'createdAt',
      title: '发现时间',
      width: 150,
      render: val => new Date(val).toLocaleDateString('zh-CN')
    }
  ];

  return (
    <Table
      columns={columns}
      data={risks}
      rowKey="id"
      striped
      bordered
      hoverable
      size="medium"
      sortable
    />
  );
}

// ═══════════════════════════════════════════════════════
// 评论列表表格
// ═══════════════════════════════════════════════════════

export interface CommentTableProps {
  comments: CommentItem[];
  onResolve?: (id: string) => void;
  onFeedback?: (id: string, feedback: string) => void;
}

export interface CommentItem {
  id: string;
  author: string;
  type: 'content' | 'data' | 'risk';
  content: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: string;
}

export function CommentTable({ comments, onResolve, onFeedback }: CommentTableProps) {
  const [feedbackText, setFeedbackText] = useState('');
  const [selectedComment, setSelectedComment] = useState<string | null>(null);

  const columns: TableColumn<CommentItem>[] = [
    {
      key: 'author',
      title: '评论员',
      width: 100,
      render: (val, row) => (
        <div className="author-cell">
          <span className="author-avatar">{val[0]}</span>
          <span>{val}</span>
        </div>
      )
    },
    {
      key: 'type',
      title: '类型',
      width: 80,
      align: 'center',
      render: val => (
        <span className={`type-badge ${val}`}>
          {val === 'content' ? '内容' : val === 'data' ? '数据' : '风险'}
        </span>
      )
    },
    {
      key: 'content',
      title: '评论内容',
      render: val => <span className="comment-content">{val}</span>
    },
    {
      key: 'status',
      title: '状态',
      width: 100,
      align: 'center',
      render: val => (
        <span className={`status-indicator ${val}`}>
          {val === 'pending' ? '⏳ 待阅' : val === 'reviewed' ? '👁️ 已阅' : '✅ 已解决'}
        </span>
      )
    },
    {
      key: 'actions',
      title: '操作',
      width: 150,
      align: 'center',
      render: (_, row) => (
        <div className="action-buttons">
          <button
            className="action-btn primary"
            onClick={() => onResolve?.(row.id)}
            disabled={row.status === 'resolved'}
          >
            解决
          </button>
          <button
            className="action-btn secondary"
            onClick={() => setSelectedComment(row.id)}
          >
            反馈
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="comment-table">
      <Table
        columns={columns}
        data={comments}
        rowKey="id"
        striped
        bordered
        hoverable
        size="medium"
      />

      {/* 反馈弹窗 */}
      {selectedComment && (
        <div className="feedback-modal">
          <div className="modal-content">
            <h4>添加反馈</h4>
            <textarea
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
              placeholder="输入您的反馈..."
            />
            <div className="modal-actions">
              <button onClick={() => {
                onFeedback?.(selectedComment, feedbackText);
                setSelectedComment(null);
                setFeedbackText('');
              }}>
                提交
              </button>
              <button onClick={() => setSelectedComment(null)}>
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════

const styles = `
.artifact-table {
  width: 100%;
  background: white;
  border-radius: 8px;
  overflow: hidden;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.table-search {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  width: 200px;
}

.selection-info {
  font-size: 13px;
  color: #6b7280;
}

.table-wrapper {
  overflow-x: auto;
}

.table-wrapper.bordered {
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

th, td {
  padding: 12px 16px;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

th {
  background: #f9fafb;
  font-weight: 600;
  color: #374151;
}

th.sortable {
  cursor: pointer;
  user-select: none;
}

th.sortable:hover {
  background: #f3f4f6;
}

.sort-icon {
  margin-left: 4px;
  color: #6b7280;
}

tr.striped {
  background: #f9fafb;
}

tr.hoverable:hover {
  background: #f3f4f6;
  cursor: pointer;
}

.checkbox-col {
  width: 40px;
  text-align: center !important;
}

.table-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-info {
  font-size: 13px;
  color: #6b7280;
}

.pagination-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-buttons button {
  padding: 6px 12px;
  border: 1px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.pagination-buttons button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-page {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border-radius: 6px;
}

/* 风险表格样式 */
.severity-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
}

.severity-badge.low {
  background: #d1fae5;
  color: #065f46;
}

.severity-badge.medium {
  background: #fef3c7;
  color: #92400e;
}

.severity-badge.high {
  background: #fee2e2;
  color: #991b1b;
}

.severity-badge.critical {
  background: #7f1d1d;
  color: white;
}

.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.status-badge.pending {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.fixed {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.ignored {
  background: #e5e7eb;
  color: #374151;
}

/* 评论表格样式 */
.author-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}

.author-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #3b82f6;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.type-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.type-badge.content {
  background: #dbeafe;
  color: #1e40af;
}

.type-badge.data {
  background: #d1fae5;
  color: #065f46;
}

.type-badge.risk {
  background: #fee2e2;
  color: #991b1b;
}

.action-buttons {
  display: flex;
  gap: 6px;
}

.action-btn {
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  border: none;
}

.action-btn.primary {
  background: #3b82f6;
  color: white;
}

.action-btn.secondary {
  background: #e5e7eb;
  color: #374151;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 反馈弹窗 */
.feedback-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 12px;
  width: 400px;
  max-width: 90vw;
}

.modal-content h4 {
  margin: 0 0 16px;
  font-size: 16px;
}

.modal-content textarea {
  width: 100%;
  height: 100px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: none;
  font-size: 14px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}

.modal-actions button {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  border: none;
}

.modal-actions button:first-child {
  background: #3b82f6;
  color: white;
}

.modal-actions button:last-child {
  background: #e5e7eb;
  color: #374151;
}
`;

export default Table;