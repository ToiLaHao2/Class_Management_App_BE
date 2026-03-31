import 'reflect-metadata';
import {
    Controller, Get, Post, Put, Delete,
    Route, Path, Body, Tags, Security, SuccessResponse,
} from '@tsoa/runtime';
import type { IUser, CreateUserDTO, UpdateUserDTO, IContact, CreateContactDTO } from './user.model';
import { IUsersService } from './user.service';

@Route('users')
@Tags('Users')
export class UsersController extends Controller {
    private readonly usersService: IUsersService;

    constructor({ usersService }: { usersService: IUsersService }) {
        super();
        this.usersService = usersService;
    }

    /**
     * Get all users (Admin only)
     */
    @Security('jwt', ['admin'])
    @Get('/')
    public async getUsers(): Promise<IUser[]> {
        return this.usersService.getAllUsers();
    }

    /**
     * Get a single user by ID
     */
    @Security('jwt')
    @Get('{userId}')
    public async getUser(@Path() userId: string): Promise<IUser | null> {
        const user = await this.usersService.getUserById(userId);
        if (!user) return null;
        const { hashed_password: _, ...safeUser } = user;
        return safeUser as unknown as IUser;
    }

    /**
     * Create a new user
     */
    @SuccessResponse('201', 'Created')
    @Post('/')
    public async createUser(@Body() body: CreateUserDTO): Promise<IUser> {
        const user = await this.usersService.createUser(body);
        this.setStatus(201);
        return user;
    }

    /**
     * Update a user (Admin only)
     */
    @Security('jwt', ['admin'])
    @Put('{userId}')
    public async updateUser(@Path() userId: string, @Body() body: UpdateUserDTO): Promise<IUser> {
        return this.usersService.updateProfile(userId, body);
    }

    /**
     * Soft-delete a user (Admin only)
     */
    @Security('jwt', ['admin'])
    @Delete('{userId}')
    public async deleteUser(@Path() userId: string): Promise<{ message: string }> {
        return this.usersService.softDeleteUser(userId);
    }

    // === Contacts ===

    /**
     * Get all contacts for a user
     */
    @Security('jwt')
    @Get('{userId}/contacts')
    public async getUserContacts(@Path() userId: string): Promise<IContact[]> {
        return this.usersService.getUserContacts(userId);
    }

    /**
     * Add a contact to a user
     */
    @Security('jwt')
    @SuccessResponse('201', 'Created')
    @Post('{userId}/contacts')
    public async addContact(@Path() userId: string, @Body() body: CreateContactDTO): Promise<IContact> {
        this.setStatus(201);
        return this.usersService.addContact(userId, body);
    }
}
