import {
    Controller, Get, Put, Post,
    Route, Path, Body, Tags, Security, Request,
} from '@tsoa/runtime';
import { IProfilesService } from './profiles.service';
import { IUsersService } from '@modules/users';
import { UnauthorizedError, BadRequestError } from '@core/exceptions';
import {
    ITeacherProfile, IParentProfile, IStudentProfile,
    UpsertTeacherProfileDTO, UpsertParentProfileDTO, UpsertStudentProfileDTO
} from './profiles.model';

@Route('profiles')
@Tags('Profiles')
export class ProfilesController extends Controller {
    private readonly profilesService: IProfilesService;
    private readonly usersService: IUsersService;

    constructor({ profilesService, usersService }: { profilesService: IProfilesService, usersService: IUsersService }) {
        super();
        this.profilesService = profilesService;
        this.usersService = usersService;
    }

    /**
     * Lấy profile của user đang đăng nhập (Tự fetch đúng model theo cấu hình).
     */
    @Security('jwt')
    @Get('me')
    public async getMyProfile(@Request() req: any): Promise<ITeacherProfile | IParentProfile | IStudentProfile | null> {
        const userId = req?.user?.userId;
        const role = req?.user?.role;
        if (!userId || !role) throw new UnauthorizedError('Unauthorized');

        if (role === 'teacher') return this.profilesService.getTeacher(userId);
        if (role === 'parent') return this.profilesService.getParent(userId);
        if (role === 'student') return this.profilesService.getStudent(userId);
        if (role === 'admin') return null; // Admin doesn't have a profile

        throw new BadRequestError('Invalid user role');
    }

    /**
     * Cập nhật Profile của user đang đăng nhập. Data được xác thực theo role.
     */
    @Security('jwt')
    @Put('me')
    public async updateMyProfile(
        @Request() req: any,
        @Body() body: any // Dùng "any" cho Swagger nhận body dynamic, hoặc có thể split ra
    ): Promise<ITeacherProfile | IParentProfile | IStudentProfile> {
        const userId = req?.user?.userId;
        const role = req?.user?.role;
        if (!userId || !role) throw new UnauthorizedError('Unauthorized');

        if (role === 'teacher') {
            return this.profilesService.upsertTeacher(userId, body as UpsertTeacherProfileDTO);
        } else if (role === 'parent') {
            return this.profilesService.upsertParent(userId, body as UpsertParentProfileDTO);
        } else if (role === 'student') {
            return this.profilesService.upsertStudent(userId, body as UpsertStudentProfileDTO);
        }
        
        throw new BadRequestError('User role does not support profiles');
    }

    /**
     * Xem chi tiết profile của một sinh viên (Teacher/Parent/Admin).
     */
    @Security('jwt', ['teacher', 'parent', 'admin'])
    @Get('student/{userId}')
    public async getStudentProfile(@Path() userId: string): Promise<IStudentProfile | null> {
        return this.profilesService.getStudent(userId);
    }

    /**
     * Xem chi tiết profile giáo viên.
     */
    @Security('jwt')
    @Get('teacher/{userId}')
    public async getTeacherProfile(@Path() userId: string): Promise<ITeacherProfile | null> {
        return this.profilesService.getTeacher(userId);
    }

    /**
     * Liên kết học sinh với phụ huynh (Admin/Teacher).
     */
    @Security('jwt', ['teacher', 'admin'])
    @Post('student/{studentId}/link-parent')
    public async linkParentToStudent(
        @Path() studentId: string,
        @Body() body: { parent_id: string }
    ): Promise<{ message: string }> {
        return this.profilesService.linkStudentToParent(studentId, body.parent_id);
    }
}
