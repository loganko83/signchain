import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Stamp, 
  Building2, 
  User, 
  Settings, 
  Shield, 
  History, 
  Plus, 
  Edit, 
  Trash2, 
  Download,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Users
} from 'lucide-react';

interface Stamp {
  id: string;
  name: string;
  type: 'company' | 'personal' | 'department';
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  lastUsed: string | null;
  status: 'active' | 'inactive' | 'suspended';
  permissions: {
    users: string[];
    departments: string[];
    roles: string[];
  };
}

interface StampUsage {
  id: string;
  stampId: string;
  stampName: string;
  contractId: string;
  contractTitle: string;
  usedBy: string;
  usedAt: string;
  ipAddress: string;
  userAgent: string;
}

export default function StampManager() {
  const [stamps, setStamps] = useState<Stamp[]>([
    {
      id: '1',
      name: '(주)테크코퍼레이션 법인인감',
      type: 'company',
      imageUrl: '/stamps/company-seal.png',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-10',
      usageCount: 45,
      lastUsed: '2024-01-20',
      status: 'active',
      permissions: {
        users: ['admin@techcorp.com', 'ceo@techcorp.com'],
        departments: ['경영지원실', '법무팀'],
        roles: ['대표이사', '법무팀장']
      }
    },
    {
      id: '2',
      name: '영업본부 직인',
      type: 'department',
      imageUrl: '/stamps/sales-dept-seal.png',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15',
      usageCount: 23,
      lastUsed: '2024-01-19',
      status: 'active',
      permissions: {
        users: ['sales-head@techcorp.com'],
        departments: ['영업본부'],
        roles: ['영업본부장', '영업팀장']
      }
    }
  ]);

  const [usageHistory, setUsageHistory] = useState<StampUsage[]>([
    {
      id: '1',
      stampId: '1',
      stampName: '(주)테크코퍼레이션 법인인감',
      contractId: 'contract-1',
      contractTitle: '소프트웨어 개발 용역계약서',
      usedBy: 'admin@techcorp.com',
      usedAt: '2024-01-20 14:30:00',
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome/120.0.0.0'
    }
  ]);

  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [selectedStamp, setSelectedStamp] = useState<Stamp | null>(null);
  const [activeTab, setActiveTab] = useState('stamps');
  const [newStamp, setNewStamp] = useState({
    name: '',
    type: 'company' as const,
    image: null as File | null
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewStamp({ ...newStamp, image: file });
    }
  };

  const handleStampUpload = async () => {
    if (!newStamp.name || !newStamp.image) {
      return;
    }

    // 실제 구현에서는 서버로 이미지를 업로드하고 URL을 받아옴
    const newStampData: Stamp = {
      id: Date.now().toString(),
      name: newStamp.name,
      type: newStamp.type,
      imageUrl: URL.createObjectURL(newStamp.image),
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
      usageCount: 0,
      lastUsed: null,
      status: 'active',
      permissions: {
        users: [],
        departments: [],
        roles: []
      }
    };

    setStamps([...stamps, newStampData]);
    setShowUploadDialog(false);
    setNewStamp({ name: '', type: 'company', image: null });
  };

  const toggleStampStatus = (stampId: string) => {
    setStamps(stamps.map(stamp => 
      stamp.id === stampId 
        ? { ...stamp, status: stamp.status === 'active' ? 'inactive' : 'active' }
        : stamp
    ));
  };

  const deleteStamp = (stampId: string) => {
    if (confirm('정말로 이 도장을 삭제하시겠습니까?')) {
      setStamps(stamps.filter(stamp => stamp.id !== stampId));
    }
  };

  const getStatusBadge = (status: Stamp['status']) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-600">사용중</Badge>;
      case 'inactive':
        return <Badge variant="secondary">비활성</Badge>;
      case 'suspended':
        return <Badge variant="destructive">일시중지</Badge>;
    }
  };

  const getTypeBadge = (type: Stamp['type']) => {
    switch (type) {
      case 'company':
        return <Badge variant="default">법인</Badge>;
      case 'department':
        return <Badge variant="secondary">부서</Badge>;
      case 'personal':
        return <Badge variant="outline">개인</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">전자도장 관리</h3>
          <p className="text-sm text-muted-foreground">
            회사 및 개인 도장을 등록하고 사용 권한을 관리합니다.
          </p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          새 도장 등록
        </Button>
      </div>

      {/* 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stamps">
            <Stamp className="h-4 w-4 mr-2" />
            도장 목록
          </TabsTrigger>
          <TabsTrigger value="permissions">
            <Shield className="h-4 w-4 mr-2" />
            권한 설정
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            사용 이력
          </TabsTrigger>
        </TabsList>

        {/* 도장 목록 탭 */}
        <TabsContent value="stamps" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {stamps.map(stamp => (
              <Card key={stamp.id} className="relative">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{stamp.name}</CardTitle>
                    <div className="flex gap-1">
                      {getTypeBadge(stamp.type)}
                      {getStatusBadge(stamp.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
                    <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center">
                      <Stamp className="h-16 w-16 text-gray-400" />
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">사용 횟수</span>
                      <span className="font-medium">{stamp.usageCount}회</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">마지막 사용</span>
                      <span className="font-medium">
                        {stamp.lastUsed || '사용 기록 없음'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">등록일</span>
                      <span className="font-medium">{stamp.createdAt}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => {
                        setSelectedStamp(stamp);
                        setShowPermissionDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      권한
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleStampStatus(stamp.id)}
                    >
                      {stamp.status === 'active' ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteStamp(stamp.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 권한 설정 탭 */}
        <TabsContent value="permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>도장 권한 관리</CardTitle>
              <CardDescription>
                도장별 사용 권한을 설정합니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stamps.map(stamp => (
                  <div key={stamp.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <Stamp className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <p className="font-medium">{stamp.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {stamp.permissions.users.length}명, 
                          {stamp.permissions.departments.length}개 부서, 
                          {stamp.permissions.roles.length}개 역할
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setSelectedStamp(stamp);
                        setShowPermissionDialog(true);
                      }}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      권한 설정
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 사용 이력 탭 */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>도장 사용 이력</CardTitle>
              <CardDescription>
                최근 30일간의 도장 사용 기록입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>사용일시</TableHead>
                    <TableHead>도장</TableHead>
                    <TableHead>계약서</TableHead>
                    <TableHead>사용자</TableHead>
                    <TableHead>IP 주소</TableHead>
                    <TableHead>상태</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {usageHistory.map(usage => (
                    <TableRow key={usage.id}>
                      <TableCell>{usage.usedAt}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Stamp className="h-4 w-4 text-gray-500" />
                          <span className="text-sm">{usage.stampName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{usage.contractTitle}</TableCell>
                      <TableCell>{usage.usedBy}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {usage.ipAddress}
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="bg-green-600">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          정상
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 도장 업로드 다이얼로그 */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>새 도장 등록</DialogTitle>
            <DialogDescription>
              회사 또는 개인 도장을 등록하세요. 등록된 도장은 계약서에 전자적으로 날인됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="stamp-name">도장 이름</Label>
              <Input
                id="stamp-name"
                placeholder="예: (주)테크코퍼레이션 법인인감"
                value={newStamp.name}
                onChange={(e) => setNewStamp({ ...newStamp, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stamp-type">도장 유형</Label>
              <Select 
                value={newStamp.type} 
                onValueChange={(value) => setNewStamp({ ...newStamp, type: value as Stamp['type'] })}
              >
                <SelectTrigger id="stamp-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      법인 도장
                    </div>
                  </SelectItem>
                  <SelectItem value="department">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      부서 도장
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      개인 도장
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="stamp-image">도장 이미지</Label>
              <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors">
                <label htmlFor="stamp-image" className="cursor-pointer">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 이미지 선택
                  </p>
                  {newStamp.image && (
                    <p className="text-sm font-medium mt-2">{newStamp.image.name}</p>
                  )}
                </label>
                <Input
                  id="stamp-image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                투명 배경의 PNG 파일을 권장합니다. (최대 2MB)
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
              취소
            </Button>
            <Button onClick={handleStampUpload} disabled={!newStamp.name || !newStamp.image}>
              <Upload className="h-4 w-4 mr-2" />
              도장 등록
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 권한 설정 다이얼로그 */}
      <Dialog open={showPermissionDialog} onOpenChange={setShowPermissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>도장 사용 권한 설정</DialogTitle>
            <DialogDescription>
              {selectedStamp?.name}의 사용 권한을 설정합니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>사용자별 권한</Label>
              <div className="flex gap-2">
                <Input placeholder="이메일 주소 입력" />
                <Button size="sm">추가</Button>
              </div>
              <div className="space-y-2 mt-2">
                {selectedStamp?.permissions.users.map(user => (
                  <div key={user} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm">{user}</span>
                    <Button variant="ghost" size="sm">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>부서별 권한</Label>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="부서 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="management">경영지원실</SelectItem>
                    <SelectItem value="sales">영업본부</SelectItem>
                    <SelectItem value="legal">법무팀</SelectItem>
                    <SelectItem value="hr">인사팀</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">추가</Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>역할별 권한</Label>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="역할 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ceo">대표이사</SelectItem>
                    <SelectItem value="executive">임원</SelectItem>
                    <SelectItem value="team-lead">팀장</SelectItem>
                    <SelectItem value="manager">매니저</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="sm">추가</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPermissionDialog(false)}>
              취소
            </Button>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              권한 저장
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}