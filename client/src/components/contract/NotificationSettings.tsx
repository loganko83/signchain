import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Hash,
  Clock,
  Calendar,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Trash2,
  Edit2,
  Send,
  Settings,
  Globe,
  Zap
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface NotificationChannel {
  id: string;
  type: "email" | "sms" | "kakao" | "slack" | "teams";
  name: string;
  enabled: boolean;
  config: Record<string, any>;
}

interface NotificationTemplate {
  id: string;
  name: string;
  channel: string;
  event: string;
  subject?: string;
  content: string;
  variables: string[];
}

interface NotificationEvent {
  id: string;
  name: string;
  description: string;
  variables: string[];
  enabled: boolean;
}

export default function NotificationSettings() {
  const { toast } = useToast();
  
  const [channels, setChannels] = useState<NotificationChannel[]>([
    {
      id: "1",
      type: "email",
      name: "이메일 (SendGrid)",
      enabled: true,
      config: {
        provider: "sendgrid",
        apiKey: "sg_xxxxx",
        fromEmail: "noreply@signchain.io",
        fromName: "SignChain"
      }
    },
    {
      id: "2",
      type: "sms",
      name: "SMS (Twilio)",
      enabled: true,
      config: {
        provider: "twilio",
        accountSid: "AC_xxxxx",
        authToken: "xxxxx",
        fromNumber: "+821012345678"
      }
    },
    {
      id: "3",
      type: "kakao",
      name: "카카오톡 알림톡",
      enabled: false,
      config: {
        provider: "kakao",
        apiKey: "",
        templateCode: ""
      }
    },
    {
      id: "4",
      type: "slack",
      name: "Slack",
      enabled: true,
      config: {
        webhookUrl: "https://hooks.slack.com/services/xxx"
      }
    }
  ]);

  const [templates, setTemplates] = useState<NotificationTemplate[]>([
    {
      id: "1",
      name: "서명 요청 이메일",
      channel: "email",
      event: "signature_requested",
      subject: "[SignChain] {{document_title}} 서명 요청",
      content: "안녕하세요 {{signer_name}}님,\n\n{{sender_name}}님이 '{{document_title}}' 문서에 서명을 요청했습니다.\n\n서명하기: {{signature_link}}\n\n감사합니다.",
      variables: ["signer_name", "sender_name", "document_title", "signature_link"]
    },
    {
      id: "2",
      name: "서명 완료 SMS",
      channel: "sms",
      event: "signature_completed",
      content: "[SignChain] {{signer_name}}님이 {{document_title}} 문서에 서명을 완료했습니다.",
      variables: ["signer_name", "document_title"]
    }
  ]);

  const [events] = useState<NotificationEvent[]>([
    {
      id: "signature_requested",
      name: "서명 요청됨",
      description: "새로운 서명 요청이 발송될 때",
      variables: ["signer_name", "sender_name", "document_title", "signature_link", "expires_at"],
      enabled: true
    },
    {
      id: "signature_completed",
      name: "서명 완료",
      description: "서명이 완료되었을 때",
      variables: ["signer_name", "document_title", "signed_at"],
      enabled: true
    },
    {
      id: "signature_rejected",
      name: "서명 거절",
      description: "서명이 거절되었을 때",
      variables: ["signer_name", "document_title", "reason"],
      enabled: true
    },
    {
      id: "document_expired",
      name: "문서 만료",
      description: "서명 기한이 만료되었을 때",
      variables: ["document_title", "expired_at"],
      enabled: true
    },
    {
      id: "reminder_sent",
      name: "리마인더 발송",
      description: "서명 리마인더가 발송될 때",
      variables: ["signer_name", "document_title", "signature_link"],
      enabled: true
    }
  ]);

  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [testRecipient, setTestRecipient] = useState("");

  const testNotification = async (templateId: string) => {
    if (!testRecipient) {
      toast({
        title: "수신자 필요",
        description: "테스트 수신자를 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "테스트 발송 중",
      description: "알림을 발송하고 있습니다..."
    });

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "테스트 발송 완료",
        description: `${testRecipient}(으)로 테스트 알림이 발송되었습니다.`
      });
    }, 2000);
  };

  const saveTemplate = (template: NotificationTemplate) => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t => 
        t.id === template.id ? template : t
      ));
    } else {
      setTemplates(prev => [...prev, { ...template, id: Date.now().toString() }]);
    }
    
    setEditingTemplate(null);
    toast({
      title: "템플릿 저장됨",
      description: "알림 템플릿이 저장되었습니다."
    });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "템플릿 삭제됨",
      description: "알림 템플릿이 삭제되었습니다."
    });
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case "email": return <Mail className="h-4 w-4" />;
      case "sms": return <Smartphone className="h-4 w-4" />;
      case "kakao": return <MessageSquare className="h-4 w-4" />;
      case "slack": return <Hash className="h-4 w-4" />;
      case "teams": return <Globe className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  const getChannelColor = (type: string) => {
    switch (type) {
      case "email": return "bg-blue-100 text-blue-600";
      case "sms": return "bg-green-100 text-green-600";
      case "kakao": return "bg-yellow-100 text-yellow-600";
      case "slack": return "bg-purple-100 text-purple-600";
      case "teams": return "bg-indigo-100 text-indigo-600";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="channels" className="space-y-4">
        <TabsList>
          <TabsTrigger value="channels">알림 채널</TabsTrigger>
          <TabsTrigger value="templates">템플릿 관리</TabsTrigger>
          <TabsTrigger value="events">이벤트 설정</TabsTrigger>
          <TabsTrigger value="test">테스트</TabsTrigger>
        </TabsList>

        <TabsContent value="channels" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>알림 채널 설정</CardTitle>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  채널 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {channels.map((channel) => (
                  <Card key={channel.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getChannelColor(channel.type)}`}>
                            {getChannelIcon(channel.type)}
                          </div>
                          <div>
                            <h4 className="font-medium">{channel.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {channel.config.provider || channel.type}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={channel.enabled}
                            onCheckedChange={(checked) => {
                              setChannels(prev => prev.map(c => 
                                c.id === channel.id ? { ...c, enabled: checked } : c
                              ));
                            }}
                          />
                          <Button size="sm" variant="ghost">
                            <Settings className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      {channel.enabled && (
                        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                          {channel.type === "email" && (
                            <>
                              <div>
                                <span className="text-muted-foreground">발신 이메일:</span>
                                <p className="font-medium">{channel.config.fromEmail}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">발신자명:</span>
                                <p className="font-medium">{channel.config.fromName}</p>
                              </div>
                            </>
                          )}
                          {channel.type === "sms" && (
                            <>
                              <div>
                                <span className="text-muted-foreground">발신 번호:</span>
                                <p className="font-medium">{channel.config.fromNumber}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Provider:</span>
                                <p className="font-medium">{channel.config.provider}</p>
                              </div>
                            </>
                          )}
                          {channel.type === "slack" && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Webhook URL:</span>
                              <p className="font-medium text-xs break-all">{channel.config.webhookUrl}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>알림 템플릿</CardTitle>
                <Button 
                  size="sm"
                  onClick={() => setEditingTemplate({
                    id: "",
                    name: "",
                    channel: "email",
                    event: "signature_requested",
                    subject: "",
                    content: "",
                    variables: []
                  })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  템플릿 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>템플릿명</TableHead>
                    <TableHead>채널</TableHead>
                    <TableHead>이벤트</TableHead>
                    <TableHead>변수</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getChannelIcon(template.channel)}
                          <span className="text-sm">{template.channel}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {events.find(e => e.id === template.event)?.name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {template.variables.slice(0, 3).map((v) => (
                            <Badge key={v} variant="secondary" className="text-xs">
                              {v}
                            </Badge>
                          ))}
                          {template.variables.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{template.variables.length - 3}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTemplate(template)}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Template Editor Modal */}
          {editingTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>{editingTemplate.id ? '템플릿 수정' : '새 템플릿'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>템플릿명</Label>
                    <Input
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        name: e.target.value
                      })}
                      placeholder="예: 서명 요청 이메일"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>채널</Label>
                    <Select
                      value={editingTemplate.channel}
                      onValueChange={(value) => setEditingTemplate({
                        ...editingTemplate,
                        channel: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {channels.map((channel) => (
                          <SelectItem key={channel.id} value={channel.type}>
                            {channel.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>이벤트</Label>
                  <Select
                    value={editingTemplate.event}
                    onValueChange={(value) => {
                      const event = events.find(e => e.id === value);
                      setEditingTemplate({
                        ...editingTemplate,
                        event: value,
                        variables: event?.variables || []
                      });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {events.map((event) => (
                        <SelectItem key={event.id} value={event.id}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {editingTemplate.channel === "email" && (
                  <div className="space-y-2">
                    <Label>제목</Label>
                    <Input
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({
                        ...editingTemplate,
                        subject: e.target.value
                      })}
                      placeholder="예: [SignChain] {{document_title}} 서명 요청"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>내용</Label>
                  <Textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      content: e.target.value
                    })}
                    rows={5}
                    placeholder="사용 가능한 변수를 {{}} 안에 넣어 사용하세요"
                  />
                  <div className="flex gap-2 flex-wrap">
                    <span className="text-sm text-muted-foreground">사용 가능한 변수:</span>
                    {editingTemplate.variables.map((v) => (
                      <Badge
                        key={v}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={() => {
                          const textarea = document.querySelector('textarea');
                          if (textarea) {
                            const pos = textarea.selectionStart;
                            const content = editingTemplate.content;
                            const newContent = content.slice(0, pos) + `{{${v}}}` + content.slice(pos);
                            setEditingTemplate({
                              ...editingTemplate,
                              content: newContent
                            });
                          }
                        }}
                      >
                        {`{{${v}}}`}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTemplate(null)}
                  >
                    취소
                  </Button>
                  <Button onClick={() => saveTemplate(editingTemplate)}>
                    저장
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>이벤트별 알림 설정</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.name}</h4>
                            <Switch defaultChecked={event.enabled} />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {event.description}
                          </p>
                          <div className="flex gap-2 flex-wrap mt-2">
                            {event.variables.map((v) => (
                              <Badge key={v} variant="outline" className="text-xs">
                                {v}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          설정
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>알림 스케줄</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>서명 리마인더</Label>
                  <p className="text-sm text-muted-foreground">
                    미서명 문서에 대한 자동 리마인더 발송
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>첫 번째 리마인더</Label>
                  <Select defaultValue="24">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12시간 후</SelectItem>
                      <SelectItem value="24">24시간 후</SelectItem>
                      <SelectItem value="48">48시간 후</SelectItem>
                      <SelectItem value="72">72시간 후</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>두 번째 리마인더</Label>
                  <Select defaultValue="72">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="48">48시간 후</SelectItem>
                      <SelectItem value="72">72시간 후</SelectItem>
                      <SelectItem value="96">96시간 후</SelectItem>
                      <SelectItem value="120">120시간 후</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>최대 리마인더 횟수</Label>
                  <Select defaultValue="3">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1회</SelectItem>
                      <SelectItem value="2">2회</SelectItem>
                      <SelectItem value="3">3회</SelectItem>
                      <SelectItem value="5">5회</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>알림 테스트</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>테스트 수신자</Label>
                <Input
                  placeholder="이메일 또는 전화번호"
                  value={testRecipient}
                  onChange={(e) => setTestRecipient(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                {templates.map((template) => {
                  const channel = channels.find(c => c.type === template.channel);
                  return (
                    <Card key={template.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${getChannelColor(template.channel)}`}>
                              {getChannelIcon(template.channel)}
                            </div>
                            <div>
                              <p className="font-medium">{template.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {channel?.name} • {events.find(e => e.id === template.event)?.name}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => testNotification(template.id)}
                          >
                            <Send className="h-4 w-4 mr-2" />
                            테스트 발송
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900">테스트 모드</p>
                      <p className="text-blue-700">
                        테스트 발송은 실제 템플릿을 사용하지만 테스트 데이터로 변수가 치환됩니다.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 알림 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>시간</TableHead>
                    <TableHead>채널</TableHead>
                    <TableHead>수신자</TableHead>
                    <TableHead>템플릿</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="text-sm">2024-01-22 15:30</TableCell>
                    <TableCell>
                      <Mail className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="text-sm">test@example.com</TableCell>
                    <TableCell className="text-sm">서명 요청 이메일</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">성공</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">2024-01-22 15:25</TableCell>
                    <TableCell>
                      <Smartphone className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="text-sm">010-1234-5678</TableCell>
                    <TableCell className="text-sm">서명 완료 SMS</TableCell>
                    <TableCell>
                      <Badge className="bg-green-500">성공</Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="text-sm">2024-01-22 15:20</TableCell>
                    <TableCell>
                      <Hash className="h-4 w-4" />
                    </TableCell>
                    <TableCell className="text-sm">#general</TableCell>
                    <TableCell className="text-sm">Slack 알림</TableCell>
                    <TableCell>
                      <Badge variant="destructive">실패</Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}