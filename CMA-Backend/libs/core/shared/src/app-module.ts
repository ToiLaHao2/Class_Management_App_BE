import { Application } from 'express';

/**
 * IAppModule — Interface contract cho tat ca business modules.
 * Moi module (users, courses, auth, ...) PHAI implement interface nay.
 */
export interface IAppModule {
    readonly name: string;
    readonly basePath: string;
    register(app: Application, deps: Record<string, unknown>): void;
}
