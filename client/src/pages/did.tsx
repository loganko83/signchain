import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DIDOverview } from "@/components/did/DIDOverview";
import { DIDManager } from "@/components/did/DIDManager";
import { VerifiableCredentials } from "@/components/did/VerifiableCredentials";
import { DIDWallet } from "@/components/did/DIDWallet";
import { PresentationExchange } from "@/components/did/PresentationExchange";
import { DIDResolver } from "@/components/did/DIDResolver";
import { MicrosoftIONManager } from "@/components/did/MicrosoftIONManager";
import { useAuth } from "@/lib/auth";

export default function DIDModule() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">W3C DID 모듈</h1>
          <p className="text-gray-600 mt-2">
            Microsoft ION 네트워크 기반 탈중앙화 신원(Decentralized Identifiers) 관리 시스템
          </p>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="ion">Microsoft ION</TabsTrigger>
            <TabsTrigger value="manager">DID 관리</TabsTrigger>
            <TabsTrigger value="credentials">자격증명</TabsTrigger>
            <TabsTrigger value="wallet">지갑</TabsTrigger>
            <TabsTrigger value="exchange">증명 교환</TabsTrigger>
            <TabsTrigger value="resolver">Resolver</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DIDOverview />
          </TabsContent>

          <TabsContent value="ion">
            <MicrosoftIONManager />
          </TabsContent>

          <TabsContent value="manager">
            <DIDManager />
          </TabsContent>

          <TabsContent value="credentials">
            <VerifiableCredentials />
          </TabsContent>

          <TabsContent value="wallet">
            <DIDWallet />
          </TabsContent>

          <TabsContent value="exchange">
            <PresentationExchange />
          </TabsContent>

          <TabsContent value="resolver">
            <DIDResolver />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}