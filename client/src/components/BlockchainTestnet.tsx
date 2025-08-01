import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  getTestnetStatus, 
  getAvailableNetworks, 
  sendTestTransaction,
  getNetworkName,
  formatAddress,
  formatBalance,
  type TestnetStatus,
  type NetworkInfo
} from '../lib/blockchain-testnet';
import { Loader2, CheckCircle, XCircle, ExternalLink, Zap } from 'lucide-react';

export function BlockchainTestnet() {
  const [status, setStatus] = useState<TestnetStatus | null>(null);
  const [networks, setNetworks] = useState<NetworkInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [testingNetwork, setTestingNetwork] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statusData, networksData] = await Promise.all([
        getTestnetStatus(),
        getAvailableNetworks()
      ]);
      setStatus(statusData);
      setNetworks(networksData);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Failed to fetch blockchain data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTestTransaction = async (network: string) => {
    setTestingNetwork(network);
    try {
      const result = await sendTestTransaction(network);
      console.log('Test transaction result:', result);
      // Refresh status after test
      await fetchData();
    } catch (error) {
      console.error('Test transaction failed:', error);
    } finally {
      setTestingNetwork(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading && !status) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="ml-2">Loading blockchain status...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Blockchain Testnet Status
            </CardTitle>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchData}
                disabled={loading}
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Object.entries(status || {}).map(([networkKey, networkStatus]) => (
              <Card key={networkKey} className="border-l-4 border-l-blue-500">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {getNetworkName(networkKey)}
                    </CardTitle>
                    <Badge variant={networkStatus.connected ? "default" : "destructive"}>
                      {networkStatus.connected ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {networkStatus.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Chain ID:</span>
                      <p className="text-gray-600">{networkStatus.config.chainId}</p>
                    </div>
                    <div>
                      <span className="font-medium">Gas Price:</span>
                      <p className="text-gray-600">{networkStatus.config.gasPrice} GWEI</p>
                    </div>
                  </div>

                  {networkStatus.connected ? (
                    <div className="space-y-2">
                      {networkStatus.blockNumber && (
                        <div>
                          <span className="font-medium text-sm">Block:</span>
                          <p className="text-gray-600">{networkStatus.blockNumber.toLocaleString()}</p>
                        </div>
                      )}
                      {networkStatus.walletAddress && (
                        <div>
                          <span className="font-medium text-sm">Wallet:</span>
                          <p className="text-gray-600 font-mono text-xs">
                            {formatAddress(networkStatus.walletAddress)}
                          </p>
                        </div>
                      )}
                      {networkStatus.balance !== undefined && (
                        <div>
                          <span className="font-medium text-sm">Balance:</span>
                          <p className="text-gray-600">{formatBalance(networkStatus.balance)} ETH</p>
                        </div>
                      )}
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleTestTransaction(networkKey)}
                          disabled={testingNetwork === networkKey}
                        >
                          {testingNetwork === networkKey ? (
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                          ) : (
                            <Zap className="h-3 w-3 mr-1" />
                          )}
                          Test TX
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          asChild
                        >
                          <a 
                            href={networkStatus.config.explorerUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Explorer
                          </a>
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                      <span className="font-medium">Error:</span>
                      <p className="text-xs mt-1">{networkStatus.error}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
