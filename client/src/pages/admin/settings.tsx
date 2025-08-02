import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Server, 
  Shield, 
  CreditCard,
  Users, 
  FileText,
  Settings as SettingsIcon,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface NotificationSettings {
  email: {
    enabled: boolean;
    documentSigned: boolean;
    documentExpiring: boolean;
    userRegistered: boolean;
    systemAlert: boolean;
    smtpHost: string;
    smtpPort: number;
    smtpUser: string;
    smtpPassword: string;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channels: {
      general: string;
      security: string;
      billing: string;
    };
  };
  discord: {
    enabled: boolean;
    webhookUrl: string;
  };
  system: {
    cpuThreshold: number;
    memoryThreshold: number;
    diskThreshold: number;
    enableRealtime: boolean;
  };
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<NotificationSettings>({
    email: {
      enabled: true,
      documentSigned: true,
      documentExpiring: true,
      userRegistered: true,
      systemAlert: true,
      smtpHost: 'smtp.gmail.com',
      smtpPort: 587,
      smtpUser: '',
      smtpPassword: ''
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channels: {
        general: '#general',
        security: '#security-alerts',
        billing: '#billing'
      }
    },
    discord: {
      enabled: false,
      webhookUrl: ''
    },
    system: {
      cpuThreshold: 80,
      memoryThreshold: 85,
      diskThreshold: 90,
      enableRealtime: true
    }
  });

  const updateEmailSettings = (key: keyof NotificationSettings['email'], value: any) => {
    setSettings(prev => ({
      ...prev,
      email: {
        ...prev.email,
        [key]: value
      }
    }));
  };

  const updateSlackSettings = (key: keyof NotificationSettings['slack'], value: any) => {
    setSettings(prev => ({
      ...prev,
      slack: {
        ...prev.slack,
        [key]: value
      }
    }));
  };

  const updateDiscordSettings = (key: keyof NotificationSettings['discord'], value: any) => {
    setSettings(prev => ({
      ...prev,
      discord: {
        ...prev.discord,
        [key]: value
      }
    }));
  };

  const updateSystemSettings = (key: keyof NotificationSettings['system'], value: any) => {
    setSettings(prev => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value
      }
    }));
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        toast({
          title: "설정 저장 완료",
          description: "알림 설정이 성공적으로 저장되었습니다."
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: "저장 실패",
        description: "설정 저장 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const testConnection = async (type: 'email' | 'slack' | 'discord') => {
    setTesting(type);
    try {
      const response = await fetch(`/api/admin/settings/test-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
        },
        body: JSON.stringify({ type, settings: settings[type] })
      });

      if (response.ok) {
        toast({
          title: "연결 테스트 성공",
          description: `${type.toUpperCase()} 연결이 정상적으로 작동합니다.`
        });
      } else {
        throw new Error('Connection test failed');
      }
    } catch (error) {
      toast({
        title: "연결 테스트 실패",
        description: `${type.toUpperCase()} 연결에 문제가 있습니다.`,
        variant: "destructive"
      });
    } finally {
      setTesting(null);
    }
  };

  return (
    <AdminLayout>
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center space-x-2">
              <SettingsIcon className="h-8 w-8" />
              <span>시스템 설정</span>
            </h1>
            <p className="text-muted-foreground mt-2">
              알림, 보안, 시스템 모니터링 설정을 관리합니다.
            </p>
          </div>
          <Button onClick={saveSettings} disabled={saving}>
            {saving ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            설정 저장
          </Button>
        </div>

        <Tabs defaultValue="notifications" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="notifications">알림 설정</TabsTrigger>
            <TabsTrigger value="security">보안 설정</TabsTrigger>
            <TabsTrigger value="billing">결제 설정</TabsTrigger>
            <TabsTrigger value="system">시스템 모니터링</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-6">
            {/* 이메일 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Mail className="h-5 w-5" />
                  <span>이메일 알림</span>
                </CardTitle>
                <CardDescription>이메일을 통한 시스템 알림을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">이메일 알림 활성화</Label>
                  <Switch
                    id="email-enabled"
                    checked={settings.email.enabled}
                    onCheckedChange={(checked) => updateEmailSettings('enabled', checked)}
                  />
                </div>

                {settings.email.enabled && (
                  <>
                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between">
                        <Label>문서 서명 완료</Label>
                        <Switch
                          checked={settings.email.documentSigned}
                          onCheckedChange={(checked) => updateEmailSettings('documentSigned', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>문서 만료 임박</Label>
                        <Switch
                          checked={settings.email.documentExpiring}
                          onCheckedChange={(checked) => updateEmailSettings('documentExpiring', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>신규 사용자 등록</Label>
                        <Switch
                          checked={settings.email.userRegistered}
                          onCheckedChange={(checked) => updateEmailSettings('userRegistered', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label>시스템 경고</Label>
                        <Switch
                          checked={settings.email.systemAlert}
                          onCheckedChange={(checked) => updateEmailSettings('systemAlert', checked)}
                        />
                      </div>
                    </div>

                    <Separator />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="smtp-host">SMTP 서버</Label>
                        <Input
                          id="smtp-host"
                          value={settings.email.smtpHost}
                          onChange={(e) => updateEmailSettings('smtpHost', e.target.value)}
                          placeholder="smtp.gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-port">SMTP 포트</Label>
                        <Input
                          id="smtp-port"
                          type="number"
                          value={settings.email.smtpPort}
                          onChange={(e) => updateEmailSettings('smtpPort', parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-user">사용자명</Label>
                        <Input
                          id="smtp-user"
                          value={settings.email.smtpUser}
                          onChange={(e) => updateEmailSettings('smtpUser', e.target.value)}
                          placeholder="your-email@gmail.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="smtp-password">비밀번호</Label>
                        <Input
                          id="smtp-password"
                          type="password"
                          value={settings.email.smtpPassword}
                          onChange={(e) => updateEmailSettings('smtpPassword', e.target.value)}
                          placeholder="앱 비밀번호"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => testConnection('email')}
                      disabled={testing === 'email' || !settings.email.smtpHost}
                    >
                      {testing === 'email' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-2" />
                      )}
                      이메일 연결 테스트
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Slack 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5" />
                  <span>Slack 알림</span>
                </CardTitle>
                <CardDescription>Slack 채널로 시스템 알림을 전송합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="slack-enabled">Slack 알림 활성화</Label>
                  <Switch
                    id="slack-enabled"
                    checked={settings.slack.enabled}
                    onCheckedChange={(checked) => updateSlackSettings('enabled', checked)}
                  />
                </div>

                {settings.slack.enabled && (
                  <>
                    <div>
                      <Label htmlFor="slack-webhook">Slack 웹훅 URL</Label>
                      <Input
                        id="slack-webhook"
                        value={settings.slack.webhookUrl}
                        onChange={(e) => updateSlackSettings('webhookUrl', e.target.value)}
                        placeholder="https://hooks.slack.com/services/..."
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="slack-general">일반 알림 채널</Label>
                        <Input
                          id="slack-general"
                          value={settings.slack.channels.general}
                          onChange={(e) => updateSlackSettings('channels', {
                            ...settings.slack.channels,
                            general: e.target.value
                          })}
                          placeholder="#general"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slack-security">보안 알림 채널</Label>
                        <Input
                          id="slack-security"
                          value={settings.slack.channels.security}
                          onChange={(e) => updateSlackSettings('channels', {
                            ...settings.slack.channels,
                            security: e.target.value
                          })}
                          placeholder="#security-alerts"
                        />
                      </div>
                      <div>
                        <Label htmlFor="slack-billing">결제 알림 채널</Label>
                        <Input
                          id="slack-billing"
                          value={settings.slack.channels.billing}
                          onChange={(e) => updateSlackSettings('channels', {
                            ...settings.slack.channels,
                            billing: e.target.value
                          })}
                          placeholder="#billing"
                        />
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => testConnection('slack')}
                      disabled={testing === 'slack' || !settings.slack.webhookUrl}
                    >
                      {testing === 'slack' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <MessageSquare className="h-4 w-4 mr-2" />
                      )}
                      Slack 연결 테스트
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Discord 알림 설정 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5" />
                  <span>Discord 알림</span>
                </CardTitle>
                <CardDescription>Discord 채널로 시스템 알림을 전송합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="discord-enabled">Discord 알림 활성화</Label>
                  <Switch
                    id="discord-enabled"
                    checked={settings.discord.enabled}
                    onCheckedChange={(checked) => updateDiscordSettings('enabled', checked)}
                  />
                </div>

                {settings.discord.enabled && (
                  <>
                    <div>
                      <Label htmlFor="discord-webhook">Discord 웹훅 URL</Label>
                      <Input
                        id="discord-webhook"
                        value={settings.discord.webhookUrl}
                        onChange={(e) => updateDiscordSettings('webhookUrl', e.target.value)}
                        placeholder="https://discord.com/api/webhooks/..."
                      />
                    </div>

                    <Button
                      variant="outline"
                      onClick={() => testConnection('discord')}
                      disabled={testing === 'discord' || !settings.discord.webhookUrl}
                    >
                      {testing === 'discord' ? (
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Bell className="h-4 w-4 mr-2" />
                      )}
                      Discord 연결 테스트
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>보안 설정</span>
                </CardTitle>
                <CardDescription>시스템 보안 관련 설정을 구성합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="session-timeout">세션 타임아웃 (분)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      defaultValue={30}
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-login-attempts">최대 로그인 시도 횟수</Label>
                    <Input
                      id="max-login-attempts"
                      type="number"
                      defaultValue={5}
                      placeholder="5"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password-min-length">최소 비밀번호 길이</Label>
                    <Input
                      id="password-min-length"
                      type="number"
                      defaultValue={8}
                      placeholder="8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="account-lockout">계정 잠금 시간 (분)</Label>
                    <Input
                      id="account-lockout"
                      type="number"
                      defaultValue={15}
                      placeholder="15"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>2단계 인증 강제</Label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>IP 화이트리스트 사용</Label>
                    <Switch defaultChecked={false} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>관리자 활동 로깅</Label>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>결제 설정</span>
                </CardTitle>
                <CardDescription>결제 및 구독 관련 설정을 관리합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="free-documents">무료 계정 문서 제한</Label>
                    <Input
                      id="free-documents"
                      type="number"
                      defaultValue={10}
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <Label htmlFor="pro-price">Pro 요금 (월)</Label>
                    <Input
                      id="pro-price"
                      type="number"
                      defaultValue={29}
                      placeholder="29"
                    />
                  </div>
                  <div>
                    <Label htmlFor="enterprise-price">Enterprise 요금 (월)</Label>
                    <Input
                      id="enterprise-price"
                      type="number"
                      defaultValue={99}
                      placeholder="99"
                    />
                  </div>
                  <div>
                    <Label htmlFor="trial-days">무료 체험 기간 (일)</Label>
                    <Input
                      id="trial-days"
                      type="number"
                      defaultValue={14}
                      placeholder="14"
                    />
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>자동 결제 활성화</Label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>결제 실패 시 자동 알림</Label>
                    <Switch defaultChecked={true} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>구독 갱신 전 알림</Label>
                    <Switch defaultChecked={true} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Server className="h-5 w-5" />
                  <span>시스템 모니터링</span>
                </CardTitle>
                <CardDescription>시스템 상태 모니터링 및 알림 임계값을 설정합니다.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="realtime-monitoring">실시간 모니터링 활성화</Label>
                  <Switch
                    id="realtime-monitoring"
                    checked={settings.system.enableRealtime}
                    onCheckedChange={(checked) => updateSystemSettings('enableRealtime', checked)}
                  />
                </div>

                <Separator />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="cpu-threshold">CPU 사용률 임계값 (%)</Label>
                    <Input
                      id="cpu-threshold"
                      type="number"
                      value={settings.system.cpuThreshold}
                      onChange={(e) => updateSystemSettings('cpuThreshold', parseInt(e.target.value))}
                      placeholder="80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="memory-threshold">메모리 사용률 임계값 (%)</Label>
                    <Input
                      id="memory-threshold"
                      type="number"
                      value={settings.system.memoryThreshold}
                      onChange={(e) => updateSystemSettings('memoryThreshold', parseInt(e.target.value))}
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <Label htmlFor="disk-threshold">디스크 사용률 임계값 (%)</Label>
                    <Input
                      id="disk-threshold"
                      type="number"
                      value={settings.system.diskThreshold}
                      onChange={(e) => updateSystemSettings('diskThreshold', parseInt(e.target.value))}
                      placeholder="90"
                    />
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>임계값을 초과하면 설정된 알림 채널로 경고 메시지가 전송됩니다.</p>
                </div>

                <div className="flex space-x-2">
                  <Badge variant="outline">
                    <Server className="h-3 w-3 mr-1" />
                    모니터링 활성화
                  </Badge>
                  <Badge variant="outline">
                    <Bell className="h-3 w-3 mr-1" />
                    실시간 알림
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}