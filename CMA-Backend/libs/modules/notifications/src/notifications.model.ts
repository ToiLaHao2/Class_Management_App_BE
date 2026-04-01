export interface INotification {
    id: string;
    user_id: string;
    title: string;
    content: string;
    type: string;
    ref_id?: string;
    ref_type?: string;
    is_read: boolean;
    created_at: Date;
    updated_at: Date;
}

export interface CreateNotificationDTO {
    user_id: string;
    title: string;
    content: string;
    type: string;
    ref_id?: string;
    ref_type?: string;
}

export interface INotificationsRepository {
    create(data: CreateNotificationDTO): Promise<INotification>;
    findByUserId(userId: string, limit?: number, offset?: number): Promise<INotification[]>;
    markAsRead(id: string, userId: string): Promise<boolean>;
    markAllAsRead(userId: string): Promise<boolean>;
    countUnread(userId: string): Promise<number>;
}
