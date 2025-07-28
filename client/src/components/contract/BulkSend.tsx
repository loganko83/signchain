import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Send, Users, CheckCircle, AlertCircle, Download, Eye } from 'lucide-react';
import Papa from 'papaparse';

interface Recipient {
  id: string;
  name: string;
  email: string;
  role: string;
  customFields: Record<string, string>;
  status: 'pending' | 'sending' | 'sent' | 'failed';
}

interface BulkSendProps {
  templates: Array<{
    id: string;
    name: string;
    category: string;
    fields: Array<{
      name: string;
      type: string;
      label: string;
    }>;
  }>;
}

export default function BulkSend({ templates }: BulkSendProps) {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    Papa.parse(file, {
      complete: (results) => {
        try {
          const headers = results.data[0] as string[];
          const rows = results.data.slice(1) as string[][];

          // 필수 필드 확인
          const requiredFields = ['name', 'email', 'role'];
          const missingFields = requiredFields.filter(field => !headers.includes(field));
          
          if (missingFields.length > 0) {
            throw new Error(`CSV에 필수 필드가 없습니다: ${missingFields.join(', ')}`);
          }

          // 수신자 목록 생성
          const parsedRecipients: Recipient[] = rows
            .filter(row => row.some(cell => cell.trim() !== '')) // 빈 행 제거
            .map((row, index) => {
              const recipient: Recipient = {
                id: `recipient-${Date.now()}-${index}`,
                name: '',
                email: '',
                role: '',
                customFields: {},
                status: 'pending'
              };

              headers.forEach((header, colIndex) => {
                const value = row[colIndex]?.trim() || '';
                if (header === 'name') recipient.name = value;
                else if (header === 'email') recipient.email = value;
                else if (header === 'role') recipient.role = value;
                else if (header && value) {
                  recipient.customFields[header] = value;
                }
              });

              return recipient;
            })
            .filter(r => r.email && r.name); // 이메일과 이름이 있는 행만 유지

          setRecipients(parsedRecipients);
          setIsUploading(false);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'CSV 파싱 중 오류가 발생했습니다.');
          setIsUploading(false);
        }
      },
      error: (err) => {
        setError(`파일 읽기 오류: ${err.message}`);
        setIsUploading(false);
      },
      header: false,
      skipEmptyLines: true
    });
  }, []);

  const handleBulkSend = async () => {
    if (!selectedTemplate || recipients.length === 0) {
      setError('템플릿을 선택하고 수신자 목록을 업로드해주세요.');
      return;
    }

    setIsSending(true);
    setSendingProgress(0);
    setError(null);

    // 수신자별로 순차적으로 발송 (실제로는 병렬 처리 가능)
    for (let i = 0; i < recipients.length; i++) {
      const recipient = recipients[i];
      
      try {
        // 상태를 'sending'으로 업데이트
        setRecipients(prev => prev.map(r => 
          r.id === recipient.id ? { ...r, status: 'sending' } : r
        ));

        // API 호출 시뮬레이션 (실제 구현 시 백엔드 API 호출)
        await new Promise(resolve => setTimeout(resolve, 500));

        // 성공 상태로 업데이트
        setRecipients(prev => prev.map(r => 
          r.id === recipient.id ? { ...r, status: 'sent' } : r
        ));
      } catch (err) {
        // 실패 상태로 업데이트
        setRecipients(prev => prev.map(r => 
          r.id === recipient.id ? { ...r, status: 'failed' } : r
        ));
      }

      setSendingProgress(((i + 1) / recipients.length) * 100);
    }

    setIsSending(false);
  };

  const downloadSampleCSV = () => {
    const sampleData = [
      ['name', 'email', 'role', 'department', 'start_date'],
      ['김철수', 'chulsoo.kim@example.com', '구매자', '영업팀', '2024-08-01'],
      ['이영희', 'younghee.lee@example.com', '판매자', '개발팀', '2024-08-15'],
      ['박민수', 'minsoo.park@example.com', '증인', '법무팀', '2024-09-01']
    ];

    const csv = sampleData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'bulk_send_sample.csv';
    link.click();
  };

  const getStatusBadge = (status: Recipient['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">대기중</Badge>;
      case 'sending':
        return <Badge variant="default">발송중</Badge>;
      case 'sent':
        return <Badge variant="default" className="bg-green-600">발송완료</Badge>;
      case 'failed':
        return <Badge variant="destructive">실패</Badge>;
    }
  };

  const sentCount = recipients.filter(r => r.status === 'sent').length;
  const failedCount = recipients.filter(r => r.status === 'failed').length;

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div>
        <h3 className="text-lg font-semibold">대량 발송</h3>
        <p className="text-sm text-muted-foreground">
          여러 수신자에게 동일한 계약서를 한 번에 발송할 수 있습니다.
        </p>
      </div>

      {/* Step 1: 템플릿 선택 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Step 1: 템플릿 선택
          </CardTitle>
          <CardDescription>
            발송할 계약서 템플릿을 선택해주세요.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="template">계약서 템플릿</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger id="template">
                <SelectValue placeholder="템플릿을 선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name} ({template.category})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: 수신자 목록 업로드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Step 2: 수신자 목록 업로드
          </CardTitle>
          <CardDescription>
            CSV 파일로 수신자 목록을 업로드하세요.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="csv-upload" className="cursor-pointer">
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    클릭하여 CSV 파일을 선택하거나<br />
                    여기에 드래그 앤 드롭하세요
                  </p>
                </div>
                <Input
                  id="csv-upload"
                  type="file"
                  accept=".csv"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
              </Label>
            </div>
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleCSV}
                className="whitespace-nowrap"
              >
                <Download className="h-4 w-4 mr-2" />
                샘플 CSV 다운로드
              </Button>
              <p className="text-xs text-muted-foreground">
                필수 필드: name, email, role
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {recipients.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  총 {recipients.length}명의 수신자
                </p>
                {isSending && (
                  <div className="flex items-center gap-2">
                    <Progress value={sendingProgress} className="w-32" />
                    <span className="text-sm text-muted-foreground">
                      {Math.round(sendingProgress)}%
                    </span>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>이름</TableHead>
                      <TableHead>이메일</TableHead>
                      <TableHead>역할</TableHead>
                      <TableHead>추가 필드</TableHead>
                      <TableHead>상태</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recipients.slice(0, 5).map(recipient => (
                      <TableRow key={recipient.id}>
                        <TableCell>{recipient.name}</TableCell>
                        <TableCell>{recipient.email}</TableCell>
                        <TableCell>{recipient.role}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {Object.keys(recipient.customFields).slice(0, 2).map(field => (
                              <Badge key={field} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                            {Object.keys(recipient.customFields).length > 2 && (
                              <Badge variant="outline" className="text-xs">
                                +{Object.keys(recipient.customFields).length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(recipient.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {recipients.length > 5 && (
                <p className="text-sm text-muted-foreground text-center">
                  ... 외 {recipients.length - 5}명
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 발송 버튼 및 결과 */}
      {recipients.length > 0 && selectedTemplate && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                {sentCount > 0 && (
                  <p className="text-sm text-green-600 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {sentCount}건 발송 완료
                  </p>
                )}
                {failedCount > 0 && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {failedCount}건 발송 실패
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" disabled={isSending}>
                  <Eye className="h-4 w-4 mr-2" />
                  미리보기
                </Button>
                <Button 
                  onClick={handleBulkSend} 
                  disabled={isSending || !selectedTemplate}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isSending ? '발송 중...' : '대량 발송 시작'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
