/**
 * Categories Model — Bảng lookup dùng chung cho toàn hệ thống.
 * Thay thế hardcoded enums bằng dữ liệu DB-driven.
 */
export interface ICategory {
    id: string; // UUID
    type: string; // e.g. 'class_category', 'teaching_model', 'payment', 'status', 'question_type', ...
    name: string;
    description?: string;
    is_active: boolean;
}

export interface ICategoriesRepository {
    findById(id: string): Promise<ICategory | null>;
    findAll(): Promise<ICategory[]>;
    findByType(type: string): Promise<ICategory[]>;
    create(data: Omit<ICategory, 'id'>): Promise<ICategory>;
    update(id: string, data: Partial<ICategory>): Promise<ICategory>;
    delete(id: string): Promise<boolean>;
}

export interface CreateCategoryDTO {
    type: string;
    name: string;
    description?: string;
    is_active?: boolean;
}

export interface UpdateCategoryDTO {
    name?: string;
    description?: string;
    is_active?: boolean;
}
