import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { PenTool, Type, RotateCcw, Check } from "lucide-react";

interface SignaturePadProps {
  onSignatureComplete: (signatureData: string, signatureType: "canvas" | "text") => void;
  onCancel: () => void;
}

export default function SignaturePad({ onSignatureComplete, onCancel }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textSignature, setTextSignature] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [canvasSignature, setCanvasSignature] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = 400;
    canvas.height = 200;

    // Set drawing style
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Fill with white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;

    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Save signature as base64
    const dataURL = canvas.toDataURL();
    setCanvasSignature(dataURL);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setCanvasSignature("");
  };

  const handleCanvasSignature = () => {
    if (!canvasSignature) {
      alert("서명을 먼저 그려주세요.");
      return;
    }
    onSignatureComplete(canvasSignature, "canvas");
  };

  const handleTextSignature = () => {
    if (!textSignature.trim()) {
      alert("서명 텍스트를 입력해주세요.");
      return;
    }
    onSignatureComplete(textSignature, "text");
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5" />
          디지털 서명
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label htmlFor="signerName">서명자 이름</Label>
            <Input
              id="signerName"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="서명자 이름을 입력하세요"
            />
          </div>

          <Tabs defaultValue="canvas" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="canvas" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                손글씨 서명
              </TabsTrigger>
              <TabsTrigger value="text" className="flex items-center gap-2">
                <Type className="h-4 w-4" />
                텍스트 서명
              </TabsTrigger>
            </TabsList>

            <TabsContent value="canvas" className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <canvas
                  ref={canvasRef}
                  className="border border-gray-200 rounded cursor-crosshair bg-white"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={clearCanvas}
                    className="flex items-center gap-1"
                  >
                    <RotateCcw className="h-4 w-4" />
                    다시 그리기
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCanvasSignature} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  서명 완료
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  취소
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="text" className="space-y-4">
              <div>
                <Label htmlFor="textSignature">서명 텍스트</Label>
                <Textarea
                  id="textSignature"
                  value={textSignature}
                  onChange={(e) => setTextSignature(e.target.value)}
                  placeholder="서명으로 사용할 텍스트를 입력하세요 (예: 홍길동)"
                  className="font-serif text-lg"
                />
              </div>
              {textSignature && (
                <div className="p-4 border rounded-lg bg-gray-50">
                  <Label>서명 미리보기:</Label>
                  <div className="text-2xl font-serif italic mt-2 text-center py-4 border-b-2 border-black">
                    {textSignature}
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <Button onClick={handleTextSignature} className="flex-1">
                  <Check className="h-4 w-4 mr-2" />
                  서명 완료
                </Button>
                <Button variant="outline" onClick={onCancel}>
                  취소
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  );
}