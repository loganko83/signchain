import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, CheckCircle, Clock, Shield } from "lucide-react";
import { Document } from "@shared/schema";

interface DocumentViewerProps {
  document: Document;
  signatureData?: string;
}

export default function DocumentViewer({ document, signatureData }: DocumentViewerProps) {
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) return 'text-red-500';
    if (fileType.includes('word')) return 'text-blue-500';
    if (fileType.includes('excel')) return 'text-green-500';
    if (fileType.includes('image')) return 'text-purple-500';
    return 'text-gray-500';
  };

  return (
    <Card className="h-full">
      <CardContent className="p-0">
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <FileText className={`w-6 h-6 ${getFileIcon(document.fileType)}`} />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{document.title}</h2>
                <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                  <span>{document.category}</span>
                  <span>•</span>
                  <span>{document.originalFilename}</span>
                  <span>•</span>
                  <span>{(document.fileSize / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            </div>
            <Badge 
              variant={document.status === "서명 완료" ? "default" : "secondary"}
              className={document.status === "서명 완료" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}
            >
              {document.status === "서명 완료" ? (
                <CheckCircle className="w-3 h-3 mr-1" />
              ) : (
                <Clock className="w-3 h-3 mr-1" />
              )}
              {document.status}
            </Badge>
          </div>
        </div>

        <ScrollArea className="h-[600px]">
          <div className="p-8">
            <div className="bg-white rounded-lg shadow-sm p-8 max-w-4xl mx-auto" style={{ minHeight: '800px' }}>
              {/* Mock Document Content - Replace with actual document viewer */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-4">{document.title}</h1>
                <p className="text-sm text-gray-600">
                  생성일: {document.createdAt ? new Date(document.createdAt).toLocaleDateString('ko-KR') : ''}
                </p>
              </div>

              <div className="space-y-6 text-sm text-gray-700 leading-relaxed">
                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">제 1 조 (목적)</h2>
                  <p>본 계약은 디지털 서명 및 문서 관리와 관련하여 상호 간에 제공하거나 취득하게 되는 정보의 보호를 목적으로 합니다.</p>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">제 2 조 (서명의 정의)</h2>
                  <p>본 계약에서 "디지털 서명"이라 함은 다음 각 호의 내용을 말합니다:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>블록체인 기반 암호화된 서명 데이터</li>
                    <li>서명자의 신원을 확인할 수 있는 정보</li>
                    <li>문서의 무결성을 보장하는 해시값</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">제 3 조 (블록체인 기록)</h2>
                  <p>모든 서명은 Xphere 블록체인에 기록되며 다음과 같은 특징을 가집니다:</p>
                  <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                    <li>불변성: 일단 기록된 서명은 변경할 수 없음</li>
                    <li>투명성: 모든 당사자가 서명 기록을 확인할 수 있음</li>
                    <li>검증 가능성: 언제든지 서명의 유효성을 검증할 수 있음</li>
                  </ul>
                </section>

                {/* Signature Areas */}
                <div className="mt-12 pt-8 border-t-2 border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">갑 (문서 제공자)</h3>
                      <p className="text-sm text-gray-600 mb-2">시스템: SignChain</p>
                      <p className="text-sm text-gray-600 mb-4">관리자: 시스템 관리자</p>
                      <div className="border-2 border-gray-300 rounded-lg p-4 h-24 flex items-center justify-center bg-gray-50">
                        <span className="text-gray-500 text-sm">시스템 서명 완료</span>
                        <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-gray-900 mb-4">을 (서명자)</h3>
                      <p className="text-sm text-gray-600 mb-2">이름: 서명 요청자</p>
                      <p className="text-sm text-gray-600 mb-4">이메일: 요청된 이메일</p>
                      <div className={`border-2 rounded-lg p-4 h-24 flex items-center justify-center transition-colors ${
                        signatureData 
                          ? "border-green-500 bg-green-50" 
                          : "border-primary bg-primary/5 cursor-pointer hover:bg-primary/10"
                      }`}>
                        {signatureData ? (
                          <div className="flex items-center">
                            <span className="text-green-600 text-sm font-medium">서명 완료</span>
                            <CheckCircle className="w-4 h-4 text-green-500 ml-2" />
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <span className="text-primary text-sm font-medium">서명이 필요합니다</span>
                            <Clock className="w-4 h-4 text-primary ml-2" />
                          </div>
                        )}
                      </div>
                      
                      {/* Show signature preview if available */}
                      {signatureData && (
                        <div className="mt-4 p-2 border border-gray-200 rounded-lg bg-white">
                          <img 
                            src={signatureData} 
                            alt="서명 미리보기" 
                            className="max-w-full h-16 object-contain mx-auto"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Blockchain Info */}
                {document.blockchainTxHash && (
                  <div className="mt-8 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="w-4 h-4 text-purple-500" />
                      <span className="font-medium text-purple-900">블록체인 검증 정보</span>
                    </div>
                    <div className="text-xs text-purple-700 space-y-1">
                      <div className="flex justify-between">
                        <span>문서 해시:</span>
                        <span className="font-mono">{document.fileHash.slice(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>트랜잭션 해시:</span>
                        <span className="font-mono">{document.blockchainTxHash.slice(0, 16)}...</span>
                      </div>
                      <div className="flex justify-between">
                        <span>타임스탬프:</span>
                        <span>{document.createdAt ? new Date(document.createdAt).toLocaleString('ko-KR') : ''}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
