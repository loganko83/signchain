import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Shield, Smartphone, Fingerprint, Key, QrCode, Copy, CheckCircle, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { startAuthentication, startRegistration } from "@simplewebauthn/browser";

interface SecuritySettingsProps {
  userId: number;
}

export default function SecuritySettings({ userId }: SecuritySettingsProps) {
  const [showQR, setShowQR] = useState(false);
  const [twoFactorToken, setTwoFactorToken] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch security settings
  const { data: securitySettings, isLoading } = useQuery({
    queryKey: ["/api/security", userId],
    queryFn: async () => {
      const response = await fetch(`/api/security/${userId}`);
      if (!response.ok) throw new Error("보안 설정을 가져올 수 없습니다");
      return response.json();
    },
  });

  // Setup 2FA mutation
  const setup2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/security/2fa/setup", {
        method: "POST",
      });
      if (!response.ok) throw new Error("2FA 설정 실패");
      return response.json();
    },
    onSuccess: (data) => {
      setShowQR(true);
      toast({
        title: "2FA 설정 시작",
        description: "QR 코드를 스캔하여 인증 앱에 등록하세요.",
      });
    },
  });

  // Enable 2FA mutation
  const enable2FAMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await fetch("/api/security/2fa/enable", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (!response.ok) throw new Error("2FA 활성화 실패");
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setBackupCodes(data.backupCodes || []);
        setShowBackupCodes(true);
        setShowQR(false);
        setTwoFactorToken("");
        queryClient.invalidateQueries({ queryKey: ["/api/security", userId] });
        toast({
          title: "2FA 활성화 완료",
          description: "2단계 인증이 성공적으로 활성화되었습니다.",
        });
      } else {
        toast({
          title: "인증 실패",
          description: "입력하신 코드가 올바르지 않습니다.",
          variant: "destructive",
        });
      }
    },
  });

  // Disable 2FA mutation
  const disable2FAMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/security/2fa/disable", {
        method: "POST",
      });
      if (!response.ok) throw new Error("2FA 비활성화 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security", userId] });
      toast({
        title: "2FA 비활성화 완료",
        description: "2단계 인증이 비활성화되었습니다.",
      });
    },
  });

  // Setup biometric authentication
  const setupBiometricMutation = useMutation({
    mutationFn: async () => {
      // Get registration options from server
      const optionsResponse = await fetch("/api/security/biometric/register-options", {
        method: "POST",
      });
      if (!optionsResponse.ok) throw new Error("생체 인증 설정 실패");
      const options = await optionsResponse.json();

      // Start WebAuthn registration
      const credential = await startRegistration(options);

      // Verify registration with server
      const verifyResponse = await fetch("/api/security/biometric/register-verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credential),
      });
      if (!verifyResponse.ok) throw new Error("생체 인증 등록 실패");
      return verifyResponse.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        queryClient.invalidateQueries({ queryKey: ["/api/security", userId] });
        toast({
          title: "생체 인증 등록 완료",
          description: "생체 인증이 성공적으로 등록되었습니다.",
        });
      } else {
        toast({
          title: "등록 실패",
          description: "생체 인증 등록에 실패했습니다.",
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "생체 인증 오류",
        description: error.message || "생체 인증 등록 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    },
  });

  // Disable biometric authentication
  const disableBiometricMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/security/biometric/disable", {
        method: "POST",
      });
      if (!response.ok) throw new Error("생체 인증 비활성화 실패");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security", userId] });
      toast({
        title: "생체 인증 비활성화 완료",
        description: "생체 인증이 비활성화되었습니다.",
      });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "클립보드에 복사됨",
      description: "백업 코드가 클립보드에 복사되었습니다.",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            2단계 인증 (2FA)
          </CardTitle>
          <CardDescription>
            추가 보안 레이어로 계정을 보호하세요
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">TOTP 인증</p>
              <p className="text-sm text-muted-foreground">
                Google Authenticator, Authy 등의 앱 사용
              </p>
            </div>
            <div className="flex items-center gap-3">
              {securitySettings?.twoFactorEnabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  활성화됨
                </Badge>
              ) : (
                <Badge variant="secondary">비활성화됨</Badge>
              )}
              
              {securitySettings?.twoFactorEnabled ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      비활성화
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>2FA 비활성화</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 2단계 인증을 비활성화하시겠습니까? 계정 보안이 약해질 수 있습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => disable2FAMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        비활성화
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setup2FAMutation.mutate()}
                  disabled={setup2FAMutation.isPending}
                >
                  {setup2FAMutation.isPending ? "설정 중..." : "설정하기"}
                </Button>
              )}
            </div>
          </div>

          {/* QR Code Setup */}
          {showQR && setup2FAMutation.data && (
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="space-y-4">
                <div className="text-center">
                  <h4 className="font-medium mb-2">QR 코드 스캔</h4>
                  <div className="flex justify-center">
                    <img 
                      src={setup2FAMutation.data.qrCode} 
                      alt="2FA QR Code"
                      className="w-48 h-48 border rounded"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    인증 앱으로 QR 코드를 스캔한 후 6자리 코드를 입력하세요
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="2fa-token">인증 코드</Label>
                  <div className="flex gap-2">
                    <Input
                      id="2fa-token"
                      value={twoFactorToken}
                      onChange={(e) => setTwoFactorToken(e.target.value)}
                      placeholder="123456"
                      maxLength={6}
                    />
                    <Button 
                      onClick={() => enable2FAMutation.mutate(twoFactorToken)}
                      disabled={enable2FAMutation.isPending || twoFactorToken.length !== 6}
                    >
                      확인
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Backup Codes */}
          {showBackupCodes && backupCodes.length > 0 && (
            <div className="p-4 border rounded-lg bg-yellow-50 border-yellow-200">
              <div className="flex items-start gap-2 mb-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-yellow-800">백업 코드</h4>
                  <p className="text-sm text-yellow-700">
                    이 코드들을 안전한 곳에 저장하세요. 인증 앱을 사용할 수 없을 때 사용할 수 있습니다.
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mb-3">
                {backupCodes.map((code, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded border font-mono text-sm"
                  >
                    <span>{code}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(code)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(backupCodes.join('\n'))}
                className="w-full"
              >
                모든 코드 복사
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Biometric Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Fingerprint className="h-5 w-5" />
            생체 인증
          </CardTitle>
          <CardDescription>
            지문, 얼굴 인식 또는 기타 생체 정보로 로그인
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">WebAuthn 생체 인증</p>
              <p className="text-sm text-muted-foreground">
                TouchID, FaceID, Windows Hello 등
              </p>
            </div>
            <div className="flex items-center gap-3">
              {securitySettings?.biometricEnabled ? (
                <Badge variant="default" className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  활성화됨
                </Badge>
              ) : (
                <Badge variant="secondary">비활성화됨</Badge>
              )}
              
              {securitySettings?.biometricEnabled ? (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      비활성화
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>생체 인증 비활성화</AlertDialogTitle>
                      <AlertDialogDescription>
                        생체 인증을 비활성화하시겠습니까?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => disableBiometricMutation.mutate()}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        비활성화
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              ) : (
                <Button 
                  size="sm" 
                  onClick={() => setupBiometricMutation.mutate()}
                  disabled={setupBiometricMutation.isPending}
                >
                  {setupBiometricMutation.isPending ? "등록 중..." : "등록하기"}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            보안 상태
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${securitySettings?.twoFactorEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">2단계 인증</span>
              </div>
              <Badge variant={securitySettings?.twoFactorEnabled ? "default" : "destructive"}>
                {securitySettings?.twoFactorEnabled ? "활성화됨" : "비활성화됨"}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${securitySettings?.biometricEnabled ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="font-medium">생체 인증</span>
              </div>
              <Badge variant={securitySettings?.biometricEnabled ? "default" : "destructive"}>
                {securitySettings?.biometricEnabled ? "활성화됨" : "비활성화됨"}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-green-500" />
                <span className="font-medium">비밀번호 암호화</span>
              </div>
              <Badge variant="default">활성화됨</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}