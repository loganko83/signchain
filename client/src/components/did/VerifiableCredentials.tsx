import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Award, 
  FileText, 
  Shield, 
  CheckCircle,
  Upload,
  QrCode,
  Share2,
  Eye,
  Download,
  Calendar
} from "lucide-react";
import { toast } from "sonner";

interface VerifiableCredential {
  "@context": string[];
  type: string[];
  id: string;
  issuer: string;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: any;
  proof?: {
    type: string;
    created: string;
    proofPurpose: string;
    verificationMethod: string;
    jws: string;
  };
}

// 자격증명 템플릿
const credentialTemplates = {
  businessLicense: {
    name: "사업자등록증",
    icon: FileText,
    fields: ["businessName", "registrationNumber", "representativeName", "businessAddress", "businessType"]
  },
  nationalId: {
    name: "주민등록증",
    icon: Shield,
    fields: ["name", "residentNumber", "address", "issueDate"]
  },
  passport: {
    name: "여권",
    icon: Award,
    fields: ["name", "passportNumber", "nationality", "birthDate", "issueDate", "expiryDate"]
  },
  degree: {
    name: "학위증명서",
    icon: Award,
    fields: ["name", "degree", "major", "university", "graduationDate"]
  }
};

export function VerifiableCredentials() {
  const [activeTab, setActiveTab] = useState("issue");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [formData, setFormData] = useState<any>({});
  const [isIssuing, setIsIssuing] = useState(false);

  // Mock 발급된 자격증명 목록
  const [issuedCredentials] = useState([
    {
      id: "vc:signchain:2025:001",
      type: "사업자등록증",
      subject: "SignChain Inc.",
      issuanceDate: "2025-07-20",
      status: "active",
      holder: "did:web:signchain.example.com:users:company"
    },
    {
      id: "vc:signchain:2025:002", 
      type: "주민등록증",
      subject: "홍길동",
      issuanceDate: "2025-07-15",
      status: "active",
      holder: "did:ethr:0x1234...5678"
    }
  ]);

  const issueCredential = async () => {
    setIsIssuing(true);
    
    try {
      // Mock VC 생성
      const vc: VerifiableCredential = {
        "@context": [
          "https://www.w3.org/2018/credentials/v1",
          "https://www.w3.org/2018/credentials/examples/v1"
        ],
        type: ["VerifiableCredential", selectedTemplate],
        id: `vc:signchain:2025:${Date.now()}`,
        issuer: "did:web:signchain.example.com",
        issuanceDate: new Date().toISOString(),
        credentialSubject: {
          id: formData.holderDID || "did:example:holder",
          ...formData
        }
      };

      // 만료일 설정
      if (formData.expirationDate) {
        vc.expirationDate = new Date(formData.expirationDate).toISOString();
      }

      // Mock 서명 추가
      vc.proof = {
        type: "JsonWebSignature2020",
        created: new Date().toISOString(),
        proofPurpose: "assertionMethod",
        verificationMethod: "did:web:signchain.example.com#key-1",
        jws: "eyJhbGciOiJFZERTQSIsImI2NCI6ZmFsc2UsImNyaXQiOlsiYjY0Il19..mock_signature"
      };

      console.log("Issued VC:", vc);
      toast.success("자격증명이 성공적으로 발급되었습니다!");
      
      // 폼 초기화
      setFormData({});
      setSelectedTemplate("");
    } catch (error) {
      toast.error("자격증명 발급 중 오류가 발생했습니다.");
    } finally {
      setIsIssuing(false);
    }
  };

  const getFieldLabel = (field: string): string => {
    const labels: { [key: string]: string } = {
      businessName: "상호명",
      registrationNumber: "사업자등록번호",
      representativeName: "대표자명",
      businessAddress: "사업장 주소",
      businessType: "업태/종목",
      name: "성명",
      residentNumber: "주민등록번호",
      address: "주소",
      issueDate: "발급일",
      passportNumber: "여권번호",
      nationality: "국적",
      birthDate: "생년월일",
      expiryDate: "만료일",
      degree: "학위",
      major: "전공",
      university: "대학교",
      graduationDate: "졸업일"
    };
    return labels[field] || field;
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="issue">자격증명 발급</TabsTrigger>
        <TabsTrigger value="verify">검증</TabsTrigger>
        <TabsTrigger value="manage">발급 관리</TabsTrigger>
      </TabsList>

      <TabsContent value="issue" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Verifiable Credential 발급</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 자격증명 유형 선택 */}
            <div>
              <Label>자격증명 유형</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {Object.entries(credentialTemplates).map(([key, template]) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedTemplate(key)}
                      className={`p-4 border rounded-lg text-center hover:border-blue-500 transition-colors ${
                        selectedTemplate === key ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                    >
                      <Icon className="w-8 h-8 mx-auto mb-2" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 선택된 템플릿의 필드 입력 */}
            {selectedTemplate && (
              <>
                <div className="space-y-4 mt-6">
                  <h4 className="font-semibold">자격증명 정보 입력</h4>
                  
                  {/* Holder DID */}
                  <div>
                    <Label>보유자 DID</Label>
                    <Input
                      placeholder="did:web:example.com:users:alice"
                      value={formData.holderDID || ""}
                      onChange={(e) => setFormData({...formData, holderDID: e.target.value})}
                      className="font-mono"
                    />
                  </div>

                  {/* 템플릿 필드 */}
                  {credentialTemplates[selectedTemplate as keyof typeof credentialTemplates].fields.map((field) => (
                    <div key={field}>
                      <Label>{getFieldLabel(field)}</Label>
                      {field.includes("Date") ? (
                        <Input
                          type="date"
                          value={formData[field] || ""}
                          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                        />
                      ) : field === "address" || field === "businessAddress" ? (
                        <Textarea
                          value={formData[field] || ""}
                          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                          rows={2}
                        />
                      ) : (
                        <Input
                          value={formData[field] || ""}
                          onChange={(e) => setFormData({...formData, [field]: e.target.value})}
                        />
                      )}
                    </div>
                  ))}

                  {/* 만료일 (선택사항) */}
                  <div>
                    <Label>만료일 (선택사항)</Label>
                    <Input
                      type="date"
                      value={formData.expirationDate || ""}
                      onChange={(e) => setFormData({...formData, expirationDate: e.target.value})}
                    />
                  </div>
                </div>

                <Button
                  onClick={issueCredential}
                  disabled={isIssuing}
                  className="w-full"
                >
                  {isIssuing ? "발급 중..." : "자격증명 발급"}
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="verify" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>자격증명 검증</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label>검증 방법 선택</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-2">
                  <Button variant="outline" className="h-24 flex-col">
                    <Upload className="w-6 h-6 mb-2" />
                    <span>파일 업로드</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <QrCode className="w-6 h-6 mb-2" />
                    <span>QR 코드 스캔</span>
                  </Button>
                  <Button variant="outline" className="h-24 flex-col">
                    <Share2 className="w-6 h-6 mb-2" />
                    <span>공유 링크</span>
                  </Button>
                </div>
              </div>

              <div>
                <Label>또는 자격증명 데이터 직접 입력</Label>
                <Textarea
                  placeholder="JSON 형식의 Verifiable Credential을 붙여넣으세요"
                  rows={6}
                  className="font-mono text-sm mt-2"
                />
              </div>

              <Button className="w-full">
                <CheckCircle className="w-4 h-4 mr-2" />
                자격증명 검증
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>발급된 자격증명 관리</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {issuedCredentials.map((credential) => (
                <div key={credential.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Award className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{credential.type}</span>
                        <Badge variant={credential.status === "active" ? "default" : "secondary"}>
                          {credential.status === "active" ? "유효" : "만료"}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>대상: {credential.subject}</p>
                        <p>발급일: {credential.issuanceDate}</p>
                        <p className="font-mono text-xs">ID: {credential.id}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <QrCode className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}