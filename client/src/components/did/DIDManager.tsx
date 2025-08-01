import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Key, 
  Plus, 
  Copy, 
  Download, 
  RefreshCw,
  Shield,
  Lock,
  Globe,
  FileJson,
  CheckCircle
} from "lucide-react";
import { toast } from "sonner";
import BlockchainHashDisplay from "@/components/BlockchainHashDisplay";
import { generateMockTransactionHash, generateMockBlockNumber } from "@/lib/blockchain-hash-utils";

interface DIDDocument {
  "@context": string[];
  id: string;
  controller?: string;
  verificationMethod: Array<{
    id: string;
    type: string;
    controller: string;
    publicKeyJwk?: any;
    publicKeyMultibase?: string;
  }>;
  authentication?: string[];
  assertionMethod?: string[];
  keyAgreement?: string[];
  service?: Array<{
    id: string;
    type: string;
    serviceEndpoint: string;
  }>;
}

export function DIDManager() {
  const [selectedMethod, setSelectedMethod] = useState("did:web");
  const [didDocument, setDidDocument] = useState<DIDDocument | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("create");

  // Mock DID 리스트
  const [myDIDs] = useState([
    {
      id: "did:web:signchain.example.com:users:alice",
      method: "did:web",
      created: "2025-07-20",
      status: "active",
      purpose: "기업 인증"
    },
    {
      id: "did:ethr:0x1234...5678",
      method: "did:ethr",
      created: "2025-07-15",
      status: "active", 
      purpose: "개인 신원"
    }
  ]);

  const generateDID = async () => {
    setIsGenerating(true);
    
    try {
      // Mock DID Document 생성
      const mockDIDDoc: DIDDocument = {
        "@context": [
          "https://www.w3.org/ns/did/v1",
          "https://w3id.org/security/suites/jws-2020/v1"
        ],
        id: `${selectedMethod}:signchain.example.com:users:${Date.now()}`,
        verificationMethod: [{
          id: `${selectedMethod}:signchain.example.com:users:${Date.now()}#key-1`,
          type: "JsonWebKey2020",
          controller: `${selectedMethod}:signchain.example.com:users:${Date.now()}`,
          publicKeyJwk: {
            kty: "EC",
            crv: "P-256",
            x: "MKBCTNIcKUSDii11ySs3526iDZ8AiTo7Tu6KPAqv7D4",
            y: "4Etl6SRW2YiLUrN5vfvVHuhp7x8PxltmWWlbbM4IFyM"
          }
        }],
        authentication: [`${selectedMethod}:signchain.example.com:users:${Date.now()}#key-1`],
        assertionMethod: [`${selectedMethod}:signchain.example.com:users:${Date.now()}#key-1`]
      };

      // 서비스 엔드포인트 추가
      if (selectedMethod === "did:web") {
        mockDIDDoc.service = [{
          id: `${mockDIDDoc.id}#signchain-service`,
          type: "SignChainService",
          serviceEndpoint: "https://signchain.example.com/api/did"
        }];
      }

      setDidDocument(mockDIDDoc);
      toast.success("DID가 성공적으로 생성되었습니다!");
    } catch (error) {
      toast.error("DID 생성 중 오류가 발생했습니다.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("클립보드에 복사되었습니다!");
  };

  const downloadDIDDocument = () => {
    if (!didDocument) return;
    
    const blob = new Blob([JSON.stringify(didDocument, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'did-document.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="create">DID 생성</TabsTrigger>
        <TabsTrigger value="manage">내 DID 관리</TabsTrigger>
        <TabsTrigger value="resolve">DID 조회</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>새 DID 생성</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* DID Method 선택 */}
            <div>
              <Label>DID Method 선택</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="did:web">
                    <div className="flex items-center space-x-2">
                      <Globe className="w-4 h-4" />
                      <span>did:web - 웹 도메인 기반</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="did:ethr">
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4" />
                      <span>did:ethr - Ethereum 기반</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="did:key">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4" />
                      <span>did:key - 자체 포함 키</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="did:polygon">
                    <div className="flex items-center space-x-2">
                      <Lock className="w-4 h-4" />
                      <span>did:polygon - Polygon 네트워크</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-600 mt-1">
                {selectedMethod === "did:web" && "도메인 기반으로 쉽게 검증 가능한 DID"}
                {selectedMethod === "did:ethr" && "Ethereum 블록체인에 등록되는 DID"}
                {selectedMethod === "did:key" && "별도 등록 없이 키에서 파생되는 DID"}
                {selectedMethod === "did:polygon" && "Polygon 네트워크를 활용한 저비용 DID"}
              </p>
            </div>

            {/* 키 타입 선택 */}
            <div>
              <Label>키 타입</Label>
              <Select defaultValue="Ed25519">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ed25519">Ed25519 (권장)</SelectItem>
                  <SelectItem value="secp256k1">Secp256k1</SelectItem>
                  <SelectItem value="P-256">P-256</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 용도 선택 */}
            <div>
              <Label>DID 용도</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="용도를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="personal">개인 신원</SelectItem>
                  <SelectItem value="business">기업 인증</SelectItem>
                  <SelectItem value="device">기기 인증</SelectItem>
                  <SelectItem value="service">서비스 엔드포인트</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button 
              onClick={generateDID} 
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  DID 생성
                </>
              )}
            </Button>

            {/* DID Document 표시 */}
            {didDocument && (
              <div className="mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">생성된 DID Document</h4>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(didDocument.id)}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      DID 복사
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={downloadDIDDocument}
                    >
                      <Download className="w-4 h-4 mr-1" />
                      다운로드
                    </Button>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <code className="text-xs">
                    <pre>{JSON.stringify(didDocument, null, 2)}</pre>
                  </code>
                </div>

                <div className="flex items-center space-x-2 text-sm text-green-600 mb-4">
                  <CheckCircle className="w-4 h-4" />
                  <span>DID가 블록체인에 등록되었습니다</span>
                </div>

                {/* 블록체인 증빙 정보 */}
                <BlockchainHashDisplay
                  hashInfo={{
                    transactionHash: generateMockTransactionHash(),
                    blockNumber: generateMockBlockNumber(),
                    network: 'xphere',
                    timestamp: new Date().toISOString(),
                    confirmations: 6,
                    status: 'confirmed',
                    gasUsed: '55000',
                    gasFee: '0.004',
                    type: 'did'
                  }}
                  title="DID 생성 블록체인 증빙"
                  compact={false}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="manage" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>내 DID 목록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myDIDs.map((did) => (
                <div key={did.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          {did.id}
                        </code>
                        <Badge variant={did.status === "active" ? "default" : "secondary"}>
                          {did.status === "active" ? "활성" : "비활성"}
                        </Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>Method: {did.method}</span>
                        <span>생성일: {did.created}</span>
                        <span>용도: {did.purpose}</span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        <FileJson className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Key className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="resolve" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>DID Resolver</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>DID 입력</Label>
              <div className="flex space-x-2">
                <Input 
                  placeholder="did:web:example.com:users:alice"
                  className="font-mono"
                />
                <Button>조회</Button>
              </div>
            </div>

            <div className="text-center py-8 text-gray-500">
              <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>DID를 입력하여 Document를 조회하세요</p>
              <p className="text-sm">Universal Resolver를 통해 모든 DID Method 지원</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}