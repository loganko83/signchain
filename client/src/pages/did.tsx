import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserCheck, Award, QrCode, Shield, CreditCard, FileText, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function DIDModule() {
  const { user } = useAuth();
  const [issuing, setIssuing] = useState(false);
  const [credentialData, setCredentialData] = useState({
    credentialType: "",
    name: "",
    idNumber: "",
    birthDate: "",
    address: "",
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: ""
  });

  const handleIssueCredential = async () => {
    if (!credentialData.credentialType || !credentialData.name || !credentialData.idNumber) {
      return;
    }

    setIssuing(true);
    try {
      const response = await fetch("/api/modules/did/issue-credential", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user?.id || 1,
          credentialType: credentialData.credentialType,
          subjectData: {
            name: credentialData.name,
            idNumber: credentialData.idNumber,
            birthDate: credentialData.birthDate,
            address: credentialData.address,
            issueDate: credentialData.issueDate,
            expiryDate: credentialData.expiryDate || undefined
          },
          issuer: "SignChain DID Authority"
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log("DID Credential issued:", result);
        
        // Reset form
        setCredentialData({
          credentialType: "",
          name: "",
          idNumber: "",
          birthDate: "",
          address: "",
          issueDate: new Date().toISOString().split('T')[0],
          expiryDate: ""
        });
      }
    } catch (error) {
      console.error("Credential issuance error:", error);
    } finally {
      setIssuing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">DID 모듈</h1>
              <p className="text-gray-600">블록체인 기반 분산 신원 증명 및 자격증명</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CreditCard className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">사업자등록증</p>
                    <p className="text-2xl font-bold">기업 인증</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <UserCheck className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">신분증</p>
                    <p className="text-2xl font-bold">신원 확인</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <FileText className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">여권</p>
                    <p className="text-2xl font-bold">국제 인증</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <QrCode className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">QR 검증</p>
                    <p className="text-2xl font-bold">즉시 인증</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Credential Issuance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>자격증명 발급</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="credentialType">자격증명 유형</Label>
                <Select 
                  value={credentialData.credentialType} 
                  onValueChange={(value) => setCredentialData({...credentialData, credentialType: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="자격증명 유형 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="사업자등록증">사업자등록증</SelectItem>
                    <SelectItem value="주민증">주민증</SelectItem>
                    <SelectItem value="여권">여권</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="name">성명/상호</Label>
                <Input
                  id="name"
                  value={credentialData.name}
                  onChange={(e) => setCredentialData({...credentialData, name: e.target.value})}
                  placeholder="성명 또는 상호를 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="idNumber">
                  {credentialData.credentialType === "사업자등록증" ? "사업자등록번호" : 
                   credentialData.credentialType === "여권" ? "여권번호" : "주민등록번호"}
                </Label>
                <Input
                  id="idNumber"
                  value={credentialData.idNumber}
                  onChange={(e) => setCredentialData({...credentialData, idNumber: e.target.value})}
                  placeholder="식별번호를 입력하세요"
                />
              </div>
              
              {credentialData.credentialType !== "사업자등록증" && (
                <div>
                  <Label htmlFor="birthDate">생년월일</Label>
                  <Input
                    id="birthDate"
                    type="date"
                    value={credentialData.birthDate}
                    onChange={(e) => setCredentialData({...credentialData, birthDate: e.target.value})}
                  />
                </div>
              )}
              
              <div>
                <Label htmlFor="address">주소</Label>
                <Input
                  id="address"
                  value={credentialData.address}
                  onChange={(e) => setCredentialData({...credentialData, address: e.target.value})}
                  placeholder="주소를 입력하세요"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="issueDate">발급일</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={credentialData.issueDate}
                    onChange={(e) => setCredentialData({...credentialData, issueDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="expiryDate">만료일 (선택사항)</Label>
                  <Input
                    id="expiryDate"
                    type="date"
                    value={credentialData.expiryDate}
                    onChange={(e) => setCredentialData({...credentialData, expiryDate: e.target.value})}
                  />
                </div>
              </div>
              
              <Button
                onClick={handleIssueCredential}
                disabled={!credentialData.credentialType || !credentialData.name || !credentialData.idNumber || issuing}
                className="w-full"
              >
                {issuing ? "발급 중..." : "블록체인 DID 자격증명 발급"}
              </Button>
            </CardContent>
          </Card>

          {/* DID Features */}
          <Card>
            <CardHeader>
              <CardTitle>DID 모듈 주요 기능</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">1</Badge>
                  <div>
                    <h4 className="font-semibold">자격증명 발급</h4>
                    <p className="text-sm text-gray-600">사업자등록증, 신분증, 여권 등 공식 문서의 DID 버전 생성</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">2</Badge>
                  <div>
                    <h4 className="font-semibold">블록체인 등록</h4>
                    <p className="text-sm text-gray-600">분산원장에 자격증명을 안전하게 저장</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">3</Badge>
                  <div>
                    <h4 className="font-semibold">암호학적 증명</h4>
                    <p className="text-sm text-gray-600">RSA 서명으로 위변조 방지</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">4</Badge>
                  <div>
                    <h4 className="font-semibold">QR 코드 공유</h4>
                    <p className="text-sm text-gray-600">즉시 검증 가능한 공유 링크 생성</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Badge variant="outline" className="mt-1">5</Badge>
                  <div>
                    <h4 className="font-semibold">검증 및 인증</h4>
                    <p className="text-sm text-gray-600">실시간 DID 자격증명 검증</p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <h4 className="font-semibold mb-2">지원 자격증명</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge>사업자등록증</Badge>
                  <Badge>주민등록증</Badge>
                  <Badge>여권</Badge>
                  <Badge>기타 신분증</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Verification Process */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>DID 검증 프로세스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">자격증명 발급</h4>
                <p className="text-sm text-gray-600">DID 생성</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">블록체인 등록</h4>
                <p className="text-sm text-gray-600">불변 저장</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <QrCode className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">QR 생성</h4>
                <p className="text-sm text-gray-600">공유 링크</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <UserCheck className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">검증 요청</h4>
                <p className="text-sm text-gray-600">신원 확인</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">검증 완료</h4>
                <p className="text-sm text-gray-600">신뢰성 확보</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Credentials */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>내 자격증명</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <UserCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 발급된 DID 자격증명이 없습니다.</p>
              <p className="text-sm">첫 번째 디지털 신분증을 발급해보세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}