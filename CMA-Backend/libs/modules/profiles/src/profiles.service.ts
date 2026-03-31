import {
    IProfilesRepository,
    ITeacherProfile,
    IParentProfile,
    IStudentProfile,
    UpsertTeacherProfileDTO,
    UpsertParentProfileDTO,
    UpsertStudentProfileDTO
} from './profiles.model';
import { IUsersService } from '@modules/users';
import { UnauthorizedError, NotFoundError } from '@core/exceptions';

export interface IProfilesService {
    getTeacher(userId: string): Promise<ITeacherProfile | null>;
    upsertTeacher(userId: string, data: UpsertTeacherProfileDTO): Promise<ITeacherProfile>;

    getParent(userId: string): Promise<IParentProfile | null>;
    upsertParent(userId: string, data?: UpsertParentProfileDTO): Promise<IParentProfile>;

    getStudent(userId: string): Promise<IStudentProfile | null>;
    upsertStudent(userId: string, data: UpsertStudentProfileDTO): Promise<IStudentProfile>;

    linkStudentToParent(studentId: string, parentId: string): Promise<{ message: string }>;
}

export class ProfilesService implements IProfilesService {
    private profilesRepo: IProfilesRepository;
    private usersService: IUsersService;

    constructor({ profilesRepository, usersService }: { profilesRepository: IProfilesRepository, usersService: IUsersService }) {
        this.profilesRepo = profilesRepository;
        this.usersService = usersService;
    }

    // Role Validator
    private async validateRole(userId: string, expectedRole: string) {
        const user = await this.usersService.getUserById(userId);
        if (!user) throw new NotFoundError('User not found');
        if (user.role !== expectedRole && user.role !== 'admin') {
            throw new UnauthorizedError(`User must be ${expectedRole}`);
        }
        return user;
    }

    // --- TEACHER ---
    async getTeacher(userId: string): Promise<ITeacherProfile | null> {
        return this.profilesRepo.getTeacher(userId);
    }

    async upsertTeacher(userId: string, data: UpsertTeacherProfileDTO): Promise<ITeacherProfile> {
        await this.validateRole(userId, 'teacher');
        return this.profilesRepo.upsertTeacher(userId, data);
    }

    // --- PARENT ---
    async getParent(userId: string): Promise<IParentProfile | null> {
        return this.profilesRepo.getParent(userId);
    }

    async upsertParent(userId: string, data?: UpsertParentProfileDTO): Promise<IParentProfile> {
        await this.validateRole(userId, 'parent');
        return this.profilesRepo.upsertParent(userId, data);
    }

    // --- STUDENT ---
    async getStudent(userId: string): Promise<IStudentProfile | null> {
        return this.profilesRepo.getStudent(userId);
    }

    async upsertStudent(userId: string, data: UpsertStudentProfileDTO): Promise<IStudentProfile> {
        await this.validateRole(userId, 'student');
        return this.profilesRepo.upsertStudent(userId, data);
    }

    // --- UTILITIES ---
    async linkStudentToParent(studentId: string, parentId: string): Promise<{ message: string }> {
        // Validate student
        await this.validateRole(studentId, 'student');
        // Validate parent
        const parentRecord = await this.profilesRepo.getParent(parentId);
        if (!parentRecord) {
            // Upsert basic parent profile if it somehow doesn't exist
            await this.upsertParent(parentId, {});
        }

        const success = await this.profilesRepo.linkStudentToParent(studentId, parentId);
        if (!success) {
            throw new NotFoundError('Failed to link student. Student may not exist in profiles.');
        }

        return { message: 'Successfully linked student to parent.' };
    }
}
