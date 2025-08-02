import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Bell, 
  LogOut,
  Menu,
  X,
  Home
} from 'lucide-react';

interface AdminUser {
  id: string;
  username: string;
  role: 'SuperAdmin' | 'OrgAdmin' | 'ModuleAdmin';
  organizationId?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // 관리자 인증 확인
    const token = localStorage.getItem('admin_token');
    const user = localStorage.getItem('admin_user');
    
    if (!token || !user) {
      navigate('/admin/login');
      return;
    }

    try {
      setAdminUser(JSON.parse(user));
    } catch (error) {
      console.error('Invalid admin user data:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const navigation = [
    {
      name: '대시보드',
      href: '/admin/dashboard',
      icon: BarChart3,
      current: location.pathname === '/admin/dashboard'
    },
    {
      name: '사용자 관리',
      href: '/admin/users',
      icon: Users,
      current: location.pathname === '/admin/users'
    },
    {
      name: '시스템 설정',
      href: '/admin/settings',
      icon: Settings,
      current: location.pathname === '/admin/settings'
    },
    {
      name: '모듈 현황',
      href: '/admin/modules',
      icon: FileText,
      current: location.pathname === '/admin/modules'
    },
    {
      name: '알림 설정',
      href: '/admin/notifications',
      icon: Bell,
      current: location.pathname === '/admin/notifications'
    }
  ];

  if (!adminUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 bg-white shadow-lg flex flex-col`}>
        {/* Logo & Toggle */}
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center space-x-2">
                <Shield className="h-8 w-8 text-indigo-600" />
                <span className="text-lg font-bold text-gray-900">SignChain Admin</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  item.current
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {sidebarOpen && item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t">
          {sidebarOpen && (
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-900">{adminUser.username}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {adminUser.role}
                </Badge>
                {adminUser.organizationId && (
                  <Badge variant="secondary" className="text-xs">
                    조직 {adminUser.organizationId}
                  </Badge>
                )}
              </div>
            </div>
          )}
          
          <div className="space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => navigate('/')}
            >
              <Home className="h-4 w-4 mr-2" />
              {sidebarOpen && '메인 사이트'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {sidebarOpen && '로그아웃'}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold text-gray-900">
              {navigation.find(item => item.current)?.name || '관리자 대시보드'}
            </h1>
            <div className="flex items-center space-x-4">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                시스템 정상
              </Badge>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
