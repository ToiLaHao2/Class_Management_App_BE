import { BasePostgresRepository, IDatabaseAdapter } from '@core/database';
import { ICategoriesRepository, ICategory } from '../category.model';

export class PostgresCategoriesRepository implements ICategoriesRepository {
    private baseRepo: BasePostgresRepository;

    constructor({ db }: { db: IDatabaseAdapter }) {
        this.baseRepo = new BasePostgresRepository(db, 'categories');
    }

    private mapRow(row: Record<string, unknown>): ICategory {
        return {
            id: row.id as string,
            type: row.type as string,
            name: row.name as string,
            description: (row.description as string) ?? undefined,
            is_active: row.is_active as boolean,
        };
    }

    async findById(id: string): Promise<ICategory | null> {
        const row = await this.baseRepo.findById(id);
        if (!row) return null;
        return this.mapRow(row);
    }

    async findAll(): Promise<ICategory[]> {
        const rows = await this.baseRepo.findAll();
        return rows.map(row => this.mapRow(row));
    }

    async findByType(type: string): Promise<ICategory[]> {
        const rows = await this.baseRepo.findWhere({ type });
        return rows.map(row => this.mapRow(row));
    }

    async create(data: Omit<ICategory, 'id'>): Promise<ICategory> {
        const row = await this.baseRepo.create(data as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }

    async update(id: string, data: Partial<ICategory>): Promise<ICategory> {
        const row = await this.baseRepo.update(id, data as unknown as Record<string, unknown>);
        return this.mapRow(row);
    }

    async delete(id: string): Promise<boolean> {
        return this.baseRepo.delete(id);
    }
}
