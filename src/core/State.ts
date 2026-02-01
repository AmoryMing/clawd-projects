/**
 * StateManager - 状态管理，支持历史记录和撤销/重做
 */

import { Intent, Artifact } from './Agent';

export interface StateEntry {
  id: string;
  intent: Intent;
  result: StateResult;
  timestamp: Date;
  duration: number;
  metadata?: Record<string, any>;
}

export interface StateResult {
  artifact?: Artifact;
  success: boolean;
  error?: string;
}

export interface StateSnapshot {
  entries: StateEntry[];
  currentIndex: number;
}

export class StateManager {
  private history: StateEntry[] = [];
  private currentIndex: number = -1;
  private maxHistorySize: number = 100;

  /**
   * 记录状态
   */
  record(entry: Omit<StateEntry, 'id'>): StateEntry {
    const newEntry: StateEntry = {
      id: this.generateId(),
      ...entry,
      timestamp: entry.timestamp || new Date()
    };

    // 如果在历史中间，重新开始
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    this.history.push(newEntry);
    this.currentIndex = this.history.length - 1;

    // 限制历史大小
    if (this.history.length > this.maxHistorySize) {
      this.history = this.history.slice(-this.maxHistorySize);
      this.currentIndex = this.history.length - 1;
    }

    return newEntry;
  }

  /**
   * 撤销
   */
  undo(): StateEntry | null {
    if (this.currentIndex < 0) return null;

    this.currentIndex--;
    return this.getCurrent();
  }

  /**
   * 重做
   */
  redo(): StateEntry | null {
    if (this.currentIndex >= this.history.length - 1) return null;

    this.currentIndex++;
    return this.getCurrent();
  }

  /**
   * 获取当前状态
   */
  getCurrent(): StateEntry | null {
    if (this.currentIndex < 0 || this.currentIndex >= this.history.length) {
      return null;
    }
    return this.history[this.currentIndex];
  }

  /**
   * 获取历史快照
   */
  getSnapshot(): StateSnapshot {
    return {
      entries: [...this.history],
      currentIndex: this.currentIndex
    };
  }

  /**
   * 恢复快照
   */
  restoreSnapshot(snapshot: StateSnapshot): void {
    this.history = [...snapshot.entries];
    this.currentIndex = snapshot.currentIndex;
  }

  /**
   * 清空历史
   */
  clear(): void {
    this.history = [];
    this.currentIndex = -1;
  }

  /**
   * 获取历史长度
   */
  size(): number {
    return this.history.length;
  }

  /**
   * 按意图类型搜索
   */
  searchByIntentType(type: string): StateEntry[] {
    return this.history.filter(entry => entry.intent.type === type);
  }

  /**
   * 获取最近的 N 条记录
   */
  recent(n: number): StateEntry[] {
    return this.history.slice(-n);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}
