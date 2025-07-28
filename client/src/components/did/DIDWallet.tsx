import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Wallet, 
  Key, 
  Award, 
  Shield,
  QrCode,
  Share2,
  Plus,
  Import,
  Download,
  Lock,
  Unlock,
  FileText,
  CreditCard,
  UserCheck,
  Globe,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";

interface WalletItem {
  id: string;
  type: "did" | "credential" | "presentation";
  name: string;
  issuer?: string;
  issuanceDate?: string;
  expirationDate?: string;
  status: "active" | "expired" | "revoked";
  icon: any;
}

export function DIDWallet() {
  const [isLocked, setIsLocked] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedItem, setSelectedItem] = useState<WalletItem | null>(null);

  // Mock 지갑 항목
  const [walletItems] = useState<WalletItem[]>([
    {
      id: "did:web:signchain.example.com:users:alice",
      type: "did",
      name: "개인 DID",
      status: "active",
      icon: Key
    },
    {
      id: "did:ethr:0x1234...5678",
      type: "did",
      name: "Ethereum DID",
      status: "active",
      icon: Shield
    },
    {
      id: "vc:signchain:2025:001",
      type: "credential",
      name: "사업자등록증",
      issuer: "대한민국 국세청",
      issuanceDate: "2025-07-20",
      status: "active",
      icon: FileText
    },
    {
      id: "vc:signchain:2025:002",
      type: "credential",
      name: "주민등록증",
      issuer: "행정안전부",
      issuanceDate: "2025-07-15",
      expirationDate: "2035-07-15",
      status: "active",
      icon: CreditCard
    },
    {
      id: "vc:signchain:2025:003",
      type: "credential",
      name: "학위증명서",
      issuer: "서울대학교",
      issuanceDate: "2025-06-01",
      status: "active",
      icon: Award
    }
  ]);

  const walletStats = {
    totalDIDs: walletItems.filter(item => item.type === "did").length,
    totalCredentials: walletItems.filter(item => item.type === "credential").length,
    activeItems: walletItems.filter(item => item.status === "active").length,
    expiringItems: walletItems.filter(item => item.expirationDate && 
      new Date(item.expirationDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length
  };

  const toggleLock = () => {
    setIsLocked(!isLocked);
    toast.success(isLocked ? "지갑이 잠금 해제되었습니다" : "지갑이 잠겼습니다");
  };

  const shareItem = (item: WalletItem) => {
    toast.success(`${item.name} 공유 링크가 생성되었습니다`);
  };

  const exportWallet = () => {
    toast.success("지갑 백업이 생성되었습니다");
  };

  return (
    <div className="space-y-6">
      {/* 지갑 헤더 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">SignChain DID Wallet</h3>
                <p className="text-sm text-gray-600">분산 신원 지갑</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge variant={isLocked ? "secondary" : "default"}>
                {isLocked ? "잠김" : "활성"}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleLock}
              >
                {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* 지갑 통계 */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <div className="text-center">
              <p className="text-2xl font-bold">{walletStats.totalDIDs}</p>
              <p className="text-sm text-gray-600">DID</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{walletStats.totalCredentials}</p>
              <p className="text-sm text-gray-600">자격증명</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{walletStats.activeItems}</p>
              <p className="text-sm text-gray-600">활성 항목</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{walletStats.expiringItems}</p>
              <p className="text-sm text-gray-600">만료 예정</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 지갑 내용 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="dids">DIDs</TabsTrigger>
          <TabsTrigger value="credentials">자격증명</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <Plus className="w-6 h-6 mb-2" />
                  <span>DID 추가</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Import className="w-6 h-6 mb-2" />
                  <span>자격증명 가져오기</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <QrCode className="w-6 h-6 mb-2" />
                  <span>QR 스캔</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Share2 className="w-6 h-6 mb-2" />
                  <span>공유하기</span>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span className="text-sm">사업자등록증 자격증명이 발급되었습니다</span>
                  <span className="text-xs text-gray-500">2시간 전</span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-4 h-4 text-blue-500" />
                  <span className="text-sm">SignChain 서비스에서 신원 검증을 요청했습니다</span>
                  <span className="text-xs text-gray-500">5시간 전</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Key className="w-4 h-4 text-purple-500" />
                  <span className="text-sm">새 DID가 생성되었습니다</span>
                  <span className="text-xs text-gray-500">1일 전</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dids" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>내 DID 목록</CardTitle>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  새 DID 추가
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {walletItems
                  .filter(item => item.type === "did")
                  .map((did) => {
                    const Icon = did.icon;
                    return (
                      <div key={did.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Icon className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">{did.name}</p>
                              <p className="text-xs font-mono text-gray-600">{did.id}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {did.status === "active" ? "활성" : "비활성"}
                            </Badge>
                            <Button size="sm" variant="ghost">
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="credentials" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>자격증명</CardTitle>
                <Button size="sm">
                  <Import className="w-4 h-4 mr-2" />
                  가져오기
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {walletItems
                  .filter(item => item.type === "credential")
                  .map((credential) => {
                    const Icon = credential.icon;
                    return (
                      <div key={credential.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <Icon className="w-8 h-8 text-blue-500" />
                          <Badge variant={credential.status === "active" ? "default" : "secondary"}>
                            {credential.status === "active" ? "유효" : "만료"}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold mb-1">{credential.name}</h4>
                        <p className="text-sm text-gray-600 mb-2">발급: {credential.issuer}</p>
                        
                        <div className="space-y-1 text-xs text-gray-500">
                          <p>발급일: {credential.issuanceDate}</p>
                          {credential.expirationDate && (
                            <p>만료일: {credential.expirationDate}</p>
                          )}
                        </div>
                        
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="w-4 h-4 mr-1" />
                            보기
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => shareItem(credential)}
                          >
                            <Share2 className="w-4 h-4 mr-1" />
                            공유
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>지갑 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>백업 및 복구</Label>
                <div className="flex space-x-2 mt-2">
                  <Button variant="outline" onClick={exportWallet}>
                    <Download className="w-4 h-4 mr-2" />
                    지갑 백업
                  </Button>
                  <Button variant="outline">
                    <Import className="w-4 h-4 mr-2" />
                    지갑 복구
                  </Button>
                </div>
              </div>

              <div>
                <Label>보안 설정</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">생체 인증 사용</span>
                    <Button size="sm" variant="outline">활성화</Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">자동 잠금 시간</span>
                    <Button size="sm" variant="outline">5분</Button>
                  </div>
                </div>
              </div>

              <div>
                <Label>연결된 서비스</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span className="text-sm">signchain.example.com</span>
                    </div>
                    <Button size="sm" variant="ghost">연결 해제</Button>
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