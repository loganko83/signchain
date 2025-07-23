import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { io, Socket } from "socket.io-client";
import { Bell, X, Check, AlertTriangle, Mail, FileText, Shield, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  metadata?: any;
  createdAt: string;
}

interface NotificationCenterProps {
  userId: number;
  userEmail: string;
}

export default function NotificationCenter({ userId, userEmail }: NotificationCenterProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch notifications
  const { data: notifications = [], refetch } = useQuery({
    queryKey: ["/api/notifications"],
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      if (!response.ok) throw new Error("알림을 가져올 수 없습니다");
      return response.json();
    },
  });

  // Mark notification as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const response = await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("알림 읽음 처리 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      });
      if (!response.ok) throw new Error("모든 알림 읽음 처리 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      setUnreadCount(0);
    },
  });

  // Setup WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const newSocket = io(wsUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('실시간 알림 서버에 연결됨');
      // Authenticate with the server
      newSocket.emit('authenticate', { userId, email: userEmail });
    });

    newSocket.on('authenticated', (data) => {
      if (data.success) {
        console.log('WebSocket 인증 완료');
      }
    });

    newSocket.on('auth_error', (data) => {
      console.error('WebSocket 인증 실패:', data.message);
      toast({
        title: "연결 오류",
        description: "실시간 알림 연결에 실패했습니다.",
        variant: "destructive",
      });
    });

    newSocket.on('new_notification', (notification) => {
      console.log('새 알림 수신:', notification);
      
      // Show toast notification
      toast({
        title: notification.title,
        description: notification.message,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              markAsReadMutation.mutate(notification.id);
              setIsOpen(true);
            }}
          >
            확인
          </Button>
        ),
      });

      // Refresh notifications list
      refetch();
    });

    newSocket.on('unread_count', (data) => {
      setUnreadCount(data.count);
    });

    newSocket.on('document_update', (update) => {
      console.log('문서 업데이트:', update);
      toast({
        title: "문서 업데이트",
        description: update.message,
      });
    });

    newSocket.on('workflow_update', (update) => {
      console.log('워크플로우 업데이트:', update);
      toast({
        title: "워크플로우 업데이트",
        description: update.message,
      });
    });

    newSocket.on('security_alert', (alert) => {
      console.log('보안 알림:', alert);
      toast({
        title: alert.title,
        description: alert.message,
        variant: alert.severity === 'high' || alert.severity === 'critical' ? "destructive" : "default",
      });
    });

    newSocket.on('disconnect', () => {
      console.log('실시간 알림 서버 연결 해제');
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [userId, userEmail, toast, refetch, markAsReadMutation]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'signature_request':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'signature_completed':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'workflow_update':
        return <Workflow className="h-4 w-4 text-purple-500" />;
      case 'security_alert':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'blockchain_confirmation':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default:
        return <Mail className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'signature_request':
        return '서명 요청';
      case 'signature_completed':
        return '서명 완료';
      case 'workflow_update':
        return '워크플로우';
      case 'security_alert':
        return '보안 알림';
      case 'blockchain_confirmation':
        return '블록체인 확인';
      default:
        return '알림';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return date.toLocaleDateString('ko-KR');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="destructive" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">알림</CardTitle>
              <div className="flex items-center gap-2">
                {notifications.filter((n: Notification) => !n.isRead).length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAllAsReadMutation.mutate()}
                    disabled={markAllAsReadMutation.isPending}
                  >
                    모두 읽음
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {unreadCount > 0 && (
              <CardDescription>
                {unreadCount}개의 읽지 않은 알림이 있습니다
              </CardDescription>
            )}
          </CardHeader>
          
          <CardContent className="p-0">
            <ScrollArea className="h-96">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>알림이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {notifications.map((notification: Notification, index: number) => (
                    <div key={notification.id}>
                      <div
                        className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${
                          !notification.isRead ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            markAsReadMutation.mutate(notification.id);
                          }
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-0.5">
                            {getNotificationIcon(notification.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className={`text-sm font-medium ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {notification.message}
                            </p>
                            <div className="flex items-center justify-between">
                              <Badge variant="secondary" className="text-xs">
                                {getNotificationTypeText(notification.type)}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {formatTime(notification.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {index < notifications.length - 1 && <Separator />}
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}