import { useState, useRef, useEffect } from "react";
import { useParams } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import MobileSignDocument from "@/components/mobile/MobileSignDocument";
import { 
  FileText, 
  Edit3, 
  Check, 
  X,
  Download,
  Shield,
  User,
  Calendar,
  Building,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  FileSignature,
  Stamp,
  Type,
  Square,
  Camera,
  Upload
} from "lucide-react";

interface SignatureField {
  id: string;
  type: "signature" | "initial" | "stamp" | "text" | "date" | "checkbox";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  required: boolean;
  label: string;
  completed: boolean;
}

interface ContractData {
  id: string;
  title: string;
  description: string;
  totalPages: number;
  fields: SignatureField[];
  signerInfo: {
    name: string;
    email: string;
    role: string;
  };
  otherSigners: {
    name: string;
    email: string;
    role: string;
    signed: boolean;
    signedAt?: string;
  }[];
  expiresAt: string;
}

export default function SignDocument() {
  const { token } = useParams();
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [signatureData, setSignatureData] = useState("");
  const [initialData, setInitialData] = useState("");
  const [stampData, setStampData] = useState("");
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "upload">("draw");
  const [isMobile, setIsMobile] = useState(false);
  
  // Mock contract data
  const [contractData, setContractData] = useState<ContractData>({
    id: "1",
    title: "서비스 이용 계약서",
    description: "2024년 연간 서비스 이용 계약",
    totalPages: 3,
    signerInfo: {
      name: "김철수",
      email: "kim@example.com",
      role: "구매자"
    },
    otherSigners: [
      {
        name: "이영희",
        email: "lee@company.com",
        role: "판매자",
        signed: false
      }
    ],
    expiresAt: "2024-02-15",
    fields: [
      {
        id: "1",
        type: "signature",
        page: 3,
        x: 20,
        y: 70,
        width: 25,
        height: 10,
        required: true,
        label: "구매자 서명",
        completed: false
      },
      {
        id: "2",
        type: "date",
        page: 3,
        x: 50,
        y: 70,
        width: 20,
        height: 5,
        required: true,
        label: "서명일",
        completed: false
      },
      {
        id: "3",
        type: "initial",
        page: 1,
        x: 80,
        y: 90,
        width: 10,
        height: 5,
        required: true,
        label: "이니셜",
        completed: false
      }
    ]
  });

  useEffect(() => {
    // Check if mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    // Simulate loading contract data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, [token]);

  const handleFieldClick = (field: SignatureField) => {
    setActiveField(field.id);
    if (field.type === "signature" || field.type === "initial") {
      setShowSignatureModal(true);
    }
  };

  const updateFieldValue = (fieldId: string, value: string) => {
    setContractData(prev => ({
      ...prev,
      fields: prev.fields.map(f => 
        f.id === fieldId 
          ? { ...f, value, completed: true }
          : f
      )
    }));
  };

  const handleSignatureComplete = () => {
    if (activeField) {
      const field = contractData.fields.find(f => f.id === activeField);
      if (field?.type === "signature") {
        updateFieldValue(activeField, signatureData);
      } else if (field?.type === "initial") {
        updateFieldValue(activeField, initialData);
      }
    }
    setShowSignatureModal(false);
  };

  const handleDrawSignature = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const isAllFieldsCompleted = () => {
    return contractData.fields.every(f => !f.required || f.completed);
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      toast({
        title: "약관 동의 필요",
        description: "전자서명 약관에 동의해주세요.",
        variant: "destructive"
      });
      return;
    }

    if (!isAllFieldsCompleted()) {
      toast({
        title: "필수 항목 미완료",
        description: "모든 필수 항목을 완료해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Simulate submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "서명 완료",
        description: "계약서 서명이 완료되었습니다."
      });
      
      // Redirect or show completion message
    } catch (error) {
      toast({
        title: "서명 실패",
        description: "서명 처리 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getFieldsForCurrentPage = () => {
    return contractData.fields.filter(f => f.page === currentPage);
  };

  const getProgress = () => {
    const completed = contractData.fields.filter(f => f.completed).length;
    return (completed / contractData.fields.length) * 100;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 mx-auto mb-4 animate-spin" />
          <p>계약서를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // Mobile view
  if (isMobile) {
    return (
      <MobileSignDocument
        contractData={contractData}
        onFieldUpdate={updateFieldValue}
        onSubmit={handleSubmit}
      />
    );
  }

  // Desktop view
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img src="/logo.svg" alt="SignChain" className="h-8" />
              <div>
                <h1 className="font-semibold">{contractData.title}</h1>
                <p className="text-sm text-muted-foreground">
                  서명 만료일: {new Date(contractData.expiresAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-right">
                <p className="font-medium">{contractData.signerInfo.name}</p>
                <p className="text-muted-foreground">{contractData.signerInfo.role}</p>
              </div>
              <Badge variant="outline">
                <User className="w-3 h-3 mr-1" />
                {contractData.signerInfo.email}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-2">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>진행률</span>
            <span>{Math.round(getProgress())}%</span>
          </div>
          <Progress value={getProgress()} className="h-2" />
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">서명 필드</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contractData.fields.map((field) => (
                    <div
                      key={field.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        field.completed 
                          ? 'bg-green-50 border-green-200' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => {
                        setCurrentPage(field.page);
                        handleFieldClick(field);
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {field.completed ? (
                            <Check className="w-4 h-4 text-green-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-400" />
                          )}
                          <span className="text-sm font-medium">{field.label}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {field.page}쪽
                        </Badge>
                      </div>
                      {field.required && !field.completed && (
                        <p className="text-xs text-red-500 mt-1">* 필수</p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">다른 서명자</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contractData.otherSigners.map((signer, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium">{signer.name}</p>
                        <p className="text-xs text-muted-foreground">{signer.role}</p>
                      </div>
                      {signer.signed ? (
                        <Badge className="bg-green-500">완료</Badge>
                      ) : (
                        <Badge variant="secondary">대기</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Document Viewer */}
          <div className="col-span-6">
            <Card className="h-[800px] flex flex-col">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm px-3">
                    {currentPage} / {contractData.totalPages}
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={currentPage === contractData.totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                  >
                    <ZoomOut className="w-4 h-4" />
                  </Button>
                  <span className="text-sm w-12 text-center">{zoom}%</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                  >
                    <ZoomIn className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <RotateCw className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-4 bg-gray-100">
                <div 
                  className="bg-white shadow-lg mx-auto relative"
                  style={{
                    width: `${zoom}%`,
                    minHeight: '1000px',
                    padding: '60px'
                  }}
                >
                  {/* Mock Document Content */}
                  <h2 className="text-2xl font-bold mb-4">서비스 이용 계약서</h2>
                  <div className="space-y-4 text-gray-700">
                    <p className="font-semibold">제1조 (목적)</p>
                    <p>본 계약은 서비스 제공자(이하 "갑")와 서비스 이용자(이하 "을") 간의...</p>
                    
                    {currentPage === 3 && (
                      <div className="mt-16">
                        <p className="font-semibold mb-8">제10조 (서명)</p>
                        <div className="grid grid-cols-2 gap-8 mt-8">
                          <div>
                            <p className="mb-2">갑:</p>
                            <div className="border-b border-gray-400 h-16"></div>
                            <p className="text-sm mt-1">서비스 제공자</p>
                          </div>
                          <div>
                            <p className="mb-2">을:</p>
                            <div className="border-b border-gray-400 h-16"></div>
                            <p className="text-sm mt-1">서비스 이용자</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Render Fields */}
                  {getFieldsForCurrentPage().map((field) => (
                    <div
                      key={field.id}
                      className={`absolute border-2 rounded cursor-pointer transition-all ${
                        field.completed 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-blue-500 bg-blue-50 hover:bg-blue-100'
                      }`}
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`
                      }}
                      onClick={() => handleFieldClick(field)}
                    >
                      <div className="p-2 text-center">
                        {field.completed ? (
                          field.value || <Check className="w-4 h-4 mx-auto text-green-600" />
                        ) : (
                          <div className="text-xs text-blue-600">
                            {field.label}
                            {field.required && " *"}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">서명 작업</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>전자서명 약관 동의</Label>
                  <div className="flex items-start gap-2">
                    <Checkbox
                      checked={agreedToTerms}
                      onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
                    />
                    <Label className="text-sm font-normal">
                      본인은 전자서명이 수기 서명과 동일한 법적 효력을 가짐을 이해하고 동의합니다.
                    </Label>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  onClick={handleSubmit}
                  disabled={!isAllFieldsCompleted() || !agreedToTerms}
                >
                  <FileSignature className="w-4 h-4 mr-2" />
                  서명 완료
                </Button>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-900">주의사항</p>
                      <p className="text-yellow-700">
                        모든 필수 필드를 작성해야 서명을 완료할 수 있습니다.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg">블록체인 정보</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">문서 해시</p>
                    <p className="font-mono text-xs">0x1234...abcd</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">네트워크</p>
                    <p>Xphere Mainnet</p>
                  </div>
                  <Badge variant="outline" className="w-full justify-center">
                    <Shield className="w-3 h-3 mr-1" />
                    블록체인 보호
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-[500px]">
            <CardHeader>
              <CardTitle>서명하기</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs value={signatureType} onValueChange={(v) => setSignatureType(v as any)}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="draw">그리기</TabsTrigger>
                  <TabsTrigger value="type">타이핑</TabsTrigger>
                  <TabsTrigger value="upload">업로드</TabsTrigger>
                </TabsList>
                
                <TabsContent value="draw" className="space-y-4">
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={150}
                      className="border bg-white w-full cursor-crosshair"
                      onMouseDown={() => setIsDrawing(true)}
                      onMouseUp={() => setIsDrawing(false)}
                      onMouseMove={handleDrawSignature}
                    />
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={clearSignature}
                  >
                    지우기
                  </Button>
                </TabsContent>
                
                <TabsContent value="type" className="space-y-4">
                  <Input
                    placeholder="서명을 입력하세요"
                    className="text-2xl h-16 font-script"
                    value={signatureData}
                    onChange={(e) => setSignatureData(e.target.value)}
                  />
                </TabsContent>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-sm text-muted-foreground">
                      서명 이미지를 업로드하세요
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      className="mt-4"
                    />
                  </div>
                </TabsContent>
              </Tabs>
              
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSignatureModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSignatureComplete}
                  className="flex-1"
                >
                  적용
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
