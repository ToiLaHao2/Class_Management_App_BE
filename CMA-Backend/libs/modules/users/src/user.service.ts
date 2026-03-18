import { IUsersRepository, CreateUserDTO, IUserEntity } from './user.model';
import { BadRequestError } from '@core/exceptions';
import { hashPassword } from '@core/utils';

export interface IUsersService {
    getUserById(id: string): Promise<IUserEntity | null>;
    getUserByEmail(email: string): Promise<IUserEntity | null>;
    createUser(data: CreateUserDTO): Promise<Omit<IUserEntity, 'passwordHash'>>;
    updatePasswordHash(userId: string, passwordHash: string, mustChangePassword: boolean): Promise<void>;
    updateProfile(userId: string, data: { fullName?: string; avatar?: string }): Promise<Omit<IUserEntity, 'passwordHash'>>;
}

export class UsersService implements IUsersService {
    private usersRepository: IUsersRepository;

    constructor({ usersRepository }: { usersRepository: IUsersRepository }) {
        this.usersRepository = usersRepository;
    }

    async getUserById(id: string): Promise<IUserEntity | null> {
        return this.usersRepository.findById(id);
    }

    async getUserByEmail(email: string): Promise<IUserEntity | null> {
        return this.usersRepository.findByEmail(email);
    }

    async createUser(data: CreateUserDTO): Promise<Omit<IUserEntity, 'passwordHash'>> {
        // 1. Kiểm tra email đã tồn tại chưa
        const existingUser = await this.usersRepository.findByEmail(data.email);
        if (existingUser) {
            throw new BadRequestError('Email đã được sử dụng');
        }

        // 2. Hash mật khẩu bằng Utility của Core
        const passwordHash = await hashPassword(data.password);

        // 3. Chuẩn bị payload lưu DB
        const payload: Partial<IUserEntity> = {
            email: data.email,
            passwordHash,
            fullName: data.fullName,
            role: data.role,
            mustChangePassword: false,
        };
        if (data.avatar) payload.avatar = data.avatar;

        // 4. Lưu vào Database thông qua Repository
        const newUser = await this.usersRepository.create(payload as Omit<IUserEntity, 'id' | 'createdAt' | 'isDeleted'>);

        // 5. Loại bỏ passwordHash trước khi trả về
        const { passwordHash: _, ...userWithoutPassword } = newUser;
        return userWithoutPassword;
    }

    async updatePasswordHash(userId: string, passwordHash: string, mustChangePassword: boolean): Promise<void> {
        await this.usersRepository.update(userId, { passwordHash, mustChangePassword });
    }

    async updateProfile(userId: string, data: { fullName?: string; avatar?: string }): Promise<Omit<IUserEntity, 'passwordHash'>> {
        const updated = await this.usersRepository.update(userId, {
            ...(data.fullName ? { fullName: data.fullName } : {}),
            ...(data.avatar ? { avatar: data.avatar } : {}),
        });
        const { passwordHash: _, ...userWithoutPassword } = updated;
        return userWithoutPassword;
    }
}
