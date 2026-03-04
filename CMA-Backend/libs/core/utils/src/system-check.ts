import { firebaseAdapter } from '@core/database';
import { cloudinaryAdapter } from '@core/storage';
import { cacheManager } from '@core/cache';

/**
 * System Check - Kiem tra ket noi cac service khi khoi dong
 */
export const runSystemCheck = async (): Promise<void> => {
    console.log('\n--- 🛠️  SYSTEM CHECK ---');

    try {
        // 1. Khoi tao Database (Firebase)
        firebaseAdapter.connect();

        // 2. Khoi tao Storage (Cloudinary)
        cloudinaryAdapter.connect();

        // 3. Dam bao Cache Manager duoc load
        if (cacheManager) {
            // Redis tu connect ngam trong CacheManager, ioredis se tu log
        }
    } catch (error) {
        console.error('❌ [System Check] Error:', (error as Error).message);
    }

    console.log('----------------------\n');
};
