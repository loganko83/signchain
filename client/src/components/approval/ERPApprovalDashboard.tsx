import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  DollarSign,
  FileText,
  Users,
  Calendar,
  Filter,
  Download,
  MoreVertical
} from 'lucide-react';
import { useAuth } from '@/lib/auth';

interface ApprovalStats {
  totalPending: number;
  totalApproved: number;
  totalRejected: number;
  averageProcessingTime: number;
  totalAmount: number;
  monthlyVolume: { month: string; count: number; amount: number }[];
  departmentStats: { department: string; pending: number; approved: number }[];
  urgentRequests: number;
  overdueRequests: number;
}

interface PendingApproval {
  id: string;
  title: string;
  requester: string;
  department: string;
  amount: number;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  submittedAt: string;
  deadline: string;
  currentStep: string;
  totalSteps: number;
  completedSteps: number;
  status: 'pending' | 'in_progress' | 'approved' | 'rejected';
}

// Tryton/Odoo/Dolibarr 스타일의 ERP 대시보드
export const ERPApprovalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<ApprovalStats | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<PendingApproval[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('thisMonth');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [loading, setLoading] = useState(true);

  const priorityColors = {
    low: '#10b981',
    medium: '#f59e0b', 
    high: '#ef4444',
    urgent: '#dc2626'
  };

  const statusColors = {
    pending: '#6b7280',
    in_progress: '#3b82f6',
    approved: '#10b981',
    rejected: '#ef4444'
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod, selectedDepartment]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [statsResponse, approvalsResponse] = await Promise.all([
        fetch(`/api/approval/stats?period=${selectedPeriod}&department=${selectedDepartment}`),
        fetch(`/api/approval/pending?department=${selectedDepartment}`)
      ]);

      if (statsResponse.ok && approvalsResponse.ok) {
        const statsData = await statsResponse.json();
        const approvalsData = await approvalsResponse.json();
        
        setStats(statsData);
        setPendingApprovals(approvalsData.approvals || []);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysOverdue = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = today.getTime() - deadlineDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getPriorityBadge = (priority: string) => {
    const variants = {
      low: 'secondary',
      medium: 'outline',
      high: 'destructive',
      urgent: 'destructive'
    };
    
    return (
      <Badge 
        variant={variants[priority as keyof typeof variants] as any}
        className={priority === 'urgent' ? 'animate-pulse' : ''}
      >
        {priority === 'low' && '낮음'}
        {priority === 'medium' && '보통'}
        {priority === 'high' && '높음'}
        {priority === 'urgent' && '긴급'}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">ERP 결재 대시보드</h2>
          <p className="text-gray-600">실시간 승인 프로세스 모니터링</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="thisMonth">이번 달</option>
            <option value="lastMonth">지난 달</option>
            <option value="thisQuarter">이번 분기</option>
            <option value="thisYear">올해</option>
          </select>
          
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">전체 부서</option>
            <option value="finance">재무팀</option>
            <option value="hr">인사팀</option>
            <option value="it">IT팀</option>
            <option value="marketing">마케팅팀</option>
            <option value="sales">영업팀</option>
          </select>

          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="w-4 h-4" />
            <span>내보내기</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">대기 중</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalPending}</p>
                  {stats.urgentRequests > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      긴급 {stats.urgentRequests}건
                    </p>
                  )}
                </div>
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">승인 완료</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalApproved}</p>
                  <p className="text-xs text-gray-500">
                    승인율 {Math.round(stats.totalApproved / (stats.totalApproved + stats.totalRejected) * 100)}%
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">총 결재 금액</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(stats.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-500">이번 달 기준</p>
                </div>
                <DollarSign className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 처리 시간</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.averageProcessingTime}일
                  </p>
                  {stats.overdueRequests > 0 && (
                    <p className="text-xs text-red-600 font-medium">
                      지연 {stats.overdueRequests}건
                    </p>
                  )}
                </div>
                <TrendingUp className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 월별 처리 현황 */}
        {stats?.monthlyVolume && (
          <Card>
            <CardHeader>
              <CardTitle>월별 결재 처리 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats.monthlyVolume}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" name="건수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* 부서별 현황 */}
        {stats?.departmentStats && (
          <Card>
            <CardHeader>
              <CardTitle>부서별 결재 현황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.departmentStats.map((dept) => (
                  <div key={dept.department} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{dept.department}</span>
                      <span className="text-sm text-gray-600">
                        대기: {dept.pending} / 완료: {dept.approved}
                      </span>
                    </div>
                    <Progress 
                      value={(dept.approved / (dept.pending + dept.approved)) * 100} 
                      className="h-2"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 대기 중인 결재 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>대기 중인 결재</span>
            <Badge variant="outline">{pendingApprovals.length}건</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">제목</th>
                  <th className="text-left py-3 px-4">요청자</th>
                  <th className="text-left py-3 px-4">부서</th>
                  <th className="text-left py-3 px-4">금액</th>
                  <th className="text-left py-3 px-4">우선순위</th>
                  <th className="text-left py-3 px-4">진행률</th>
                  <th className="text-left py-3 px-4">마감일</th>
                  <th className="text-left py-3 px-4">작업</th>
                </tr>
              </thead>
              <tbody>
                {pendingApprovals.map((approval) => {
                  const progress = (approval.completedSteps / approval.totalSteps) * 100;
                  const isOverdue = getDaysOverdue(approval.deadline) > 0;
                  
                  return (
                    <tr key={approval.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium">{approval.title}</div>
                          <div className="text-sm text-gray-600">{approval.currentStep}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4 text-gray-400" />
                          <span>{approval.requester}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{approval.department}</td>
                      <td className="py-3 px-4 font-mono">
                        {formatCurrency(approval.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {getPriorityBadge(approval.priority)}
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{approval.completedSteps}/{approval.totalSteps}</span>
                            <span>{Math.round(progress)}%</span>
                          </div>
                          <Progress value={progress} className="h-2" />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                          {formatDate(approval.deadline)}
                          {isOverdue && (
                            <div className="flex items-center space-x-1 text-red-600">
                              <AlertTriangle className="w-3 h-3" />
                              <span>{getDaysOverdue(approval.deadline)}일 지연</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline">
                            검토
                          </Button>
                          <Button size="sm" variant="ghost">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
