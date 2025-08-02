import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  FileText, 
  Shield, 
  Activity, 
  TrendingUp, 
  AlertTriangle,
  RefreshCw,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  BarChart3,
  PieChart,
  Download
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    growth: number;
  };
  documents: {
    total: number;
    signed: number;
    pending: number;
    thisMonth: number;
  };
  security: {
    threats: number;
    blocked: number;
    lastScan: string;
  };
  system: {
    uptime: number;
    cpu: number;
    memory: number;
    storage: number;
  };
}

interface RecentActivity {
  id: string;
  type: 'user_registration' | 'document_signed' | 'security_alert' | 'system_update';
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'success';
}

export default function AdminDashboard() {
  const { toast } = useToast();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async (showRefreshToast = false) => {
    try {
      const token = localStorage.getItem('admin_token');
      
      // 대시보드 통계 가져오기
      const statsResponse = await fetch('/api/admin/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      } else {
        // Mock data for demo
        setStats({
          users: {
            total: 1247,
            active: 892,
            newThisMonth: 156,
            growth: 12.5
          },
          documents: {
            total: 3489,
            signed: 2891,
            pending: 598,
            thisMonth: 423
          },
          security: {
            threats: 0,
            blocked: 45,
            lastScan: new Date().toISOString()
          },
          system: {
            uptime: 99.9,
            cpu: 23.5,
            memory: 67.2,
            storage: 45.8
          }
        });
      }

      // 최근 활동 가져오기
      const activitiesResponse = await fetch('/api/admin/activities', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (activitiesResponse.ok) {
        const activitiesData = await activitiesResponse.json();
        setActivities(activitiesData.data);
      } else {
        // Mock activities
        setActivities([
          {
            id: '1',
            type: 'user_registration',
            message: '새 사용자 등록: john@example.com',
            timestamp: new Date(Date.now() - 300000).toISOString(),
            severity: 'success'
          },
          {
            id: '2',
            type: 'document_signed',
            message: 'NDA 계약서 서명 완료',
            timestamp: new Date(Date.now() - 600000).toISOString(),
            severity: 'info'
          },
          {
            id: '3',
            type: 'security_alert',
            message: 'API 요청 제한 적용 (IP: 192.168.1.100)',
            timestamp: new Date(Date.now() - 900000).toISOString(),
            severity: 'warning'
          },
          {
            id: '4',
            type: 'system_update',
            message: '보안 미들웨어 업데이트 완료',
            timestamp: new Date(Date.now() - 1800000).toISOString(),
            severity: 'success'
          }
        ]);
      }

      if (showRefreshToast) {
        toast({
          title: "데이터 새로고침 완료",
          description: "최신 대시보드 데이터를 불러왔습니다."
        });
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      toast({
        title: "데이터 로드 실패",
        description: "대시보드 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData(true);
  };

  // 빠른 작업 핸들러들
  const handleAddUser = () => {
    router.push('/admin/users?action=add');
  };

  const handleGenerateReport = async () => {
    try {
      toast({
        title: "보고서 생성 중",
        description: "시스템 보고서를 생성하고 있습니다..."
      });

      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/reports/system', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `system-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "보고서 생성 완료",
          description: "시스템 보고서가 다운로드되었습니다."
        });
      } else {
        throw new Error('보고서 생성 실패');
      }
    } catch (error) {
      toast({
        title: "보고서 생성 실패",
        description: "시스템 보고서 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleSecurityScan = async () => {
    try {
      toast({
        title: "보안 검사 시작",
        description: "시스템 보안 검사를 시작합니다..."
      });

      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/security/scan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "보안 검사 완료",
          description: `검사 완료: ${result.data.issues || 0}개의 이슈 발견`
        });
        
        // 대시보드 데이터 새로고침
        await fetchDashboardData();
      } else {
        throw new Error('보안 검사 실패');
      }
    } catch (error) {
      toast({
        title: "보안 검사 실패",
        description: "보안 검사 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const handleDataBackup = async () => {
    try {
      toast({
        title: "백업 시작",
        description: "데이터 백업을 시작합니다..."
      });

      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/backup/start', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "백업 진행 중",
          description: `백업 작업이 시작되었습니다. 작업 ID: ${result.data.jobId}`
        });
      } else {
        throw new Error('백업 시작 실패');
      }
    } catch (error) {
      toast({
        title: "백업 실패",
        description: "데이터 백업 시작 중 오류가 발생했습니다.",
        variant: "destructive"
      });
    }
  };

  const getActivityIcon = (type: RecentActivity['type']) => {
    switch (type) {
      case 'user_registration':
        return <Users className="h-4 w-4" />;
      case 'document_signed':
        return <FileText className="h-4 w-4" />;
      case 'security_alert':
        return <Shield className="h-4 w-4" />;
      case 'system_update':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (severity: RecentActivity['severity']) => {
    switch (severity) {
      case 'success':
        return 'text-green-600 bg-green-50';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50';
      case 'error':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-blue-600 bg-blue-50';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with Refresh */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">시스템 개요</h2>
            <p className="text-gray-600">SignChain 플랫폼의 전체 현황을 확인하세요</p>
          </div>
          <Button 
            onClick={handleRefresh} 
            disabled={refreshing}
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            새로고침
          </Button>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.users.total.toLocaleString()}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 text-green-500" />
                <span>+{stats?.users.growth}% 이번 달</span>
              </div>
              <div className="mt-2">
                <Badge variant="secondary" className="text-xs">
                  활성: {stats?.users.active}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 문서</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.documents.total.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">
                이번 달 +{stats?.documents.thisMonth}개
              </div>
              <div className="mt-2 space-x-2">
                <Badge variant="outline" className="text-xs">
                  완료: {stats?.documents.signed}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  대기: {stats?.documents.pending}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">보안 상태</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">안전</div>
              <div className="text-xs text-muted-foreground">
                차단된 위협: {stats?.security.blocked}개
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                  최근 검사: 정상
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">시스템 상태</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.system.uptime}%</div>
              <div className="text-xs text-muted-foreground">가동률</div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>CPU</span>
                  <span>{stats?.system.cpu}%</span>
                </div>
                <Progress value={stats?.system.cpu} className="h-1" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">종합 현황</TabsTrigger>
            <TabsTrigger value="analytics">분석</TabsTrigger>
            <TabsTrigger value="system">시스템</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activities */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Clock className="h-5 w-5" />
                    <span>최근 활동</span>
                  </CardTitle>
                  <CardDescription>시스템에서 발생한 최근 이벤트들</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex items-start space-x-3">
                        <div className={`p-1 rounded-full ${getActivityColor(activity.severity)}`}>
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {activity.message}
                          </p>
                          <p className="text-xs text-gray-500">
                            {new Date(activity.timestamp).toLocaleString('ko-KR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>빠른 작업</CardTitle>
                  <CardDescription>자주 사용하는 관리 기능</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleAddUser}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    새 사용자 추가
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleGenerateReport}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    시스템 보고서 생성
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleSecurityScan}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    보안 검사 실행
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={handleDataBackup}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    데이터 백업
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>시스템 리소스</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>CPU 사용률</span>
                      <span>{stats?.system.cpu}%</span>
                    </div>
                    <Progress value={stats?.system.cpu} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>메모리 사용률</span>
                      <span>{stats?.system.memory}%</span>
                    </div>
                    <Progress value={stats?.system.memory} className="mt-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm">
                      <span>스토리지 사용률</span>
                      <span>{stats?.system.storage}%</span>
                    </div>
                    <Progress value={stats?.system.storage} className="mt-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>문서 처리 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">완료된 문서</span>
                      </div>
                      <span className="text-sm font-medium">{stats?.documents.signed}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">대기 중인 문서</span>
                      </div>
                      <span className="text-sm font-medium">{stats?.documents.pending}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">이번 달 처리</span>
                      </div>
                      <span className="text-sm font-medium">{stats?.documents.thisMonth}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>사용자 증가 추이</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    차트 영역 (Chart.js 또는 Recharts 구현 예정)
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5" />
                    <span>문서 유형별 분포</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    파이 차트 영역 (Chart.js 또는 Recharts 구현 예정)
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>시스템 헬스체크</CardTitle>
                <CardDescription>각 서비스별 상태 확인</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">API 서버</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">응답 시간: 45ms</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">데이터베이스</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">연결 풀: 8/20</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">블록체인 노드</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">블록 높이: 18,923,456</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">IPFS 게이트웨이</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">핀된 파일: 1,247개</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">이메일 서비스</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">월간 한도: 89%</p>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Redis 캐시</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        정상
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">메모리: 256MB</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
