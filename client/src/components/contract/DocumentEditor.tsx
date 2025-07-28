import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Calendar,
  Type, 
  Edit3, 
  Square, 
  Stamp,
  FileText,
  Users,
  Mail,
  User,
  MapPin,
  Phone,
  Building,
  CreditCard
} from "lucide-react";

interface SignatureField {
  id: string;
  type: "signature" | "initial" | "stamp" | "text" | "date" | "checkbox";
  x: number;
  y: number;
  width: number;
  height: number;
  page: number;
  assignedTo?: string;
  required: boolean;
  value?: string;
  label?: string;
}

interface Signer {
  id: string;
  email: string;
  name: string;
  role: string;
  color: string;
  fields: SignatureField[];
}

interface DocumentEditorProps {
  documentUrl: string;
  onSave: (signers: Signer[], fields: SignatureField[]) => void;
}

export default function DocumentEditor({ documentUrl, onSave }: DocumentEditorProps) {
  const [signers, setSigners] = useState<Signer[]>([
    {
      id: "1",
      email: "",
      name: "",
      role: "서명자 1",
      color: "#3B82F6",
      fields: []
    }
  ]);
  
  const [selectedSigner, setSelectedSigner] = useState<string>("1");
  const [selectedTool, setSelectedTool] = useState<string>("signature");
  const [fields, setFields] = useState<SignatureField[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages] = useState(3); // Mock value
  const documentRef = useRef<HTMLDivElement>(null);

  const tools = [
    { id: "signature", label: "서명", icon: Edit3 },
    { id: "initial", label: "이니셜", icon: Type },
    { id: "stamp", label: "도장", icon: Stamp },
    { id: "date", label: "날짜", icon: Calendar },
    { id: "text", label: "텍스트", icon: Type },
    { id: "checkbox", label: "체크박스", icon: Square }
  ];

  const predefinedRoles = [
    { id: "buyer", label: "구매자", icon: User },
    { id: "seller", label: "판매자", icon: Building },
    { id: "witness", label: "증인", icon: Users },
    { id: "notary", label: "공증인", icon: Stamp },
    { id: "guarantor", label: "보증인", icon: CreditCard }
  ];

  const addSigner = () => {
    const newSigner: Signer = {
      id: Date.now().toString(),
      email: "",
      name: "",
      role: `서명자 ${signers.length + 1}`,
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      fields: []
    };
    setSigners([...signers, newSigner]);
  };

  const updateSigner = (id: string, updates: Partial<Signer>) => {
    setSigners(signers.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const removeSigner = (id: string) => {
    if (signers.length > 1) {
      setSigners(signers.filter(s => s.id !== id));
      setFields(fields.filter(f => f.assignedTo !== id));
    }
  };

  const handleDocumentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!documentRef.current || !selectedSigner) return;

    const rect = documentRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const newField: SignatureField = {
      id: Date.now().toString(),
      type: selectedTool as SignatureField["type"],
      x,
      y,
      width: 15,
      height: 5,
      page: currentPage,
      assignedTo: selectedSigner,
      required: true,
      label: `${selectedTool} 필드`
    };

    setFields([...fields, newField]);
  };

  const removeField = (fieldId: string) => {
    setFields(fields.filter(f => f.id !== fieldId));
  };

  const handleSave = () => {
    const updatedSigners = signers.map(signer => ({
      ...signer,
      fields: fields.filter(f => f.assignedTo === signer.id)
    }));
    onSave(updatedSigners, fields);
  };

  return (
    <div className="grid grid-cols-12 gap-4 h-[calc(100vh-12rem)]">
      {/* Left Sidebar - Signers */}
      <div className="col-span-3 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">서명자 관리</h3>
            <ScrollArea className="h-[400px]">
              <div className="space-y-3">
                {signers.map((signer, index) => (
                  <div
                    key={signer.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                      selectedSigner === signer.id 
                        ? 'border-primary bg-primary/5' 
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedSigner(signer.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: signer.color }}
                        />
                        <span className="font-medium text-sm">{signer.role}</span>
                      </div>
                      {signers.length > 1 && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSigner(signer.id);
                          }}
                        >
                          ×
                        </Button>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Input
                        placeholder="이메일"
                        value={signer.email}
                        onChange={(e) => updateSigner(signer.id, { email: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <Input
                        placeholder="이름"
                        value={signer.name}
                        onChange={(e) => updateSigner(signer.id, { name: e.target.value })}
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {fields.filter(f => f.assignedTo === signer.id).length}개 필드
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <Button 
              className="w-full mt-3" 
              variant="outline"
              onClick={addSigner}
            >
              서명자 추가
            </Button>
          </CardContent>
        </Card>

        {/* Tools */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">서명 도구</h3>
            <div className="grid grid-cols-2 gap-2">
              {tools.map((tool) => (
                <Button
                  key={tool.id}
                  variant={selectedTool === tool.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTool(tool.id)}
                  className="flex flex-col gap-1 h-auto py-2"
                >
                  <tool.icon className="w-4 h-4" />
                  <span className="text-xs">{tool.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Center - Document Viewer */}
      <div className="col-span-6">
        <Card className="h-full">
          <CardContent className="p-4 h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">문서 미리보기</h3>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  이전
                </Button>
                <span className="text-sm px-3">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  다음
                </Button>
              </div>
            </div>
            
            <div 
              ref={documentRef}
              className="flex-1 bg-gray-100 rounded-lg relative overflow-hidden cursor-crosshair"
              onClick={handleDocumentClick}
              style={{
                backgroundImage: `url(${documentUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat'
              }}
            >
              {/* Mock PDF page */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white w-[90%] h-[95%] shadow-lg p-8">
                  <h2 className="text-2xl font-bold mb-4">계약서 샘플</h2>
                  <div className="space-y-4 text-gray-600">
                    <p>계약 당사자: _________________ (이하 "갑")</p>
                    <p>계약 상대방: _________________ (이하 "을")</p>
                    <p>계약 일자: _________________</p>
                    <div className="mt-8">
                      <p className="font-semibold">제1조 (목적)</p>
                      <p>본 계약은 갑과 을 사이의 ...</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Render fields */}
              {fields
                .filter(f => f.page === currentPage)
                .map((field) => {
                  const signer = signers.find(s => s.id === field.assignedTo);
                  return (
                    <div
                      key={field.id}
                      className="absolute border-2 rounded cursor-move hover:shadow-lg transition-shadow"
                      style={{
                        left: `${field.x}%`,
                        top: `${field.y}%`,
                        width: `${field.width}%`,
                        height: `${field.height}%`,
                        borderColor: signer?.color || '#ccc',
                        backgroundColor: `${signer?.color}20` || '#ccc20'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeField(field.id);
                      }}
                    >
                      <div className="text-xs p-1 text-center">
                        {field.label}
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Sidebar - Field Properties */}
      <div className="col-span-3 space-y-4">
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">필드 속성</h3>
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {fields.map((field) => {
                  const signer = signers.find(s => s.id === field.assignedTo);
                  return (
                    <div key={field.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <Badge 
                          style={{ backgroundColor: signer?.color }}
                          className="text-white"
                        >
                          {signer?.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeField(field.id)}
                        >
                          삭제
                        </Button>
                      </div>
                      <div className="space-y-2">
                        <Input
                          placeholder="필드 라벨"
                          value={field.label}
                          onChange={(e) => {
                            setFields(fields.map(f => 
                              f.id === field.id 
                                ? { ...f, label: e.target.value }
                                : f
                            ));
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => {
                              setFields(fields.map(f => 
                                f.id === field.id 
                                  ? { ...f, required: e.target.checked }
                                  : f
                              ));
                            }}
                          />
                          <Label className="text-sm">필수 입력</Label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4">서명 순서</h3>
            <div className="space-y-2">
              {signers.map((signer, index) => (
                <div key={signer.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">{signer.role}</p>
                    <p className="text-xs text-muted-foreground">{signer.email || "이메일 미입력"}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={signers.some(s => !s.email) || fields.length === 0}
          >
            저장 및 다음
          </Button>
        </div>
      </div>
    </div>
  );
}
