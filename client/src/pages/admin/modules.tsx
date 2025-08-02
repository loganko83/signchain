import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Users,
  Activity,
  BarChart3,
  PieChart,
  Download,
  RefreshCw,
  AlertTriangle,
  DollarSign,
  Shield,
  Zap
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface ModuleStats {
  contract: {
    totalDocuments: number;
    completedDocuments: number;
    pendingDocuments: number;
    failedDocuments: number;
    activeUsers: number;
    monthlyGrowth: number;
    avgProcessingTime: number; // minutes
    revenue: number;
  };
  approval: {
    totalRequests: number;
    approvedRequests: number;
    pendingRequests: number;
    rejectedRequests: number;
    activeUsers: number;
    monthlyGrowth: number;
    avgApprovalTime: number; // hours
    revenue: number;
  };
  payment: {
    totalTransactions: number;
    successfulTransactions: number;
    pendingTransactions: number;
    failedTransactions: number;
    activeUsers: number;
    monthlyGrowth: number;
    totalVolume: number; // USD
    revenue: number;
  };
  did: {
    totalDIDs: number;
    activeDIDs: number;
    credentialsIssued: number;
    verificationsCompleted: number;
    activeUsers: number;
    monthlyGrowth: number;
    avgVerificationTime: number; // seconds
    revenue: number;
  };
}

interface ModuleHealth {
  contract: 'healthy' | 'warning' | 'critical';
  approval: 'healthy' | 'warning' | 'critical';
  payment: 'healthy' | 'warning' | 'critical';
  did: 'healthy' | 'warning' | 'critical';
}

export default function AdminModules() {
  const { toast } = useToast();
  const [stats, setStats] = useState<ModuleStats | null>(null);
  const [health, setHealth] = useState<ModuleHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // 모듈 통계 조회
  const fetchModuleStats = async (showRefreshToast = false) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/statistics/modules', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data.stats);
        setHealth(data.data.health);
      } else {
        // Mock data for demo
        setStats({
          contract: {
            totalDocuments: 1247,
            completedDocuments: 1089,
            pendingDocuments: 127,
            failedDocuments: 31,
            activeUsers: 342,
            monthlyGrowth: 15.2,
            avgProcessingTime: 24,
            revenue: 12450
          },
          approval: {
            totalRequests: 892,
            approvedRequests: 756,
            pendingRequests: 98,
            rejectedRequests: 38,
            activeUsers: 178,
            monthlyGrowth: 8.7,
            avgApprovalTime: 3.2,
            revenue: 8920
          },
          payment: {
            totalTransactions: 2341,
            successfulTransactions: 2201,
            pendingTransactions: 65,
            failedTransactions: 75,
            activeUsers: 456,
            monthlyGrowth: 22.1,
            totalVolume: 234567,
            revenue: 23456
          },
          did: {
            totalDIDs: 567,
            activeDIDs: 489,
            credentialsIssued: 1234,
            verificationsCompleted: 987,
            activeUsers: 234,
            monthlyGrowth: 34.5,
            avgVerificationTime: 12,
            revenue: 5670
          }
        });

        setHealth({
          contract: 'healthy',
          approval: 'healthy',
          payment: 'warning',
          did: 'healthy'
        });
      }

      if (showRefreshToast) {
        toast({
          title: "통계 새로고침 완료",
          description: "최신 모듈 통계를 불러왔습니다."
        });
      }
    } catch (error) {
      console.error('Failed to fetch module stats:', error);
      toast({
        title: "통계 로드 실패",
        description: "모듈 통계를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchModuleStats(true);
  };

  const getHealthColor = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'critical':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getHealthIcon = (status: 'healthy' | 'warning' | 'critical') => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'critical':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getSuccessRate = (completed: number, total: number) => {
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  };

  useEffect(() => {
    fetchModuleStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
        </div>
      </AdminLayout>
    );
  }

  if (!stats || !health) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">데이터 로드 실패</h3>
            <p className="text-gray-600">모듈 통계를 불러올 수 없습니다.</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">모듈 현황</h2>
            <p className="text-gray-600">각 기능 모듈의 사용 현황과 성능을 모니터링하세요</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={handleRefresh} disabled={refreshing} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              새로고침
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              보고서 다운로드
            </Button>
          </div>
        </div>

        {/* Module Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">계약 모듈</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.contract.totalDocuments}</div>
                <Badge variant="outline" className={getHealthColor(health.contract)}>
                  {getHealthIcon(health.contract)}
                  <span className="ml-1">
                    {health.contract === 'healthy' ? '정상' : health.contract === 'warning' ? '주의' : '위험'}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                {stats.contract.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{stats.contract.monthlyGrowth > 0 ? '+' : ''}{stats.contract.monthlyGrowth}% 이번 달</span>
              </div>
              <Progress 
                value={getSuccessRate(stats.contract.completedDocuments, stats.contract.totalDocuments)} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">전자결재 모듈</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.approval.totalRequests}</div>
                <Badge variant="outline" className={getHealthColor(health.approval)}>
                  {getHealthIcon(health.approval)}
                  <span className="ml-1">
                    {health.approval === 'healthy' ? '정상' : health.approval === 'warning' ? '주의' : '위험'}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                {stats.approval.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{stats.approval.monthlyGrowth > 0 ? '+' : ''}{stats.approval.monthlyGrowth}% 이번 달</span>
              </div>
              <Progress 
                value={getSuccessRate(stats.approval.approvedRequests, stats.approval.totalRequests)} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">결제 모듈</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.payment.totalTransactions}</div>
                <Badge variant="outline" className={getHealthColor(health.payment)}>
                  {getHealthIcon(health.payment)}
                  <span className="ml-1">
                    {health.payment === 'healthy' ? '정상' : health.payment === 'warning' ? '주의' : '위험'}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                {stats.payment.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{stats.payment.monthlyGrowth > 0 ? '+' : ''}{stats.payment.monthlyGrowth}% 이번 달</span>
              </div>
              <Progress 
                value={getSuccessRate(stats.payment.successfulTransactions, stats.payment.totalTransactions)} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">DID 모듈</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold">{stats.did.totalDIDs}</div>
                <Badge variant="outline" className={getHealthColor(health.did)}>
                  {getHealthIcon(health.did)}
                  <span className="ml-1">
                    {health.did === 'healthy' ? '정상' : health.did === 'warning' ? '주의' : '위험'}
                  </span>
                </Badge>
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground mt-2">
                {stats.did.monthlyGrowth > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
                <span>{stats.did.monthlyGrowth > 0 ? '+' : ''}{stats.did.monthlyGrowth}% 이번 달</span>
              </div>
              <Progress 
                value={getSuccessRate(stats.did.activeDIDs, stats.did.totalDIDs)} 
                className="mt-2 h-1"
              />
            </CardContent>
          </Card>
        </div>

        {/* Detailed Module Stats */}
        <Tabs defaultValue="contract" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="contract">계약 모듈</TabsTrigger>
            <TabsTrigger value="approval">전자결재</TabsTrigger>
            <TabsTrigger value="payment">결제</TabsTrigger>
            <TabsTrigger value="did">DID</TabsTrigger>
          </TabsList>

          {/* 계약 모듈 상세 */}
          <TabsContent value="contract" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>문서 처리 현황</CardTitle>
                  <CardDescription>계약 문서의 처리 상태별 통계</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">완료된 문서</span>
                      </div>
                      <span className="text-sm font-medium">{stats.contract.completedDocuments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">처리 중인 문서</span>
                      </div>
                      <span className="text-sm font-medium">{stats.contract.pendingDocuments}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">실패한 문서</span>
                      </div>
                      <span className="text-sm font-medium">{stats.contract.failedDocuments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성능 지표</CardTitle>
                  <CardDescription>계약 모듈의 주요 성능 메트릭</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">활성 사용자</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.contract.activeUsers}명</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">평균 처리 시간</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.contract.avgProcessingTime}분</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">성공률</span>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {getSuccessRate(stats.contract.completedDocuments, stats.contract.totalDocuments)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">월간 수익</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">${stats.contract.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 전자결재 모듈 상세 */}
          <TabsContent value="approval" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>결재 요청 현황</CardTitle>
                  <CardDescription>전자결재 요청의 상태별 통계</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">승인된 요청</span>
                      </div>
                      <span className="text-sm font-medium">{stats.approval.approvedRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">대기 중인 요청</span>
                      </div>
                      <span className="text-sm font-medium">{stats.approval.pendingRequests}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">반려된 요청</span>
                      </div>
                      <span className="text-sm font-medium">{stats.approval.rejectedRequests}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성능 지표</CardTitle>
                  <CardDescription>전자결재 모듈의 주요 성능 메트릭</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">활성 사용자</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.approval.activeUsers}명</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">평균 승인 시간</span>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.approval.avgApprovalTime}시간</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">승인률</span>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {getSuccessRate(stats.approval.approvedRequests, stats.approval.totalRequests)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">월간 수익</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">${stats.approval.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 결제 모듈 상세 */}
          <TabsContent value="payment" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>결제 거래 현황</CardTitle>
                  <CardDescription>결제 거래의 상태별 통계</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">성공한 거래</span>
                      </div>
                      <span className="text-sm font-medium">{stats.payment.successfulTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm">처리 중인 거래</span>
                      </div>
                      <span className="text-sm font-medium">{stats.payment.pendingTransactions}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <XCircle className="h-4 w-4 text-red-500" />
                        <span className="text-sm">실패한 거래</span>
                      </div>
                      <span className="text-sm font-medium">{stats.payment.failedTransactions}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성능 지표</CardTitle>
                  <CardDescription>결제 모듈의 주요 성능 메트릭</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">활성 사용자</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.payment.activeUsers}명</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">총 거래량</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">${stats.payment.totalVolume.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">성공률</span>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {getSuccessRate(stats.payment.successfulTransactions, stats.payment.totalTransactions)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">월간 수익</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">${stats.payment.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* DID 모듈 상세 */}
          <TabsContent value="did" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>DID 및 자격증명 현황</CardTitle>
                  <CardDescription>DID 및 VC/VP 처리 통계</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-4 w-4 text-blue-500" />
                        <span className="text-sm">활성 DID</span>
                      </div>
                      <span className="text-sm font-medium">{stats.did.activeDIDs}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">발급된 자격증명</span>
                      </div>
                      <span className="text-sm font-medium">{stats.did.credentialsIssued}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-purple-500" />
                        <span className="text-sm">완료된 검증</span>
                      </div>
                      <span className="text-sm font-medium">{stats.did.verificationsCompleted}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>성능 지표</CardTitle>
                  <CardDescription>DID 모듈의 주요 성능 메트릭</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">활성 사용자</span>
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.did.activeUsers}명</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">평균 검증 시간</span>
                      <div className="flex items-center space-x-2">
                        <Zap className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">{stats.did.avgVerificationTime}초</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">DID 활성률</span>
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">
                          {getSuccessRate(stats.did.activeDIDs, stats.did.totalDIDs)}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">월간 수익</span>
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="text-sm font-medium">${stats.did.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
