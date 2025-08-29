import { LocalStorageProvider } from './LocalStorageProvider';

// Utility to help users manage localStorage
export class StorageManager {
  private storage: LocalStorageProvider;

  constructor() {
    this.storage = new LocalStorageProvider();
  }

  // Get current storage usage information
  getStorageInfo() {
    const info = this.storage.getStorageInfo();
    const usagePercentage = (info.used / info.total) * 100;
    
    return {
      ...info,
      usagePercentage,
      formattedUsed: this.formatBytes(info.used),
      formattedTotal: this.formatBytes(info.total),
      formattedAvailable: this.formatBytes(info.available),
      isNearLimit: usagePercentage > 80
    };
  }

  // Format bytes to human readable format
  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Manual cleanup trigger
  async cleanupStorage() {
    await this.storage.cleanup();
  }

  // Get detailed breakdown of what's using storage
  async getStorageBreakdown() {
    try {
      const keys = await this.storage.getAllKeys();
      const breakdown: Record<string, { size: number; count: number }> = {};
      
      for (const key of keys) {
        const value = await this.storage.getItem(key);
        const size = (key.length + (value?.length || 0)) * 2; // Rough estimate including encoding
        
        // Categorize by key prefix/type
        let category = 'other';
        if (key.includes('test_results')) category = 'Test Results';
        else if (key.includes('test_sessions')) category = 'Test Sessions';
        else if (key.includes('user_preferences')) category = 'User Preferences';
        else if (key.includes('randomization')) category = 'Randomization';
        else if (key.includes('cache')) category = 'Cache';
        
        if (!breakdown[category]) {
          breakdown[category] = { size: 0, count: 0 };
        }
        breakdown[category].size += size;
        breakdown[category].count++;
      }
      
      return Object.entries(breakdown).map(([category, data]) => ({
        category,
        size: data.size,
        count: data.count,
        formattedSize: this.formatBytes(data.size)
      }));
    } catch (error) {
      console.error('Error getting storage breakdown:', error);
      return [];
    }
  }

  // Check if storage needs attention
  needsAttention(): boolean {
    const info = this.getStorageInfo();
    return info.isNearLimit;
  }
}

// Global storage manager instance
export const storageManager = new StorageManager();