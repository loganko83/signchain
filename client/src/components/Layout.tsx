import { Link } from "wouter";
import { FileText, FileCheck, Shield, Key, Book, Home as HomeIcon, LogIn, UserPlus, LayoutDashboard, HardDrive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth.tsx";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location === path;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={`sticky top-0 z-50 w-full border-b bg-white shadow-lg transition-all duration-300 ${isScrolled ? "shadow-xl" : "shadow-lg"}`}>
        <div className="container flex h-20 items-center px-4">
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <FileText className="h-8 w-8 text-blue-600 group-hover:text-blue-700 transition-colors" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SignChain</span>
              <span className="text-xs text-gray-500 -mt-1">Smart Contract Platform</span>
            </div>
          </Link>

          <nav className="ml-12 flex items-center space-x-8 flex-1">
            <Link href="/" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <HomeIcon className="h-4 w-4" />
              <span>홈</span>
            </Link>
            
            {user && (
              <Link href="/dashboard" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/dashboard") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
                <LayoutDashboard className="h-4 w-4" />
                <span>대시보드</span>
              </Link>
            )}

            <Link href="/contract" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/contract") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <FileText className="h-4 w-4" />
              <span>계약 모듈</span>
            </Link>

            <Link href="/approval" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/approval") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <FileCheck className="h-4 w-4" />
              <span>결재 모듈</span>
            </Link>

            <Link href="/did" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/did") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <Key className="h-4 w-4" />
              <span>DID 모듈</span>
            </Link>

            <Link href="/files" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/files") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <HardDrive className="h-4 w-4" />
              <span>파일 관리</span>
            </Link>

            <Link href="/security" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/security") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <Shield className="h-4 w-4" />
              <span>보안 설정</span>
            </Link>

            <Link href="/api-docs" className={`group flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-blue-50 ${isActive("/api-docs") ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:text-blue-600"}`}>
              <Book className="h-4 w-4" />
              <span>API 문서</span>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-600">로딩 중...</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 px-3 py-2 bg-blue-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">
                      {(user.name || user.email).charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {user.name || user.email}
                  </span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogout}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  로그아웃
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button 
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    회원가입
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <FileText className="h-8 w-8 text-blue-600" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">SignChain</span>
                  <span className="text-xs text-gray-500 -mt-1">Smart Contract Platform</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                블록체인 기반 전자서명 플랫폼으로 더 안전하고 투명한 계약을 시작하세요.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">제품</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contract" className="hover:text-primary transition-colors">계약 모듈</Link></li>
                <li><Link href="/approval" className="hover:text-primary transition-colors">결재 모듈</Link></li>
                <li><Link href="/did" className="hover:text-primary transition-colors">DID 모듈</Link></li>
                <li><Link href="/api-docs" className="hover:text-primary transition-colors">API 문서</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">회사</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">회사 소개</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">이용약관</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">문의하기</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold">연락처</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>이메일: support@signchain.com</li>
                <li>전화: 02-1234-5678</li>
                <li>주소: 서울특별시 강남구 테헤란로 123</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            <p>© 2024 SignChain. 모든 권리 보유.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
