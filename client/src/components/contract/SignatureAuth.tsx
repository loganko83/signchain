import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { 
  Shield, 
  Smartphone, 
  Mail, 
  Key, 
  Fingerprint,
  Lock,
  Settings,
  CheckCircle,
  AlertCircle,
  Info,
  ShieldCheck,
  UserCheck,
  Clock,
  CreditCard,
  Globe,
  Zap,
  Plus,
  Send
} from 'lucide-react';

interface AuthMethod {
  id: string;
  name: string;
  type: 'sms' | 'email' | 'otp' | 'biometric' | 'certificate';
  enabled: boolean;
  icon: React.ElementType;
  description: string;
  settings: Record<string, any>;
}

interface AuthRequirement {
  id: string;
  name: string;
  description: string;
  conditions: string[];
  authMethods: string[];
  enabled: boolean;
}

export default function SignatureAuth() {
  const [authMethods, setAuthMethods] = useState<AuthMethod[]>([
    {
      id: 'sms',
      name: 'SMS 인증',
      type: 'sms',
      enabled: true,
      icon: Smartphone,
      description: '휴대폰 번호로 인증 코드를 발송합니다.',
      settings: {
        provider: 'twilio',
        timeout: 180,
        codeLength: 6
      }
    },
    {
      id: 'email',
      name: '이메일 인증',
      type: 'email', 
      enabled: true,
      icon: Mail,
      description: '등록된 이메일로 인증 링크를 발송합니다.',
      settings: {
        provider: 'sendgrid',
        timeout: 600,
        linkExpiry: 24
      }
    },
    {
      id: 'otp',
      name: 'OTP 인증',
      type: 'otp',
      enabled: false,
      icon: Key,
      description: 'Google Authenticator 등 OTP 앱을 사용합니다.',
      settings: {
        algorithm: 'TOTP',
        digits: 6,
        period: 30
      }
    },
    {
      id: 'biometric',
      name: '생체 인증',
      type: 'biometric',
      enabled: false,
      icon: Fingerprint,
      description: '지문, 얼굴 인식 등 생체 정보로 인증합니다.',
      settings: {
        methods: ['fingerprint', 'face', 'iris'],
        fallback: 'pin'
      }
    },
    {
      id: 'certificate',
      name: '공동인증서',
      type: 'certificate',
      enabled: false,
      icon: CreditCard,
      description: '공동인증서(구 공인인증서)로 본인 확인을 합니다.',
      settings: {
        providers: ['yessign', 'signgate'],
        level: 'personal'
      }
    }
  ]);

  const [authRequirements, setAuthRequirements] = useState<AuthRequirement[]>([
    {
      id: '1',
      name: '고액 계약서',
      description: '계약 금액이 1억원 이상인 경우',
      conditions: ['amount >= 100000000'],
      authMethods: ['sms', 'certificate'],
      enabled: true
    },
    {
      id: '2',
      name: '인사 관련 문서',
      description: '근로계약서, 퇴직 합의서 등 인사 문서',
      conditions: ['category == "hr"'],
      authMethods: ['sms', 'email'],
      enabled: true
    },
    {
      id: '3',
      name: '법적 구속력 문서',
      description: 'NDA, 라이선스 계약 등 법적 효력이 있는 문서',
      conditions: ['legal_binding == true'],
      authMethods: ['certificate'],
      enabled: false
    }
  ]);

  const [selectedMethod, setSelectedMethod] = useState<string>('sms');
  const [testPhone, setTestPhone] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isTestingSMS, setIsTestingSMS] = useState(false);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  const toggleAuthMethod = (methodId: string) => {
    setAuthMethods(methods => 
      methods.map(method => 
        method.id === methodId 
          ? { ...method, enabled: !method.enabled }
          : method
      )
    );
  };

  const toggleRequirement = (requirementId: string) => {
    setAuthRequirements(requirements =>
      requirements.map(req =>
        req.id === requirementId
          ? { ...req, enabled: !req.enabled }
          : req
      )
    );
  };

  const testSMSAuth = async () => {
    if (!testPhone) return;
    
    setIsTestingSMS(true);
    // 실제 구현에서는 SMS API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingSMS(false);
    alert(`테스트 SMS가 ${testPhone}로 발송되었습니다.`);
  };

  const testEmailAuth = async () => {
    if (!testEmail) return;
    
    setIsTestingEmail(true);
    // 실제 구현에서는 이메일 API 호출
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsTestingEmail(false);
    alert(`테스트 이메일이 ${testEmail}로 발송되었습니다.`);
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-semibold">서명 인증 설정</h3>
        <p className="text-sm text-muted-foreground">
          서명 전 본인 확인을 위한 인증 방법을 설정합니다.
        </p>
      </div>

      <Tabs defaultValue="methods" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="methods">
            <Shield className="h-4 w-4 mr-2" />
            인증 방법
          </TabsTrigger>
          <TabsTrigger value="requirements">
            <ShieldCheck className="h-4 w-4 mr-2" />
            인증 요구사항
          </TabsTrigger>
          <TabsTrigger value="test">
            <Zap className="h-4 w-4 mr-2" />
            테스트
          </TabsTrigger>
        </TabsList>

        {/* 인증 방법 탭 */}
        <TabsContent value="methods" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              활성화된 인증 방법 중 서명자가 선택하여 사용할 수 있습니다.
              최소 1개 이상의 인증 방법을 활성화해야 합니다.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            {authMethods.map(method => {
              const Icon = method.icon;
              return (
                <Card key={method.id} className={!method.enabled ? 'opacity-60' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Icon className="h-5 w-5" />
                        {method.name}
                      </CardTitle>
                      <Switch
                        checked={method.enabled}
                        onCheckedChange={() => toggleAuthMethod(method.id)}
                      />
                    </div>
                    <CardDescription>{method.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {method.enabled && (
                      <div className="space-y-3">
                        {method.type === 'sms' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">SMS 제공업체</span>
                              <span className="font-medium">Twilio</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">인증 코드 유효시간</span>
                              <span className="font-medium">3분</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">코드 길이</span>
                              <span className="font-medium">6자리</span>
                            </div>
                          </>
                        )}
                        {method.type === 'email' && (
                          <>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">이메일 제공업체</span>
                              <span className="font-medium">SendGrid</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">링크 유효시간</span>
                              <span className="font-medium">24시간</span>
                            </div>
                          </>
                        )}
                        <Button variant="outline" size="sm" className="w-full">
                          <Settings className="h-4 w-4 mr-2" />
                          설정
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* 인증 요구사항 탭 */}
        <TabsContent value="requirements" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              특정 조건에 해당하는 계약서에 대해 추가 인증을 요구할 수 있습니다.
            </AlertDescription>
          </Alert>

          <div className="space-y-4">
            {authRequirements.map(requirement => (
              <Card key={requirement.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">{requirement.name}</CardTitle>
                      <CardDescription>{requirement.description}</CardDescription>
                    </div>
                    <Switch
                      checked={requirement.enabled}
                      onCheckedChange={() => toggleRequirement(requirement.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium mb-2">적용 조건</p>
                      <div className="flex flex-wrap gap-2">
                        {requirement.conditions.map((condition, index) => (
                          <Badge key={index} variant="secondary">
                            {condition}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium mb-2">필수 인증 방법</p>
                      <div className="flex flex-wrap gap-2">
                        {requirement.authMethods.map(methodId => {
                          const method = authMethods.find(m => m.id === methodId);
                          if (!method) return null;
                          const Icon = method.icon;
                          return (
                            <Badge key={methodId} variant="default">
                              <Icon className="h-3 w-3 mr-1" />
                              {method.name}
                            </Badge>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">새 요구사항 추가</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                요구사항 추가
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 테스트 탭 */}
        <TabsContent value="test" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              인증 기능이 정상적으로 작동하는지 테스트해보세요.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 md:grid-cols-2">
            {/* SMS 테스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Smartphone className="h-5 w-5" />
                  SMS 인증 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-phone">휴대폰 번호</Label>
                  <Input
                    id="test-phone"
                    placeholder="010-1234-5678"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={testSMSAuth}
                  disabled={!testPhone || isTestingSMS}
                >
                  {isTestingSMS ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      테스트 SMS 발송
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 이메일 테스트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  이메일 인증 테스트
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="test-email">이메일 주소</Label>
                  <Input
                    id="test-email"
                    type="email"
                    placeholder="test@example.com"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                  />
                </div>
                <Button 
                  className="w-full" 
                  onClick={testEmailAuth}
                  disabled={!testEmail || isTestingEmail}
                >
                  {isTestingEmail ? (
                    <>
                      <Clock className="h-4 w-4 mr-2 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" />
                      테스트 이메일 발송
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* 통계 */}
          <Card>
            <CardHeader>
              <CardTitle>인증 통계</CardTitle>
              <CardDescription>최근 30일간의 인증 현황</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">전체 인증 시도</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">325</p>
                  <p className="text-sm text-muted-foreground">성공</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-red-600">17</p>
                  <p className="text-sm text-muted-foreground">실패</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold">94.9%</p>
                  <p className="text-sm text-muted-foreground">성공률</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}