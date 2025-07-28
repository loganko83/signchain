import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Globe, 
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  FileJson,
  Key,
  Shield,
  Database,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

interface ResolverResult {
  did: string;
  didDocument: any;
  metadata: {
    method: string;
    created: string;
    updated: string;
    versionId: string;
  };
  status: "found" | "not_found" | "error";
  error?: string;
}

export function DIDResolver() {
  const [didInput, setDidInput] = useState("");
  const [isResolving, setIsResolving] = useState(false);
  const [resolverResult, setResolverResult] = useState<ResolverResult | null>(null);
  const [activeTab, setActiveTab] = useState("universal");

  // Mock 최근 조회 기록
  const [recentSearches] = useState([
    "did:web:signchain.example.com:users:alice",
    "did:ethr:0x1234567890abcdef1234567890abcdef12345678",
    "did:key:z6MkpTHR8VNsBxYAAWHut2Geadd9jSwuBV8xRoAnwWsdvktH",
    "did:polygon:0xabcdef1234567890abcdef1234567890abcdef12"
  ]);

  const resolveDID = async () => {
    if (!didInput.trim()) {
      toast.error("DID를 입력해주세요");
      return;
    }

    setIsResolving(true);
    
    try {
      // Mock DID resolution
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResult: ResolverResult = {
        did: didInput,
        didDocument: {
          "@context": [
            "https://www.w3.org/ns/did/v1",
            "https://w3id.org/security/suites/jws-2020/v1"
          ],
          id: didInput,
          verificationMethod: [{
            id: `${didInput}#key-1`,
            type: "JsonWebKey2020",
            controller: didInput,
            publicKeyJwk: {
              kty: "EC",
              crv: "P-256",
              x: "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
              y: "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM"
            }
          }],
          authentication: [`${didInput}#key-1`],
          assertionMethod: [`${didInput}#key-1`],
          service: [{
            id: `${didInput}#signchain-service`,
            type: "SignChainService",
            serviceEndpoint: "https://signchain.example.com/api/did"
          }]
        },
        metadata: {
          method: didInput.split(":")[1],
          created: "2025-07-01T12:00:00Z",
          updated: "2025-07-25T15:30:00Z",
          versionId: "1.0.0"
        },
        status: "found"
      };
      
      setResolverResult(mockResult);
      toast.success("DID가 성공적으로 조회되었습니다");
    } catch (error) {
      setResolverResult({
        did: didInput,
        didDocument: null,
        metadata: {
          method: "",
          created: "",
          updated: "",
          versionId: ""
        },
        status: "error",
        error: "DID 조회 중 오류가 발생했습니다"
      });
      toast.error("DID 조회 실패");
    } finally {
      setIsResolving(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다");
  };

  const verifyDID = () => {
    toast.success("DID 검증이 완료되었습니다");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="universal">Universal Resolver</TabsTrigger>
          <TabsTrigger value="specific">특정 Method</TabsTrigger>
          <TabsTrigger value="tools">도구</TabsTrigger>
        </TabsList>

        <TabsContent value="universal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Globe className="w-5 h-5" />
                <span>Universal DID Resolver</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>DID 입력</Label>
                <div className="flex space-x-2 mt-2">
                  <Input
                    placeholder="did:web:example.com:users:alice"
                    value={didInput}
                    onChange={(e) => setDidInput(e.target.value)}
                    className="font-mono"
                    onKeyPress={(e) => e.key === 'Enter' && resolveDID()}
                  />
                  <Button onClick={resolveDID} disabled={isResolving}>
                    {isResolving ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        조회 중...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        조회
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* 최근 검색 */}
              <div>
                <Label>최근 조회</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {recentSearches.map((did) => (
                    <Badge
                      key={did}
                      variant="outline"
                      className="cursor-pointer hover:bg-gray-100"
                      onClick={() => setDidInput(did)}
                    >
                      {did.length > 40 ? did.substring(0, 40) + "..." : did}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* 조회 결과 */}
              {resolverResult && (
                <div className="space-y-4">
                  {/* 상태 표시 */}
                  <div className="flex items-center space-x-2">
                    {resolverResult.status === "found" ? (
                      <>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <span className="font-medium">DID Document 조회 성공</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-5 h-5 text-red-500" />
                        <span className="font-medium">조회 실패</span>
                      </>
                    )}
                  </div>

                  {resolverResult.status === "found" && (
                    <>
                      {/* 메타데이터 */}
                      <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                        <h4 className="font-medium mb-2">메타데이터</h4>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Method:</span>
                            <Badge variant="outline" className="ml-2">
                              {resolverResult.metadata.method}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-gray-600">Version:</span>
                            <span className="ml-2">{resolverResult.metadata.versionId}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">생성일:</span>
                            <span className="ml-2">
                              {new Date(resolverResult.metadata.created).toLocaleDateString()}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">수정일:</span>
                            <span className="ml-2">
                              {new Date(resolverResult.metadata.updated).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* DID Document */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">DID Document</h4>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(JSON.stringify(resolverResult.didDocument, null, 2))}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={verifyDID}
                            >
                              <Shield className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                          <pre className="text-xs">
                            <code>{JSON.stringify(resolverResult.didDocument, null, 2)}</code>
                          </pre>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specific" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* did:web Resolver */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Globe className="w-5 h-5" />
                  <span>did:web Resolver</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="example.com:users:alice" />
                  <Button className="w-full">
                    did:web 조회
                  </Button>
                  <p className="text-sm text-gray-600">
                    웹 도메인 기반 DID를 조회합니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* did:ethr Resolver */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Shield className="w-5 h-5" />
                  <span>did:ethr Resolver</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="0x1234...5678" />
                  <Button className="w-full">
                    did:ethr 조회
                  </Button>
                  <p className="text-sm text-gray-600">
                    Ethereum 주소 기반 DID를 조회합니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* did:key Resolver */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Key className="w-5 h-5" />
                  <span>did:key Resolver</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="z6Mk..." />
                  <Button className="w-full">
                    did:key 조회
                  </Button>
                  <p className="text-sm text-gray-600">
                    공개키 기반 DID를 조회합니다
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* did:polygon Resolver */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Database className="w-5 h-5" />
                  <span>did:polygon Resolver</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Input placeholder="0xabcd...ef12" />
                  <Button className="w-full">
                    did:polygon 조회
                  </Button>
                  <p className="text-sm text-gray-600">
                    Polygon 네트워크 DID를 조회합니다
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tools" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>DID 도구</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-24 flex-col">
                  <FileJson className="w-6 h-6 mb-2" />
                  <span>DID Document 검증</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Key className="w-6 h-6 mb-2" />
                  <span>공개키 추출</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <ExternalLink className="w-6 h-6 mb-2" />
                  <span>서비스 엔드포인트 확인</span>
                </Button>
                <Button variant="outline" className="h-24 flex-col">
                  <Shield className="w-6 h-6 mb-2" />
                  <span>서명 검증</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}