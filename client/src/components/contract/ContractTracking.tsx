import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  CheckCircle2, 
  Circle, 
  Clock, 
  FileText,
  Download,
  Eye,
  Mail,
  Shield,
  AlertCircle,
  User,
  Calendar,
  Building,
  Hash,
  Link2,
  ExternalLink,
  Share2
} from "lucide-react";
import { format } from "date-fns";

interface TrackingData {
  contractId: string;
  title: string;
  status: "draft" | "sent" | "viewed" | "signing" | "completed" | "expired" | "declined";
  createdAt: string;
  expiresAt?: string;
  documentHash: string;
  blockchainTxHash?: string;
  signers: {
    id: string;
    email: string;
    name: string;
    role: string;
    status: "pending" | "sent" | "viewed" | "signed" | "declined";
    signedAt?: string;
    viewedAt?: string;
    ipAddress?: string;
    device?: string;
  }[];
  timeline: {
    id: string;
    action: string;
    actor: string;
    timestamp: string;
    details?: string;
    ipAddress?: string;
  }[];
  reminders: {
    sentAt: string;
    sentTo: string[];
    type: "auto" | "manual";
  }[];
}

interface ContractTrackingProps {
  trackingData: TrackingData;
  onSendReminder: (signerIds: string[]) => void;
  onDownload: () => void;
  onView: () => void;
}

export default function ContractTracking({ 
  trackingData, 
  onSendReminder, 
  onDownload, 
  onView 
}: ContractTrackingProps) {
  const [selectedSigners, setSelectedSigners] = useState<string[]>([]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-500";
      case "signing": return "bg-blue-500";
      case "viewed": return "bg-yellow-500";
      case "sent": return "bg-orange-500";
      case "declined": return "bg-red-500";
      case "expired": return "bg-gray-500";
      default: return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "draft": return "초안";
      case "sent": return "발송됨";
      case "viewed": return "열람됨";
      case "signing": return "서명 중";
      case "completed": return "완료";
      case "expired": return "만료됨";
      case "declined": return "거절됨";
      case "pending": return "대기중";
      case "signed": return "서명 완료";
      default: return status;
    }
  };

  const getProgressPercentage = () => {
    const signedCount = trackingData.signers.filter(s => s.status === "signed").length;
    return (signedCount / trackingData.signers.length) * 100;
  };

  const toggleSignerSelection = (signerId: string) => {
    setSelectedSigners(prev => 
      prev.includes(signerId) 
        ? prev.filter(id => id !== signerId)
        : [...prev, signerId]
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{trackingData.title}</CardTitle>
              <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  생성일: {format(new Date(trackingData.createdAt), "yyyy-MM-dd HH:mm")}
                </span>
                {trackingData.expiresAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    만료일: {format(new Date(trackingData.expiresAt), "yyyy-MM-dd")}
                  </span>
                )}
              </div>
            </div>
            <Badge className={`${getStatusColor(trackingData.status)} text-white`}>
              {getStatusText(trackingData.status)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>서명 진행률</span>
              <span className="font-medium">
                {trackingData.signers.filter(s => s.status === "signed").length} / {trackingData.signers.length}
              </span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              문서 보기
            </Button>
            {trackingData.status === "completed" && (
              <Button size="sm" onClick={onDownload}>
                <Download className="w-4 h-4 mr-2" />
                최종본 다운로드
              </Button>
            )}
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => onSendReminder(selectedSigners)}
              disabled={selectedSigners.length === 0}
            >
              <Mail className="w-4 h-4 mr-2" />
              리마인더 발송 ({selectedSigners.length})
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signers Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">서명자 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {trackingData.signers.map((signer) => (
              <div key={signer.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedSigners.includes(signer.id)}
                      onChange={() => toggleSignerSelection(signer.id)}
                      disabled={signer.status === "signed"}
                      className="mt-1"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        {signer.status === "signed" ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                        <span className="font-medium">{signer.name || signer.email}</span>
                        <Badge variant="outline" className="text-xs">
                          {signer.role}
                        </Badge>
                      </div>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-muted-foreground">{signer.email}</p>
                        {signer.viewedAt && (
                          <p className="text-xs text-muted-foreground">
                            열람: {format(new Date(signer.viewedAt), "yyyy-MM-dd HH:mm")}
                          </p>
                        )}
                        {signer.signedAt && (
                          <p className="text-xs text-green-600">
                            서명: {format(new Date(signer.signedAt), "yyyy-MM-dd HH:mm")}
                          </p>
                        )}
                        {signer.ipAddress && (
                          <p className="text-xs text-muted-foreground">
                            IP: {signer.ipAddress} {signer.device && `• ${signer.device}`}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant={signer.status === "signed" ? "default" : "secondary"}>
                    {getStatusText(signer.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">활동 기록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {trackingData.timeline.map((event, index) => (
                <div key={event.id} className="flex gap-4">
                  <div className="relative">
                    <div className="w-4 h-4 rounded-full bg-background border-2 border-primary" />
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="font-medium text-sm">{event.action}</p>
                    <p className="text-sm text-muted-foreground">{event.actor}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(event.timestamp), "yyyy-MM-dd HH:mm:ss")}
                      {event.ipAddress && ` • IP: ${event.ipAddress}`}
                    </p>
                    {event.details && (
                      <p className="text-sm mt-1">{event.details}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blockchain Info */}
      {trackingData.blockchainTxHash && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="w-5 h-5" />
              블록체인 정보
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">문서 해시</p>
                <p className="font-mono text-xs mt-1">{trackingData.documentHash}</p>
              </div>
              <div>
                <p className="text-muted-foreground">트랜잭션 해시</p>
                <p className="font-mono text-xs mt-1">{trackingData.blockchainTxHash}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <ExternalLink className="w-4 h-4 mr-2" />
                익스플로러에서 보기
              </Button>
              <Button size="sm" variant="outline">
                <Shield className="w-4 h-4 mr-2" />
                검증하기
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reminders */}
      {trackingData.reminders.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">리마인더 발송 기록</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trackingData.reminders.map((reminder, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div>
                    <p>{reminder.sentTo.join(", ")}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(reminder.sentAt), "yyyy-MM-dd HH:mm")}
                    </p>
                  </div>
                  <Badge variant="outline">
                    {reminder.type === "auto" ? "자동" : "수동"}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
