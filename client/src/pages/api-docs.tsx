import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copy, Check, Key, Webhook, FileText, Shield, Code, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function ApiDocsPage() {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    toast({
      title: "코드 복사됨",
      description: "클립보드에 복사되었습니다.",
    });
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const CodeBlock = ({ code, language = "javascript", id }: { code: string; language?: string; id: string }) => (
    <div className="relative">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className={`language-${language}`}>{code}</code>
      </pre>
      <Button
        variant="ghost"
        size="sm"
        className="absolute top-2 right-2"
        onClick={() => copyToClipboard(code, id)}
      >
        {copiedCode === id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  const endpoints = [
    {
      method: "GET",
      path: "/api/v1/documents",
      description: "문서 목록 조회",
      parameters: [
        { name: "page", type: "number", description: "페이지 번호 (기본값: 1)" },
        { name: "limit", type: "number", description: "페이지당 항목 수 (최대: 100, 기본값: 20)" }
      ]
    },
    {
      method: "GET",
      path: "/api/v1/documents/{id}",
      description: "특정 문서 조회",
      parameters: [
        { name: "id", type: "number", description: "문서 ID", required: true }
      ]
    },
    {
      method: "POST",
      path: "/api/v1/documents",
      description: "새 문서 업로드",
      body: {
        title: "string (required)",
        description: "string (optional)",
        fileContent: "string (required, base64 encoded)",
        mimeType: "string (required)"
      }
    },
    {
      method: "POST",
      path: "/api/v1/documents/{id}/signature-requests",
      description: "서명 요청 생성",
      body: {
        signerEmail: "string (required)",
        signerName: "string (optional)",
        message: "string (optional)",
        deadline: "string (optional, ISO 8601 format)",
        requiredActions: "array of strings (optional)"
      }
    },
    {
      method: "GET",
      path: "/api/v1/documents/{id}/signature-requests",
      description: "문서의 서명 요청 목록 조회"
    },
    {
      method: "GET",
      path: "/api/v1/documents/{id}/signatures",
      description: "문서의 서명 목록 조회"
    },
    {
      method: "GET",
      path: "/api/v1/documents/{id}/verification",
      description: "블록체인 검증 결과 조회"
    }
  ];

  const webhookEvents = [
    { event: "document.uploaded", description: "문서가 업로드됨" },
    { event: "signature.requested", description: "서명이 요청됨" },
    { event: "signature.completed", description: "서명이 완료됨" },
    { event: "document.verified", description: "문서가 블록체인에서 검증됨" },
    { event: "workflow.started", description: "워크플로우가 시작됨" },
    { event: "workflow.completed", description: "워크플로우가 완료됨" }
  ];

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">SignChain API 문서</h1>
          <p className="text-lg text-muted-foreground">
            SignChain API를 사용하여 전자서명 기능을 외부 애플리케이션에 통합하세요
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="auth">인증</TabsTrigger>
            <TabsTrigger value="endpoints">엔드포인트</TabsTrigger>
            <TabsTrigger value="webhooks">웹훅</TabsTrigger>
            <TabsTrigger value="examples">예제</TabsTrigger>
            <TabsTrigger value="sdk">SDK</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  API 개요
                </CardTitle>
                <CardDescription>
                  SignChain REST API를 사용하여 문서 관리, 서명 요청, 블록체인 검증 기능을 통합하세요
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">기본 URL</h3>
                    <code className="text-sm bg-muted px-2 py-1 rounded">
                      https://your-domain.com/api/v1
                    </code>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">인증 방식</h3>
                    <p className="text-sm text-muted-foreground">API Key (Header)</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">응답 형식</h3>
                    <p className="text-sm text-muted-foreground">JSON</p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">주요 기능</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <FileText className="h-5 w-5 text-blue-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">문서 관리</h4>
                        <p className="text-sm text-muted-foreground">문서 업로드, 조회, 메타데이터 관리</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Key className="h-5 w-5 text-green-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">서명 요청</h4>
                        <p className="text-sm text-muted-foreground">전자서명 요청 생성 및 관리</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Shield className="h-5 w-5 text-purple-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">블록체인 검증</h4>
                        <p className="text-sm text-muted-foreground">문서 무결성 및 진위성 검증</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 border rounded-lg">
                      <Webhook className="h-5 w-5 text-orange-500 mt-0.5" />
                      <div>
                        <h4 className="font-medium">실시간 웹훅</h4>
                        <p className="text-sm text-muted-foreground">이벤트 기반 알림 및 통합</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="auth" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API 인증</CardTitle>
                <CardDescription>
                  SignChain API에 접근하기 위해서는 API 키가 필요합니다
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">API 키 헤더</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    모든 요청에 다음 헤더를 포함해야 합니다:
                  </p>
                  <CodeBlock 
                    code="X-API-Key: sk_your_api_key_here" 
                    language="http"
                    id="auth-header"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">요청 제한</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">기본 제한</h4>
                      <p className="text-sm text-muted-foreground">분당 100회 요청</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium">응답 헤더</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>X-RateLimit-Limit: 100</div>
                        <div>X-RateLimit-Remaining: 95</div>
                        <div>X-RateLimit-Reset: 1640995200</div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">오류 응답</h3>
                  <CodeBlock 
                    code={`{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "code": 401
}`}
                    language="json"
                    id="error-response"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="endpoints" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>API 엔드포인트</CardTitle>
                <CardDescription>
                  사용 가능한 모든 API 엔드포인트와 사용 방법
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge variant={endpoint.method === 'GET' ? 'default' : 'secondary'}>
                          {endpoint.method}
                        </Badge>
                        <code className="font-mono text-sm">{endpoint.path}</code>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{endpoint.description}</p>
                      
                      {endpoint.parameters && (
                        <div className="mb-3">
                          <h4 className="font-medium text-sm mb-2">파라미터:</h4>
                          <div className="space-y-1">
                            {endpoint.parameters.map((param, paramIndex) => (
                              <div key={paramIndex} className="text-sm flex items-center gap-2">
                                <code className="bg-muted px-1 rounded">{param.name}</code>
                                <span className="text-muted-foreground">({param.type})</span>
                                {param.required && <Badge variant="outline" className="text-xs">필수</Badge>}
                                <span className="text-muted-foreground">- {param.description}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {endpoint.body && (
                        <div>
                          <h4 className="font-medium text-sm mb-2">요청 본문:</h4>
                          <CodeBlock 
                            code={JSON.stringify(endpoint.body, null, 2)}
                            language="json"
                            id={`body-${index}`}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Webhook className="h-5 w-5" />
                  웹훅 설정
                </CardTitle>
                <CardDescription>
                  실시간 이벤트 알림을 받기 위한 웹훅 설정 방법
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-3">웹훅 등록</h3>
                  <CodeBlock 
                    code={`POST /api/v1/webhooks
Content-Type: application/json
X-API-Key: sk_your_api_key_here

{
  "url": "https://your-app.com/webhooks/signchain",
  "events": ["document.uploaded", "signature.completed"],
  "secret": "your_webhook_secret"
}`}
                    language="http"
                    id="webhook-register"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">지원되는 이벤트</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {webhookEvents.map((event, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <code className="text-sm font-mono">{event.event}</code>
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">웹훅 페이로드 예제</h3>
                  <CodeBlock 
                    code={`{
  "event": "signature.completed",
  "timestamp": "2025-01-23T12:00:00Z",
  "data": {
    "document_id": 123,
    "signature_id": 456,
    "signer_email": "user@example.com",
    "signer_name": "홍길동",
    "signature_type": "digital",
    "completed_at": "2025-01-23T12:00:00Z"
  }
}`}
                    language="json"
                    id="webhook-payload"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">서명 검증</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    웹훅 요청의 진위성을 확인하기 위해 HMAC-SHA256 서명을 사용합니다:
                  </p>
                  <CodeBlock 
                    code={`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}`}
                    language="javascript"
                    id="webhook-verify"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="examples" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>코드 예제</CardTitle>
                <CardDescription>
                  다양한 언어로 작성된 SignChain API 사용 예제
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-3">JavaScript (Node.js)</h3>
                  <CodeBlock 
                    code={`const axios = require('axios');

const api = axios.create({
  baseURL: 'https://your-domain.com/api/v1',
  headers: {
    'X-API-Key': 'sk_your_api_key_here',
    'Content-Type': 'application/json'
  }
});

// 문서 업로드
async function uploadDocument(title, fileContent, mimeType) {
  try {
    const response = await api.post('/documents', {
      title,
      description: '새 문서 업로드',
      fileContent: Buffer.from(fileContent).toString('base64'),
      mimeType
    });
    
    console.log('Document uploaded:', response.data);
    return response.data;
  } catch (error) {
    console.error('Upload failed:', error.response.data);
  }
}

// 서명 요청
async function requestSignature(documentId, signerEmail) {
  try {
    const response = await api.post(\`/documents/\${documentId}/signature-requests\`, {
      signerEmail,
      message: '문서에 서명해 주세요',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });
    
    console.log('Signature requested:', response.data);
    return response.data;
  } catch (error) {
    console.error('Request failed:', error.response.data);
  }
}`}
                    language="javascript"
                    id="example-js"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">Python</h3>
                  <CodeBlock 
                    code={`import requests
import base64
from datetime import datetime, timedelta

class SignChainAPI:
    def __init__(self, api_key, base_url='https://your-domain.com/api/v1'):
        self.session = requests.Session()
        self.session.headers.update({
            'X-API-Key': api_key,
            'Content-Type': 'application/json'
        })
        self.base_url = base_url
    
    def upload_document(self, title, file_content, mime_type):
        """문서 업로드"""
        encoded_content = base64.b64encode(file_content).decode('utf-8')
        
        data = {
            'title': title,
            'description': '새 문서 업로드',
            'fileContent': encoded_content,
            'mimeType': mime_type
        }
        
        response = self.session.post(f'{self.base_url}/documents', json=data)
        response.raise_for_status()
        return response.json()
    
    def request_signature(self, document_id, signer_email):
        """서명 요청"""
        deadline = (datetime.now() + timedelta(days=7)).isoformat()
        
        data = {
            'signerEmail': signer_email,
            'message': '문서에 서명해 주세요',
            'deadline': deadline
        }
        
        response = self.session.post(
            f'{self.base_url}/documents/{document_id}/signature-requests',
            json=data
        )
        response.raise_for_status()
        return response.json()

# 사용 예제
api = SignChainAPI('sk_your_api_key_here')

# 문서 업로드
with open('contract.pdf', 'rb') as f:
    document = api.upload_document(
        title='계약서',
        file_content=f.read(),
        mime_type='application/pdf'
    )

# 서명 요청
signature_request = api.request_signature(
    document_id=document['data']['id'],
    signer_email='signer@example.com'
)`}
                    language="python"
                    id="example-python"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">cURL</h3>
                  <CodeBlock 
                    code={`# 문서 목록 조회
curl -X GET "https://your-domain.com/api/v1/documents?page=1&limit=20" \\
  -H "X-API-Key: sk_your_api_key_here"

# 문서 업로드
curl -X POST "https://your-domain.com/api/v1/documents" \\
  -H "X-API-Key: sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "계약서",
    "description": "새 계약서 업로드",
    "fileContent": "JVBERi0xLjQKJe...",
    "mimeType": "application/pdf"
  }'

# 서명 요청
curl -X POST "https://your-domain.com/api/v1/documents/123/signature-requests" \\
  -H "X-API-Key: sk_your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "signerEmail": "signer@example.com",
    "message": "문서에 서명해 주세요",
    "deadline": "2025-01-30T23:59:59Z"
  }'`}
                    language="bash"
                    id="example-curl"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="sdk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SDK 및 라이브러리</CardTitle>
                <CardDescription>
                  다양한 프로그래밍 언어를 위한 공식 SDK
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">JavaScript/TypeScript</h3>
                    <CodeBlock 
                      code="npm install @signchain/sdk"
                      language="bash"
                      id="sdk-js"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Node.js 및 브라우저 환경 지원
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Python</h3>
                    <CodeBlock 
                      code="pip install signchain-python"
                      language="bash"
                      id="sdk-python"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Python 3.7+ 지원
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">PHP</h3>
                    <CodeBlock 
                      code="composer require signchain/php-sdk"
                      language="bash"
                      id="sdk-php"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      PHP 7.4+ 지원
                    </p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-semibold mb-2">Go</h3>
                    <CodeBlock 
                      code="go get github.com/signchain/go-sdk"
                      language="bash"
                      id="sdk-go"
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Go 1.18+ 지원
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">SDK 사용 예제</h3>
                  <CodeBlock 
                    code={`import { SignChain } from '@signchain/sdk';

const client = new SignChain({
  apiKey: 'sk_your_api_key_here',
  baseUrl: 'https://your-domain.com/api/v1'
});

// 문서 업로드 및 서명 요청
async function processDocument() {
  try {
    // 문서 업로드
    const document = await client.documents.upload({
      title: '계약서',
      file: fileBuffer,
      mimeType: 'application/pdf'
    });
    
    // 서명 요청
    const signatureRequest = await client.signatures.request({
      documentId: document.id,
      signerEmail: 'signer@example.com',
      message: '계약서에 서명해 주세요'
    });
    
    console.log('서명 요청이 생성되었습니다:', signatureRequest);
  } catch (error) {
    console.error('오류 발생:', error);
  }
}`}
                    language="typescript"
                    id="sdk-example"
                  />
                </div>

                <Separator />

                <div>
                  <h3 className="font-semibold mb-3">추가 리소스</h3>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      GitHub 리포지토리
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      NPM 패키지
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      API 테스트 도구
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}