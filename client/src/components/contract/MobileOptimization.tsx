import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import {
  Smartphone,
  Monitor,
  Tablet,
  QrCode,
  Mail,
  MessageSquare,
  Copy,
  Check,
  ExternalLink,
  Send,
  Settings,
  AlertCircle
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MobileSignSettings {
  enableQRCode: boolean;
  enableSMS: boolean;
  enableEmail: boolean;
  enableKakaoTalk: boolean;
  autoSwitchMobile: boolean;
  mobileTheme: "light" | "dark" | "auto";
  touchSensitivity: "low" | "medium" | "high";
  signatureQuality: "standard" | "high";
}

interface DeviceStats {
  device: string;
  count: number;
  percentage: number;
  icon: any;
}

export default function MobileOptimization() {
  const { toast } = useToast();
  const [copied, setCopied] = useState<string | null>(null);
  const [settings, setSettings] = useState<MobileSignSettings>({
    enableQRCode: true,
    enableSMS: true,
    enableEmail: true,
    enableKakaoTalk: false,
    autoSwitchMobile: true,
    mobileTheme: "auto",
    touchSensitivity: "medium",
    signatureQuality: "high"
  });

  // Mock data
  const mockSigningLink = "https://sign.signchain.io/s/abc123def456";
  const mockQRCode = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==";
  
  const deviceStats: DeviceStats[] = [
    { device: "모바일", count: 324, percentage: 65, icon: Smartphone },
    { device: "데스크톱", count: 126, percentage: 25, icon: Monitor },
    { device: "태블릿", count: 50, percentage: 10, icon: Tablet }
  ];

  const recentMobileSigns = [
    {
      id: "1",
      signer: "김철수",
      device: "iPhone 14 Pro",
      os: "iOS 17.2",
      signedAt: "2024-01-22 14:30",
      status: "completed"
    },
    {
      id: "2",
      signer: "이영희",
      device: "Galaxy S23",
      os: "Android 14",
      signedAt: "2024-01-22 13:45",
      status: "completed"
    },
    {
      id: "3",
      signer: "박민수",
      device: "iPad Pro",
      os: "iPadOS 17.2",
      signedAt: "2024-01-22 12:20",
      status: "completed"
    }
  ];

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
    
    toast({
      title: "복사됨",
      description: `${type}이(가) 클립보드에 복사되었습니다.`,
    });
  };

  const sendViaMethod = (method: string) => {
    toast({
      title: "전송 중",
      description: `${method}(으)로 서명 링크를 전송하고 있습니다...`,
    });
  };

  const updateSetting = (key: keyof MobileSignSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    toast({
      title: "설정 저장됨",
      description: "모바일 서명 설정이 업데이트되었습니다.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="sharing">공유 옵션</TabsTrigger>
          <TabsTrigger value="settings">모바일 설정</TabsTrigger>
          <TabsTrigger value="responsive">반응형 테스트</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Device Usage Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {deviceStats.map((stat) => (
              <Card key={stat.device}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.device} 서명
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.count}건</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${stat.percentage}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {stat.percentage}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Mobile Signs */}
          <Card>
            <CardHeader>
              <CardTitle>최근 모바일 서명</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentMobileSigns.map((sign) => (
                  <div key={sign.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Smartphone className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{sign.signer}</p>
                        <p className="text-sm text-muted-foreground">
                          {sign.device} • {sign.os}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-green-500">완료</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {sign.signedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Mobile Features */}
          <Card>
            <CardHeader>
              <CardTitle>모바일 서명 기능</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Smartphone className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">터치 최적화</h4>
                    <p className="text-sm text-muted-foreground">
                      손가락으로 쉽게 서명할 수 있는 큰 터치 영역
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
                    <QrCode className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">QR 코드 지원</h4>
                    <p className="text-sm text-muted-foreground">
                      PC에서 QR 스캔으로 모바일 서명 시작
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">반응형 디자인</h4>
                    <p className="text-sm text-muted-foreground">
                      모든 화면 크기에 자동으로 최적화
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium">다양한 전송 방법</h4>
                    <p className="text-sm text-muted-foreground">
                      SMS, 이메일, 카카오톡으로 링크 전송
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sharing" className="space-y-4">
          {/* QR Code Section */}
          <Card>
            <CardHeader>
              <CardTitle>QR 코드</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1">
                  <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center max-w-[200px]">
                    <QrCode className="h-32 w-32 text-gray-400" />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    모바일 기기로 스캔하여 서명 시작
                  </p>
                </div>
                <div className="flex-1 space-y-4">
                  <div>
                    <Label>서명 링크</Label>
                    <div className="flex gap-2 mt-1">
                      <Input value={mockSigningLink} readOnly />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(mockSigningLink, "링크")}
                      >
                        {copied === "링크" ? (
                          <Check className="h-4 w-4" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full">
                    <QrCode className="h-4 w-4 mr-2" />
                    QR 코드 다운로드
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sharing Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">SMS 전송</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="010-1234-5678" />
                <Textarea
                  placeholder="메시지 내용"
                  defaultValue="SignChain 전자계약서 서명 요청입니다. 아래 링크를 클릭하여 서명해주세요."
                  rows={3}
                />
                <Button
                  className="w-full"
                  onClick={() => sendViaMethod("SMS")}
                  disabled={!settings.enableSMS}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  SMS 전송
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">이메일 전송</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input placeholder="email@example.com" type="email" />
                <Input placeholder="제목" defaultValue="[SignChain] 전자계약서 서명 요청" />
                <Button
                  className="w-full"
                  onClick={() => sendViaMethod("이메일")}
                  disabled={!settings.enableEmail}
                >
                  <Mail className="h-4 w-4 mr-2" />
                  이메일 전송
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">카카오톡 전송</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="bg-yellow-50 p-3 rounded-lg">
                  <p className="text-sm text-yellow-900">
                    카카오톡 알림톡 서비스 연동이 필요합니다
                  </p>
                </div>
                <Button
                  className="w-full"
                  onClick={() => sendViaMethod("카카오톡")}
                  disabled={!settings.enableKakaoTalk}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  카카오톡 전송
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>모바일 서명 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sharing Options */}
              <div className="space-y-4">
                <h3 className="font-medium">공유 옵션</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>QR 코드 생성</Label>
                      <p className="text-sm text-muted-foreground">
                        서명 링크에 대한 QR 코드 자동 생성
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableQRCode}
                      onCheckedChange={(checked) => updateSetting("enableQRCode", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>SMS 전송</Label>
                      <p className="text-sm text-muted-foreground">
                        문자 메시지로 서명 링크 전송
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableSMS}
                      onCheckedChange={(checked) => updateSetting("enableSMS", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>이메일 전송</Label>
                      <p className="text-sm text-muted-foreground">
                        이메일로 서명 링크 전송
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableEmail}
                      onCheckedChange={(checked) => updateSetting("enableEmail", checked)}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>카카오톡 알림톡</Label>
                      <p className="text-sm text-muted-foreground">
                        카카오톡으로 서명 링크 전송
                      </p>
                    </div>
                    <Switch
                      checked={settings.enableKakaoTalk}
                      onCheckedChange={(checked) => updateSetting("enableKakaoTalk", checked)}
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Experience */}
              <div className="space-y-4">
                <h3 className="font-medium">모바일 경험</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>자동 모바일 전환</Label>
                      <p className="text-sm text-muted-foreground">
                        모바일 기기 감지 시 자동으로 모바일 UI 표시
                      </p>
                    </div>
                    <Switch
                      checked={settings.autoSwitchMobile}
                      onCheckedChange={(checked) => updateSetting("autoSwitchMobile", checked)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>모바일 테마</Label>
                    <Select
                      value={settings.mobileTheme}
                      onValueChange={(value) => updateSetting("mobileTheme", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">라이트</SelectItem>
                        <SelectItem value="dark">다크</SelectItem>
                        <SelectItem value="auto">자동 (시스템 설정)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>터치 감도</Label>
                    <Select
                      value={settings.touchSensitivity}
                      onValueChange={(value) => updateSetting("touchSensitivity", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">낮음</SelectItem>
                        <SelectItem value="medium">보통</SelectItem>
                        <SelectItem value="high">높음</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>서명 품질</Label>
                    <Select
                      value={settings.signatureQuality}
                      onValueChange={(value) => updateSetting("signatureQuality", value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="standard">표준</SelectItem>
                        <SelectItem value="high">고품질</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="responsive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>반응형 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="mobile" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="mobile">
                    <Smartphone className="h-4 w-4 mr-2" />
                    모바일
                  </TabsTrigger>
                  <TabsTrigger value="tablet">
                    <Tablet className="h-4 w-4 mr-2" />
                    태블릿
                  </TabsTrigger>
                  <TabsTrigger value="desktop">
                    <Monitor className="h-4 w-4 mr-2" />
                    데스크톱
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="mobile">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mx-auto" style={{ maxWidth: "375px" }}>
                      <div className="bg-white rounded-lg shadow-lg p-4 space-y-4">
                        <div className="h-8 bg-gray-200 rounded animate-pulse" />
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </div>
                        <div className="h-32 bg-gray-200 rounded animate-pulse" />
                        <Button className="w-full">
                          모바일 서명 시작
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      375 x 812 (iPhone 13)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="tablet">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="mx-auto" style={{ maxWidth: "768px" }}>
                      <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                        <div className="h-10 bg-gray-200 rounded animate-pulse" />
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                          </div>
                          <div className="h-24 bg-gray-200 rounded animate-pulse" />
                        </div>
                        <Button className="w-full md:w-auto">
                          태블릿 서명 시작
                        </Button>
                      </div>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      768 x 1024 (iPad)
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="desktop">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                      <div className="h-12 bg-gray-200 rounded animate-pulse max-w-md" />
                      <div className="grid grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                        </div>
                        <div className="col-span-2 h-32 bg-gray-200 rounded animate-pulse" />
                      </div>
                      <Button>
                        데스크톱 서명 시작
                      </Button>
                    </div>
                    <p className="text-center text-sm text-muted-foreground mt-4">
                      1920 x 1080 (Full HD)
                    </p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">테스트 팁</p>
                    <p className="text-blue-700">
                      실제 기기에서 테스트하려면 QR 코드를 스캔하거나 링크를 전송하세요.
                      Chrome DevTools의 디바이스 에뮬레이션도 활용할 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}