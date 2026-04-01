import {
    Controller, Get, Put, Route, Path, Query, Tags, Security, Request, Body
} from '@tsoa/runtime';
import { INotificationsService } from './notifications.service';
import { INotification, CreateNotificationDTO } from './notifications.model';
import express from 'express';

interface RequestWithUser extends express.Request {
    user: { id: string; role: string };
}

@Route('notifications')
@Tags('Notifications')
export class NotificationsController extends Controller {
    private notificationsService: INotificationsService;

    constructor({ notificationsService }: { notificationsService: INotificationsService }) {
        super();
        this.notificationsService = notificationsService;
    }

    /**
     * Lấy danh sách thông báo của user đang đăng nhập (có phân trang)
     */
    @Security('jwt')
    @Get('/')
    public async getMyNotifications(
        @Request() req: RequestWithUser,
        @Query() limit: number = 20,
        @Query() offset: number = 0
    ): Promise<INotification[]> {
        return this.notificationsService.getUserNotifications(req.user.id, limit, offset);
    }

    /**
     * Lấy số lượng thông báo chưa đọc của user
     */
    @Security('jwt')
    @Get('/unread-count')
    public async getUnreadCount(
        @Request() req: RequestWithUser
    ): Promise<{ count: number }> {
        return this.notificationsService.getUnreadCount(req.user.id);
    }

    /**
     * Đánh dấu tất cả thông báo là đã đọc
     */
    @Security('jwt')
    @Put('/read-all')
    public async markAllAsRead(
        @Request() req: RequestWithUser
    ): Promise<{ success: boolean; message: string }> {
        return this.notificationsService.markAllAsRead(req.user.id);
    }

    /**
     * Đánh dấu 1 thông báo cụ thể là đã đọc
     */
    @Security('jwt')
    @Put('/{id}/read')
    public async markAsRead(
        @Request() req: RequestWithUser,
        @Path() id: string
    ): Promise<{ success: boolean; message: string }> {
        return this.notificationsService.markAsRead(id, req.user.id);
    }

    /**
     * API Test (Chỉ dùng nội bộ/cho role test) để bắn thông báo.
     * Thực tế các service khác gọi trực tiếp internal methods.
     */
    @Security('jwt', ['admin'])
    @Put('/test-trigger')
    public async testTriggerNotification(
        @Body() body: CreateNotificationDTO
    ): Promise<INotification> {
        return this.notificationsService.createNotification(body);
    }
}
