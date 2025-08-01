import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Upload, 
  Send, 
  Shield, 
  CheckCircle, 
  Clock,
  Download,
  Eye,
  Users,
  Mail,
  AlertCircle,
  FileCheck,
  X,
  Edit3,
  FileSignature,
  History,
  Settings,
  Briefcase,
  Calendar,
  CreditCard,
  Archive,
  BarChart,
  Smartphone,
  Bell
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/components/ui/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import DocumentEditor from "@/components/contract/DocumentEditor";
import ContractTracking from "@/components/contract/ContractTracking";
import ContractTemplates from "@/components/contract/ContractTemplates";
import BulkSend from "@/components/contract/BulkSend";
import StampManager from "@/components/contract/StampManager";
import SignatureAuth from "@/components/contract/SignatureAuth";
import VersionControl from "@/components/contract/VersionControl";
import CloudIntegration from "@/components/contract/CloudIntegration";
import MobileOptimization from "@/components/contract/MobileOptimization";
import NotificationSettings from "@/components/contract/NotificationSettings";
import BlockchainHashDisplay from "@/components/BlockchainHashDisplay";
import { generateMockTransactionHash, generateMockBlockNumber } from "@/lib/blockchain-hash-utils";

interface ContractDocument {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileHash: string;
  ipfsHash?: string;
  ipfsGatewayUrl?: string;
  checksum?: string;
  fileId?: string;
  uploadedAt: string;
  status: "uploaded" | "pending_signature" | "partially_signed" | "completed";
  signers: {
    email: string;
    name?: string;
    signed: boolean;
    signedAt?: string;
  }[];
  ccRecipients?: string[];
  blockchainTxHash?: string;
}

export default function ContractModule() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [selectedContract, setSelectedContract] = useState<ContractDocument | null>(null);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  
  const [contractData, setContractData] = useState({
    title: "",
    description: "",
    organizationId: ""
  });

  const [signatureRequest, setSignatureRequest] = useState({
    signerEmail: "",
    signerName: "",
    ccEmails: "",
    message: ""
  });

  // Mock data for demonstration
  const [contracts, setContracts] = useState<ContractDocument[]>([
    {
      id: "1",
      title: "서비스 이용 계약서",
      description: "2024년 연간 서비스 이용 계약",
      fileName: "service_contract_2024.pdf",
      fileHash: "0x1234...abcd",
      uploadedAt: "2024-01-15T10:30:00",
      status: "partially_signed",
      signers: [
        { email: user?.email || "", name: "김철수", signed: true, signedAt: "2024-01-15T14:00:00" },
        { email: "partner@company.com", name: "이영희", signed: false }
      ],
      ccRecipients: ["legal@company.com"],
      blockchainTxHash: "0xabc123..."
    },
    {
      id: "2", 
      title: "비밀유지계약서(NDA)",
      description: "프로젝트 X 관련 NDA",
      fileName: "nda_project_x.pdf",
      fileHash: "0x5678...efgh",
      uploadedAt: "2024-01-10T09:00:00",
      status: "completed",
      signers: [
        { email: user?.email || "", name: "김철수", signed: true, signedAt: "2024-01-10T10:00:00" },
        { email: "vendor@external.com", name: "박민수", signed: true, signedAt: "2024-01-11T15:30:00" }
      ],
      blockchainTxHash: "0xdef456..."
    }
  ]);

  // Statistics data
  const stats = {
    totalContracts: contracts.length,
    completed: contracts.filter(c => c.status === "completed").length,
    pending: contracts.filter(c => c.status === "pending_signature" || c.status === "partially_signed").length,
    thisMonth: contracts.filter(c => {
      const date = new Date(c.uploadedAt);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !contractData.title) {
      toast({
        title: "입력 오류",
        description: "계약서 제목과 파일을 선택해주세요.",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      // Step 1: Upload file to IPFS
      toast({
        title: "IPFS 업로드 중",
        description: "계약서를 분산 저장소에 업로드하고 있습니다..."
      });

      const formData = new FormData();
      formData.append('file', selectedFile);

      const ipfsResponse = await fetch('/api/v1/ipfs/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!ipfsResponse.ok) {
        throw new Error('IPFS 업로드 실패');
      }

      const ipfsResult = await ipfsResponse.json();
      
      if (!ipfsResult.success) {
        throw new Error(ipfsResult.message || 'IPFS 업로드 실패');
      }

      // Step 2: Save contract metadata to database
      toast({
        title: "블록체인 등록 중",
        description: "계약 정보를 블록체인에 등록하고 있습니다..."
      });

      const contractMetadata = {
        title: contractData.title,
        description: contractData.description,
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        size: selectedFile.size,
        ipfsHash: ipfsResult.data.ipfsHash,
        ipfsGatewayUrl: ipfsResult.data.ipfsGatewayUrl,
        checksum: ipfsResult.data.checksum,
        category: 'contract'
      };

      // Save to database (using existing files API)
      const saveResponse = await fetch('/api/v1/files', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contractMetadata)
      });

      let fileRecord = null;
      if (saveResponse.ok) {
        const saveResult = await saveResponse.json();
        fileRecord = saveResult.data;
      }

      // Step 3: Create contract record
      const newContract: ContractDocument = {
        id: Date.now().toString(),
        title: contractData.title,
        description: contractData.description,
        fileName: selectedFile.name,
        fileHash: ipfsResult.data.ipfsHash,
        ipfsHash: ipfsResult.data.ipfsHash,
        ipfsGatewayUrl: ipfsResult.data.ipfsGatewayUrl,
        checksum: ipfsResult.data.checksum,
        uploadedAt: new Date().toISOString(),
        status: "uploaded",
        signers: [],
        blockchainTxHash: `0x${Math.random().toString(16).substr(2, 8)}...`,
        fileId: fileRecord?.id
      };

      setContracts([newContract, ...contracts]);
      
      toast({
        title: "업로드 성공",
        description: `계약서가 IPFS(${ipfsResult.data.ipfsHash.substring(0, 8)}...)에 저장되고 블록체인에 등록되었습니다.`
      });
      
      // Reset form
      setContractData({ title: "", description: "", organizationId: "" });
      setSelectedFile(null);
      setActiveTab("manage");
    } catch (error) {
      console.error('Contract upload error:', error);
      toast({
        title: "업로드 실패",
        description: error instanceof Error ? error.message : "계약서 업로드 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSignatureRequest = async () => {
    if (!signatureRequest.signerEmail || !selectedContract) {
      toast({
        title: "입력 오류",
        description: "서명자 이메일을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate sending signature request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedContract = {
        ...selectedContract,
        status: "pending_signature" as const,
        signers: [
          ...selectedContract.signers,
          {
            email: signatureRequest.signerEmail,
            name: signatureRequest.signerName,
            signed: false
          }
        ],
        ccRecipients: signatureRequest.ccEmails ? signatureRequest.ccEmails.split(',').map(e => e.trim()) : []
      };

      setContracts(contracts.map(c => c.id === selectedContract.id ? updatedContract : c));
      
      toast({
        title: "서명 요청 발송",
        description: `${signatureRequest.signerEmail}로 서명 요청을 발송했습니다.`
      });
      
      setShowSignatureModal(false);
      setSignatureRequest({ signerEmail: "", signerName: "", ccEmails: "", message: "" });
    } catch (error) {
      toast({
        title: "발송 실패",
        description: "서명 요청 발송 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: ContractDocument["status"]) => {
    switch (status) {
      case "uploaded":
        return <Badge variant="secondary"><Upload className="w-3 h-3 mr-1" />업로드됨</Badge>;
      case "pending_signature":
        return <Badge variant="default" className="bg-yellow-500"><Clock className="w-3 h-3 mr-1" />서명 대기</Badge>;
      case "partially_signed":
        return <Badge variant="default" className="bg-blue-500"><Users className="w-3 h-3 mr-1" />일부 서명</Badge>;
      case "completed":
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>;
    }
  };

  const getProgressPercentage = (contract: ContractDocument) => {
    if (contract.signers.length === 0) return 0;
    const signedCount = contract.signers.filter(s => s.signed).length;
    return (signedCount / contract.signers.length) * 100;
  };

  // Mock tracking data
  const mockTrackingData = {
    contractId: "1",
    title: "서비스 이용 계약서",
    status: "signing" as const,
    createdAt: "2024-01-15T10:30:00",
    expiresAt: "2024-02-15T23:59:59",
    documentHash: "0x1234567890abcdef",
    blockchainTxHash: "0xabc123def456",
    signers: [
      {
        id: "1",
        email: "kim@example.com",
        name: "김철수",
        role: "구매자",
        status: "signed" as const,
        signedAt: "2024-01-15T14:00:00",
        viewedAt: "2024-01-15T13:30:00",
        ipAddress: "123.456.789.0",
        device: "Chrome on Windows"
      },
      {
        id: "2",
        email: "lee@company.com",
        name: "이영희",
        role: "판매자",
        status: "viewed" as const,
        viewedAt: "2024-01-16T10:00:00",
        ipAddress: "987.654.321.0",
        device: "Safari on Mac"
      }
    ],
    timeline: [
      {
        id: "1",
        action: "계약서 생성",
        actor: "김철수",
        timestamp: "2024-01-15T10:30:00",
        details: "서비스 이용 계약서를 생성했습니다"
      },
      {
        id: "2",
        action: "서명 요청 발송",
        actor: "시스템",
        timestamp: "2024-01-15T10:35:00",
        details: "2명의 서명자에게 이메일이 발송되었습니다"
      },
      {
        id: "3",
        action: "문서 열람",
        actor: "김철수",
        timestamp: "2024-01-15T13:30:00",
        ipAddress: "123.456.789.0"
      },
      {
        id: "4",
        action: "서명 완료",
        actor: "김철수",
        timestamp: "2024-01-15T14:00:00",
        ipAddress: "123.456.789.0"
      }
    ],
    reminders: [
      {
        sentAt: "2024-01-17T09:00:00",
        sentTo: ["lee@company.com"],
        type: "auto" as const
      }
    ]
  };

  if (showDocumentEditor) {
    return (
      <div className="container mx-auto py-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">문서 편집기</h1>
          <Button
            variant="outline"
            onClick={() => setShowDocumentEditor(false)}
          >
            <X className="w-4 h-4 mr-2" />
            닫기
          </Button>
        </div>
        <DocumentEditor
          documentUrl="/mock-document.pdf"
          onSave={(signers, fields) => {
            console.log("Saved:", { signers, fields });
            setShowDocumentEditor(false);
            toast({
              title: "저장 완료",
              description: "서명 필드가 성공적으로 설정되었습니다."
            });
          }}
        />
      </div>
    );
  }

  if (showTracking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">계약서 추적</h1>
          <Button
            variant="outline"
            onClick={() => setShowTracking(false)}
          >
            <X className="w-4 h-4 mr-2" />
            목록으로
          </Button>
        </div>
        <ContractTracking
          trackingData={mockTrackingData}
          onSendReminder={(signerIds) => {
            console.log("Send reminder to:", signerIds);
            toast({
              title: "리마인더 발송",
              description: "선택한 서명자에게 리마인더를 발송했습니다."
            });
          }}
          onDownload={() => {
            console.log("Download contract");
          }}
          onView={() => {
            console.log("View contract");
          }}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">계약 모듈</h1>
        <p className="text-muted-foreground">블록체인 기반 계약서 관리 및 전자서명</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-12 gap-1">
          <TabsTrigger value="overview">
            <BarChart className="w-4 h-4 mr-2" />
            대시보드
          </TabsTrigger>
          <TabsTrigger value="upload">
            <Upload className="w-4 h-4 mr-2" />
            계약서 업로드
          </TabsTrigger>
          <TabsTrigger value="templates">
            <FileSignature className="w-4 h-4 mr-2" />
            템플릿
          </TabsTrigger>
          <TabsTrigger value="bulk-send">
            <Users className="w-4 h-4 mr-2" />
            대량 발송
          </TabsTrigger>
          <TabsTrigger value="stamps">
            <Shield className="w-4 h-4 mr-2" />
            도장 관리
          </TabsTrigger>
          <TabsTrigger value="auth">
            <Settings className="w-4 h-4 mr-2" />
            서명 인증
          </TabsTrigger>
          <TabsTrigger value="version">
            <History className="w-4 h-4 mr-2" />
            버전 관리
          </TabsTrigger>
          <TabsTrigger value="cloud">
            <Upload className="w-4 h-4 mr-2" />
            클라우드
          </TabsTrigger>
          <TabsTrigger value="mobile">
            <Smartphone className="w-4 h-4 mr-2" />
            모바일
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            알림
          </TabsTrigger>
          <TabsTrigger value="manage">
            <FileText className="w-4 h-4 mr-2" />
            진행 중
          </TabsTrigger>
          <TabsTrigger value="completed">
            <CheckCircle className="w-4 h-4 mr-2" />
            완료
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">전체 계약서</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalContracts}</div>
                <p className="text-xs text-muted-foreground">
                  이번 달 +{stats.thisMonth}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">완료된 계약</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.completed}</div>
                <p className="text-xs text-muted-foreground">
                  전체의 {Math.round((stats.completed / stats.totalContracts) * 100)}%
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">진행 중</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  서명 대기 중
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">평균 처리 시간</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.5일</div>
                <p className="text-xs text-muted-foreground">
                  지난 달 대비 -0.5일
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>빠른 작업</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                <Button className="w-full justify-start" onClick={() => setActiveTab("upload")}>
                  <Upload className="w-4 h-4 mr-2" />
                  새 계약서 업로드
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setActiveTab("templates")}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  템플릿에서 생성
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => setShowDocumentEditor(true)}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  문서 편집기 열기
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>최근 활동</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">NDA 계약서 완료</p>
                      <p className="text-xs text-muted-foreground">2시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-blue-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">서비스 계약서 서명 요청</p>
                      <p className="text-xs text-muted-foreground">5시간 전</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Eye className="w-4 h-4 text-yellow-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">구매 계약서 열람</p>
                      <p className="text-xs text-muted-foreground">1일 전</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="upload" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>새 계약서 업로드</CardTitle>
              <CardDescription>계약서를 업로드하고 블록체인에 등록합니다</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">계약서 제목 *</Label>
                <Input
                  id="title"
                  placeholder="예: 2024년 서비스 이용 계약서"
                  value={contractData.title}
                  onChange={(e) => setContractData({ ...contractData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  placeholder="계약서에 대한 간단한 설명을 입력하세요"
                  value={contractData.description}
                  onChange={(e) => setContractData({ ...contractData, description: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="file">계약서 파일 *</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="flex-1"
                  />
                  {selectedFile && (
                    <Badge variant="outline" className="gap-1">
                      <FileText className="w-3 h-3" />
                      {selectedFile.name}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleUpload} 
                  disabled={uploading || !selectedFile || !contractData.title}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      업로드 중...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      블록체인에 계약서 등록
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDocumentEditor(true)}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  편집기로 작성
                </Button>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start gap-2">
                  <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900">블록체인 보안</p>
                    <p className="text-blue-700">업로드된 계약서는 SHA-256 해시로 변환되어 블록체인에 영구 저장됩니다.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <ContractTemplates />
        </TabsContent>

        <TabsContent value="bulk-send" className="space-y-4">
          <BulkSend 
            templates={[
              {
                id: "1",
                name: "표준 근로계약서",
                category: "인사/노무",
                fields: [
                  { name: "employeeName", type: "text", label: "근로자 성명" },
                  { name: "department", type: "text", label: "부서" },
                  { name: "position", type: "text", label: "직위" },
                  { name: "salary", type: "number", label: "급여" },
                  { name: "startDate", type: "date", label: "계약 시작일" }
                ]
              },
              {
                id: "2",
                name: "소프트웨어 개발 용역계약서",
                category: "IT/개발",
                fields: [
                  { name: "projectName", type: "text", label: "프로젝트명" },
                  { name: "scope", type: "textarea", label: "개발 범위" },
                  { name: "amount", type: "number", label: "계약 금액" },
                  { name: "deliveryDate", type: "date", label: "납품일" }
                ]
              },
              {
                id: "3",
                name: "비밀유지계약서(NDA)",
                category: "법무/보안",
                fields: [
                  { name: "partyA", type: "text", label: "공개자" },
                  { name: "partyB", type: "text", label: "수령자" },
                  { name: "confidentialInfo", type: "textarea", label: "비밀정보 내용" },
                  { name: "duration", type: "text", label: "유효 기간" }
                ]
              }
            ]}
          />
        </TabsContent>

        <TabsContent value="stamps" className="space-y-4">
          <StampManager />
        </TabsContent>

        <TabsContent value="auth" className="space-y-4">
          <SignatureAuth />
        </TabsContent>

        <TabsContent value="version" className="space-y-4">
          <VersionControl />
        </TabsContent>

        <TabsContent value="cloud" className="space-y-4">
          <CloudIntegration />
        </TabsContent>

        <TabsContent value="mobile" className="space-y-4">
          <MobileOptimization />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettings />
        </TabsContent>

        <TabsContent value="manage" className="space-y-4">
          <div className="grid gap-4">
            {contracts.filter(c => c.status !== "completed").map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <CardDescription>{contract.description}</CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">서명 진행률</span>
                      <span className="font-medium">
                        {contract.signers.filter(s => s.signed).length} / {contract.signers.length}
                      </span>
                    </div>
                    <Progress value={getProgressPercentage(contract)} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">서명자 현황</p>
                    {contract.signers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">아직 서명자가 지정되지 않았습니다.</p>
                    ) : (
                      <div className="space-y-1">
                        {contract.signers.map((signer, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {signer.signed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Clock className="w-4 h-4 text-yellow-500" />
                              )}
                              <span>{signer.name || signer.email}</span>
                            </div>
                            {signer.signed && signer.signedAt && (
                              <span className="text-muted-foreground">
                                {new Date(signer.signedAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedContract(contract);
                        setShowSignatureModal(true);
                      }}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      서명 요청
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowTracking(true)}
                    >
                      <History className="w-4 h-4 mr-2" />
                      추적
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                    {contract.status === "partially_signed" && (
                      <Button size="sm" variant="outline">
                        <Mail className="w-4 h-4 mr-2" />
                        리마인더
                      </Button>
                    )}
                  </div>

                  <div className="text-xs text-muted-foreground">
                    <p>파일: {contract.fileName}</p>
                    <p>해시: {contract.fileHash}</p>
                    <p>업로드: {new Date(contract.uploadedAt).toLocaleString()}</p>
                  </div>
                </CardContent>
              </Card>
            ))}

            {contracts.filter(c => c.status !== "completed").length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">진행 중인 계약서가 없습니다.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => setActiveTab("upload")}
                  >
                    새 계약서 업로드
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          <div className="grid gap-4">
            {contracts.filter(c => c.status === "completed").map((contract) => (
              <Card key={contract.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <CardDescription>{contract.description}</CardDescription>
                    </div>
                    {getStatusBadge(contract.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">서명 완료</p>
                    <div className="space-y-1">
                      {contract.signers.map((signer, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span>{signer.name || signer.email}</span>
                          </div>
                          {signer.signedAt && (
                            <span className="text-muted-foreground">
                              {new Date(signer.signedAt).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div className="flex items-center gap-2">
                    <Button size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      최종본 다운로드
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      미리보기
                    </Button>
                    <Button size="sm" variant="outline">
                      <Shield className="w-4 h-4 mr-2" />
                      블록체인 검증
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setShowTracking(true)}
                    >
                      <History className="w-4 h-4 mr-2" />
                      기록 보기
                    </Button>
                  </div>

                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <FileCheck className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-green-900">계약 완료</p>
                        <p className="text-green-700">모든 당사자가 서명을 완료했습니다.</p>
                      </div>
                    </div>
                  </div>

                  {/* 블록체인 증빙 정보 */}
                  <BlockchainHashDisplay
                    hashInfo={{
                      transactionHash: contract.blockchainTxHash || generateMockTransactionHash(),
                      blockNumber: generateMockBlockNumber(),
                      network: 'xphere',
                      timestamp: contract.completedAt || new Date().toISOString(),
                      confirmations: 12,
                      status: 'confirmed',
                      gasUsed: '45000',
                      gasFee: '0.003',
                      type: 'contract'
                    }}
                    title="계약서 블록체인 증빙"
                    compact={false}
                  />
                </CardContent>
              </Card>
            ))}

            {contracts.filter(c => c.status === "completed").length === 0 && (
              <Card>
                <CardContent className="text-center py-8">
                  <CheckCircle className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">완료된 계약서가 없습니다.</p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="archive" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>계약서 보관함</CardTitle>
              <CardDescription>만료되거나 취소된 계약서를 보관합니다</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Archive className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">보관된 계약서가 없습니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Signature Request Modal */}
      <Dialog open={showSignatureModal} onOpenChange={setShowSignatureModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>서명 요청</DialogTitle>
            <DialogDescription>
              계약서에 서명할 상대방의 정보를 입력하세요.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="signerEmail">서명자 이메일 *</Label>
              <Input
                id="signerEmail"
                type="email"
                placeholder="signer@example.com"
                value={signatureRequest.signerEmail}
                onChange={(e) => setSignatureRequest({ ...signatureRequest, signerEmail: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="signerName">서명자 이름</Label>
              <Input
                id="signerName"
                placeholder="홍길동"
                value={signatureRequest.signerName}
                onChange={(e) => setSignatureRequest({ ...signatureRequest, signerName: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ccEmails">참조자 이메일</Label>
              <Input
                id="ccEmails"
                placeholder="cc1@example.com, cc2@example.com"
                value={signatureRequest.ccEmails}
                onChange={(e) => setSignatureRequest({ ...signatureRequest, ccEmails: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">여러 명인 경우 쉼표로 구분하세요</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">메시지 (선택)</Label>
              <Textarea
                id="message"
                placeholder="계약서 검토 후 서명 부탁드립니다."
                value={signatureRequest.message}
                onChange={(e) => setSignatureRequest({ ...signatureRequest, message: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSignatureModal(false)}>
              취소
            </Button>
            <Button onClick={handleSignatureRequest}>
              <Send className="w-4 h-4 mr-2" />
              서명 요청 발송
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}