import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { storage } from './storage';

interface AuthenticatedSocket {
  userId: number;
  email: string;
}

export function setupWebSocket(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    path: '/ws',
    cors: {
      origin: true,
      credentials: true
    }
  });

  // Store connected users
  const connectedUsers = new Map<string, AuthenticatedSocket>();

  io.on('connection', (socket) => {
    console.log('새로운 WebSocket 연결:', socket.id);

    // Authentication middleware
    socket.on('authenticate', async (data: { userId: number; email: string }) => {
      try {
        // Verify user exists
        const user = await storage.getUser(data.userId);
        if (user && user.email === data.email) {
          connectedUsers.set(socket.id, {
            userId: data.userId,
            email: data.email
          });
          
          socket.join(`user_${data.userId}`);
          socket.emit('authenticated', { success: true });
          
          // Send unread notifications count
          const notifications = await storage.getUnreadNotifications(data.userId);
          socket.emit('unread_count', { count: notifications.length });
          
          console.log(`사용자 인증 완료: ${data.email} (${socket.id})`);
        } else {
          socket.emit('auth_error', { message: '인증에 실패했습니다' });
        }
      } catch (error) {
        console.error('WebSocket 인증 오류:', error);
        socket.emit('auth_error', { message: '인증 중 오류가 발생했습니다' });
      }
    });

    // Handle notification read
    socket.on('mark_notification_read', async (data: { notificationId: number }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        try {
          await storage.markNotificationAsRead(data.notificationId, user.userId);
          const unreadCount = await storage.getUnreadNotifications(user.userId);
          socket.emit('unread_count', { count: unreadCount.length });
        } catch (error) {
          console.error('알림 읽음 처리 오류:', error);
        }
      }
    });

    // Handle signature status updates
    socket.on('subscribe_document', (data: { documentId: number }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.join(`document_${data.documentId}`);
        console.log(`사용자 ${user.email}가 문서 ${data.documentId} 구독 시작`);
      }
    });

    socket.on('unsubscribe_document', (data: { documentId: number }) => {
      socket.leave(`document_${data.documentId}`);
    });

    // Handle workflow updates
    socket.on('subscribe_workflow', (data: { workflowId: string }) => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        socket.join(`workflow_${data.workflowId}`);
        console.log(`사용자 ${user.email}가 워크플로우 ${data.workflowId} 구독 시작`);
      }
    });

    socket.on('disconnect', () => {
      const user = connectedUsers.get(socket.id);
      if (user) {
        console.log(`사용자 연결 해제: ${user.email} (${socket.id})`);
      }
      connectedUsers.delete(socket.id);
    });
  });

  return io;
}

// Export notification helper functions
export class NotificationService {
  private io: SocketIOServer;

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async sendNotification(userId: number, notification: {
    title: string;
    message: string;
    type: string;
    metadata?: any;
  }) {
    try {
      // Save to database
      const savedNotification = await storage.createNotification({
        userId,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata,
      });

      // Send real-time notification
      this.io.to(`user_${userId}`).emit('new_notification', {
        id: savedNotification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        metadata: notification.metadata,
        createdAt: savedNotification.createdAt,
      });

      // Update unread count
      const unreadNotifications = await storage.getUnreadNotifications(userId);
      this.io.to(`user_${userId}`).emit('unread_count', { 
        count: unreadNotifications.length 
      });

      return savedNotification;
    } catch (error) {
      console.error('알림 전송 오류:', error);
      throw error;
    }
  }

  async broadcastDocumentUpdate(documentId: number, update: {
    type: string;
    message: string;
    data?: any;
  }) {
    this.io.to(`document_${documentId}`).emit('document_update', {
      documentId,
      type: update.type,
      message: update.message,
      data: update.data,
      timestamp: new Date(),
    });
  }

  async broadcastWorkflowUpdate(workflowId: string, update: {
    type: string;
    message: string;
    currentStep?: any;
    progress?: { completed: number; total: number };
  }) {
    this.io.to(`workflow_${workflowId}`).emit('workflow_update', {
      workflowId,
      type: update.type,
      message: update.message,
      currentStep: update.currentStep,
      progress: update.progress,
      timestamp: new Date(),
    });
  }

  async sendSecurityAlert(userId: number, alert: {
    title: string;
    message: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    metadata?: any;
  }) {
    await this.sendNotification(userId, {
      title: alert.title,
      message: alert.message,
      type: 'security_alert',
      metadata: {
        severity: alert.severity,
        ...alert.metadata,
      },
    });

    // Send immediate push notification for high/critical alerts
    if (alert.severity === 'high' || alert.severity === 'critical') {
      this.io.to(`user_${userId}`).emit('security_alert', {
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        timestamp: new Date(),
      });
    }
  }
}

export let notificationService: NotificationService;