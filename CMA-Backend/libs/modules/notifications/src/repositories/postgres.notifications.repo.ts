import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { Pool } from 'pg';
import { INotificationsRepository, INotification, CreateNotificationDTO } from '../notifications.model';

function mapNotification(row: any): INotification {
    return {
        id: row.id,
        user_id: row.user_id,
        title: row.title,
        content: row.content,
        type: row.type,
        ref_id: row.ref_id ?? undefined,
        ref_type: row.ref_type ?? undefined,
        is_read: row.is_read,
        created_at: new Date(row.created_at),
        updated_at: new Date(row.updated_at),
    };
}

export class PostgresNotificationsRepository implements INotificationsRepository {
    private pool: Pool;
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.pool = db.getDB() as Pool;
        this.baseRepo = new BasePostgresRepository(db, 'notifications');
    }

    async create(data: CreateNotificationDTO): Promise<INotification> {
        const row = await this.baseRepo.create(data as unknown as Record<string, unknown>);
        return mapNotification(row);
    }

    async findByUserId(userId: string, limit: number = 50, offset: number = 0): Promise<INotification[]> {
        const res = await this.pool.query(
            `SELECT * FROM notifications 
             WHERE user_id = $1 
             ORDER BY created_at DESC 
             LIMIT $2 OFFSET $3`,
            [userId, limit, offset]
        );
        return res.rows.map(mapNotification);
    }

    async markAsRead(id: string, userId: string): Promise<boolean> {
        const res = await this.pool.query(
            `UPDATE notifications 
             SET is_read = true, updated_at = NOW() 
             WHERE id = $1 AND user_id = $2 AND is_read = false`,
            [id, userId]
        );
        return res.rowCount !== null && res.rowCount > 0;
    }

    async markAllAsRead(userId: string): Promise<boolean> {
        const res = await this.pool.query(
            `UPDATE notifications 
             SET is_read = true, updated_at = NOW() 
             WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return res.rowCount !== null && res.rowCount > 0;
    }

    async countUnread(userId: string): Promise<number> {
        const res = await this.pool.query(
            `SELECT COUNT(*) as exact_count FROM notifications WHERE user_id = $1 AND is_read = false`,
            [userId]
        );
        return parseInt(res.rows[0].exact_count, 10);
    }
}
