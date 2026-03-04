import { IAppModule, IEventBus } from '@core/shared';
import express, { Application, Request, Response } from 'express';

class UsersModule implements IAppModule {
    get name(): string { return 'users'; }
    get basePath(): string { return '/users'; }

    register(app: Application, deps: { eventBus: IEventBus }): void {
        const router = express.Router();

        router.get('/health', (_req: Request, res: Response) => {
            res.json({ module: this.name, status: 'ok' });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath}`);
    }
}

export default new UsersModule();
