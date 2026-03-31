import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import { PostgresProfilesRepository } from './repositories/postgres.profiles.repo';
import { ProfilesService } from './profiles.service';
import { PROFILES_MIGRATION } from './profiles.migration';

export * from './profiles.model';
export * from './profiles.service';

class ProfilesModule implements IAppModule {
    get name(): string { return 'profiles'; }
    get basePath(): string { return '/profiles'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Auto-migration: Tạo bảng profiles
        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(PROFILES_MIGRATION)
                .then(() => console.log('✅ [Profiles] Tables ready (teacher, parent, student).'))
                .catch((err: Error) => console.error('❌ [Profiles] Migration error:', err.message));
        }

        // DI Registration
        container.register({
            profilesRepository: asClass(PostgresProfilesRepository).singleton(),
            profilesService: asClass(ProfilesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', dbInjected: !!container.resolve('profilesRepository') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new ProfilesModule();
