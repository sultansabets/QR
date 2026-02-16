import type { VerificationHistoryItem, VerificationResult } from '@/types';
import type { InstrumentData } from '@/types';

export class HistoryService {
  private readonly STORAGE_KEY = 'verificationHistory';
  private readonly MAX_ITEMS = 100;

  save(item: VerificationHistoryItem): void {
    const history = this.getAll();
    history.unshift(item);
    const trimmedHistory = history.slice(0, this.MAX_ITEMS);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmedHistory));
  }

  getAll(): VerificationHistoryItem[] {
    const data = localStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  getById(id: string): VerificationHistoryItem | null {
    const history = this.getAll();
    return history.find((item) => item.id === id) ?? null;
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getStats(): {
    total: number;
    successful: number;
    errors: number;
    successRate: string;
    today: { total: number; successful: number; errors: number };
  } {
    const history = this.getAll();
    const total = history.length;
    const successful = history.filter((h) => h.result === 'success').length;
    const errors = total - successful;
    const today = new Date().toDateString();
    const todayItems = history.filter(
      (h) => new Date(h.timestamp).toDateString() === today
    );
    return {
      total,
      successful,
      errors,
      successRate: total > 0 ? ((successful / total) * 100).toFixed(1) : '0',
      today: {
        total: todayItems.length,
        successful: todayItems.filter((h) => h.result === 'success').length,
        errors: todayItems.filter((h) => h.result === 'error').length,
      },
    };
  }

  addFromVerification(
    instrumentData: InstrumentData,
    result: VerificationResult
  ): VerificationHistoryItem {
    const item: VerificationHistoryItem = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: result.timestamp,
      instrumentName: instrumentData.name,
      instrumentType: instrumentData.type,
      result: result.success ? 'success' : 'error',
      details: result,
      instrumentData,
    };
    this.save(item);
    return item;
  }
}

export const historyService = new HistoryService();
