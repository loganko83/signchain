import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Copy, 
  Plus, 
  Trash2, 
  Save,
  FileText,
  Building,
  User,
  Calendar,
  DollarSign,
  Hash,
  Type,
  List
} from "lucide-react";

interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select" | "textarea";
  placeholder?: string;
  required: boolean;
  options?: string[];
  defaultValue?: string;
}

interface ContractTemplate {
  id: string;
  name: string;
  category: string;
  description: string;
  fields: TemplateField[];
  content: string;
  tags: string[];
}

const defaultTemplates: ContractTemplate[] = [
  {
    id: "1",
    name: "표준 근로계약서",
    category: "인사/노무",
    description: "정규직 근로자를 위한 표준 근로계약서 템플릿",
    tags: ["근로계약", "정규직", "노동법"],
    fields: [
      { id: "1", label: "근로자 성명", type: "text", required: true },
      { id: "2", label: "주민등록번호", type: "text", required: true },
      { id: "3", label: "주소", type: "text", required: true },
      { id: "4", label: "직위", type: "text", required: true },
      { id: "5", label: "근무부서", type: "text", required: true },
      { id: "6", label: "월급여", type: "number", required: true },
      { id: "7", label: "계약시작일", type: "date", required: true },
      { id: "8", label: "계약종료일", type: "date", required: false }
    ],
    content: `근로계약서

사업주(이하 "갑"이라 함)와 근로자 {{근로자 성명}}(이하 "을"이라 함)은 다음과 같이 근로계약을 체결한다.

제1조 (근로계약기간)
계약기간은 {{계약시작일}}부터 {{계약종료일}}까지로 한다.

제2조 (근무장소 및 업무내용)
1. 근무장소: {{근무부서}}
2. 업무내용: {{직위}}의 업무

제3조 (근로시간)
1. 근로시간은 휴게시간을 제외하고 1일 8시간, 1주 40시간으로 한다.
2. 근무시간: 09:00 ~ 18:00 (휴게시간 12:00 ~ 13:00)

제4조 (임금)
1. 월 기본급: {{월급여}}원
2. 지급일: 매월 25일
3. 지급방법: 을이 지정한 은행계좌로 입금

...`
  },
  {
    id: "2",
    name: "소프트웨어 개발 용역계약서",
    category: "IT/개발",
    description: "소프트웨어 개발 프로젝트를 위한 용역계약서",
    tags: ["개발", "용역", "IT", "프로젝트"],
    fields: [
      { id: "1", label: "프로젝트명", type: "text", required: true },
      { id: "2", label: "개발범위", type: "textarea", required: true },
      { id: "3", label: "계약금액", type: "number", required: true },
      { id: "4", label: "개발기간", type: "text", required: true },
      { id: "5", label: "납품일자", type: "date", required: true }
    ],
    content: `소프트웨어 개발 용역계약서...`
  },
  {
    id: "3",
    name: "비밀유지계약서(NDA)",
    category: "법무/보안",
    description: "기업 간 비밀정보 보호를 위한 NDA 템플릿",
    tags: ["NDA", "비밀유지", "보안"],
    fields: [
      { id: "1", label: "공개당사자", type: "text", required: true },
      { id: "2", label: "수령당사자", type: "text", required: true },
      { id: "3", label: "비밀정보 내용", type: "textarea", required: true },
      { id: "4", label: "유효기간", type: "text", required: true }
    ],
    content: `비밀유지계약서(NDA)...`
  }
];

export default function ContractTemplates() {
  const [templates, setTemplates] = useState<ContractTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<ContractTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ContractTemplate | null>(null);

  const categories = [
    { id: "hr", label: "인사/노무", icon: User },
    { id: "it", label: "IT/개발", icon: FileText },
    { id: "legal", label: "법무/보안", icon: Building },
    { id: "sales", label: "영업/판매", icon: DollarSign },
    { id: "rental", label: "임대/부동산", icon: Building }
  ];

  const createNewTemplate = () => {
    const newTemplate: ContractTemplate = {
      id: Date.now().toString(),
      name: "새 템플릿",
      category: "기타",
      description: "",
      fields: [],
      content: "",
      tags: []
    };
    setEditingTemplate(newTemplate);
    setIsCreating(true);
  };

  const addField = () => {
    if (!editingTemplate) return;
    
    const newField: TemplateField = {
      id: Date.now().toString(),
      label: "",
      type: "text",
      required: false
    };
    
    setEditingTemplate({
      ...editingTemplate,
      fields: [...editingTemplate.fields, newField]
    });
  };

  const updateField = (fieldId: string, updates: Partial<TemplateField>) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.map(f => 
        f.id === fieldId ? { ...f, ...updates } : f
      )
    });
  };

  const removeField = (fieldId: string) => {
    if (!editingTemplate) return;
    
    setEditingTemplate({
      ...editingTemplate,
      fields: editingTemplate.fields.filter(f => f.id !== fieldId)
    });
  };

  const saveTemplate = () => {
    if (!editingTemplate) return;
    
    if (isCreating) {
      setTemplates([...templates, editingTemplate]);
    } else {
      setTemplates(templates.map(t => 
        t.id === editingTemplate.id ? editingTemplate : t
      ));
    }
    
    setEditingTemplate(null);
    setIsCreating(false);
  };

  const duplicateTemplate = (template: ContractTemplate) => {
    const duplicated = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (복사본)`
    };
    setTemplates([...templates, duplicated]);
  };

  if (editingTemplate) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">
            {isCreating ? "템플릿 만들기" : "템플릿 편집"}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setEditingTemplate(null);
                setIsCreating(false);
              }}
            >
              취소
            </Button>
            <Button onClick={saveTemplate}>
              <Save className="w-4 h-4 mr-2" />
              저장
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-5 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>기본 정보</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>템플릿 이름</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      name: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>카테고리</Label>
                  <select
                    className="w-full border rounded-md p-2"
                    value={editingTemplate.category}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      category: e.target.value
                    })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.label}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>설명</Label>
                  <Textarea
                    value={editingTemplate.description}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      description: e.target.value
                    })}
                  />
                </div>
                <div>
                  <Label>태그 (쉼표로 구분)</Label>
                  <Input
                    value={editingTemplate.tags.join(", ")}
                    onChange={(e) => setEditingTemplate({
                      ...editingTemplate,
                      tags: e.target.value.split(",").map(t => t.trim()).filter(t => t)
                    })}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>입력 필드</CardTitle>
                  <Button size="sm" onClick={addField}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {editingTemplate.fields.map((field) => (
                    <div key={field.id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <Input
                          placeholder="필드 라벨"
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeField(field.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex gap-2">
                        <select
                          className="flex-1 border rounded-md p-1 text-sm"
                          value={field.type}
                          onChange={(e) => updateField(field.id, { 
                            type: e.target.value as TemplateField["type"] 
                          })}
                        >
                          <option value="text">텍스트</option>
                          <option value="number">숫자</option>
                          <option value="date">날짜</option>
                          <option value="textarea">긴 텍스트</option>
                          <option value="select">선택</option>
                        </select>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={field.required}
                            onCheckedChange={(checked) => 
                              updateField(field.id, { required: !!checked })
                            }
                          />
                          <Label className="text-sm">필수</Label>
                        </div>
                      </div>
                      <Input
                        placeholder="플레이스홀더"
                        value={field.placeholder || ""}
                        onChange={(e) => updateField(field.id, { 
                          placeholder: e.target.value 
                        })}
                        className="text-sm"
                      />
                    </div>
                  ))}
                  {editingTemplate.fields.length === 0 && (
                    <p className="text-center text-muted-foreground py-4">
                      필드를 추가하세요
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-7">
            <Card className="h-full">
              <CardHeader>
                <CardTitle>템플릿 내용</CardTitle>
                <p className="text-sm text-muted-foreground">
                  필드를 참조하려면 &#123;&#123;필드라벨&#125;&#125; 형식을 사용하세요
                </p>
              </CardHeader>
              <CardContent>
                <Textarea
                  className="min-h-[600px] font-mono text-sm"
                  value={editingTemplate.content}
                  onChange={(e) => setEditingTemplate({
                    ...editingTemplate,
                    content: e.target.value
                  })}
                  placeholder="계약서 내용을 입력하세요..."
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">계약서 템플릿</h2>
        <Button onClick={createNewTemplate}>
          <Plus className="w-4 h-4 mr-2" />
          새 템플릿 만들기
        </Button>
      </div>

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {template.description}
                  </p>
                </div>
                <Badge variant="outline">{template.category}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <List className="w-4 h-4" />
                  <span>{template.fields.length}개 입력 필드</span>
                </div>
                
                {template.tags.length > 0 && (
                  <div className="flex gap-2 flex-wrap">
                    {template.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button 
                    size="sm"
                    onClick={() => setSelectedTemplate(template)}
                  >
                    사용하기
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setEditingTemplate(template)}
                  >
                    편집
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => duplicateTemplate(template)}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
