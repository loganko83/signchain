import { Link } from "wouter";
import { FileText, FileCheck, Shield, Key, Book, Home as HomeIcon, LogIn, UserPlus, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout } = useAuth();
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
      <header className={`sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 ${isScrolled ? "shadow-sm" : ""}`}>
        <div className="container flex h-16 items-center">
          <Link href="/" className="flex items-center space-x-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">SignChain</span>
          </Link>

          <nav className="ml-8 flex items-center space-x-6 flex-1">
            <Link href="/" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <HomeIcon className="h-4 w-4" />
                <span>홈</span>
              </div>
            </Link>
            
            {user && (
              <Link href="/dashboard" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/dashboard") ? "text-primary" : "text-muted-foreground"}`}>
                <div className="flex items-center space-x-1">
                  <LayoutDashboard className="h-4 w-4" />
                  <span>대시보드</span>
                </div>
              </Link>
            )}

            <Link href="/contract" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/contract") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <FileText className="h-4 w-4" />
                <span>계약 모듈</span>
              </div>
            </Link>

            <Link href="/approval" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/approval") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <FileCheck className="h-4 w-4" />
                <span>결재 모듈</span>
              </div>
            </Link>

            <Link href="/did" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/did") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <Key className="h-4 w-4" />
                <span>DID 모듈</span>
              </div>
            </Link>

            <Link href="/security" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/security") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>보안 설정</span>
              </div>
            </Link>

            <Link href="/api-docs" className={`text-sm font-medium transition-colors hover:text-primary ${isActive("/api-docs") ? "text-primary" : "text-muted-foreground"}`}>
              <div className="flex items-center space-x-1">
                <Book className="h-4 w-4" />
                <span>API 문서</span>
              </div>
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user.email}
                </span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  로그아웃
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">
                    <LogIn className="h-4 w-4 mr-2" />
                    로그인
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    회원가입
                  </Button>
                </Link>
              </>
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
              <div className="flex items-center space-x-2">
                <FileText className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SignChain</span>
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
