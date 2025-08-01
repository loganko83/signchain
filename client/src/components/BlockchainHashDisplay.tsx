import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Copy, 
  ExternalLink, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Hash,
  Clock
} from "lucide-react";

export interface BlockchainHashInfo {
  transactionHash: string;
  blockNumber?: number;
  network?: string;
  timestamp?: string;
  confirmations?: number;
  status?: 'pending' | 'confirmed' | 'failed';
  gasUsed?: string;
  gasFee?: string;
  type: 'document' | 'signature' | 'contract' | 'approval' | 'did' | 'payment' | 'auth';
}

interface BlockchainHashDisplayProps {
  hashInfo: BlockchainHashInfo;
  title?: string;
  showDetails?: boolean;
  compact?: boolean;
}

export const BlockchainHashDisplay: React.FC<BlockchainHashDisplayProps> = ({
  hashInfo,
  title,
  showDetails = true,
  compact = false
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyHash = async () => {
    try {
      await navigator.clipboard.writeText(hashInfo.transactionHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy hash:', err);
    }
  };

  const getExplorerUrl = (hash: string, network?: string) => {
    const networkUrls = {
      'xphere': `https://explorer.xphere.io/tx/${hash}`,
      'ethereum': `https://etherscan.io/tx/${hash}`,
      'polygon': `https://polygonscan.com/tx/${hash}`,
      'bsc': `https://bscscan.com/tx/${hash}`,
    };
    
    const networkKey = (network?.toLowerCase() || 'xphere') as keyof typeof networkUrls;
    return networkUrls[networkKey] || networkUrls.xphere;
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      document: Shield,
      signature: CheckCircle,
      contract: Hash,
      approval: CheckCircle,
      did: Shield,
      payment: Hash,
      auth: Shield
    };
    const IconComponent = icons[type as keyof typeof icons] || Hash;
    return <IconComponent className="w-4 h-4" />;
  };

  const getTypeLabel = (type: string) => {
    const labels = {
      document: '문서 등록',
      signature: '전자서명',
      contract: '계약서',
      approval: '결재',
      did: 'DID 인증',
      payment: '결제',
      auth: '인증'
    };
    return labels[type as keyof typeof labels] || '블록체인 기록';
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'confirmed': return <CheckCircle className="w-3 h-3" />;
      case 'pending': return <Clock className="w-3 h-3" />;
      case 'failed': return <AlertCircle className="w-3 h-3" />;
      default: return <Hash className="w-3 h-3" />;
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg border">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          {getTypeIcon(hashInfo.type)}
          <span>{getTypeLabel(hashInfo.type)}</span>
        </div>
        
        <div className="flex items-center gap-1 flex-1 min-w-0">
          <code className="text-xs font-mono text-gray-800 truncate">
            {hashInfo.transactionHash}
          </code>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyHash}
                >
                  {copied ? (
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{copied ? '복사됨!' : '해시 복사'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
          asChild
        >
          <a
            href={getExplorerUrl(hashInfo.transactionHash, hashInfo.network)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-blue-200 bg-blue-50/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          {getTypeIcon(hashInfo.type)}
          <span>{title || `${getTypeLabel(hashInfo.type)} 블록체인 증빙`}</span>
          {hashInfo.status && (
            <Badge variant="outline" className={getStatusColor(hashInfo.status)}>
              {getStatusIcon(hashInfo.status)}
              <span className="ml-1 capitalize">
                {hashInfo.status === 'confirmed' ? '확인됨' : 
                 hashInfo.status === 'pending' ? '대기중' : '실패'}
              </span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* 트랜잭션 해시 */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">트랜잭션 해시</label>
          <div className="flex items-center gap-2 p-2 bg-white rounded-md border">
            <code className="flex-1 text-xs font-mono text-gray-800 break-all">
              {hashInfo.transactionHash}
            </code>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0"
                    onClick={handleCopyHash}
                  >
                    {copied ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copied ? '복사됨!' : '해시 복사'}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {showDetails && (
          <>
            {/* 상세 정보 */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {hashInfo.blockNumber && (
                <div>
                  <label className="font-medium text-gray-600">블록 번호</label>
                  <p className="font-mono">{hashInfo.blockNumber.toLocaleString()}</p>
                </div>
              )}
              
              {hashInfo.network && (
                <div>
                  <label className="font-medium text-gray-600">네트워크</label>
                  <p className="capitalize">{hashInfo.network}</p>
                </div>
              )}
              
              {hashInfo.confirmations && (
                <div>
                  <label className="font-medium text-gray-600">확인 횟수</label>
                  <p>{hashInfo.confirmations}</p>
                </div>
              )}
              
              {hashInfo.timestamp && (
                <div>
                  <label className="font-medium text-gray-600">타임스탬프</label>
                  <p>{new Date(hashInfo.timestamp).toLocaleString('ko-KR')}</p>
                </div>
              )}
              
              {hashInfo.gasUsed && (
                <div>
                  <label className="font-medium text-gray-600">가스 사용량</label>
                  <p className="font-mono">{hashInfo.gasUsed}</p>
                </div>
              )}
              
              {hashInfo.gasFee && (
                <div>
                  <label className="font-medium text-gray-600">가스비</label>
                  <p className="font-mono">{hashInfo.gasFee}</p>
                </div>
              )}
            </div>

            {/* 블록체인 익스플로러 링크 */}
            <div className="pt-2 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                asChild
              >
                <a
                  href={getExplorerUrl(hashInfo.transactionHash, hashInfo.network)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  블록체인 익스플로러에서 확인
                </a>
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default BlockchainHashDisplay;
