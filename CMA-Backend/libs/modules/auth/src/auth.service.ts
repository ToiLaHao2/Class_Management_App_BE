import * as jwt from 'jsonwebtoken';
import { IUsersService, LoginDTO } from '@modules/users';
import { UnauthorizedError } from '@core/exceptions';
import { securityConfig } from '@core/config';
import { comparePassword, hashPassword } from '@core/utils';

export interface IAuthService {
    login(data: LoginDTO): Promise<{ accessToken: string, user: Record<string, any> }>;
    changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{ message: string }>;
}

export class AuthService implements IAuthService {
    private usersService: IUsersService;

    constructor({ usersService }: { usersService: IUsersService }) {
        this.usersService = usersService;
    }

    async login(data: LoginDTO) {
        // 1. Tìm user theo email (qua UsersService, KHÔNG gọi trực tiếp Repo)
        const user = await this.usersService.getUserByEmail(data.email);
        if (!user) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        // 2. So sánh mật khẩu bằng utility
        const isPasswordValid = await comparePassword(data.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        if (user.isDeleted) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        // 3. Sinh Access Token (JWT)
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            roles: [user.role],
        };

        const accessToken = jwt.sign(payload, securityConfig.jwtSecret, { expiresIn: '1d' });

        // 4. Lọc bỏ các trường nhạy cảm trả về UI
        const { passwordHash: _, isDeleted, ...safeUser } = user;

        return {
            accessToken,
            user: safeUser
        };
    }

    async changePassword(userId: string, currentPassword: string, newPassword: string) {
        const user = await this.usersService.getUserById(userId);
        if (!user) {
            throw new UnauthorizedError('Người dùng không tồn tại');
        }
        if (user.isDeleted) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
        }

        const newHash = await hashPassword(newPassword);
        await this.usersService.updatePasswordHash(userId, newHash, false);

        return { message: 'Đổi mật khẩu thành công' };
    }
}
