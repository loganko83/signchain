import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Key, 
  Globe, 
  Database, 
  Award, 
  UserCheck,
  Lock,
  Fingerprint,
  Network,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Download,
  RefreshCw,
  Plus,
  Settings,
  Eye,
  Trash2,
  ExternalLink,
  QrCode,
  FileJson
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

interface IONIdentity {
  id: string;
  did: string;
  method: 'ion' | 'web' | 'ethr' | 'key';
  status: 'active' | 'deactivated' | 'revoked';
  created: string;
  lastUpdated: string;
  keyCount: number;
  serviceCount: number;
  operations: IONOperation[];
  metadata: {
    name: string;
    description: string;
    type: 'individual' | 'organization' | 'device' | 'service';
    verificationLevel: 'basic' | 'enhanced' | 'enterprise';
  };
}

interface IONOperation {
  id: string;
  type: 'create' | 'update' | 'recover' | 'deactivate';
  operationHash: string;
  transactionTime: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockHeight?: number;
}

interface VerifiableCredential {
  id: string;
  type: string[];
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: any;
  proof: {
    type: string;
    created: string;
    verificationMethod: string;
    proofPurpose: string;
    jws: string;
  };
  status: 'active' | 'revoked' | 'expired';
}

// Microsoft ION 스타일의 고급 DID 관리 시스템
export const MicrosoftIONManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [identities, setIdentities] = useState<IONIdentity[]>([]);
  const [selectedIdentity, setSelectedIdentity] = useState<IONIdentity | null>(null);
  const [credentials, setCredentials] = useState<VerifiableCredential[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('identities');

  // ION 노드 연결 상태
  const [ionNodeStatus, setIonNodeStatus] = useState({
    connected: true,
    latency: 45,
    blockHeight: 847392,
    pendingOperations: 12
  });

  useEffect(() => {
    loadIdentities();
    loadCredentials();
    checkIONNodeStatus();
  }, []);

  const loadIdentities = async () => {
    try {
      const response = await fetch('/api/did/identities/ion');
      if (response.ok) {
        const data = await response.json();
        setIdentities(data.identities || []);
      }
    } catch (error) {
      console.error('Failed to load ION identities:', error);
    }
  };

  const loadCredentials = async () => {
    try {
      const response = await fetch('/api/did/credentials');
      if (response.ok) {
        const data = await response.json();
        setCredentials(data.credentials || []);
      }
    } catch (error) {
      console.error('Failed to load credentials:', error);
    }
  };

  const checkIONNodeStatus = async () => {
    try {
      const response = await fetch('/api/did/ion/status');
      if (response.ok) {
        const status = await response.json();
        setIonNodeStatus(status);
      }
    } catch (error) {
      console.error('Failed to check ION status:', error);
    }
  };

  const createIONIdentity = async (identityData: {
    name: string;
    description: string;
    type: string;
    verificationLevel: string;
  }) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/did/ion/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...identityData,
          userId: user?.id
        })
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "성공",
          description: "ION DID가 생성되었습니다. 블록체인 확인까지 약 10-20분이 소요됩니다."
        });
        loadIdentities();
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "ION DID 생성에 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  const resolveIONDID = async (did: string) => {
    try {
      const response = await fetch(`/api/did/ion/resolve/${encodeURIComponent(did)}`);
      if (response.ok) {
        const document = await response.json();
        return document;
      }
    } catch (error) {
      console.error('Failed to resolve ION DID:', error);
    }
    return null;
  };

  const revokeCredential = async (credentialId: string) => {
    try {
      const response = await fetch(`/api/did/credentials/${credentialId}/revoke`, {
        method: 'POST'
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "자격증명이 폐기되었습니다."
        });
        loadCredentials();
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "자격증명 폐기에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      pending: 'outline',
      confirmed: 'default',
      failed: 'destructive',
      revoked: 'secondary',
      expired: 'secondary'
    };

    const colors = {
      active: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
      revoked: 'bg-gray-100 text-gray-800',
      expired: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge className={colors[status as keyof typeof colors]}>
        {status === 'active' && '활성'}
        {status === 'pending' && '대기 중'}
        {status === 'confirmed' && '확인됨'}
        {status === 'failed' && '실패'}
        {status === 'revoked' && '폐기됨'}
        {status === 'expired' && '만료됨'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* ION 네트워크 상태 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-blue-500" />
              <span>Microsoft ION 네트워크 상태</span>
            </div>
            <Button variant="outline" size="sm" onClick={checkIONNodeStatus}>
              <RefreshCw className="w-4 h-4 mr-2" />
              새로고침
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`w-3 h-3 rounded-full ${ionNodeStatus.connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <div>
                <p className="text-sm text-gray-600">연결 상태</p>
                <p className="font-semibold">{ionNodeStatus.connected ? '연결됨' : '연결 끊김'}</p>
              </div>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">응답 시간</p>
              <p className="font-semibold">{ionNodeStatus.latency}ms</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">현재 블록</p>
              <p className="font-semibold">{ionNodeStatus.blockHeight.toLocaleString()}</p>
            </div>
            
            <div>
              <p className="text-sm text-gray-600">대기 중 작업</p>
              <p className="font-semibold">{ionNodeStatus.pendingOperations}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 메인 탭 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="identities">DID 신원</TabsTrigger>
          <TabsTrigger value="credentials">자격증명</TabsTrigger>
          <TabsTrigger value="operations">작업 내역</TabsTrigger>
          <TabsTrigger value="settings">고급 설정</TabsTrigger>
        </TabsList>

        {/* DID 신원 관리 */}
        <TabsContent value="identities" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">ION DID 신원</h3>
              <p className="text-gray-600">Microsoft ION 네트워크의 탈중앙화 신원 관리</p>
            </div>
            <Button onClick={() => setIsCreating(true)} className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>새 DID 생성</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {identities.map((identity) => (
              <Card key={identity.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{identity.metadata.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{identity.metadata.description}</p>
                    </div>
                    {getStatusBadge(identity.status)}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all">
                      {identity.did}
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">키 개수:</span>
                      <span className="font-medium">{identity.keyCount}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">서비스:</span>
                      <span className="font-medium">{identity.serviceCount}</span>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">검증 수준:</span>
                      <Badge variant="outline" className="text-xs">
                        {identity.metadata.verificationLevel === 'basic' && '기본'}
                        {identity.metadata.verificationLevel === 'enhanced' && '향상'}
                        {identity.metadata.verificationLevel === 'enterprise' && '기업'}
                      </Badge>
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="w-3 h-3 mr-1" />
                        보기
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="w-3 h-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <QrCode className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 자격증명 관리 */}
        <TabsContent value="credentials" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">검증 가능한 자격증명</h3>
              <p className="text-gray-600">W3C VC 표준 기반 디지털 자격증명</p>
            </div>
            <Button className="flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>자격증명 발급</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {credentials.map((credential) => (
              <Card key={credential.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Award className="w-5 h-5 text-blue-500" />
                        <h4 className="font-semibold">{credential.type.join(', ')}</h4>
                        {getStatusBadge(credential.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>발급자:</strong> {credential.issuer}</p>
                        <p><strong>발급일:</strong> {new Date(credential.issuanceDate).toLocaleDateString('ko-KR')}</p>
                        {credential.expirationDate && (
                          <p><strong>만료일:</strong> {new Date(credential.expirationDate).toLocaleDateString('ko-KR')}</p>
                        )}
                      </div>
                      
                      <div className="mt-3 text-xs font-mono bg-gray-100 p-2 rounded break-all">
                        ID: {credential.id}
                      </div>
                    </div>
                    
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button size="sm" variant="outline">
                        <FileJson className="w-3 h-3 mr-1" />
                        내보내기
                      </Button>
                      <Button size="sm" variant="outline">
                        <ExternalLink className="w-3 h-3 mr-1" />
                        검증
                      </Button>
                      {credential.status === 'active' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => revokeCredential(credential.id)}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          폐기
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ION 작업 내역 */}
        <TabsContent value="operations" className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold">ION 블록체인 작업 내역</h3>
            <p className="text-gray-600">DID 작업의 블록체인 트랜잭션 상태</p>
          </div>

          <div className="space-y-4">
            {identities.flatMap(identity => identity.operations).map((operation) => (
              <Card key={operation.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-2 h-2 rounded-full ${
                          operation.status === 'confirmed' ? 'bg-green-500' :
                          operation.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <span className="font-medium capitalize">{operation.type} Operation</span>
                        {getStatusBadge(operation.status)}
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>작업 해시:</strong> {operation.operationHash}</p>
                        <p><strong>시간:</strong> {new Date(operation.transactionTime).toLocaleString('ko-KR')}</p>
                        {operation.blockHeight && (
                          <p><strong>블록 높이:</strong> {operation.blockHeight.toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      탐색기
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 고급 설정 */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ION 네트워크 설정</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ionNode">ION 노드 URL</Label>
                  <Input
                    id="ionNode"
                    defaultValue="https://ion.msidentity.com"
                    placeholder="ION 노드 엔드포인트"
                  />
                </div>
                
                <div>
                  <Label htmlFor="bitcoinNode">Bitcoin 노드 URL</Label>
                  <Input
                    id="bitcoinNode"
                    defaultValue="https://blockstream.info/api"
                    placeholder="Bitcoin 노드 엔드포인트"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="autoUpdate" />
                <Label htmlFor="autoUpdate">DID 문서 자동 업데이트</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch id="monitoring" defaultChecked />
                <Label htmlFor="monitoring">네트워크 상태 모니터링</Label>
              </div>
              
              <div className="pt-4">
                <Button>설정 저장</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DID 생성 모달 */}
      {isCreating && (
        <Card className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">새 ION DID 생성</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newName">신원 이름</Label>
                <Input id="newName" placeholder="예: 개인 신원, 회사 계정" />
              </div>
              
              <div>
                <Label htmlFor="newDesc">설명</Label>
                <Textarea id="newDesc" placeholder="이 DID의 용도를 설명하세요" />
              </div>
              
              <div>
                <Label htmlFor="newType">유형</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="신원 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">개인</SelectItem>
                    <SelectItem value="organization">조직</SelectItem>
                    <SelectItem value="device">디바이스</SelectItem>
                    <SelectItem value="service">서비스</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="verLevel">검증 수준</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="검증 수준 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">기본</SelectItem>
                    <SelectItem value="enhanced">향상</SelectItem>
                    <SelectItem value="enterprise">기업</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                취소
              </Button>
              <Button onClick={() => {
                // createIONIdentity 호출
                setIsCreating(false);
              }}>
                생성
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
