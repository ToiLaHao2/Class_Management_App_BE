import 'reflect-metadata';
import {
    Controller, Get, Post, Put, Delete,
    Route, Path, Body, Query, Tags, Security, SuccessResponse,
} from '@tsoa/runtime';
import { ICategoriesService } from './category.service';
import type { ICategory, CreateCategoryDTO, UpdateCategoryDTO } from './category.model';

@Route('categories')
@Tags('Categories')
export class CategoriesController extends Controller {
    private readonly categoriesService: ICategoriesService;

    constructor({ categoriesService }: { categoriesService: ICategoriesService }) {
        super();
        this.categoriesService = categoriesService;
    }

    /**
     * Lấy tất cả categories (có thể filter theo type)
     * @param type Optional: filter theo type (e.g. 'class_category', 'status')
     */
    @Get('/')
    public async getCategories(@Query() type?: string): Promise<ICategory[]> {
        if (type) {
            return this.categoriesService.getByType(type);
        }
        return this.categoriesService.getAll();
    }

    /**
     * Lấy category theo ID
     */
    @Get('{id}')
    public async getCategory(@Path() id: string): Promise<ICategory> {
        return this.categoriesService.getById(id);
    }

    /**
     * Tạo category mới (Admin only)
     */
    @Security('jwt', ['admin'])
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createCategory(@Body() body: CreateCategoryDTO): Promise<ICategory> {
        this.setStatus(201);
        return this.categoriesService.create(body);
    }

    /**
     * Cập nhật category (Admin only)
     */
    @Security('jwt', ['admin'])
    @Put('{id}')
    public async updateCategory(@Path() id: string, @Body() body: UpdateCategoryDTO): Promise<ICategory> {
        return this.categoriesService.update(id, body);
    }

    /**
     * Xóa category (Admin only)
     */
    @Security('jwt', ['admin'])
    @Delete('{id}')
    public async deleteCategory(@Path() id: string): Promise<{ message: string }> {
        return this.categoriesService.remove(id);
    }
}
