/**
 * Undo Service
 * Manages rename history and provides undo functionality
 */

import type { RenameHistoryEntry, RenamePair, UndoResult } from '@/types';

export class UndoService {
  private static history: RenameHistoryEntry[] = [];
  private static readonly MAX_HISTORY = 10;
  private static readonly STORAGE_KEY = 'renomiq_undo_history';

  /**
   * Add a rename operation to history
   */
  static addToHistory(entry: RenameHistoryEntry): void {
    this.history.unshift(entry);

    // Keep only the last MAX_HISTORY entries
    if (this.history.length > this.MAX_HISTORY) {
      this.history = this.history.slice(0, this.MAX_HISTORY);
    }

    // Persist to localStorage
    this.saveToStorage();
  }

  /**
   * Get the last operation for undo
   */
  static getLastOperation(): RenameHistoryEntry | null {
    return this.history[0] || null;
  }

  /**
   * Check if undo is available
   */
  static canUndo(): boolean {
    return this.history.length > 0;
  }

  /**
   * Get all history entries
   */
  static getHistory(): RenameHistoryEntry[] {
    return [...this.history];
  }

  /**
   * Clear history
   */
  static clearHistory(): void {
    this.history = [];
    this.saveToStorage();
  }

  /**
   * Remove a specific entry from history
   */
  static removeEntry(id: string): void {
    this.history = this.history.filter((entry) => entry.id !== id);
    this.saveToStorage();
  }

  /**
   * Perform undo operation
   */
  static async undo(): Promise<UndoResult> {
    const lastOperation = this.getLastOperation();

    if (!lastOperation) {
      return {
        success: false,
        restoredCount: 0,
        error: 'No operation to undo',
      };
    }

    try {
      const { TauriService } = await import('./tauri');
      const result = await TauriService.undoRenames(lastOperation.pairs);

      if (!result.success) {
        return {
          success: false,
          restoredCount: 0,
          error: result.error ?? 'Failed to undo',
        };
      }

      // Remove of entry from history after successful undo
      this.removeEntry(lastOperation.id);

      return {
        success: true,
        restoredCount: result.restoredCount,
      };
    } catch (error) {
      return {
        success: false,
        restoredCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Load history from localStorage
   */
  static loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.history = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load undo history:', error);
      this.history = [];
    }
  }

  /**
   * Save history to localStorage
   */
  private static saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.history));
    } catch (error) {
      console.error('Failed to save undo history:', error);
    }
  }

  /**
   * Create a history entry from rename pairs
   */
  static createHistoryEntry(
    originalPairs: RenamePair[],
    folder: string,
    description: string
  ): RenameHistoryEntry {
    // Reverse pairs for undo (from: newPath, to: oldPath)
    const undoPairs: RenamePair[] = originalPairs.map((pair) => ({
      from: pair.to,
      to: pair.from,
    }));

    return {
      id: `undo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      pairs: undoPairs,
      originalPairs,
      folder,
      description,
    };
  }

  /**
   * Format timestamp to relative time
   */
  static formatRelativeTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) {
      return 'همین الان';
    } else if (minutes < 60) {
      return `${minutes} دقیقه پیش`;
    } else if (hours < 24) {
      return `${hours} ساعت پیش`;
    } else if (days < 7) {
      return `${days} روز پیش`;
    } else {
      return new Date(timestamp).toLocaleDateString('fa-IR');
    }
  }
}

// Load history on module initialization
if (typeof window !== 'undefined') {
  UndoService.loadFromStorage();
}
