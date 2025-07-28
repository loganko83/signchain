import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  QrCode, 
  CheckCircle,
  XCircle,
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ArrowRight,
  FileCheck,
  UserCheck
} from "lucide-react";
import { toast } from "sonner";

interface PresentationRequest {
  id: string;
  requester: string;
  purpose: string;
  requestedCredentials: string[];
  status: "pending" | "approved" | "rejected";
  timestamp: string;
}

interface SelectiveDisclosure {
  credentialId: string;
  fields: {
    name: string;
    value: string;
    disclosed: boolean;
  }[];
}

export function PresentationExchange() {
  const [activeRequest, setActiveRequest] = useState<PresentationRequest | null>(null);
  const [selectedCredentials, setSelectedCredentials] = useState<string[]>([]);
  const [selectiveDisclosure, setSelectiveDisclosure] = useState<SelectiveDisclosure[]>([]);
  
  // Mock presentation requests
  const [requests] = useState<PresentationRequest[]>([
    {
      id: "pr-001",
      requester: "SignChain 파트너사",
      purpose: "계약 체결을 위한 신원 확인",
      requestedCredentials: ["사업자등록증", "대표자 신분증"],
      status: "pending",
      timestamp: "2025-07-25 14:30"
    },
    {
      id: "pr-002",
      requester: "금융기관 A",
      purpose: "대출 심사를 위한 자격 확인",
      requestedCredentials: ["사업자등록증", "재무제표", "신용등급"],
      status: "pending",
      timestamp: "2025-07-25 10:15"
    }
  ]);

  // Mock 자격증명 필드
  const mockCredentialFields = {
    "사업자등록증": [
      { name: "상호명", value: "SignChain Inc.", disclosed: true },
      { name: "사업자등록번호", value: "123-45-67890", disclosed: true },
      { name: "대표자명", value: "홍길동", disclosed: true },
      { name: "사업장주소", value: "서울시 강남구", disclosed: false },
      { name: "업태/종목", value: "소프트웨어 개발", disclosed: false }
    ],
    "대표자 신분증": [
      { name: "성명", value: "홍길동", disclosed: true },
      { name: "생년월일", value: "1980-01-01", disclosed: false },
      { name: "주소", value: "서울시 강남구", disclosed: false }
    ]
  };

  const handleRequestClick = (request: PresentationRequest) => {
    setActiveRequest(request);
    setSelectedCredentials(request.requestedCredentials);
    
    // 초기 선택적 공개 설정
    const initialDisclosure = request.requestedCredentials.map(cred => ({
      credentialId: cred,
      fields: mockCredentialFields[cred as keyof typeof mockCredentialFields] || []
    }));
    setSelectiveDisclosure(initialDisclosure);
  };

  const toggleFieldDisclosure = (credentialId: string, fieldName: string) => {
    setSelectiveDisclosure(prev => 
      prev.map(disc => {
        if (disc.credentialId === credentialId) {
          return {
            ...disc,
            fields: disc.fields.map(field => 
              field.name === fieldName 
                ? { ...field, disclosed: !field.disclosed }
                : field
            )
          };
        }
        return disc;
      })
    );
  };

  const approvePresentation = () => {
    toast.success("자격증명 제출이 승인되었습니다");
    setActiveRequest(null);
  };

  const rejectPresentation = () => {
    toast.error("자격증명 제출이 거부되었습니다");
    setActiveRequest(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 요청 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>자격증명 제출 요청</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                  activeRequest?.id === request.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                }`}
                onClick={() => handleRequestClick(request)}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{request.requester}</span>
                      <Badge variant={request.status === "pending" ? "default" : "secondary"}>
                        {request.status === "pending" ? "대기중" : 
                         request.status === "approved" ? "승인됨" : "거부됨"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{request.purpose}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {request.requestedCredentials.map((cred) => (
                        <Badge key={cred} variant="outline" className="text-xs">
                          {cred}
                        </Badge>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500">{request.timestamp}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>

          {requests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>새로운 자격증명 요청이 없습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 상세 정보 및 선택적 공개 */}
      <Card>
        <CardHeader>
          <CardTitle>선택적 정보 공개</CardTitle>
        </CardHeader>
        <CardContent>
          {activeRequest ? (
            <div className="space-y-4">
              {/* 요청자 정보 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">요청 정보</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="text-gray-600">요청자:</span> {activeRequest.requester}</p>
                  <p><span className="text-gray-600">목적:</span> {activeRequest.purpose}</p>
                </div>
              </div>

              {/* 선택적 공개 설정 */}
              <div className="space-y-4">
                {selectiveDisclosure.map((disclosure) => (
                  <div key={disclosure.credentialId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3 flex items-center space-x-2">
                      <FileCheck className="w-4 h-4" />
                      <span>{disclosure.credentialId}</span>
                    </h4>
                    
                    <div className="space-y-2">
                      {disclosure.fields.map((field) => (
                        <div key={field.name} className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              checked={field.disclosed}
                              onCheckedChange={() => toggleFieldDisclosure(disclosure.credentialId, field.name)}
                            />
                            <div>
                              <p className="text-sm font-medium">{field.name}</p>
                              <p className={`text-xs ${field.disclosed ? 'text-gray-600' : 'text-gray-400'}`}>
                                {field.disclosed ? field.value : "***가려짐***"}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleFieldDisclosure(disclosure.credentialId, field.name)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            {field.disclosed ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Zero-Knowledge Proof 옵션 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Lock className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">영지식 증명 사용 가능</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      특정 조건을 만족한다는 것만 증명하고 실제 값은 공개하지 않습니다
                    </p>
                  </div>
                </div>
              </div>

              {/* 액션 버튼 */}
              <div className="flex space-x-3">
                <Button 
                  onClick={approvePresentation}
                  className="flex-1"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인 및 제출
                </Button>
                <Button
                  variant="outline"
                  onClick={rejectPresentation}
                  className="flex-1"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  거부
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>요청을 선택하여 상세 정보를 확인하세요</p>
              <p className="text-sm mt-2">선택적 정보 공개로 프라이버시를 보호할 수 있습니다</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR 코드 스캐너 */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>QR 코드로 즉시 인증</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <QrCode className="w-32 h-32 mx-auto text-gray-400" />
              </div>
              <Button className="w-full">
                <QrCode className="w-4 h-4 mr-2" />
                QR 코드 스캔
              </Button>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">QR 인증 프로세스</h4>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">1</Badge>
                  <div>
                    <p className="font-medium text-sm">QR 코드 스캔</p>
                    <p className="text-xs text-gray-600">요청자가 제공한 QR 코드를 스캔합니다</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">2</Badge>
                  <div>
                    <p className="font-medium text-sm">요청 확인</p>
                    <p className="text-xs text-gray-600">요청된 자격증명과 목적을 확인합니다</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">3</Badge>
                  <div>
                    <p className="font-medium text-sm">선택적 공개</p>
                    <p className="text-xs text-gray-600">공개할 정보를 선택합니다</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Badge className="mt-0.5">4</Badge>
                  <div>
                    <p className="font-medium text-sm">안전한 전송</p>
                    <p className="text-xs text-gray-600">암호화된 채널로 전송됩니다</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}