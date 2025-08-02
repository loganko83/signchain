import React, { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  Download,
  Edit,
  Trash2,
  Lock,
  Unlock,
  Mail,
  Shield,
  Activity,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface User {
  id: string;
  email: string;
  username: string;
  fullName: string;
  status: 'active' | 'inactive' | 'suspended';
  role: 'user' | 'moderator' | 'admin';
  tier: 'free' | 'pro' | 'enterprise';
  registeredAt: string;
  lastLoginAt: string;
  documentsCount: number;
  organizationId?: string;
  organizationName?: string;
}

interface UserFormData {
  email: string;
  username: string;
  fullName: string;
  role: string;
  tier: string;
  organizationId?: string;
}

export default function AdminUsers() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showAddUserDialog, setShowAddUserDialog] = useState(false);
  const [showEditUserDialog, setShowEditUserDialog] = useState(false);
  const [newUserData, setNewUserData] = useState<UserFormData>({
    email: '',
    username: '',
    fullName: '',
    role: 'user',
    tier: 'free'
  });

  // 사용자 목록 조회
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.data);
        setFilteredUsers(data.data);
      } else {
        // Mock data for demo
        const mockUsers: User[] = [
          {
            id: '1',
            email: 'john@example.com',
            username: 'john.doe',
            fullName: 'John Doe',
            status: 'active',
            role: 'user',
            tier: 'pro',
            registeredAt: '2024-01-15T09:00:00Z',
            lastLoginAt: '2024-08-02T14:30:00Z',
            documentsCount: 15,
            organizationName: 'Tech Corp'
          },
          {
            id: '2',
            email: 'sarah@company.com',
            username: 'sarah.wilson',
            fullName: 'Sarah Wilson',
            status: 'active',
            role: 'moderator',
            tier: 'enterprise',
            registeredAt: '2024-02-20T10:15:00Z',
            lastLoginAt: '2024-08-02T16:45:00Z',
            documentsCount: 42,
            organizationName: 'Business Inc'
          },
          {
            id: '3',
            email: 'mike@startup.io',
            username: 'mike.brown',
            fullName: 'Mike Brown',
            status: 'inactive',
            role: 'user',
            tier: 'free',
            registeredAt: '2024-03-10T14:30:00Z',
            lastLoginAt: '2024-07-28T11:20:00Z',
            documentsCount: 3,
            organizationName: 'Startup LLC'
          },
          {
            id: '4',
            email: 'admin@signchain.com',
            username: 'system.admin',
            fullName: 'System Administrator',
            status: 'active',
            role: 'admin',
            tier: 'enterprise',
            registeredAt: '2024-01-01T00:00:00Z',
            lastLoginAt: '2024-08-02T17:00:00Z',
            documentsCount: 0
          },
          {
            id: '5',
            email: 'test.user@demo.com',
            username: 'test.user',
            fullName: 'Test User',
            status: 'suspended',
            role: 'user',
            tier: 'free',
            registeredAt: '2024-07-15T16:20:00Z',
            lastLoginAt: '2024-07-20T09:10:00Z',
            documentsCount: 1
          }
        ];
        setUsers(mockUsers);
        setFilteredUsers(mockUsers);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast({
        title: "사용자 목록 조회 실패",
        description: "사용자 데이터를 불러오는데 실패했습니다.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // 사용자 상태 변경
  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        // 로컬 상태 업데이트
        const updatedUsers = users.map(user => 
          user.id === userId ? { ...user, status: newStatus as User['status'] } : user
        );
        setUsers(updatedUsers);
        applyFilters(updatedUsers);
        
        toast({
          title: "상태 변경 완료",
          description: "사용자 상태가 성공적으로 변경되었습니다."
        });
      } else {
        throw new Error('Status update failed');
      }
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast({
        title: "상태 변경 실패",
        description: "사용자 상태 변경에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 새 사용자 추가
  const handleAddUser = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUserData)
      });

      if (response.ok) {
        await fetchUsers(); // 목록 새로고침
        setShowAddUserDialog(false);
        setNewUserData({
          email: '',
          username: '',
          fullName: '',
          role: 'user',
          tier: 'free'
        });
        
        toast({
          title: "사용자 추가 완료",
          description: "새 사용자가 성공적으로 추가되었습니다."
        });
      } else {
        throw new Error('User creation failed');
      }
    } catch (error) {
      console.error('Failed to add user:', error);
      toast({
        title: "사용자 추가 실패",
        description: "새 사용자 추가에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  // 필터링 적용
  const applyFilters = (userList: User[] = users) => {
    let filtered = userList;

    // 검색어 필터
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // 상태 필터
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // 역할 필터
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  // 이벤트 핸들러들
  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, roleFilter, users]);

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'inactive':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'suspended':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'moderator':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'user':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const getTierColor = (tier: User['tier']) => {
    switch (tier) {
      case 'enterprise':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'pro':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'free':
        return 'bg-gray-50 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">사용자 관리</h2>
            <p className="text-gray-600">플랫폼의 모든 사용자를 관리하고 모니터링하세요</p>
          </div>
          <Dialog open={showAddUserDialog} onOpenChange={setShowAddUserDialog}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                새 사용자 추가
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>새 사용자 추가</DialogTitle>
                <DialogDescription>
                  새로운 사용자 계정을 생성합니다.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email">이메일 주소</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUserData.email}
                    onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                    placeholder="user@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="username">사용자명</Label>
                  <Input
                    id="username"
                    value={newUserData.username}
                    onChange={(e) => setNewUserData({...newUserData, username: e.target.value})}
                    placeholder="user.name"
                  />
                </div>
                <div>
                  <Label htmlFor="fullName">전체 이름</Label>
                  <Input
                    id="fullName"
                    value={newUserData.fullName}
                    onChange={(e) => setNewUserData({...newUserData, fullName: e.target.value})}
                    placeholder="홍길동"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="role">역할</Label>
                    <Select value={newUserData.role} onValueChange={(value) => setNewUserData({...newUserData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">일반 사용자</SelectItem>
                        <SelectItem value="moderator">모더레이터</SelectItem>
                        <SelectItem value="admin">관리자</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="tier">요금제</Label>
                    <Select value={newUserData.tier} onValueChange={(value) => setNewUserData({...newUserData, tier: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">무료</SelectItem>
                        <SelectItem value="pro">프로</SelectItem>
                        <SelectItem value="enterprise">엔터프라이즈</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddUserDialog(false)}>
                  취소
                </Button>
                <Button onClick={handleAddUser}>
                  사용자 추가
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">총 사용자</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.length}</div>
              <p className="text-xs text-muted-foreground">
                +{users.filter(u => new Date(u.registeredAt) > new Date(Date.now() - 30*24*60*60*1000)).length} 이번 달
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">활성 사용자</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {Math.round((users.filter(u => u.status === 'active').length / users.length) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">프로 사용자</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.filter(u => u.tier === 'pro' || u.tier === 'enterprise').length}</div>
              <p className="text-xs text-muted-foreground">
                전체의 {Math.round((users.filter(u => u.tier === 'pro' || u.tier === 'enterprise').length / users.length) * 100)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">문서 처리</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{users.reduce((sum, u) => sum + u.documentsCount, 0)}</div>
              <p className="text-xs text-muted-foreground">
                평균 사용자당 {Math.round(users.reduce((sum, u) => sum + u.documentsCount, 0) / users.length)}개
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 검색 및 필터</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="이메일, 사용자명, 이름으로 검색..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="상태 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 상태</SelectItem>
                  <SelectItem value="active">활성</SelectItem>
                  <SelectItem value="inactive">비활성</SelectItem>
                  <SelectItem value="suspended">정지</SelectItem>
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="역할 필터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">모든 역할</SelectItem>
                  <SelectItem value="user">일반 사용자</SelectItem>
                  <SelectItem value="moderator">모더레이터</SelectItem>
                  <SelectItem value="admin">관리자</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                내보내기
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Table */}
        <Card>
          <CardHeader>
            <CardTitle>사용자 목록</CardTitle>
            <CardDescription>
              {filteredUsers.length}명의 사용자가 표시됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>사용자</TableHead>
                  <TableHead>상태</TableHead>
                  <TableHead>역할</TableHead>
                  <TableHead>요금제</TableHead>
                  <TableHead>문서 수</TableHead>
                  <TableHead>가입일</TableHead>
                  <TableHead>최종 로그인</TableHead>
                  <TableHead>작업</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        <div className="text-xs text-gray-400">@{user.username}</div>
                        {user.organizationName && (
                          <div className="text-xs text-blue-600">{user.organizationName}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(user.status)}>
                        {user.status === 'active' ? '활성' : user.status === 'inactive' ? '비활성' : '정지'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getRoleColor(user.role)}>
                        {user.role === 'admin' ? '관리자' : user.role === 'moderator' ? '모더레이터' : '사용자'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getTierColor(user.tier)}>
                        {user.tier === 'enterprise' ? '엔터프라이즈' : user.tier === 'pro' ? '프로' : '무료'}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.documentsCount}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.registeredAt).toLocaleDateString('ko-KR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(user.lastLoginAt).toLocaleDateString('ko-KR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newStatus = user.status === 'active' ? 'suspended' : 'active';
                            handleStatusChange(user.id, newStatus);
                          }}
                        >
                          {user.status === 'active' ? (
                            <Lock className="h-4 w-4 text-red-500" />
                          ) : (
                            <Unlock className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Mail className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
