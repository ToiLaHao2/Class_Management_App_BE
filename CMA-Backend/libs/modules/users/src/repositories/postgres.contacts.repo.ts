import { BasePostgresRepository } from '@core/database';
import type { IDatabaseAdapter } from '@core/database';
import { IContactsRepository, IContact } from '../user.model';

export class PostgresContactsRepository implements IContactsRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'contacts');
    }

    private mapRow(row: Record<string, unknown>): IContact {
        return {
            id: row.id as string,
            user_id: row.user_id as string,
            category_id: (row.category_id as string) ?? undefined,
            contact_value: row.contact_value as string,
            is_public: row.is_public as boolean,
            is_primary: row.is_primary as boolean,
            created_at: new Date(row.created_at as string),
            updated_at: new Date(row.updated_at as string),
        };
    }

    async findByUserId(userId: string): Promise<IContact[]> {
        const rows = await this.baseRepo.findWhere({ user_id: userId });
        return rows.map(row => this.mapRow(row));
    }

    async create(data: Omit<IContact, 'id' | 'created_at' | 'updated_at'>): Promise<IContact> {
        const row = await this.baseRepo.create(data as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }

    async update(id: string, data: Partial<IContact>): Promise<IContact> {
        const row = await this.baseRepo.update(id, data as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }

    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}
