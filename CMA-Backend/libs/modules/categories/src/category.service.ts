import { ICategoriesRepository, ICategory, CreateCategoryDTO, UpdateCategoryDTO } from './category.model';
import { NotFoundError } from '@core/exceptions';

export interface ICategoriesService {
    getAll(): Promise<ICategory[]>;
    getByType(type: string): Promise<ICategory[]>;
    getById(id: string): Promise<ICategory>;
    create(data: CreateCategoryDTO): Promise<ICategory>;
    update(id: string, data: UpdateCategoryDTO): Promise<ICategory>;
    remove(id: string): Promise<{ message: string }>;
}

export class CategoriesService implements ICategoriesService {
    private categoriesRepository: ICategoriesRepository;

    constructor({ categoriesRepository }: { categoriesRepository: ICategoriesRepository }) {
        this.categoriesRepository = categoriesRepository;
    }

    async getAll(): Promise<ICategory[]> {
        return this.categoriesRepository.findAll();
    }

    async getByType(type: string): Promise<ICategory[]> {
        return this.categoriesRepository.findByType(type);
    }

    async getById(id: string): Promise<ICategory> {
        const cat = await this.categoriesRepository.findById(id);
        if (!cat) throw new NotFoundError(`Category ${id} not found`);
        return cat;
    }

    async create(data: CreateCategoryDTO): Promise<ICategory> {
        return this.categoriesRepository.create({
            type: data.type,
            name: data.name,
            description: data.description,
            is_active: data.is_active ?? true,
        });
    }

    async update(id: string, data: UpdateCategoryDTO): Promise<ICategory> {
        await this.getById(id); // Throw if not found
        return this.categoriesRepository.update(id, data);
    }

    async remove(id: string): Promise<{ message: string }> {
        await this.getById(id);
        await this.categoriesRepository.delete(id);
        return { message: `Category ${id} deleted` };
    }
}
