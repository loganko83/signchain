import{j as e}from"./ui-vendor-DtKnxXw5.js";import{r as k}from"./react-vendor-Dzt9N-8P.js";import{c as w,f as C,C as d,d as n,e as o,g as c,a as l,F as S,K as T,S as P,B as h}from"./index-DifXOlZV.js";import{B as j}from"./badge-rnGWDgP8.js";import{T as I,a as q,b as m,c as p}from"./tabs-dCtZTWem.js";import{S as i}from"./separator-Dzupzyuf.js";import{C as A}from"./code-CWGiOtEZ.js";import{E as x}from"./external-link-BWsmJ6ag.js";import{C as E}from"./check-De_5ApH_.js";import{C as K}from"./copy-DmFTctZJ.js";import"./api-D30H7COj.js";import"./utils-B2rm_Apj.js";/**
 * @license lucide-react v0.525.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const R=[["path",{d:"M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2",key:"q3hayz"}],["path",{d:"m6 17 3.13-5.78c.53-.97.1-2.18-.5-3.1a4 4 0 1 1 6.89-4.06",key:"1go1hn"}],["path",{d:"m12 6 3.13 5.73C15.66 12.7 16.9 13 18 13a4 4 0 0 1 0 8",key:"qlwsc0"}]],g=w("webhook",R);function $(){const[f,u]=k.useState(null),{toast:N}=C(),b=(s,t)=>{navigator.clipboard.writeText(s),u(t),N({title:"코드 복사됨",description:"클립보드에 복사되었습니다."}),setTimeout(()=>u(null),2e3)},a=({code:s,language:t="javascript",id:r})=>e.jsxs("div",{className:"relative",children:[e.jsx("pre",{className:"bg-muted p-4 rounded-lg overflow-x-auto text-sm",children:e.jsx("code",{className:`language-${t}`,children:s})}),e.jsx(h,{variant:"ghost",size:"sm",className:"absolute top-2 right-2",onClick:()=>b(s,r),children:f===r?e.jsx(E,{className:"h-4 w-4"}):e.jsx(K,{className:"h-4 w-4"})})]}),y=[{method:"GET",path:"/api/v1/documents",description:"문서 목록 조회",parameters:[{name:"page",type:"number",description:"페이지 번호 (기본값: 1)"},{name:"limit",type:"number",description:"페이지당 항목 수 (최대: 100, 기본값: 20)"}]},{method:"GET",path:"/api/v1/documents/{id}",description:"특정 문서 조회",parameters:[{name:"id",type:"number",description:"문서 ID",required:!0}]},{method:"POST",path:"/api/v1/documents",description:"새 문서 업로드",body:{title:"string (required)",description:"string (optional)",fileContent:"string (required, base64 encoded)",mimeType:"string (required)"}},{method:"POST",path:"/api/v1/documents/{id}/signature-requests",description:"서명 요청 생성",body:{signerEmail:"string (required)",signerName:"string (optional)",message:"string (optional)",deadline:"string (optional, ISO 8601 format)",requiredActions:"array of strings (optional)"}},{method:"GET",path:"/api/v1/documents/{id}/signature-requests",description:"문서의 서명 요청 목록 조회"},{method:"GET",path:"/api/v1/documents/{id}/signatures",description:"문서의 서명 목록 조회"},{method:"GET",path:"/api/v1/documents/{id}/verification",description:"블록체인 검증 결과 조회"}],v=[{event:"document.uploaded",description:"문서가 업로드됨"},{event:"signature.requested",description:"서명이 요청됨"},{event:"signature.completed",description:"서명이 완료됨"},{event:"document.verified",description:"문서가 블록체인에서 검증됨"},{event:"workflow.started",description:"워크플로우가 시작됨"},{event:"workflow.completed",description:"워크플로우가 완료됨"}];return e.jsx("div",{className:"container mx-auto py-8",children:e.jsxs("div",{className:"max-w-6xl mx-auto",children:[e.jsxs("div",{className:"mb-8",children:[e.jsx("h1",{className:"text-4xl font-bold mb-4",children:"SignChain API 문서"}),e.jsx("p",{className:"text-lg text-muted-foreground",children:"SignChain API를 사용하여 전자서명 기능을 외부 애플리케이션에 통합하세요"})]}),e.jsxs(I,{defaultValue:"overview",className:"space-y-6",children:[e.jsxs(q,{className:"grid w-full grid-cols-6",children:[e.jsx(m,{value:"overview",children:"개요"}),e.jsx(m,{value:"auth",children:"인증"}),e.jsx(m,{value:"endpoints",children:"엔드포인트"}),e.jsx(m,{value:"webhooks",children:"웹훅"}),e.jsx(m,{value:"examples",children:"예제"}),e.jsx(m,{value:"sdk",children:"SDK"})]}),e.jsx(p,{value:"overview",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsxs(o,{className:"flex items-center gap-2",children:[e.jsx(A,{className:"h-5 w-5"}),"API 개요"]}),e.jsx(c,{children:"SignChain REST API를 사용하여 문서 관리, 서명 요청, 블록체인 검증 기능을 통합하세요"})]}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-3 gap-4",children:[e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"기본 URL"}),e.jsx("code",{className:"text-sm bg-muted px-2 py-1 rounded",children:"https://your-domain.com/api/v1"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"인증 방식"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"API Key (Header)"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"응답 형식"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"JSON"})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"주요 기능"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"flex items-start gap-3 p-3 border rounded-lg",children:[e.jsx(S,{className:"h-5 w-5 text-blue-500 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium",children:"문서 관리"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"문서 업로드, 조회, 메타데이터 관리"})]})]}),e.jsxs("div",{className:"flex items-start gap-3 p-3 border rounded-lg",children:[e.jsx(T,{className:"h-5 w-5 text-green-500 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium",children:"서명 요청"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"전자서명 요청 생성 및 관리"})]})]}),e.jsxs("div",{className:"flex items-start gap-3 p-3 border rounded-lg",children:[e.jsx(P,{className:"h-5 w-5 text-purple-500 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium",children:"블록체인 검증"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"문서 무결성 및 진위성 검증"})]})]}),e.jsxs("div",{className:"flex items-start gap-3 p-3 border rounded-lg",children:[e.jsx(g,{className:"h-5 w-5 text-orange-500 mt-0.5"}),e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium",children:"실시간 웹훅"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"이벤트 기반 알림 및 통합"})]})]})]})]})]})]})}),e.jsx(p,{value:"auth",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(o,{children:"API 인증"}),e.jsx(c,{children:"SignChain API에 접근하기 위해서는 API 키가 필요합니다"})]}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"API 키 헤더"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-3",children:"모든 요청에 다음 헤더를 포함해야 합니다:"}),e.jsx(a,{code:"X-API-Key: sk_your_api_key_here",language:"http",id:"auth-header"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"요청 제한"}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"기본 제한"}),e.jsx("p",{className:"text-sm text-muted-foreground",children:"분당 100회 요청"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h4",{className:"font-medium",children:"응답 헤더"}),e.jsxs("div",{className:"text-sm text-muted-foreground space-y-1",children:[e.jsx("div",{children:"X-RateLimit-Limit: 100"}),e.jsx("div",{children:"X-RateLimit-Remaining: 95"}),e.jsx("div",{children:"X-RateLimit-Reset: 1640995200"})]})]})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"오류 응답"}),e.jsx(a,{code:`{
  "error": "Unauthorized",
  "message": "Invalid API key",
  "code": 401
}`,language:"json",id:"error-response"})]})]})]})}),e.jsx(p,{value:"endpoints",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(o,{children:"API 엔드포인트"}),e.jsx(c,{children:"사용 가능한 모든 API 엔드포인트와 사용 방법"})]}),e.jsx(l,{children:e.jsx("div",{className:"space-y-6",children:y.map((s,t)=>e.jsxs("div",{className:"border rounded-lg p-4",children:[e.jsxs("div",{className:"flex items-center gap-3 mb-3",children:[e.jsx(j,{variant:s.method==="GET"?"default":"secondary",children:s.method}),e.jsx("code",{className:"font-mono text-sm",children:s.path})]}),e.jsx("p",{className:"text-sm text-muted-foreground mb-3",children:s.description}),s.parameters&&e.jsxs("div",{className:"mb-3",children:[e.jsx("h4",{className:"font-medium text-sm mb-2",children:"파라미터:"}),e.jsx("div",{className:"space-y-1",children:s.parameters.map((r,_)=>e.jsxs("div",{className:"text-sm flex items-center gap-2",children:[e.jsx("code",{className:"bg-muted px-1 rounded",children:r.name}),e.jsxs("span",{className:"text-muted-foreground",children:["(",r.type,")"]}),r.required&&e.jsx(j,{variant:"outline",className:"text-xs",children:"필수"}),e.jsxs("span",{className:"text-muted-foreground",children:["- ",r.description]})]},_))})]}),s.body&&e.jsxs("div",{children:[e.jsx("h4",{className:"font-medium text-sm mb-2",children:"요청 본문:"}),e.jsx(a,{code:JSON.stringify(s.body,null,2),language:"json",id:`body-${t}`})]})]},t))})})]})}),e.jsx(p,{value:"webhooks",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsxs(o,{className:"flex items-center gap-2",children:[e.jsx(g,{className:"h-5 w-5"}),"웹훅 설정"]}),e.jsx(c,{children:"실시간 이벤트 알림을 받기 위한 웹훅 설정 방법"})]}),e.jsxs(l,{className:"space-y-4",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"웹훅 등록"}),e.jsx(a,{code:`POST /api/v1/webhooks
Content-Type: application/json
X-API-Key: sk_your_api_key_here

{
  "url": "https://your-app.com/webhooks/signchain",
  "events": ["document.uploaded", "signature.completed"],
  "secret": "your_webhook_secret"
}`,language:"http",id:"webhook-register"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"지원되는 이벤트"}),e.jsx("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-3",children:v.map((s,t)=>e.jsxs("div",{className:"p-3 border rounded-lg",children:[e.jsx("code",{className:"text-sm font-mono",children:s.event}),e.jsx("p",{className:"text-sm text-muted-foreground mt-1",children:s.description})]},t))})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"웹훅 페이로드 예제"}),e.jsx(a,{code:`{
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
}`,language:"json",id:"webhook-payload"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"서명 검증"}),e.jsx("p",{className:"text-sm text-muted-foreground mb-3",children:"웹훅 요청의 진위성을 확인하기 위해 HMAC-SHA256 서명을 사용합니다:"}),e.jsx(a,{code:`const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');
  
  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
}`,language:"javascript",id:"webhook-verify"})]})]})]})}),e.jsx(p,{value:"examples",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(o,{children:"코드 예제"}),e.jsx(c,{children:"다양한 언어로 작성된 SignChain API 사용 예제"})]}),e.jsxs(l,{className:"space-y-6",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"JavaScript (Node.js)"}),e.jsx(a,{code:`const axios = require('axios');

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
}`,language:"javascript",id:"example-js"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"Python"}),e.jsx(a,{code:`import requests
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
)`,language:"python",id:"example-python"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"cURL"}),e.jsx(a,{code:`# 문서 목록 조회
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
  }'`,language:"bash",id:"example-curl"})]})]})]})}),e.jsx(p,{value:"sdk",className:"space-y-6",children:e.jsxs(d,{children:[e.jsxs(n,{children:[e.jsx(o,{children:"SDK 및 라이브러리"}),e.jsx(c,{children:"다양한 프로그래밍 언어를 위한 공식 SDK"})]}),e.jsxs(l,{className:"space-y-6",children:[e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-6",children:[e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"JavaScript/TypeScript"}),e.jsx(a,{code:"npm install @signchain/sdk",language:"bash",id:"sdk-js"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-2",children:"Node.js 및 브라우저 환경 지원"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Python"}),e.jsx(a,{code:"pip install signchain-python",language:"bash",id:"sdk-python"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-2",children:"Python 3.7+ 지원"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"PHP"}),e.jsx(a,{code:"composer require signchain/php-sdk",language:"bash",id:"sdk-php"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-2",children:"PHP 7.4+ 지원"})]}),e.jsxs("div",{className:"p-4 border rounded-lg",children:[e.jsx("h3",{className:"font-semibold mb-2",children:"Go"}),e.jsx(a,{code:"go get github.com/signchain/go-sdk",language:"bash",id:"sdk-go"}),e.jsx("p",{className:"text-sm text-muted-foreground mt-2",children:"Go 1.18+ 지원"})]})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"SDK 사용 예제"}),e.jsx(a,{code:`import { SignChain } from '@signchain/sdk';

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
}`,language:"typescript",id:"sdk-example"})]}),e.jsx(i,{}),e.jsxs("div",{children:[e.jsx("h3",{className:"font-semibold mb-3",children:"추가 리소스"}),e.jsxs("div",{className:"space-y-3",children:[e.jsxs(h,{variant:"outline",className:"w-full justify-start",children:[e.jsx(x,{className:"h-4 w-4 mr-2"}),"GitHub 리포지토리"]}),e.jsxs(h,{variant:"outline",className:"w-full justify-start",children:[e.jsx(x,{className:"h-4 w-4 mr-2"}),"NPM 패키지"]}),e.jsxs(h,{variant:"outline",className:"w-full justify-start",children:[e.jsx(x,{className:"h-4 w-4 mr-2"}),"API 테스트 도구"]})]})]})]})]})})]})]})})}export{$ as default};
