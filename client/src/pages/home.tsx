import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Shield, 
  Users, 
  Zap, 
  Smartphone, 
  CheckCircle, 
  Globe, 
  Clock, 
  Lock, 
  TrendingUp,
  FileCheck,
  UserCheck,
  Settings,
  BarChart3,
  Crown,
  Star,
  ArrowRight
} from "lucide-react";

export default function Home() {
  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4 bg-white/20 text-white border-white/30">
              🚀 블록체인 기반 전자서명 혁신
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              언제 어디서나<br />
              <span className="text-yellow-300">모바일로 완결되는</span><br />
              스마트 계약 플랫폼
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              PWA 기술로 모바일 앱처럼 사용하고, 블록체인 보안으로 신뢰도를 보장하는<br />
              차세대 전자서명 솔루션을 경험하세요
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/register">
                <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
                  <Star className="w-5 h-5 mr-2" />
                  무료로 시작하기
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
                  로그인하기
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-blue-100">
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                신용카드 없이 무료 시작
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                모바일 PWA 지원
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-4 h-4 mr-2 text-green-300" />
                블록체인 보안
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile PWA Advantage Section */}
      <div className="py-20 bg-gradient-to-r from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-4 bg-green-100 text-green-800">📱 PWA 기술</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              모바일 만으로도 모든 업무 완결
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Progressive Web App 기술로 앱 설치 없이도 모바일에서 네이티브 앱과 동일한 경험을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-green-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">모바일 최적화</h3>
                <p className="text-gray-600">
                  터치 친화적 UI와 반응형 디자인으로 스마트폰에서도 편리한 계약 체결이 가능합니다
                </p>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe className="w-8 h-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">언제 어디서나</h3>
                <p className="text-gray-600">
                  인터넷만 있으면 장소와 시간에 구애받지 않고 즉시 계약서 작성과 서명이 가능합니다
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-white/80 backdrop-blur">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-8 h-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">실시간 알림</h3>
                <p className="text-gray-600">
                  푸시 알림으로 계약 진행 상황을 실시간으로 확인하고 놓치는 일 없이 업무를 처리하세요
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Core Features Section */}
      <div className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-primary/10 text-primary">🛡️ 핵심 기능</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              왜 SignChain을 선택해야 할까요?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              기존 전자서명 서비스의 한계를 극복한 차세대 블록체인 솔루션으로<br />
              관리자와 사용자 모두를 위한 혁신적인 기능을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="border-blue-200 hover:border-blue-400 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">블록체인 보안</h3>
                <p className="text-gray-600 text-sm">
                  Xphere 블록체인의 불변성으로 위변조 불가능한 서명 기록을 보장합니다
                </p>
              </CardContent>
            </Card>

            <Card className="border-green-200 hover:border-green-400 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">실시간 완결성</h3>
                <p className="text-gray-600 text-sm">
                  PBFT 합의 알고리즘으로 즉각적인 거래 확정과 빠른 처리 속도를 제공합니다
                </p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 hover:border-purple-400 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-6 h-6 text-purple-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">다양한 파일 지원</h3>
                <p className="text-gray-600 text-sm">
                  PDF, Office 문서, 이미지 등 모든 형식의 파일을 지원하여 활용도가 높습니다
                </p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 hover:border-orange-400 transition-colors">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Users className="w-6 h-6 text-orange-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">강력한 API</h3>
                <p className="text-gray-600 text-sm">
                  기존 시스템과 원활한 통합을 위한 RESTful API를 제공합니다
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Advanced Features Section */}
      <div className="py-20 bg-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-purple-100 text-purple-800">⚡ 고급 기능</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              관리자와 사용자를 위한 특별한 배려
            </h2>
            <p className="text-xl text-gray-600">
              사용자 경험과 관리 효율성을 극대화하기 위해 세심하게 설계된 기능들
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mr-3">
                    <FileCheck className="w-5 h-5 text-indigo-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">스마트 계약 모듈</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  자동화된 계약 실행과 조건부 서명으로 업무 효율성을 극대화합니다
                </p>
                <Badge variant="secondary" className="text-xs">자동화</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <UserCheck className="w-5 h-5 text-green-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">DID 신원 인증</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  탈중앙화 신원 인증으로 개인정보 보호와 보안을 동시에 보장합니다
                </p>
                <Badge variant="secondary" className="text-xs">보안</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <Settings className="w-5 h-5 text-blue-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">결재 승인 시스템</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  다단계 승인 프로세스로 조직의 결재 라인을 디지털화합니다
                </p>
                <Badge variant="secondary" className="text-xs">워크플로우</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                    <Lock className="w-5 h-5 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">고급 보안 설정</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  2FA, IP 제한, 세션 관리 등 엔터프라이즈급 보안 기능을 제공합니다
                </p>
                <Badge variant="secondary" className="text-xs">엔터프라이즈</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                    <BarChart3 className="w-5 h-5 text-purple-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">실시간 대시보드</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  관리자를 위한 상세한 통계와 모니터링으로 업무 현황을 한눈에 파악합니다
                </p>
                <Badge variant="secondary" className="text-xs">분석</Badge>
              </CardContent>
            </Card>

            <Card className="bg-white hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">성능 최적화</h3>
                </div>
                <p className="text-gray-600 text-sm mb-3">
                  대용량 파일 처리와 동시 사용자 지원으로 업무 중단 없는 서비스를 제공합니다
                </p>
                <Badge variant="secondary" className="text-xs">성능</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-green-100 text-green-800">💰 요금제</Badge>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              합리적인 가격으로 시작하세요
            </h2>
            <p className="text-xl text-gray-600">
              개인부터 기업까지, 모든 규모에 맞는 플랜을 제공합니다
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Star className="w-6 h-6 text-gray-500" />
                </div>
                <CardTitle className="text-2xl font-bold">무료 플랜</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  ₩0<span className="text-lg font-normal text-gray-500">/월</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    월 10건 서명 무료
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    기본 블록체인 보안
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    PWA 모바일 지원
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    이메일 지원
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full">
                    무료로 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="border-2 border-primary shadow-lg relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-primary text-white px-4 py-1">
                  인기
                </Badge>
              </div>
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Crown className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">프로 플랜</CardTitle>
                <div className="text-3xl font-bold text-primary mt-2">
                  ₩29,000<span className="text-lg font-normal text-gray-500">/월</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    월 500건 서명
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    고급 보안 기능
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    API 연동 지원
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    DID 신원 인증
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    우선 기술 지원
                  </li>
                </ul>
                <Link href="/register">
                  <Button className="w-full bg-primary hover:bg-primary/90">
                    프로 플랜 시작하기
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="border-2 border-gray-200 hover:border-purple-300 transition-colors">
              <CardHeader className="text-center pb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Settings className="w-6 h-6 text-purple-500" />
                </div>
                <CardTitle className="text-2xl font-bold">기업 플랜</CardTitle>
                <div className="text-3xl font-bold text-gray-900 mt-2">
                  맞춤<span className="text-lg font-normal text-gray-500"> 견적</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    무제한 서명
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    온프레미스 배포
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    전용 지원팀
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    맞춤형 기능 개발
                  </li>
                  <li className="flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    SLA 보장
                  </li>
                </ul>
                <Button variant="outline" className="w-full">
                  영업팀 문의하기
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            지금 바로 SignChain을 경험해보세요
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            블록체인 기반 전자서명으로 더 안전하고 투명한 계약을 시작하세요.<br />
            모바일에서도 완벽한 업무 환경을 제공합니다.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-primary hover:bg-gray-100 px-8 py-4 text-lg">
                <Star className="w-5 h-5 mr-2" />
                무료 계정 만들기
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary px-8 py-4 text-lg">
              데모 보기
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
          
          {/* Statistics */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">99.9%</div>
              <div className="text-blue-100">시스템 가동률</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">10,000+</div>
              <div className="text-blue-100">처리된 계약</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">1,500+</div>
              <div className="text-blue-100">활성 사용자</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-300">0.5초</div>
              <div className="text-blue-100">평균 처리 시간</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
