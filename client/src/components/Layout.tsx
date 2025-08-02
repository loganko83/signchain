import { Link } from "wouter";
import { 
  FileText, 
  FileCheck, 
  Shield, 
  Key, 
  Book, 
  Home as HomeIcon, 
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  HardDrive,
  Sun,
  Moon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileMenu } from "@/components/ui/mobile-menu";
import { PWAInstallButton } from "@/components/ui/pwa-install-button";
import LazyImage from "@/components/LazyImage";
import PerformanceMonitor from "@/components/PerformanceMonitor";
import { useAuth } from "@/lib/auth.tsx";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isLoading, isAuthenticated } = useAuth();
  const [location] = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    // Check for saved theme preference or default to light mode
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location === path;

  // Menu items configuration
  const menuItems = [
    {
      href: "/",
      icon: <HomeIcon className="h-4 w-4" />,
      label: "홈",
      isActive: isActive("/"),
      showWhenLoggedOut: true
    },
    {
      href: "/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "대시보드",
      isActive: isActive("/dashboard"),
      showWhenLoggedOut: false,
      requireAuth: true
    },
    {
      href: "/contract",
      icon: <FileText className="h-4 w-4" />,
      label: "계약 모듈",
      isActive: isActive("/contract"),
      showWhenLoggedOut: true
    },
    {
      href: "/approval",
      icon: <FileCheck className="h-4 w-4" />,
      label: "결재 모듈",
      isActive: isActive("/approval"),
      showWhenLoggedOut: true
    },
    {
      href: "/did",
      icon: <Key className="h-4 w-4" />,
      label: "DID 모듈",
      isActive: isActive("/did"),
      showWhenLoggedOut: true
    },
    {
      href: "/files",
      icon: <HardDrive className="h-4 w-4" />,
      label: "파일 관리",
      isActive: isActive("/files"),
      showWhenLoggedOut: true
    },
    {
      href: "/security",
      icon: <Shield className="h-4 w-4" />,
      label: "보안 설정",
      isActive: isActive("/security"),
      showWhenLoggedOut: true
    },
    {
      href: "/api-docs",
      icon: <Book className="h-4 w-4" />,
      label: "API 문서",
      isActive: isActive("/api-docs"),
      showWhenLoggedOut: true
    }
  ];

  const visibleMenuItems = menuItems.filter(item => {
    if (item.requireAuth && !user) return false;
    return true;
  });

  const mobileMenuItems = visibleMenuItems.map(item => ({
    href: item.href,
    icon: item.icon,
    label: item.label,
    isActive: item.isActive
  }));

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className={cn(
        "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-shadow duration-200",
        isScrolled ? "shadow-lg" : ""
      )}>
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <div className="relative">
              <FileText className="h-7 w-7 text-primary" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full animate-pulse" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              SignChain
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="ml-8 hidden md:flex items-center space-x-1 flex-1">
            {visibleMenuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-muted/50",
                  item.isActive
                    ? "text-primary bg-primary/10 shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>

          {/* Right side controls */}
          <div className="flex items-center space-x-2">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="hidden md:flex"
              aria-label={isDarkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center space-x-2">
              {isLoading ? (
                <div className="text-sm text-muted-foreground animate-pulse">로딩 중...</div>
              ) : isAuthenticated && user ? (
                <>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-muted/50 rounded-lg">
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-primary-foreground">
                        {(user.name || user.email).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span className="text-sm font-medium">
                      {user.name || user.email}
                    </span>
                  </div>
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

            {/* Mobile Menu */}
            <MobileMenu
              isOpen={isMobileMenuOpen}
              onToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              menuItems={mobileMenuItems}
              user={user}
              onLogout={handleLogout}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* PWA Install Button */}
      <PWAInstallButton />

      {/* Enhanced Footer */}
      <footer className="border-t bg-gradient-to-br from-muted/30 to-muted/50">
        <div className="container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <FileText className="h-6 w-6 text-primary" />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  SignChain
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                블록체인 기반 전자서명 플랫폼으로 더 안전하고 투명한 계약을 시작하세요.
              </p>
              <div className="flex space-x-2">
                <Button variant="outline" size="sm" onClick={toggleTheme}>
                  {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">제품</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/contract" className="hover:text-primary transition-colors hover:underline">계약 모듈</Link></li>
                <li><Link href="/approval" className="hover:text-primary transition-colors hover:underline">결재 모듈</Link></li>
                <li><Link href="/did" className="hover:text-primary transition-colors hover:underline">DID 모듈</Link></li>
                <li><Link href="/api-docs" className="hover:text-primary transition-colors hover:underline">API 문서</Link></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">회사</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors hover:underline">회사 소개</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:underline">이용약관</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:underline">개인정보처리방침</a></li>
                <li><a href="#" className="hover:text-primary transition-colors hover:underline">문의하기</a></li>
              </ul>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">연락처</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>이메일: support@signchain.com</li>
                <li>전화: 02-1234-5678</li>
                <li>주소: 서울특별시 강남구 테헤란로 123</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center">
            <p className="text-sm text-muted-foreground">
              © 2024 SignChain. 모든 권리 보유. • 
              <span className="ml-1 text-xs opacity-60">
                {isDarkMode ? "다크 모드" : "라이트 모드"} 활성화됨
              </span>
            </p>
          </div>
        </div>
      </footer>
      
      {/* Performance Monitor (개발 환경에서만 표시) */}
      <PerformanceMonitor enabled={import.meta.env.DEV} showOverlay={true} />
    </div>
  );
}
