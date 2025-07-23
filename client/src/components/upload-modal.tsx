import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CloudUpload, X } from "lucide-react";
import { insertDocumentSchema, type InsertDocument } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth.tsx";
import { useToast } from "@/hooks/use-toast";
import { validateFileType, formatFileSize, generateFileHash } from "@/lib/crypto";

interface UploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function UploadModal({ open, onOpenChange }: UploadModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<InsertDocument>({
    resolver: zodResolver(insertDocumentSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "계약서",
      priority: "보통",
      originalFilename: "",
      fileType: "",
      fileSize: 0,
      uploadedBy: user?.id || 0,
    },
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: InsertDocument) => {
      const response = await apiRequest("POST", "/api/documents", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "업로드 완료",
        description: "문서가 성공적으로 업로드되고 블록체인에 기록되었습니다.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/documents"] });
      handleClose();
    },
    onError: (error: any) => {
      setError(error.message || "문서 업로드에 실패했습니다.");
    },
  });

  const handleFileSelect = (file: File) => {
    if (!validateFileType(file)) {
      setError("지원하지 않는 파일 형식입니다. PDF, DOC, DOCX, XLS, XLSX, PNG, JPG 파일만 업로드 가능합니다.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      setError("파일 크기는 10MB를 초과할 수 없습니다.");
      return;
    }

    setError(null);
    setSelectedFile(file);
    form.setValue("originalFilename", file.name);
    form.setValue("fileType", file.type);
    form.setValue("fileSize", file.size);
    
    // Auto-fill title if not set
    if (!form.getValues("title")) {
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      form.setValue("title", nameWithoutExt);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleClose = () => {
    form.reset();
    setSelectedFile(null);
    setError(null);
    setDragActive(false);
    onOpenChange(false);
  };

  const onSubmit = async (data: InsertDocument) => {
    if (!selectedFile) {
      setError("파일을 선택해주세요.");
      return;
    }

    setError(null);
    uploadMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            문서 업로드
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive 
                ? "border-primary bg-primary/10" 
                : selectedFile 
                  ? "border-green-500 bg-green-50"
                  : "border-gray-300 hover:border-primary/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              className="hidden"
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
            
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CloudUpload className="w-8 h-8 text-primary" />
            </div>
            
            {selectedFile ? (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">선택된 파일</p>
                <p className="text-sm text-gray-600 mb-2">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            ) : (
              <div>
                <p className="text-lg font-medium text-gray-900 mb-2">
                  파일을 드래그하거나 클릭하여 업로드
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  PDF, DOC, DOCX, XLS, XLSX, PNG, JPG 파일 지원 (최대 10MB)
                </p>
                <Button type="button" variant="outline">
                  파일 선택
                </Button>
              </div>
            )}
          </div>

          {/* Document Info Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>문서 제목</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="문서 제목을 입력하세요" 
                        {...field}
                        disabled={uploadMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>설명 (선택사항)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="문서에 대한 간단한 설명을 입력하세요" 
                        rows={3}
                        {...field}
                        disabled={uploadMutation.isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>카테고리</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={uploadMutation.isPending}>
                            <SelectValue placeholder="카테고리 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="계약서">계약서</SelectItem>
                          <SelectItem value="제안서">제안서</SelectItem>
                          <SelectItem value="동의서">동의서</SelectItem>
                          <SelectItem value="기타">기타</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>우선순위</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger disabled={uploadMutation.isPending}>
                            <SelectValue placeholder="우선순위 선택" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="보통">보통</SelectItem>
                          <SelectItem value="높음">높음</SelectItem>
                          <SelectItem value="긴급">긴급</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleClose}
                  disabled={uploadMutation.isPending}
                >
                  취소
                </Button>
                <Button 
                  type="submit"
                  disabled={!selectedFile || uploadMutation.isPending}
                >
                  {uploadMutation.isPending ? "업로드 중..." : "업로드 및 계속하기"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
