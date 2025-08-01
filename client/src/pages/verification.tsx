import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  CheckCircle, 
  AlertTriangle, 
  Search, 
  Hash, 
  Clock,
  FileText,
  Users,
  ExternalLink,
  Download,
  Verified,
  Link as LinkIcon
} from "lucide-react";
import { Document, Signature, AuditLog } from "@shared/schema";
import { useAuth } from "@/lib/auth.tsx";
import BlockchainHashDisplay from "@/components/BlockchainHashDisplay";
import { generateMockTransactionHash, generateMockBlockNumber } from "@/lib/blockchain-hash-utils";

export default function Verification() {
  const { user } = useAuth();
  const [searchHash, setSearchHash] = useState("");
  const [verificationResults, setVerificationResults] = useState<any>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const { data: documents = [] } = useQuery<Document[]>({
    queryKey: ["/api/documents"],
    queryFn: async () => {
      const response = await fetch(`/api/documents?userId=${user?.id}`);
      if (!response.ok) throw new Error("문서를 가져올 수 없습니다");
      return response.json();
    },
    enabled: !!user,
  });

  const verifiedDocuments = documents.filter(doc => doc.blockchainTxHash);
  const totalSignatures = documents.reduce((acc, doc) => acc + (doc.status === "서명 완료" ? 1 : 0), 0);
  const integrityScore = verifiedDocuments.length > 0 ? Math.round((verifiedDocuments.length / documents.length) * 100) : 0;

  const handleVerifyHash = async () => {
    if (!searchHash.trim()) return;
    
    setIsVerifying(true);
    try {
      // Mock verification - in real app, this would query blockchain
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResult = {
        isValid: true,
        transactionHash: searchHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 1234567,
        timestamp: new Date(),
        documentTitle: "계약서_2025.pdf",
        signers: ["alice@example.com", "bob@example.com"],
        gasUsed: 21000,
        confirmations: 127,
      };
      
      setVerificationResults(mockResult);
    } catch (error) {
      setVerificationResults({ isValid: false, error: "검증 실패" });
    } finally {
      setIsVerifying(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "서명 완료":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />완료</Badge>;
      case "서명 대기":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />대기</Badge>;
      case "업로드됨":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">업로드됨</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">블록체인 검증</h1>
              <p className="mt-2 text-sm text-gray-600">
                Xphere 블록체인에서 문서와 서명의 무결성을 검증하세요
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <Button variant="outline" asChild>
                <a href="https://explorer.xphere.io" target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  블록체인 탐색기
                </a>
              </Button>
            </div>
          </div>
        </div>

        {/* Verification Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">검증된 문서</p>
                  <p className="text-2xl font-bold text-gray-900">{verifiedDocuments.length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-500" />
                </div>
              </div>
              <div className="mt-4">
                <Progress value={integrityScore} className="h-2" />
                <p className="text-sm text-muted-foreground mt-2">무결성 점수: {integrityScore}%</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">완료된 서명</p>
                  <p className="text-2xl font-bold text-gray-900">{totalSignatures}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className="text-green-500 text-sm font-medium">100% 검증됨</span>
                <span className="text-gray-500 text-sm ml-2">블록체인 기록</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">블록체인 상태</p>
                  <p className="text-2xl font-bold text-gray-900">활성</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <LinkIcon className="w-6 h-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-muted-foreground">Xphere 네트워크 연결됨</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="verify" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="verify">해시 검증</TabsTrigger>
            <TabsTrigger value="documents">검증된 문서</TabsTrigger>
            <TabsTrigger value="audit">감사 추적</TabsTrigger>
          </TabsList>

          {/* Hash Verification Tab */}
          <TabsContent value="verify">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5" />
                  트랜잭션 해시 검증
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="트랜잭션 해시를 입력하세요 (예: 0x123abc...)"
                    value={searchHash}
                    onChange={(e) => setSearchHash(e.target.value)}
                    className="font-mono"
                  />
                  <Button 
                    onClick={handleVerifyHash} 
                    disabled={isVerifying || !searchHash.trim()}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    {isVerifying ? "검증 중..." : "검증"}
                  </Button>
                </div>

                {verificationResults && (
                  <div className="mt-6">
                    {verificationResults.isValid ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <Verified className="h-4 w-4" />
                              <span className="font-semibold">검증 성공</span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium">문서명</p>
                                <p>{verificationResults.documentTitle}</p>
                              </div>
                              <div>
                                <p className="font-medium">블록 번호</p>
                                <p>{verificationResults.blockNumber}</p>
                              </div>
                              <div>
                                <p className="font-medium">타임스탬프</p>
                                <p>{verificationResults.timestamp.toLocaleString('ko-KR')}</p>
                              </div>
                              <div>
                                <p className="font-medium">확인 수</p>
                                <p>{verificationResults.confirmations}</p>
                              </div>
                            </div>
                            
                            <div>
                              <p className="font-medium text-sm">서명자</p>
                              <div className="flex gap-2 mt-1">
                                {verificationResults.signers.map((signer: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="bg-green-50">
                                    {signer}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          {verificationResults.error || "해시를 찾을 수 없거나 유효하지 않습니다."}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verified Documents Tab */}
          <TabsContent value="documents">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  검증된 문서 ({verifiedDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {verifiedDocuments.length > 0 ? (
                  <div className="space-y-4">
                    {verifiedDocuments.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4 bg-white">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <CheckCircle className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-medium">{document.title}</h3>
                              <p className="text-sm text-muted-foreground">
                                {document.createdAt ? new Date(document.createdAt).toLocaleString('ko-KR') : ''}
                              </p>
                            </div>
                          </div>
                          {getStatusBadge(document.status)}
                        </div>
                        
                        {/* 블록체인 증빙 정보 */}
                        <BlockchainHashDisplay
                          hashInfo={{
                            transactionHash: document.blockchainTxHash || generateMockTransactionHash(),
                            blockNumber: generateMockBlockNumber(),
                            network: 'xphere',
                            timestamp: document.createdAt || new Date().toISOString(),
                            confirmations: Math.floor(Math.random() * 20) + 5,
                            status: 'confirmed',
                            gasUsed: '25000',
                            gasFee: '0.0015',
                            type: 'document'
                          }}
                          title={`${document.title} 블록체인 증빙`}
                          compact={true}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Shield className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>아직 블록체인에 검증된 문서가 없습니다.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Trail Tab */}
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  전체 감사 추적
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {documents.map((document) => (
                    <div key={document.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{document.title}</h3>
                        {getStatusBadge(document.status)}
                      </div>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          <span>문서 업로드됨 - {document.createdAt ? new Date(document.createdAt).toLocaleString('ko-KR') : ''}</span>
                        </div>
                        {document.blockchainTxHash && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>블록체인에 기록됨 - 해시: {document.blockchainTxHash.slice(0, 16)}...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}