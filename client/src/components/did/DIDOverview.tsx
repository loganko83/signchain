import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Key, 
  Globe, 
  Database, 
  Award, 
  UserCheck,
  Lock,
  Fingerprint,
  Network,
  CheckCircle2
} from "lucide-react";

export function DIDOverview() {
  return (
    <div className="space-y-6">
      {/* W3C DID 소개 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-blue-500" />
            <span>W3C Decentralized Identifiers (DIDs)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            W3C DID는 중앙화된 기관 없이도 검증 가능한 디지털 신원을 생성하고 관리할 수 있는 
            새로운 유형의 식별자입니다. 사용자가 자신의 신원 데이터를 완전히 통제할 수 있습니다.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 border rounded-lg">
              <UserCheck className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-semibold">자기주권 신원</h4>
              <p className="text-sm text-gray-600 mt-1">
                개인이 자신의 신원 데이터를 소유하고 관리
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Lock className="w-8 h-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-semibold">프라이버시 보호</h4>
              <p className="text-sm text-gray-600 mt-1">
                선택적 정보 공개와 영지식 증명 지원
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-semibold">상호운용성</h4>
              <p className="text-sm text-gray-600 mt-1">
                W3C 표준으로 글로벌 호환성 보장
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* DID 아키텍처 */}
      <Card>
        <CardHeader>
          <CardTitle>SignChain DID 아키텍처</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* DID Methods */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Key className="w-4 h-4" />
                <span>지원하는 DID Methods</span>
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                <Badge variant="outline" className="p-2">did:web</Badge>
                <Badge variant="outline" className="p-2">did:ethr</Badge>
                <Badge variant="outline" className="p-2">did:key</Badge>
                <Badge variant="outline" className="p-2">did:polygon</Badge>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                다양한 DID 메서드를 지원하여 사용 목적에 맞는 최적의 방식 선택 가능
              </p>
            </div>

            {/* Trust Systems */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Network className="w-4 h-4" />
                <span>신뢰 시스템</span>
              </h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Xphere Network</span>
                  <Badge className="bg-green-500">Primary</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Polygon Network</span>
                  <Badge variant="secondary">Secondary</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">IPFS</span>
                  <Badge variant="secondary">Storage</Badge>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="border rounded-lg p-4">
              <h4 className="font-semibold mb-3 flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>핵심 기능</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">DID Document 생성 및 관리</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Verifiable Credentials 발급</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Presentation Exchange</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">DIDComm 메시징</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Universal Resolver 통합</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm">Zero-Knowledge Proofs</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 사용 시나리오 */}
      <Card>
        <CardHeader>
          <CardTitle>DID 사용 시나리오</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Award className="w-5 h-5 text-blue-500" />
                <h4 className="font-semibold">기업 인증</h4>
              </div>
              <p className="text-sm text-gray-600">
                사업자등록증, 법인인감증명서 등 기업 자격증명을 DID로 발급하여 
                온라인 계약 시 즉시 검증 가능
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Fingerprint className="w-5 h-5 text-green-500" />
                <h4 className="font-semibold">개인 신원확인</h4>
              </div>
              <p className="text-sm text-gray-600">
                주민등록증, 운전면허증, 여권 등을 DID로 변환하여 
                개인정보 노출 없이 신원 증명
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Shield className="w-5 h-5 text-purple-500" />
                <h4 className="font-semibold">자격 증명</h4>
              </div>
              <p className="text-sm text-gray-600">
                학위, 자격증, 경력증명서 등을 검증 가능한 자격증명으로 
                발급하여 위변조 방지
              </p>
            </div>
            
            <div className="border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Database className="w-5 h-5 text-orange-500" />
                <h4 className="font-semibold">접근 권한 관리</h4>
              </div>
              <p className="text-sm text-gray-600">
                조직 내 역할과 권한을 DID 기반으로 관리하여 
                안전한 접근 제어 구현
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 시작하기 */}
      <Card>
        <CardHeader>
          <CardTitle>DID 시작하기</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-600 mb-2">
                지금 바로 분산 신원 시스템을 시작하세요
              </p>
              <p className="text-sm text-gray-500">
                W3C 표준을 준수하는 안전하고 프라이버시를 보호하는 신원 관리
              </p>
            </div>
            <div className="flex space-x-3">
              <Button variant="outline">
                DID 문서 보기
              </Button>
              <Button>
                DID 생성하기
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}