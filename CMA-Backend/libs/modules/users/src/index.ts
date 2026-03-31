import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import { PostgresUsersRepository } from './repositories/postgres.user.repo';
import { PostgresContactsRepository } from './repositories/postgres.contacts.repo';
import { UsersService } from './user.service';
import { USERS_MIGRATION } from './user.migration';

export * from './user.model';
export * from './user.service';

class UsersModule implements IAppModule {
    get name(): string { return 'users'; }
    get basePath(): string { return '/users'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Auto-migration: DROP + CREATE bảng users & contacts
        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(USERS_MIGRATION)
                .then(() => console.log('✅ [Users] Tables ready (users + contacts).'))
                .catch((err: Error) => console.error('❌ [Users] Migration error:', err.message));
        }

        // DI Registration
        container.register({
            usersRepository: asClass(PostgresUsersRepository).singleton(),
            contactsRepository: asClass(PostgresContactsRepository).singleton(),
            usersService: asClass(UsersService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok', dbInjected: !!container.resolve('usersRepository') });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new UsersModule();
