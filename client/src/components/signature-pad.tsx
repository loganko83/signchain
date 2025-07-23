import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RotateCcw, Eye } from "lucide-react";

interface SignaturePadProps {
  signatureType: string;
  onSignatureChange: (signature: string) => void;
}

export default function SignaturePad({ signatureType, onSignatureChange }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [textSignature, setTextSignature] = useState("");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 128;

    // Set drawing styles
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (signatureType !== "draw") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || signatureType !== "draw") return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    captureSignature();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onSignatureChange("");
  };

  const captureSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const dataURL = canvas.toDataURL();
    onSignatureChange(dataURL);
  };

  const handleTextSignature = (text: string) => {
    setTextSignature(text);
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if (text) {
      // Draw text signature
      ctx.font = "32px cursive";
      ctx.fillStyle = "#000000";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, canvas.width / 2, canvas.height / 2);
      
      const dataURL = canvas.toDataURL();
      onSignatureChange(dataURL);
    } else {
      onSignatureChange("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Calculate scaling to fit image in canvas
        const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
        const x = (canvas.width - img.width * scale) / 2;
        const y = (canvas.height - img.height * scale) / 2;
        
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
        
        const dataURL = canvas.toDataURL();
        onSignatureChange(dataURL);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      {signatureType === "draw" && (
        <div>
          <canvas
            ref={canvasRef}
            className="w-full h-32 bg-white border border-gray-200 rounded cursor-crosshair signature-canvas"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
          <div className="flex justify-between mt-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearCanvas}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              지우기
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={captureSignature}
            >
              <Eye className="w-4 h-4 mr-1" />
              미리보기
            </Button>
          </div>
        </div>
      )}

      {signatureType === "type" && (
        <div>
          <Input
            placeholder="서명을 입력하세요"
            value={textSignature}
            onChange={(e) => handleTextSignature(e.target.value)}
            className="mb-2"
          />
          <canvas
            ref={canvasRef}
            className="w-full h-32 bg-white border border-gray-200 rounded"
          />
        </div>
      )}

      {signatureType === "upload" && (
        <div>
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="mb-2"
          />
          <canvas
            ref={canvasRef}
            className="w-full h-32 bg-white border border-gray-200 rounded"
          />
        </div>
      )}
    </div>
  );
}
