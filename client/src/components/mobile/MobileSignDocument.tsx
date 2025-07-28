import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { 
  FileText, 
  Edit3, 
  Check, 
  Menu,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  FileSignature,
  User,
  Calendar,
  AlertCircle,
  Shield,
  List,
  X,
  Upload,
  Camera
} from "lucide-react";

interface SignatureField {
  id: string;
  type: "signature" | "initial" | "stamp" | "text" | "date" | "checkbox";
  page: number;
  x: number;
  y: number;
  width: number;
  height: number;
  value?: string;
  required: boolean;
  label: string;
  completed: boolean;
}

interface MobileSignDocumentProps {
  contractData: {
    id: string;
    title: string;
    description: string;
    totalPages: number;
    fields: SignatureField[];
    signerInfo: {
      name: string;
      email: string;
      role: string;
    };
    expiresAt: string;
  };
  onFieldUpdate: (fieldId: string, value: string) => void;
  onSubmit: () => void;
}

export default function MobileSignDocument({ 
  contractData, 
  onFieldUpdate, 
  onSubmit 
}: MobileSignDocumentProps) {
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [zoom, setZoom] = useState(100);
  const [activeField, setActiveField] = useState<string | null>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [signatureType, setSignatureType] = useState<"draw" | "type" | "camera">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const [lastTouch, setLastTouch] = useState<{ x: number; y: number } | null>(null);
  const [showFieldList, setShowFieldList] = useState(false);
  
  // Touch events for drawing
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    
    setIsDrawing(true);
    setLastTouch({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing || !canvasRef.current) return;
    
    const touch = e.touches[0];
    const rect = canvasRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    
    setLastTouch({ x, y });
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    setLastTouch(null);
  };

  const clearSignature = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  const getFieldsForCurrentPage = () => {
    return contractData.fields.filter(f => f.page === currentPage);
  };

  const getProgress = () => {
    const completed = contractData.fields.filter(f => f.completed).length;
    return (completed / contractData.fields.length) * 100;
  };

  const isAllFieldsCompleted = () => {
    return contractData.fields.every(f => !f.required || f.completed);
  };

  const handleFieldClick = (field: SignatureField) => {
    setActiveField(field.id);
    if (field.type === "signature" || field.type === "initial") {
      setShowSignatureModal(true);
    }
  };

  const handleSignatureComplete = () => {
    if (!activeField || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL();
    onFieldUpdate(activeField, dataUrl);
    
    setShowSignatureModal(false);
    clearSignature();
  };

  const jumpToField = (field: SignatureField) => {
    setCurrentPage(field.page);
    setActiveField(field.id);
    setShowFieldList(false);
    
    // Scroll to field
    setTimeout(() => {
      const element = document.getElementById(`field-${field.id}`);
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Mobile Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sheet>
                <SheetTrigger asChild>
                  <Button size="icon" variant="ghost">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                  <SheetHeader>
                    <SheetTitle>서명 필드</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-2">
                    {contractData.fields.map((field) => (
                      <div
                        key={field.id}
                        className={`p-3 rounded-lg border ${
                          field.completed 
                            ? 'bg-green-50 border-green-200' 
                            : 'bg-white'
                        }`}
                        onClick={() => jumpToField(field)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {field.completed ? (
                              <Check className="w-4 h-4 text-green-600" />
                            ) : (
                              <div className="w-4 h-4 border rounded" />
                            )}
                            <span className="text-sm">{field.label}</span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {field.page}쪽
                          </Badge>
                        </div>
                        {field.required && !field.completed && (
                          <p className="text-xs text-red-500 mt-1 ml-6">필수</p>
                        )}
                      </div>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
              
              <div>
                <h1 className="text-sm font-semibold line-clamp-1">
                  {contractData.title}
                </h1>
                <p className="text-xs text-muted-foreground">
                  {contractData.signerInfo.name} ({contractData.signerInfo.role})
                </p>
              </div>
            </div>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowFieldList(!showFieldList)}
            >
              <List className="h-4 w-4" />
              <span className="ml-1 text-xs">
                {contractData.fields.filter(f => f.completed).length}/{contractData.fields.length}
              </span>
            </Button>
          </div>
        </div>
        
        {/* Progress Bar */}
        <Progress value={getProgress()} className="h-1" />
      </div>

      {/* Document Viewer */}
      <div className="px-4 py-4">
        {/* Page Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <span className="text-sm font-medium">
            페이지 {currentPage} / {contractData.totalPages}
          </span>
          
          <Button
            size="sm"
            variant="outline"
            disabled={currentPage === contractData.totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Document Content */}
        <Card className="overflow-hidden">
          <div 
            className="bg-white p-6 min-h-[600px] relative"
            style={{ fontSize: `${zoom}%` }}
          >
            {/* Mock Document Content */}
            <h2 className="text-lg font-bold mb-4">서비스 이용 계약서</h2>
            <div className="space-y-3 text-sm">
              <p className="font-semibold">제{currentPage}조</p>
              <p>본 계약은 서비스 제공자와 이용자 간의...</p>
            </div>

            {/* Render Fields for Current Page */}
            {getFieldsForCurrentPage().map((field) => (
              <div
                key={field.id}
                id={`field-${field.id}`}
                className={`absolute border-2 rounded p-2 ${
                  field.completed 
                    ? 'border-green-500 bg-green-50' 
                    : 'border-blue-500 bg-blue-50'
                } ${activeField === field.id ? 'ring-2 ring-blue-400' : ''}`}
                style={{
                  left: `${field.x}%`,
                  top: `${field.y}%`,
                  width: `${field.width}%`,
                  minHeight: '40px'
                }}
                onClick={() => handleFieldClick(field)}
              >
                {field.completed ? (
                  <div className="text-xs text-center">
                    {field.type === "signature" || field.type === "initial" ? (
                      <img src={field.value} alt="Signature" className="h-full w-full object-contain" />
                    ) : (
                      field.value
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-blue-600 text-center">
                    {field.label}
                    {field.required && " *"}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center gap-4 mt-4">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.max(75, zoom - 25))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{zoom}%</span>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setZoom(Math.min(150, zoom + 25))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Checkbox
            checked={agreedToTerms}
            onCheckedChange={(checked) => setAgreedToTerms(!!checked)}
          />
          <Label className="text-xs">
            전자서명이 수기 서명과 동일한 법적 효력을 가짐을 이해하고 동의합니다.
          </Label>
        </div>
        
        <Button 
          className="w-full" 
          onClick={onSubmit}
          disabled={!isAllFieldsCompleted() || !agreedToTerms}
        >
          <FileSignature className="w-4 h-4 mr-2" />
          서명 완료하기
        </Button>
      </div>

      {/* Mobile Signature Modal */}
      {showSignatureModal && (
        <div className="fixed inset-0 bg-black/50 flex items-end z-50">
          <Card className="w-full rounded-t-2xl rounded-b-none">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">서명하기</CardTitle>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowSignatureModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="pb-8">
              {/* Signature Type Selector */}
              <div className="flex gap-2 mb-4">
                <Button
                  size="sm"
                  variant={signatureType === "draw" ? "default" : "outline"}
                  onClick={() => setSignatureType("draw")}
                  className="flex-1"
                >
                  <Edit3 className="h-4 w-4 mr-1" />
                  그리기
                </Button>
                <Button
                  size="sm"
                  variant={signatureType === "type" ? "default" : "outline"}
                  onClick={() => setSignatureType("type")}
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-1" />
                  타이핑
                </Button>
                <Button
                  size="sm"
                  variant={signatureType === "camera" ? "default" : "outline"}
                  onClick={() => setSignatureType("camera")}
                  className="flex-1"
                >
                  <Camera className="h-4 w-4 mr-1" />
                  카메라
                </Button>
              </div>

              {/* Signature Input */}
              {signatureType === "draw" && (
                <div className="space-y-3">
                  <div className="border-2 border-gray-200 rounded-lg overflow-hidden">
                    <canvas
                      ref={canvasRef}
                      width={350}
                      height={150}
                      className="w-full bg-white touch-none"
                      onTouchStart={handleTouchStart}
                      onTouchMove={handleTouchMove}
                      onTouchEnd={handleTouchEnd}
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearSignature}
                    className="w-full"
                  >
                    지우기
                  </Button>
                </div>
              )}

              {signatureType === "type" && (
                <Input
                  placeholder="서명을 입력하세요"
                  className="text-2xl h-16 font-script text-center"
                  autoFocus
                />
              )}

              {signatureType === "camera" && (
                <div className="space-y-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Camera className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <p className="text-sm text-muted-foreground mb-3">
                      서명을 촬영하세요
                    </p>
                    <Input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      id="camera-input"
                    />
                    <Label htmlFor="camera-input">
                      <Button size="sm" variant="outline" asChild>
                        <span>카메라 열기</span>
                      </Button>
                    </Label>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setShowSignatureModal(false)}
                  className="flex-1"
                >
                  취소
                </Button>
                <Button
                  onClick={handleSignatureComplete}
                  className="flex-1"
                >
                  확인
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}