import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  History, 
  GitBranch, 
  FileText, 
  Clock, 
  User, 
  ArrowLeft, 
  ArrowRight,
  Eye,
  Download,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  Info,
  Code2,
  FileCheck,
  FileDiff,
  Calendar,
  GitCommit,
  GitMerge,
  Save
} from 'lucide-react';

interface Version {
  id: string;
  version: string;
  createdAt: string;
  createdBy: string;
  message: string;
  changes: {
    additions: number;
    deletions: number;
    modified: number;
  };
  status: 'draft' | 'published' | 'archived';
  parent?: string;
}

interface Comparison {
  type: 'added' | 'removed' | 'modified';
  field: string;
  oldValue?: string;
  newValue?: string;
}

export default function VersionControl() {
  const [versions, setVersions] = useState<Version[]>([
    {
      id: 'v1',
      version: '1.0.0',
      createdAt: '2024-01-10 10:00:00',
      createdBy: 'admin@techcorp.com',
      message: '초기 버전 - 표준 근로계약서 템플릿',
      changes: { additions: 0, deletions: 0, modified: 0 },
      status: 'archived'
    },
    {
      id: 'v2',
      version: '1.1.0',
      createdAt: '2024-01-15 14:30:00',
      createdBy: 'legal@techcorp.com',
      message: '급여 조항 수정 및 복리후생 섹션 추가',
      changes: { additions: 12, deletions: 3, modified: 5 },
      status: 'archived',
      parent: 'v1'
    },
    {
      id: 'v3',
      version: '1.2.0',
      createdAt: '2024-01-20 09:15:00',
      createdBy: 'hr@techcorp.com',
      message: '재택근무 정책 반영',
      changes: { additions: 8, deletions: 0, modified: 3 },
      status: 'published',
      parent: 'v2'
    },
    {
      id: 'v4',
      version: '2.0.0-draft',
      createdAt: '2024-01-25 16:45:00',
      createdBy: 'admin@techcorp.com',
      message: '2024년 법률 개정사항 반영 (작업중)',
      changes: { additions: 25, deletions: 10, modified: 15 },
      status: 'draft',
      parent: 'v3'
    }
  ]);

  const [selectedVersions, setSelectedVersions] = useState<[string, string]>(['v2', 'v3']);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<Version | null>(null);
  const [restoreMessage, setRestoreMessage] = useState('');
  const [activeTab, setActiveTab] = useState('timeline');

  const comparisons: Comparison[] = [
    {
      type: 'added',
      field: '복리후생',
      newValue: '회사는 직원의 복지를 위해 다음과 같은 혜택을 제공한다...'
    },
    {
      type: 'modified',
      field: '급여',
      oldValue: '기본급은 월 3,000,000원으로 한다.',
      newValue: '기본급은 월 3,500,000원으로 하며, 성과에 따라 인센티브를 지급한다.'
    },
    {
      type: 'removed',
      field: '수습기간',
      oldValue: '수습기간은 3개월로 한다.'
    }
  ];

  const getStatusBadge = (status: Version['status']) => {
    switch (status) {
      case 'draft':
        return <Badge variant="secondary">초안</Badge>;
      case 'published':
        return <Badge className="bg-green-600">배포됨</Badge>;
      case 'archived':
        return <Badge variant="default">보관</Badge>;
    }
  };

  const getChangesSummary = (changes: Version['changes']) => {
    return (
      <div className="flex gap-3 text-sm">
        <span className="text-green-600">+{changes.additions}</span>
        <span className="text-red-600">-{changes.deletions}</span>
        <span className="text-blue-600">~{changes.modified}</span>
      </div>
    );
  };

  const handleRestore = async () => {
    if (!selectedVersion || !restoreMessage) return;

    // 실제 구현에서는 API 호출
    const newVersion: Version = {
      id: `v${versions.length + 1}`,
      version: `${selectedVersion.version}-restored`,
      createdAt: new Date().toISOString(),
      createdBy: 'current-user@techcorp.com',
      message: restoreMessage,
      changes: { additions: 0, deletions: 0, modified: 1 },
      status: 'draft',
      parent: selectedVersion.id
    };

    setVersions([...versions, newVersion]);
    setShowRestoreDialog(false);
    setRestoreMessage('');
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-semibold">계약서 버전 관리</h3>
        <p className="text-sm text-muted-foreground">
          계약서의 모든 변경 사항을 추적하고 이전 버전을 복원할 수 있습니다.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="timeline">
            <History className="h-4 w-4 mr-2" />
            버전 타임라인
          </TabsTrigger>
          <TabsTrigger value="compare">
            <FileDiff className="h-4 w-4 mr-2" />
            버전 비교
          </TabsTrigger>
          <TabsTrigger value="branches">
            <GitBranch className="h-4 w-4 mr-2" />
            브랜치 관리
          </TabsTrigger>
        </TabsList>

        {/* 버전 타임라인 탭 */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>버전 히스토리</CardTitle>
              <CardDescription>
                계약서의 모든 수정 이력을 시간순으로 확인할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {versions.map((version, index) => (
                <div key={version.id} className="relative">
                  {index < versions.length - 1 && (
                    <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                  )}
                  <div className="flex gap-4 pb-8">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-100">
                      <FileText className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">버전 {version.version}</h4>
                        {getStatusBadge(version.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {version.message}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {version.createdBy}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {version.createdAt}
                        </span>
                        {getChangesSummary(version.changes)}
                      </div>
                      <div className="flex gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedVersion(version);
                            setShowRestoreDialog(true);
                          }}
                        >
                          <RotateCcw className="h-3 w-3 mr-1" />
                          복원
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          보기
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 버전 비교 탭 */}
        <TabsContent value="compare" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>버전 비교</CardTitle>
              <CardDescription>
                두 버전 간의 변경 사항을 비교할 수 있습니다.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>이전 버전</Label>
                  <Select
                    value={selectedVersions[0]}
                    onValueChange={(value) => setSelectedVersions([value, selectedVersions[1]])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="버전 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          v{version.version} - {version.createdAt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>최신 버전</Label>
                  <Select
                    value={selectedVersions[1]}
                    onValueChange={(value) => setSelectedVersions([selectedVersions[0], value])}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="버전 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {versions.map((version) => (
                        <SelectItem key={version.id} value={version.id}>
                          v{version.version} - {version.createdAt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                {comparisons.map((comp, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      comp.type === 'added' 
                        ? 'bg-green-50 border-green-200' 
                        : comp.type === 'removed' 
                        ? 'bg-red-50 border-red-200' 
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <Badge
                        variant={
                          comp.type === 'added' 
                            ? 'default' 
                            : comp.type === 'removed' 
                            ? 'destructive' 
                            : 'secondary'
                        }
                        className={
                          comp.type === 'added'
                            ? 'bg-green-600'
                            : comp.type === 'removed'
                            ? ''
                            : 'bg-blue-600'
                        }
                      >
                        {comp.type === 'added' ? '추가' : comp.type === 'removed' ? '삭제' : '수정'}
                      </Badge>
                      <span className="font-medium">{comp.field}</span>
                    </div>
                    {comp.oldValue && (
                      <div className="mb-2">
                        <span className="text-xs text-muted-foreground">이전:</span>
                        <p className="text-sm line-through text-red-600">{comp.oldValue}</p>
                      </div>
                    )}
                    {comp.newValue && (
                      <div>
                        <span className="text-xs text-muted-foreground">현재:</span>
                        <p className="text-sm text-green-600">{comp.newValue}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 브랜치 관리 탭 */}
        <TabsContent value="branches" className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              브랜치를 사용하여 여러 버전의 계약서를 동시에 관리할 수 있습니다.
              각 브랜치는 독립적으로 수정되며, 필요시 병합할 수 있습니다.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">main</CardTitle>
                    <CardDescription>기본 브랜치 - 현재 배포된 버전</CardDescription>
                  </div>
                  <Badge className="bg-green-600">활성</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">최신 버전</span>
                    <span className="font-medium">1.2.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">마지막 수정</span>
                    <span className="font-medium">2024-01-20</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <GitBranch className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">2024-legal-update</CardTitle>
                    <CardDescription>2024년 법률 개정사항 반영</CardDescription>
                  </div>
                  <Badge variant="secondary">작업중</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">기반 버전</span>
                    <span className="font-medium">1.2.0</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">변경 사항</span>
                    <span className="font-medium">15개 파일</span>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      보기
                    </Button>
                    <Button variant="outline" size="sm">
                      <GitMerge className="h-4 w-4 mr-2" />
                      병합
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">새 브랜치 생성</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                <GitBranch className="h-4 w-4 mr-2" />
                브랜치 생성
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 복원 다이얼로그 */}
      <Dialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>버전 복원</DialogTitle>
            <DialogDescription>
              버전 {selectedVersion?.version}으로 복원하시겠습니까?
              새로운 버전이 생성되며 현재 버전은 보존됩니다.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="restore-message">복원 사유</Label>
              <Textarea
                id="restore-message"
                placeholder="왜 이 버전으로 복원하는지 설명해주세요..."
                value={restoreMessage}
                onChange={(e) => setRestoreMessage(e.target.value)}
                rows={3}
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                복원 후에도 현재 버전은 그대로 유지되며, 
                새로운 버전으로 복원된 내용이 추가됩니다.
              </AlertDescription>
            </Alert>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRestoreDialog(false)}>
              취소
            </Button>
            <Button onClick={handleRestore} disabled={!restoreMessage}>
              <RotateCcw className="h-4 w-4 mr-2" />
              복원하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}