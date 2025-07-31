import { BlockchainTestnet } from '@/components/BlockchainTestnet';

export default function BlockchainTestnetPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Blockchain Testnet</h1>
          <p className="text-gray-500 mt-2">
            Monitor testnet connections and perform blockchain operations
          </p>
        </div>
      </div>
      
      <BlockchainTestnet />
      
      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">About Testnet Integration</h3>
        <p className="text-blue-700 text-sm">
          This system connects to multiple blockchain testnets for document verification and digital signatures. 
          Currently supporting Polygon Mumbai, Ethereum Sepolia, and BSC Testnet networks.
        </p>
      </div>
    </div>
  );
}
