import { INotificationsRepository, INotification, CreateNotificationDTO } from './notifications.model';
import { IEventPublisher } from '@core/events';

export interface INotificationsService {
    createNotification(data: CreateNotificationDTO): Promise<INotification>;
    getUserNotifications(userId: string, limit?: number, offset?: number): Promise<INotification[]>;
    markAsRead(id: string, userId: string): Promise<{ success: boolean; message: string }>;
    markAllAsRead(userId: string): Promise<{ success: boolean; message: string }>;
    getUnreadCount(userId: string): Promise<{ count: number }>;
}

export class NotificationsService implements INotificationsService {
    private notificationsRepo: INotificationsRepository;
    private eventPublisher: IEventPublisher;

    constructor({
        notificationsRepository,
        eventPublisher,
    }: {
        notificationsRepository: INotificationsRepository;
        eventPublisher: IEventPublisher;
    }) {
        this.notificationsRepo = notificationsRepository;
        this.eventPublisher = eventPublisher;
    }

    async createNotification(data: CreateNotificationDTO): Promise<INotification> {
        // 1. Lưu DB
        const notification = await this.notificationsRepo.create(data);

        // 2. Phát tán sự kiện qua Redis Emitter -> Tới thẳng user room
        this.eventPublisher.emitToUser(data.user_id, 'new_notification', notification);

        return notification;
    }

    async getUserNotifications(userId: string, limit: number = 50, offset: number = 0): Promise<INotification[]> {
        return this.notificationsRepo.findByUserId(userId, limit, offset);
    }

    async markAsRead(id: string, userId: string): Promise<{ success: boolean; message: string }> {
        const success = await this.notificationsRepo.markAsRead(id, userId);
        return {
            success,
            message: success ? 'Đã cập nhật trạng thái đã xem' : 'Không tìm thấy thông báo hoặc thông báo đã được xem trước đó'
        };
    }

    async markAllAsRead(userId: string): Promise<{ success: boolean; message: string }> {
        const success = await this.notificationsRepo.markAllAsRead(userId);
        return {
            success,
            message: success ? 'Tất cả thông báo đã được đánh dấu đọc' : 'Không có thông báo nào cần cập nhật'
        };
    }

    async getUnreadCount(userId: string): Promise<{ count: number }> {
        const count = await this.notificationsRepo.countUnread(userId);
        return { count };
    }
}
