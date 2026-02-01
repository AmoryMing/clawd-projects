/**
 * Review Comments Artifact - 评论区 Bot-First 设计
 *
 * 交互模式：
 * - 自然语言触发：/review、查看评论、待处理
 * - 渐进式披露：先摘要，后详情
 * - 批量操作：批量解决、批量导出
 */

import React, { useState, useMemo } from 'react';

// ═══════════════════════════════════════════════════════
// 类型定义
// ═══════════════════════════════════════════════════════

export interface ReviewComment {
  id: string;
  reportId: string;
  author: CommentAuthor;
  type: 'content' | 'data' | 'risk';
  status: 'pending' | 'reviewed' | 'resolved';
  content: string;
  position?: {
    page?: number;
    line?: number;
    selection?: string;
  };
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  replies?: CommentReply[];
}

export interface CommentAuthor {
  id: string;
  name: string;
  avatar?: string;
  role: 'content-reviewer' | 'data-reviewer' | 'risk-analyst';
}

export interface CommentReply {
  id: string;
  author: CommentAuthor;
  content: string;
  createdAt: string;
}

export interface ReviewStats {
  total: number;
  pending: number;
  reviewed: number;
  resolved: number;
  byType: {
    content: number;
    data: number;
    risk: number;
  };
}

// ═══════════════════════════════════════════════════════
// 组件：评论区 Artifact
// ═══════════════════════════════════════════════════════

interface ReviewCommentsArtifactProps {
  reportId: string;
  reportTitle: string;
  comments: ReviewComment[];
  currentUser: CommentAuthor;
  onResolve?: (commentId: string) => void;
  onReply?: (commentId: string, content: string) => void;
  onAddComment?: (comment: Partial<ReviewComment>) => void;
  onExport?: (format: 'json' | 'csv' | 'pdf') => void;
}

export function ReviewCommentsArtifact({
  reportId,
  reportTitle,
  comments,
  currentUser,
  onResolve,
  onReply,
  onAddComment,
  onExport
}: ReviewCommentsArtifactProps) {
  const [filter, setFilter] = useState<ReviewFilter>({
    status: 'all',
    type: 'all',
    author: 'all'
  });
  const [sortBy, setSortBy] = useState<'time' | 'severity' | 'type'>('time');
  const [selectedComments, setSelectedComments] = useState<Set<string>>(new Set());
  const [expandedComment, setExpandedComment] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<'' | string>('');

  // 计算统计数据
  const stats: ReviewStats = useMemo(() => {
    const result: ReviewStats = {
      total: comments.length,
      pending: 0,
      reviewed: 0,
      resolved: 0,
      byType: { content: 0, data: 0, risk: 0 }
    };

    comments.forEach(c => {
      result[c.status]++;
      result.byType[c.type]++;
    });

    return result;
  }, [comments]);

  // 过滤和排序
  const filteredComments = useMemo(() => {
    let result = [...comments];

    // 过滤
    if (filter.status !== 'all') {
      result = result.filter(c => c.status === filter.status);
    }
    if (filter.type !== 'all') {
      result = result.filter(c => c.type === filter.type);
    }
    if (filter.author !== 'all') {
      result = result.filter(c => c.author.id === filter.author);
    }

    // 排序
    result.sort((a, b) => {
      switch (sortBy) {
        case 'severity':
          const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return 0; // 需要在类型中增加 severity 字段
        case 'type':
          return a.type.localeCompare(b.type);
        default: // time
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

    return result;
  }, [comments, filter, sortBy]);

  // 处理选择
  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedComments);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedComments(newSet);
  };

  const selectAll = () => {
    if (selectedComments.size === filteredComments.length) {
      setSelectedComments(new Set());
    } else {
      setSelectedComments(new Set(filteredComments.map(c => c.id)));
    }
  };

  // 批量操作
  const batchResolve = () => {
    selectedComments.forEach(id => onResolve?.(id));
    setSelectedComments(new Set());
  };

  // 发送回复
  const sendReply = (commentId: string) => {
    if (replyText.trim()) {
      onReply?.(commentId, replyText);
      setReplyText('');
    }
  };

  return (
    <div className="review-comments-artifact">
      {/* 头部 */}
      <header className="artifact-header">
        <h3>📋 {reportTitle}</h3>
        <div className="stats-bar">
          <StatBadge label="待处理" value={stats.pending} color="yellow" />
          <StatBadge label="已阅" value={stats.reviewed} color="blue" />
          <StatBadge label="已解决" value={stats.resolved} color="green" />
        </div>
      </header>

      {/* 工具栏 */}
      <div className="toolbar">
        <div className="filters">
          <select
            value={filter.status}
            onChange={e => setFilter({ ...filter, status: e.target.value })}
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="reviewed">已阅</option>
            <option value="resolved">已解决</option>
          </select>

          <select
            value={filter.type}
            onChange={e => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="all">全部类型</option>
            <option value="content">内容</option>
            <option value="data">数据</option>
            <option value="risk">风险</option>
          </select>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
          >
            <option value="time">最新优先</option>
            <option value="type">按类型</option>
            <option value="severity">按严重程度</option>
          </select>
        </div>

        <div className="actions">
          {selectedComments.size > 0 && (
            <>
              <span className="selection-info">
                已选 {selectedComments.size} 条
              </span>
              <button className="btn-primary" onClick={batchResolve}>
                批量解决
              </button>
              <button
                className="btn-secondary"
                onClick={() => setSelectedComments(new Set())}
              >
                取消
              </button>
            </>
          )}

          <select
            onChange={e => onExport?.(e.target.value as any)}
            className="export-select"
          >
            <option value="">导出...</option>
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
            <option value="pdf">PDF</option>
          </select>
        </div>
      </div>

      {/* 评论列表 */}
      <div className="comments-list">
        {/* 全选 */}
        <div className="select-all-row">
          <input
            type="checkbox"
            checked={
              filteredComments.length > 0 &&
              selectedComments.size === filteredComments.length
            }
            onChange={selectAll}
          />
          <span>全选</span>
        </div>

        {filteredComments.map(comment => (
          <CommentCard
            key={comment.id}
            comment={comment}
            isSelected={selectedComments.has(comment.id)}
            isExpanded={expandedComment === comment.id}
            onSelect={() => toggleSelect(comment.id)}
            onExpand={() => setExpandedComment(
              expandedComment === comment.id ? null : comment.id
            )}
            onResolve={() => onResolve?.(comment.id)}
            replyText={replyText}
            onReplyChange={setReplyText}
            onSendReply={() => sendReply(comment.id)}
          />
        ))}

        {filteredComments.length === 0 && (
          <div className="empty-state">
            <span className="empty-icon">📭</span>
            <p>暂无评论</p>
          </div>
        )}
      </div>

      {/* 添加评论 */}
      <footer className="add-comment">
        <input
          type="text"
          placeholder="添加评论..."
          onKeyPress={e => {
            if (e.key === 'Enter') {
              onAddComment?.({
                reportId,
                author: currentUser,
                type: 'content',
                content: (e.target as HTMLInputElement).value,
                status: 'pending'
              });
              (e.target as HTMLInputElement).value = '';
            }
          }}
        />
      </footer>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 子组件：统计徽章
// ═══════════════════════════════════════════════════════

function StatBadge({ label, value, color }: {
  label: string;
  value: number;
  color: 'yellow' | 'blue' | 'green' | 'red';
}) {
  const colors = {
    yellow: 'bg-yellow-100 text-yellow-800',
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    red: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`stat-badge ${colors[color]}`}>
      {label}: {value}
    </span>
  );
}

// ═══════════════════════════════════════════════════════
// 子组件：评论卡片
// ═══════════════════════════════════════════════════════

function CommentCard({
  comment,
  isSelected,
  isExpanded,
  onSelect,
  onExpand,
  onResolve,
  replyText,
  onReplyChange,
  onSendReply
}: {
  comment: ReviewComment;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: () => void;
  onExpand: () => void;
  onResolve: () => void;
  replyText: string | '';
  onReplyChange: (val: string) => void;
  onSendReply: () => void;
}) {
  const typeConfig = {
    content: { icon: '📝', color: 'blue', label: '内容' },
    data: { icon: '📊', color: 'green', label: '数据' },
    risk: { icon: '⚠️', color: 'red', label: '风险' }
  };

  const config = typeConfig[comment.type];

  const statusConfig = {
    pending: { icon: '⏳', label: '待处理', color: 'yellow' },
    reviewed: { icon: '👁️', label: '已阅', color: 'blue' },
    resolved: { icon: '✅', label: '已解决', color: 'green' }
  };

  const status = statusConfig[comment.status];

  return (
    <div className={`comment-card ${isExpanded ? 'expanded' : ''}`}>
      <div className="comment-header">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={onSelect}
        />

        <div className="comment-meta">
          <span className="author-avatar">
            {comment.author.name[0]}
          </span>
          <span className="author-name">{comment.author.name}</span>
          <span className={`type-badge ${config.color}`}>
            {config.icon} {config.label}
          </span>
          <span className={`status-badge ${status.color}`}>
            {status.icon} {status.label}
          </span>
        </div>

        <button className="expand-btn" onClick={onExpand}>
          {isExpanded ? '收起' : '展开'}
        </button>
      </div>

      <div className="comment-content">
        {comment.content}
      </div>

      {isExpanded && (
        <div className="comment-expanded">
          {/* 位置信息 */}
          {comment.position && (
            <div className="position-info">
              位置: 第 {comment.position.page || '-'} 页
              {comment.position.line && `, 第 ${comment.position.line} 行`}
            </div>
          )}

          {/* 回复列表 */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="replies">
              <h4>回复 ({comment.replies.length})</h4>
              {comment.replies.map(reply => (
                <div key={reply.id} className="reply">
                  <span className="reply-author">{reply.author.name}</span>
                  <span className="reply-content">{reply.content}</span>
                  <span className="reply-time">
                    {new Date(reply.createdAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 回复输入框 */}
          <div className="reply-input">
            <input
              type="text"
              placeholder="回复..."
              value={replyText}
              onChange={e => onReplyChange(e.target.value)}
              onKeyPress={e => e.key === 'Enter' && onSendReply()}
            />
            <button onClick={onSendReply}>发送</button>
          </div>

          {/* 操作按钮 */}
          {comment.status !== 'resolved' && (
            <div className="comment-actions">
              <button className="btn-primary" onClick={onResolve}>
                解决
              </button>
              <button className="btn-secondary">
                标记已阅
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// 样式
// ═══════════════════════════════════════════════════════

const styles = `
.review-comments-artifact {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

.artifact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.artifact-header h3 {
  margin: 0;
  font-size: 16px;
}

.stats-bar {
  display: flex;
  gap: 12px;
}

.stat-badge {
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.filters, .actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.filters select, .export-select {
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.selection-info {
  font-size: 13px;
  color: #6b7280;
}

.btn-primary {
  padding: 6px 12px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.btn-secondary {
  padding: 6px 12px;
  background: #e5e7eb;
  color: #374151;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.comments-list {
  max-height: 500px;
  overflow-y: auto;
}

.select-all-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f9fafb;
  font-size: 13px;
  color: #6b7280;
}

.comment-card {
  border-bottom: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.comment-card:hover {
  background: #f9fafb;
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
}

.comment-meta {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
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

.author-name {
  font-weight: 500;
  font-size: 13px;
}

.type-badge, .status-badge {
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.type-badge.blue { background: #dbeafe; color: #1e40af; }
.type-badge.green { background: #d1fae5; color: #065f46; }
.type-badge.red { background: #fee2e2; color: #991b1b; }

.status-badge.yellow { background: #fef3c7; color: #92400e; }
.status-badge.blue { background: #dbeafe; color: #1e40af; }
.status-badge.green { background: #d1fae5; color: #065f46; }

.expand-btn {
  padding: 4px 10px;
  background: transparent;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 12px;
  color: #6b7280;
  cursor: pointer;
}

.comment-content {
  padding: 0 16px 12px;
  font-size: 14px;
  color: #374151;
  line-height: 1.5;
}

.comment-expanded {
  padding: 12px 16px;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.position-info {
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 12px;
}

.replies {
  margin-bottom: 12px;
}

.replies h4 {
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px;
}

.reply {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: white;
  border-radius: 6px;
  margin-bottom: 6px;
  font-size: 13px;
}

.reply-author {
  font-weight: 500;
  color: #374151;
}

.reply-content {
  flex: 1;
  color: #6b7280;
}

.reply-time {
  font-size: 11px;
  color: #9ca3af;
}

.reply-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.reply-input input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
}

.reply-input button {
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 13px;
  cursor: pointer;
}

.comment-actions {
  display: flex;
  gap: 8px;
}

.add-comment {
  padding: 12px 16px;
  border-top: 1px solid #e5e7eb;
}

.add-comment input {
  width: 100%;
  padding: 10px 14px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 14px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #9ca3af;
}

.empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 8px;
}
`;

export default ReviewCommentsArtifact;
