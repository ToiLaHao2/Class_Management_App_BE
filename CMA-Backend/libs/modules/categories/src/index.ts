import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import { PostgresCategoriesRepository } from './repositories/postgres.category.repo';
import { CategoriesService } from './category.service';
import { CATEGORIES_MIGRATION, CATEGORIES_SEED } from './category.migration';

export * from './category.model';
export * from './category.service';

class CategoriesModule implements IAppModule {
    get name(): string { return 'categories'; }
    get basePath(): string { return '/categories'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Auto-migration: tạo bảng nếu chưa có
        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(CATEGORIES_MIGRATION)
                .then(() => {
                    console.log('✅ [Categories] Table ready.');
                    // Seed default data
                    return pool.query(CATEGORIES_SEED);
                })
                .then(() => console.log('✅ [Categories] Default data seeded.'))
                .catch((err: Error) => console.error('❌ [Categories] Migration/Seed error:', err.message));
        }

        // DI Registration
        container.register({
            categoriesRepository: asClass(PostgresCategoriesRepository).singleton(),
            categoriesService: asClass(CategoriesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok' });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new CategoriesModule();
