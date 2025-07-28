import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cloud,
  FolderOpen,
  FileText,
  RefreshCw,
  Check,
  X,
  AlertCircle,
  Shield,
  Clock,
  Upload,
  Download,
  Settings,
  LogIn,
  Plus,
  Trash2,
  ExternalLink,
  Info
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CloudService {
  id: string;
  name: string;
  type: "google_drive" | "dropbox" | "onedrive";
  connected: boolean;
  email?: string;
  lastSync?: string;
  settings: {
    autoSync: boolean;
    syncInterval: "manual" | "realtime" | "hourly" | "daily";
    folderPath: string;
    encryption: boolean;
    twoFactorRequired: boolean;
  };
}

interface SyncedFile {
  id: string;
  name: string;
  service: string;
  localPath: string;
  cloudPath: string;
  lastSync: string;
  status: "synced" | "syncing" | "error" | "pending";
  size: string;
}

export default function CloudIntegration() {
  const { toast } = useToast();
  
  const [services, setServices] = useState<CloudService[]>([
    {
      id: "1",
      name: "Google Drive",
      type: "google_drive",
      connected: true,
      email: "user@gmail.com",
      lastSync: "2024-01-22 14:30",
      settings: {
        autoSync: true,
        syncInterval: "realtime",
        folderPath: "/SignChain/Contracts",
        encryption: true,
        twoFactorRequired: false
      }
    },
    {
      id: "2",
      name: "Dropbox",
      type: "dropbox",
      connected: false,
      settings: {
        autoSync: false,
        syncInterval: "manual",
        folderPath: "/SignChain",
        encryption: false,
        twoFactorRequired: false
      }
    },
    {
      id: "3",
      name: "OneDrive",
      type: "onedrive",
      connected: false,
      settings: {
        autoSync: false,
        syncInterval: "manual",
        folderPath: "/Documents/SignChain",
        encryption: false,
        twoFactorRequired: false
      }
    }
  ]);

  const [syncedFiles] = useState<SyncedFile[]>([
    {
      id: "1",
      name: "서비스 이용 계약서_v2.pdf",
      service: "Google Drive",
      localPath: "/contracts/2024/01/service-agreement-v2.pdf",
      cloudPath: "/SignChain/Contracts/2024/service-agreement-v2.pdf",
      lastSync: "2024-01-22 14:30",
      status: "synced",
      size: "2.4 MB"
    },
    {
      id: "2",
      name: "근로계약서_김철수.pdf",
      service: "Google Drive",
      localPath: "/contracts/2024/01/employment-kim.pdf",
      cloudPath: "/SignChain/Contracts/2024/employment-kim.pdf",
      lastSync: "2024-01-22 13:15",
      status: "syncing",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "NDA_테크기업.pdf",
      service: "Google Drive",
      localPath: "/contracts/2024/01/nda-tech.pdf",
      cloudPath: "/SignChain/Contracts/2024/nda-tech.pdf",
      lastSync: "2024-01-22 12:00",
      status: "error",
      size: "956 KB"
    }
  ]);

  const [selectedService, setSelectedService] = useState<CloudService | null>(null);

  const connectService = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    toast({
      title: "연결 중",
      description: `${service.name} 연결을 시작합니다...`
    });

    // Simulate OAuth flow
    setTimeout(() => {
      setServices(prev => prev.map(s => 
        s.id === serviceId 
          ? { ...s, connected: true, email: `user@${s.type.replace('_', '')}.com` }
          : s
      ));
      
      toast({
        title: "연결 완료",
        description: `${service.name}이(가) 성공적으로 연결되었습니다.`
      });
    }, 2000);
  };

  const disconnectService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, connected: false, email: undefined }
        : s
    ));
    
    toast({
      title: "연결 해제됨",
      description: `${service.name} 연결이 해제되었습니다.`
    });
  };

  const syncNow = async (serviceId: string) => {
    const service = services.find(s => s.id === serviceId);
    if (!service) return;

    toast({
      title: "동기화 시작",
      description: `${service.name} 동기화를 시작합니다...`
    });

    // Simulate sync
    setTimeout(() => {
      setServices(prev => prev.map(s => 
        s.id === serviceId 
          ? { ...s, lastSync: new Date().toLocaleString() }
          : s
      ));
      
      toast({
        title: "동기화 완료",
        description: `${service.name} 동기화가 완료되었습니다.`
      });
    }, 3000);
  };

  const updateServiceSetting = (serviceId: string, key: keyof CloudService['settings'], value: any) => {
    setServices(prev => prev.map(s => 
      s.id === serviceId 
        ? { ...s, settings: { ...s.settings, [key]: value } }
        : s
    ));
    
    toast({
      title: "설정 저장됨",
      description: "클라우드 스토리지 설정이 업데이트되었습니다."
    });
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "google_drive":
        return "🔷";
      case "dropbox":
        return "📦";
      case "onedrive":
        return "☁️";
      default:
        return "📁";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "synced":
        return <Check className="h-4 w-4 text-green-600" />;
      case "syncing":
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      case "error":
        return <X className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="services" className="space-y-4">
        <TabsList>
          <TabsTrigger value="services">연결된 스토리지</TabsTrigger>
          <TabsTrigger value="files">동기화 파일</TabsTrigger>
          <TabsTrigger value="settings">설정</TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {services.map((service) => (
              <Card key={service.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{getServiceIcon(service.type)}</span>
                      <CardTitle className="text-lg">{service.name}</CardTitle>
                    </div>
                    {service.connected && (
                      <Badge className="bg-green-500">연결됨</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {service.connected ? (
                    <>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">계정:</span>
                          <span className="font-medium">{service.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">마지막 동기화:</span>
                          <span className="font-medium">{service.lastSync || "없음"}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">자동 동기화:</span>
                          <Badge variant={service.settings.autoSync ? "default" : "secondary"}>
                            {service.settings.autoSync ? "켜짐" : "꺼짐"}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => syncNow(service.id)}
                        >
                          <RefreshCw className="h-4 w-4 mr-2" />
                          동기화
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          onClick={() => setSelectedService(service)}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          설정
                        </Button>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="w-full"
                        onClick={() => disconnectService(service.id)}
                      >
                        연결 해제
                      </Button>
                    </>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => connectService(service.id)}
                    >
                      <LogIn className="h-4 w-4 mr-2" />
                      {service.name} 연결
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>동기화된 파일</CardTitle>
                <Button size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  전체 동기화
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>파일명</TableHead>
                    <TableHead>서비스</TableHead>
                    <TableHead>크기</TableHead>
                    <TableHead>마지막 동기화</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {syncedFiles.map((file) => (
                    <TableRow key={file.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FileText className="h-4 w-4 text-muted-foreground" />
                          {file.name}
                        </div>
                      </TableCell>
                      <TableCell>{file.service}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.size}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {file.lastSync}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(file.status)}
                          <span className="text-sm">
                            {file.status === "synced" && "동기화됨"}
                            {file.status === "syncing" && "동기화 중"}
                            {file.status === "error" && "오류"}
                            {file.status === "pending" && "대기 중"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="ghost">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>전역 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-medium">동기화 규칙</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>서명 완료된 문서만 동기화</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>블록체인 검증된 문서만 동기화</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>템플릿 동기화</Label>
                    <Switch />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">파일 구조</h3>
                <div className="space-y-2">
                  <Label>폴더 구조 형식</Label>
                  <Select defaultValue="year-month">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="year-month">/년도/월/파일명</SelectItem>
                      <SelectItem value="category">/카테고리/파일명</SelectItem>
                      <SelectItem value="client">/고객명/파일명</SelectItem>
                      <SelectItem value="flat">단일 폴더</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-medium">보안</h3>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">주의사항</p>
                      <p className="text-yellow-700">
                        클라우드 스토리지에 저장된 문서는 해당 서비스의 보안 정책을 따릅니다.
                        민감한 문서는 암호화 옵션을 활성화하는 것을 권장합니다.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-4">
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    전체 백업
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Upload className="h-4 w-4 mr-2" />
                    복원
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}