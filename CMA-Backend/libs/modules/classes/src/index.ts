import { IAppModule } from '@core/shared';
import express, { Application, Request, Response } from 'express';
import { AwilixContainer, asClass } from 'awilix';
import { Pool } from 'pg';

import {
    PostgresClassesRepository,
    PostgresTeachersClassesRepository,
    PostgresClassesStudentsRepository,
    PostgresLessonsRepository,
} from './repositories/postgres.classes.repo';
import { ClassesService } from './classes.service';
import { CLASSES_MIGRATION } from './classes.migration';

export * from './classes.model';
export * from './classes.service';

class ClassesModule implements IAppModule {
    get name(): string { return 'classes'; }
    get basePath(): string { return '/classes'; }

    register(app: Application, container: AwilixContainer): void {
        const router = express.Router();

        // Auto-migration: Tạo 4 bảng classes
        const db = container.resolve<{ getDB: () => Pool }>('db');
        const pool = db.getDB();
        if (pool) {
            pool.query(CLASSES_MIGRATION)
                .then(() => console.log('✅ [Classes] Tables ready (classes, teachers_classes, classes_students, lessons).'))
                .catch((err: Error) => console.error('❌ [Classes] Migration error:', err.message));
        }

        // DI Registration
        container.register({
            classesRepository: asClass(PostgresClassesRepository).singleton(),
            teachersClassesRepository: asClass(PostgresTeachersClassesRepository).singleton(),
            classesStudentsRepository: asClass(PostgresClassesStudentsRepository).singleton(),
            lessonsRepository: asClass(PostgresLessonsRepository).singleton(),
            classesService: asClass(ClassesService).singleton(),
        });

        router.get('/health', (_req: Request, res: Response) => {
            res.json({
                module: this.name,
                status: 'ok',
                tables: ['classes', 'teachers_classes', 'classes_students', 'lessons'],
            });
        });

        app.use(this.basePath, router);
        console.log(`📦 Module registered: [${this.name}] at ${this.basePath} (with DI)`);
    }
}

export default new ClassesModule();
