import { asClass, AwilixContainer } from 'awilix';
import { IAppModule } from '@core/shared';
import { Application } from 'express';
import { PostgresNotificationsRepository } from './repositories/postgres.notifications.repo';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { NOTIFICATIONS_MIGRATION } from './notifications.migration';
import { SocketIoRedisPublisher } from '@core/events';

export * from './notifications.model';
export * from './notifications.service';
export * from './notifications.controller';

class NotificationsModule implements IAppModule {
    get name(): string { return 'notifications'; }
    get basePath(): string { return '/notifications'; }

    register(_app: Application, container: AwilixContainer): void {
        
        // 1. Register Event Publisher if not already registered
        if (!container.hasRegistration('eventPublisher')) {
            container.register({
                eventPublisher: asClass(SocketIoRedisPublisher).singleton(),
            });
        }

        // 2. DI Registration
        container.register({
            notificationsRepository: asClass(PostgresNotificationsRepository).singleton(),
            notificationsService: asClass(NotificationsService).singleton(),
            NotificationsController: asClass(NotificationsController).singleton(),
        });

        // 3. Auto-Migration
        const db = container.resolve<any>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(NOTIFICATIONS_MIGRATION)
                .then(() => console.log('✅ [Notifications] Tables ready.'))
                .catch((err: Error) => console.error('❌ [Notifications] Migration error:', err.message));
        }

        console.log(`📦 Module registered: [${this.name}] (with DI)`);
    }
}

export default new NotificationsModule();
