import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Users, 
  Settings, 
  DollarSign, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  User,
  Plus,
  Trash2,
  Edit,
  Save
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useToast } from '@/components/ui/use-toast';

interface ApprovalRule {
  id: string;
  name: string;
  department: string;
  documentType: string;
  minAmount?: number;
  maxAmount?: number;
  requiredApprovers: number;
  parallelApproval: boolean;
  escalationDays: number;
  autoApprovalAmount?: number;
}

interface ApprovalStep {
  id: string;
  ruleId: string;
  order: number;
  approverRole: string;
  approverUser?: string;
  isRequired: boolean;
  deadline: number; // days
  escalationTo?: string;
  conditions: ApprovalCondition[];
}

interface ApprovalCondition {
  id: string;
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains';
  value: string;
}

// Tryton/Odoo/Dolibarr 스타일의 고급 결재 라인 설정
export const AdvancedApprovalSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<ApprovalRule[]>([]);
  const [selectedRule, setSelectedRule] = useState<ApprovalRule | null>(null);
  const [steps, setSteps] = useState<ApprovalStep[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // 부서 및 역할 목록 (ERP 시스템에서 가져오는 것을 시뮬레이션)
  const departments = [
    { value: 'finance', label: '재무팀' },
    { value: 'hr', label: '인사팀' },
    { value: 'it', label: 'IT팀' },
    { value: 'marketing', label: '마케팅팀' },
    { value: 'sales', label: '영업팀' },
    { value: 'operations', label: '운영팀' }
  ];

  const roles = [
    { value: 'manager', label: '팀장' },
    { value: 'director', label: '부장' },
    { value: 'cfo', label: 'CFO' },
    { value: 'ceo', label: 'CEO' },
    { value: 'accountant', label: '회계담당자' },
    { value: 'hr_manager', label: '인사담당자' }
  ];

  const documentTypes = [
    { value: 'expense', label: '비용 지출' },
    { value: 'purchase', label: '구매 요청' },
    { value: 'contract', label: '계약서' },
    { value: 'invoice', label: '송장/청구서' },
    { value: 'hr_document', label: '인사 문서' },
    { value: 'budget', label: '예산 요청' }
  ];

  useEffect(() => {
    loadApprovalRules();
  }, []);

  const loadApprovalRules = async () => {
    try {
      const response = await fetch('/api/approval/rules');
      if (response.ok) {
        const data = await response.json();
        setRules(data.rules || []);
      }
    } catch (error) {
      console.error('Failed to load approval rules:', error);
    }
  };

  const createNewRule = () => {
    const newRule: ApprovalRule = {
      id: Date.now().toString(),
      name: '새 결재 규칙',
      department: '',
      documentType: '',
      requiredApprovers: 1,
      parallelApproval: false,
      escalationDays: 3,
    };
    setSelectedRule(newRule);
    setSteps([]);
    setIsEditing(true);
  };

  const saveRule = async () => {
    if (!selectedRule) return;

    try {
      const response = await fetch('/api/approval/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rule: selectedRule,
          steps: steps
        })
      });

      if (response.ok) {
        toast({
          title: "성공",
          description: "결재 규칙이 저장되었습니다."
        });
        loadApprovalRules();
        setIsEditing(false);
      }
    } catch (error) {
      toast({
        title: "오류",
        description: "결재 규칙 저장에 실패했습니다.",
        variant: "destructive"
      });
    }
  };

  const addApprovalStep = () => {
    if (!selectedRule) return;

    const newStep: ApprovalStep = {
      id: Date.now().toString(),
      ruleId: selectedRule.id,
      order: steps.length + 1,
      approverRole: '',
      isRequired: true,
      deadline: 3,
      conditions: []
    };
    setSteps([...steps, newStep]);
  };

  const updateStep = (stepId: string, updates: Partial<ApprovalStep>) => {
    setSteps(steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    ));
  };

  const removeStep = (stepId: string) => {
    setSteps(steps.filter(step => step.id !== stepId));
  };

  const addCondition = (stepId: string) => {
    const newCondition: ApprovalCondition = {
      id: Date.now().toString(),
      field: 'amount',
      operator: 'greater_than',
      value: '0'
    };

    setSteps(steps.map(step => 
      step.id === stepId 
        ? { ...step, conditions: [...step.conditions, newCondition] }
        : step
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">고급 결재 라인 설정</h2>
          <p className="text-gray-600">ERP 스타일의 조건부 승인 및 다단계 결재 시스템</p>
        </div>
        <Button onClick={createNewRule} className="flex items-center space-x-2">
          <Plus className="w-4 h-4" />
          <span>새 규칙 생성</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 규칙 목록 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <span>결재 규칙 목록</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    selectedRule?.id === rule.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    setSelectedRule(rule);
                    // Load steps for this rule
                    setSteps([]);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{rule.name}</h4>
                      <p className="text-sm text-gray-600">
                        {departments.find(d => d.value === rule.department)?.label} - 
                        {documentTypes.find(d => d.value === rule.documentType)?.label}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Badge variant="outline">{rule.requiredApprovers}단계</Badge>
                        {rule.parallelApproval && (
                          <Badge variant="secondary">병렬승인</Badge>
                        )}
                        {rule.autoApprovalAmount && (
                          <Badge variant="default">자동승인</Badge>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedRule(rule);
                        setIsEditing(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 규칙 상세 설정 */}
        {selectedRule && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>규칙 상세 설정</span>
                {isEditing && (
                  <Button onClick={saveRule} className="flex items-center space-x-2">
                    <Save className="w-4 h-4" />
                    <span>저장</span>
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 기본 정보 */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="ruleName">규칙 이름</Label>
                  <Input
                    id="ruleName"
                    value={selectedRule.name}
                    onChange={(e) => setSelectedRule({
                      ...selectedRule,
                      name: e.target.value
                    })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="department">부서</Label>
                    <Select
                      value={selectedRule.department}
                      onValueChange={(value) => setSelectedRule({
                        ...selectedRule,
                        department: value
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="부서 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.value} value={dept.value}>
                            {dept.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="docType">문서 유형</Label>
                    <Select
                      value={selectedRule.documentType}
                      onValueChange={(value) => setSelectedRule({
                        ...selectedRule,
                        documentType: value
                      })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="문서 유형 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {documentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* 금액 범위 설정 */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minAmount">최소 금액</Label>
                    <Input
                      id="minAmount"
                      type="number"
                      value={selectedRule.minAmount || ''}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        minAmount: e.target.value ? Number(e.target.value) : undefined
                      })}
                      disabled={!isEditing}
                      placeholder="제한 없음"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxAmount">최대 금액</Label>
                    <Input
                      id="maxAmount"
                      type="number"
                      value={selectedRule.maxAmount || ''}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        maxAmount: e.target.value ? Number(e.target.value) : undefined
                      })}
                      disabled={!isEditing}
                      placeholder="제한 없음"
                    />
                  </div>
                </div>

                {/* 고급 설정 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="parallelApproval"
                      checked={selectedRule.parallelApproval}
                      onCheckedChange={(checked) => setSelectedRule({
                        ...selectedRule,
                        parallelApproval: checked
                      })}
                      disabled={!isEditing}
                    />
                    <Label htmlFor="parallelApproval">병렬 승인</Label>
                  </div>

                  <div>
                    <Label htmlFor="escalationDays">에스컬레이션 기간 (일)</Label>
                    <Input
                      id="escalationDays"
                      type="number"
                      value={selectedRule.escalationDays}
                      onChange={(e) => setSelectedRule({
                        ...selectedRule,
                        escalationDays: Number(e.target.value)
                      })}
                      disabled={!isEditing}
                      min="1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="autoApproval">자동 승인 금액</Label>
                  <Input
                    id="autoApproval"
                    type="number"
                    value={selectedRule.autoApprovalAmount || ''}
                    onChange={(e) => setSelectedRule({
                      ...selectedRule,
                      autoApprovalAmount: e.target.value ? Number(e.target.value) : undefined
                    })}
                    disabled={!isEditing}
                    placeholder="자동 승인 사용 안함"
                  />
                </div>
              </div>

              {/* 승인 단계 설정 */}
              {isEditing && (
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold">승인 단계</h4>
                    <Button onClick={addApprovalStep} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      단계 추가
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {steps.map((step, index) => (
                      <div key={step.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <h5 className="font-medium">단계 {index + 1}</h5>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => removeStep(step.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>승인자 역할</Label>
                            <Select
                              value={step.approverRole}
                              onValueChange={(value) => updateStep(step.id, { approverRole: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="역할 선택" />
                              </SelectTrigger>
                              <SelectContent>
                                {roles.map((role) => (
                                  <SelectItem key={role.value} value={role.value}>
                                    {role.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>

                          <div>
                            <Label>마감일 (일)</Label>
                            <Input
                              type="number"
                              value={step.deadline}
                              onChange={(e) => updateStep(step.id, { deadline: Number(e.target.value) })}
                              min="1"
                            />
                          </div>
                        </div>

                        <div className="mt-2 flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={step.isRequired}
                              onCheckedChange={(checked) => updateStep(step.id, { isRequired: checked })}
                            />
                            <Label>필수 승인</Label>
                          </div>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addCondition(step.id)}
                          >
                            조건 추가
                          </Button>
                        </div>

                        {/* 조건 설정 */}
                        {step.conditions.length > 0 && (
                          <div className="mt-4 space-y-2">
                            <Label>승인 조건</Label>
                            {step.conditions.map((condition) => (
                              <div key={condition.id} className="flex items-center space-x-2 text-sm">
                                <Select value={condition.field}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="amount">금액</SelectItem>
                                    <SelectItem value="department">부서</SelectItem>
                                    <SelectItem value="category">카테고리</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select value={condition.operator}>
                                  <SelectTrigger className="w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="equals">같음</SelectItem>
                                    <SelectItem value="greater_than">초과</SelectItem>
                                    <SelectItem value="less_than">미만</SelectItem>
                                    <SelectItem value="contains">포함</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Input
                                  value={condition.value}
                                  className="w-24"
                                  placeholder="값"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
