// Storage management utility script
import { storageManager } from '@/lib/storage/StorageManager';

export async function checkStorageHealth() {
  console.log('🔍 Checking localStorage health...');
  
  const info = storageManager.getStorageInfo();
  console.log(`📊 Storage Usage: ${info.formattedUsed} / ${info.formattedTotal} (${info.usagePercentage.toFixed(1)}%)`);
  
  if (info.isNearLimit) {
    console.log('⚠️ Storage is near limit! Consider cleaning up old data.');
    
    const breakdown = await storageManager.getStorageBreakdown();
    console.log('\n📋 Storage Breakdown:');
    breakdown.forEach(item => {
      console.log(`  ${item.category}: ${item.formattedSize} (${item.count} items)`);
    });
    
    console.log('\n🧹 Running automatic cleanup...');
    await storageManager.cleanupStorage();
    
    const newInfo = storageManager.getStorageInfo();
    console.log(`✅ After cleanup: ${newInfo.formattedUsed} / ${newInfo.formattedTotal} (${newInfo.usagePercentage.toFixed(1)}%)`);
  } else {
    console.log('✅ Storage usage is healthy.');
  }
}

// Export for use in browser console
(window as any).checkStorageHealth = checkStorageHealth;