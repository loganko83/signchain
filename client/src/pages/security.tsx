import { useAuth } from "@/lib/auth.tsx";
import SecuritySettings from "@/components/security-settings";

export default function SecurityPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">로그인이 필요합니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">보안 설정</h1>
          <p className="text-muted-foreground mt-2">
            계정의 보안을 강화하고 인증 방법을 관리하세요
          </p>
        </div>
        
        <SecuritySettings userId={user.id} />
      </div>
    </div>
  );
}