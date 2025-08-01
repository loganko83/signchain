import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckSquare, Users, Mail, ArrowRight, Clock, CheckCircle, Settings, BarChart3, FileText } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ERPApprovalDashboard } from "@/components/approval/ERPApprovalDashboard";
import { AdvancedApprovalSettings } from "@/components/approval/AdvancedApprovalSettings";
import BlockchainHashDisplay from "@/components/BlockchainHashDisplay";
import { generateMockTransactionHash, generateMockBlockNumber } from "@/lib/blockchain-hash-utils";

export default function ApprovalModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [documentData, setDocumentData] = useState({
    title: "",
    description: "",
    organizationId: "1"
  });
  const [workflowSteps, setWorkflowSteps] = useState([
    { stepType: "검토", assignedRole: "", deadline: "" },
    { stepType: "승인", assignedRole: "", deadline: "" }
  ]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUploadAndCreateWorkflow = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      // 1. Upload document
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("title", documentData.title);
      formData.append("description", documentData.description);
      formData.append("uploadedBy", user?.id.toString() || "1");
      formData.append("organizationId", documentData.organizationId);

      const uploadResponse = await fetch("/api/modules/approval/upload", {
        method: "POST",
        body: formData
      });

      if (uploadResponse.ok) {
        const uploadResult = await uploadResponse.json();
        const documentId = uploadResult.document.id;

        // 2. Create workflow
        const workflowResponse = await fetch("/api/modules/approval/workflow", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            workflowName: `${documentData.title} 승인 프로세스`,
            organizationId: parseInt(documentData.organizationId),
            initiatedBy: user?.id || 1,
            steps: workflowSteps
          })
        });

        if (workflowResponse.ok) {
          const workflowResult = await workflowResponse.json();
          console.log("Workflow created:", workflowResult);
          
          // Reset form
          setSelectedFile(null);
          setDocumentData({ title: "", description: "", organizationId: "1" });
          setWorkflowSteps([
            { stepType: "검토", assignedRole: "", deadline: "" },
            { stepType: "승인", assignedRole: "", deadline: "" }
          ]);
        }
      }
    } catch (error) {
      console.error("Upload/workflow error:", error);
    } finally {
      setUploading(false);
    }
  };

  const addWorkflowStep = () => {
    setWorkflowSteps([...workflowSteps, { stepType: "승인", assignedRole: "", deadline: "" }]);
  };

  const updateWorkflowStep = (index: number, field: string, value: string) => {
    const updated = [...workflowSteps];
    updated[index] = { ...updated[index], [field]: value };
    setWorkflowSteps(updated);
  };

  const removeWorkflowStep = (index: number) => {
    if (workflowSteps.length > 1) {
      setWorkflowSteps(workflowSteps.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">ERP 결재 모듈</h1>
          <p className="text-gray-600 mt-2">
            Tryton/Odoo/Dolibarr 스타일의 고급 결재 및 승인 관리 시스템
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>대시보드</span>
            </TabsTrigger>
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>결재 요청</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>고급 설정</span>
            </TabsTrigger>
            <TabsTrigger value="legacy" className="flex items-center space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>기본 승인</span>
            </TabsTrigger>
          </TabsList>

          {/* ERP 대시보드 */}
          <TabsContent value="dashboard">
            <ERPApprovalDashboard />
          </TabsContent>

          {/* 결재 요청 생성 */}
          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>새 결재 요청</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">제목</Label>
                      <Input
                        id="title"
                        placeholder="결재 요청 제목"
                        value={documentData.title}
                        onChange={(e) => setDocumentData({
                          ...documentData,
                          title: e.target.value
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">조직</Label>
                      <Select
                        value={documentData.organizationId}
                        onValueChange={(value) => setDocumentData({
                          ...documentData,
                          organizationId: value
                        })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="조직 선택" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">본사</SelectItem>
                          <SelectItem value="2">지사 A</SelectItem>
                          <SelectItem value="3">지사 B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">설명</Label>
                    <Textarea
                      id="description"
                      placeholder="결재 요청에 대한 자세한 설명을 입력하세요"
                      value={documentData.description}
                      onChange={(e) => setDocumentData({
                        ...documentData,
                        description: e.target.value
                      })}
                    />
                  </div>

                  {/* 파일 업로드 */}
                  <div>
                    <Label htmlFor="file">첨부 파일</Label>
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileSelect}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                    />
                    {selectedFile && (
                      <p className="text-sm text-gray-600 mt-2">
                        선택된 파일: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  {/* 승인 단계 설정 */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <Label>승인 단계</Label>
                      <Button onClick={addWorkflowStep} size="sm">
                        단계 추가
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {workflowSteps.map((step, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">단계 {index + 1}</h4>
                            {workflowSteps.length > 1 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeWorkflowStep(index)}
                              >
                                삭제
                              </Button>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <Label>단계 유형</Label>
                              <Select
                                value={step.stepType}
                                onValueChange={(value) => updateWorkflowStep(index, "stepType", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="검토">검토</SelectItem>
                                  <SelectItem value="승인">승인</SelectItem>
                                  <SelectItem value="확인">확인</SelectItem>
                                  <SelectItem value="최종승인">최종승인</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>담당자 역할</Label>
                              <Select
                                value={step.assignedRole}
                                onValueChange={(value) => updateWorkflowStep(index, "assignedRole", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="역할 선택" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="팀장">팀장</SelectItem>
                                  <SelectItem value="부장">부장</SelectItem>
                                  <SelectItem value="이사">이사</SelectItem>
                                  <SelectItem value="대표">대표</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label>마감일</Label>
                              <Input
                                type="date"
                                value={step.deadline}
                                onChange={(e) => updateWorkflowStep(index, "deadline", e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 제출 버튼 */}
                  <div className="flex justify-end space-x-4">
                    <Button variant="outline">임시저장</Button>
                    <Button 
                      onClick={handleUploadAndCreateWorkflow}
                      disabled={!selectedFile || uploading}
                      className="flex items-center space-x-2"
                    >
                      {uploading ? (
                        <>
                          <Clock className="w-4 h-4 animate-spin" />
                          <span>처리 중...</span>
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          <span>승인 요청 제출</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 고급 설정 */}
          <TabsContent value="settings">
            <AdvancedApprovalSettings />
          </TabsContent>

          {/* 기존 기본 승인 시스템 (호환성) */}
          <TabsContent value="legacy">
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
              <CheckSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">결재 모듈</h1>
              <p className="text-gray-600">Adobe Sign 스타일 순차 승인 워크플로우</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-600">다중 승인자</p>
                    <p className="text-2xl font-bold">순차 서명</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <Mail className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-600">이메일 초대</p>
                    <p className="text-2xl font-bold">자동 알림</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <ArrowRight className="w-8 h-8 text-purple-500" />
                  <div>
                    <p className="text-sm text-gray-600">ERP 스타일</p>
                    <p className="text-2xl font-bold">공람 절차</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-600">블록체인</p>
                    <p className="text-2xl font-bold">증빙 보관</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Document Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckSquare className="w-5 h-5" />
                <span>문서 업로드 및 워크플로우 설정</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">문서 제목</Label>
                <Input
                  id="title"
                  value={documentData.title}
                  onChange={(e) => setDocumentData({...documentData, title: e.target.value})}
                  placeholder="승인 문서 제목을 입력하세요"
                />
              </div>
              
              <div>
                <Label htmlFor="description">설명</Label>
                <Textarea
                  id="description"
                  value={documentData.description}
                  onChange={(e) => setDocumentData({...documentData, description: e.target.value})}
                  placeholder="문서에 대한 설명을 입력하세요"
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="file">문서 파일</Label>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-600 mt-2">
                    선택된 파일: {selectedFile.name}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Workflow Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>승인 단계 설정</span>
                <Button size="sm" onClick={addWorkflowStep}>
                  단계 추가
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {workflowSteps.map((step, index) => (
                <div key={index} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">단계 {index + 1}</Badge>
                    {workflowSteps.length > 1 && (
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeWorkflowStep(index)}
                      >
                        제거
                      </Button>
                    )}
                  </div>
                  
                  <div>
                    <Label>단계 유형</Label>
                    <Select 
                      value={step.stepType} 
                      onValueChange={(value) => updateWorkflowStep(index, 'stepType', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="단계 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="검토">검토</SelectItem>
                        <SelectItem value="승인">승인</SelectItem>
                        <SelectItem value="서명">서명</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>담당자 이메일</Label>
                    <Input
                      value={step.assignedRole}
                      onChange={(e) => updateWorkflowStep(index, 'assignedRole', e.target.value)}
                      placeholder="담당자 이메일 주소"
                    />
                  </div>
                  
                  <div>
                    <Label>마감일 (선택사항)</Label>
                    <Input
                      type="datetime-local"
                      value={step.deadline}
                      onChange={(e) => updateWorkflowStep(index, 'deadline', e.target.value)}
                    />
                  </div>
                </div>
              ))}
              
              <Button
                onClick={handleUploadAndCreateWorkflow}
                disabled={!selectedFile || !documentData.title || uploading || workflowSteps.some(step => !step.assignedRole)}
                className="w-full"
              >
                {uploading ? "처리 중..." : "문서 업로드 및 승인 프로세스 시작"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Process Flow */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>승인 프로세스 흐름</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckSquare className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">문서 업로드</h4>
                <p className="text-sm text-gray-600">블록체인 등록</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">승인자 설정</h4>
                <p className="text-sm text-gray-600">순차 워크플로우</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Mail className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">이메일 전송</h4>
                <p className="text-sm text-gray-600">자동 알림</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-yellow-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <ArrowRight className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">순차 승인</h4>
                <p className="text-sm text-gray-600">각 단계별 처리</p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold">최종 완료</h4>
                <p className="text-sm text-gray-600">블록체인 증빙 완료</p>
              </div>
            </div>
            
            {/* 완료된 승인 프로세스 예시 (데모) */}
            <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">승인 완료 예시</h4>
              <p className="text-sm text-green-700 mb-4">모든 승인 단계가 완료되면 블록체인에 최종 증빙이 기록됩니다.</p>
              
              <BlockchainHashDisplay
                hashInfo={{
                  transactionHash: generateMockTransactionHash(),
                  blockNumber: generateMockBlockNumber(),
                  network: 'xphere',
                  timestamp: new Date().toISOString(),
                  confirmations: 8,
                  status: 'confirmed',
                  gasUsed: '45000',
                  gasFee: '0.003',
                  type: 'approval'
                }}
                title="승인 워크플로우 블록체인 증빙"
                compact={true}
              />
            </div>
          </CardContent>
        </Card>

        {/* Recent Workflows */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>최근 승인 프로세스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>아직 진행 중인 승인 프로세스가 없습니다.</p>
              <p className="text-sm">첫 번째 승인 워크플로우를 시작해보세요.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}