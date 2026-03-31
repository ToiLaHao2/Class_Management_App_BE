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
        // 1. Tìm user theo email
        const user = await this.usersService.getUserByEmail(data.email);
        if (!user) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        // 2. So sánh mật khẩu (field mới: hashed_password)
        const isPasswordValid = await comparePassword(data.password, user.hashed_password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Email hoặc mật khẩu không chính xác');
        }

        // 3. Kiểm tra is_active (thay cho is_deleted)
        if (!user.is_active) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        // 4. Sinh Access Token (JWT)
        const payload = {
            userId: user.id,
            email: user.email,
            role: user.role,
            roles: [user.role],
        };

        const accessToken = jwt.sign(payload, securityConfig.jwtSecret, { expiresIn: '1d' });

        // 5. Lọc bỏ hashed_password trả về UI
        const { hashed_password: _, ...safeUser } = user;

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
        if (!user.is_active) {
            throw new UnauthorizedError('Tài khoản đã bị vô hiệu hóa');
        }

        const isPasswordValid = await comparePassword(currentPassword, user.hashed_password);
        if (!isPasswordValid) {
            throw new UnauthorizedError('Mật khẩu hiện tại không đúng');
        }

        const newHash = await hashPassword(newPassword);
        await this.usersService.updatePasswordHash(userId, newHash);

        return { message: 'Đổi mật khẩu thành công' };
    }
}
