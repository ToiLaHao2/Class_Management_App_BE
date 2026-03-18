import { firebaseAdapter, seedSuperAdmin } from '@core/database';
import { cloudinaryAdapter } from '@core/storage';
import { cacheManager } from '@core/cache';

/**
 * System Check - Kiem tra ket noi cac service khi khoi dong
 */
export const runSystemCheck = async (): Promise<void> => {
    console.log('\n--- 🛠️  SYSTEM CHECK ---');

    try {
        // 1. Khoi tao Database (Firebase)
        const { db, admin } = firebaseAdapter.connect();

        // 1.1 Seed default Super Admin (optional, env-driven)
        if (db && admin) {
            await seedSuperAdmin(db, admin);
        }

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
