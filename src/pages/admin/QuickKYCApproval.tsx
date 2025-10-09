import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { toast } from 'sonner';
import { useWalletClient, useAccount } from 'wagmi';
import { CheckCircle2, Loader2, AlertCircle, Copy } from 'lucide-react';
import { encodeFunctionData } from 'viem';
import { supabase } from '@/integrations/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';

const KYC_REGISTRY_ABI = [
  {
    inputs: [
      { internalType: 'address', name: 'user', type: 'address' },
      { internalType: 'bool', name: 'approved', type: 'bool' }
    ],
    name: 'setKYCStatus',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  }
] as const;

export default function QuickKYCApproval() {
  const [kycRegistryAddress, setKycRegistryAddress] = useState('');
  const [walletToApprove, setWalletToApprove] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { data: walletClient } = useWalletClient();
  const { isConnected, address } = useAccount();

  // Auto-load KYC Registry address from database
  useEffect(() => {
    const loadKYCRegistry = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('kyc_registry_address')
          .not('kyc_registry_address', 'is', null)
          .limit(1)
          .single();

        if (error) throw error;

        if (data?.kyc_registry_address) {
          setKycRegistryAddress(data.kyc_registry_address);
          toast.success('KYC Registry address loaded');
        } else {
          toast.error('No KYC Registry found in database');
        }
      } catch (error: any) {
        console.error('Error loading KYC Registry:', error);
        toast.error('Failed to load KYC Registry address');
      } finally {
        setIsLoading(false);
      }
    };

    loadKYCRegistry();
  }, []);

  const handleApprove = async () => {
    if (!walletClient || !isConnected) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!kycRegistryAddress || !walletToApprove) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate addresses
    if (!kycRegistryAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid KYC Registry address');
      return;
    }

    if (!walletToApprove.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('Invalid wallet address');
      return;
    }

    setIsApproving(true);
    try {
      const data = encodeFunctionData({
        abi: KYC_REGISTRY_ABI,
        functionName: 'setKYCStatus',
        args: [walletToApprove as `0x${string}`, true],
      });

      const hash = await walletClient.sendTransaction({
        to: kycRegistryAddress as `0x${string}`,
        data,
      } as any);

      toast.success('✅ KYC APPROVED ON-CHAIN! Tx: ' + hash.slice(0, 10) + '...', {
        duration: 8000
      });
      
      // Clear wallet input
      setWalletToApprove('');
    } catch (error: any) {
      console.error('KYC approval error:', error);
      toast.error(error.message || 'Failed to approve KYC');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminHeader />
        
        <main className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6" />
                Quick KYC Approval
              </CardTitle>
              <CardDescription>
                Approve wallets for testing. Use your deployer wallet to approve other wallets.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <>
                  <Alert className="border-blue-500/50 bg-blue-500/10">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    <AlertDescription className="text-sm">
                      <strong>Connected Wallet:</strong> {address ? `${address.slice(0, 10)}...${address.slice(-8)}` : 'Not connected'}
                      <br />
                      <strong>KYC Registry:</strong> {kycRegistryAddress ? `${kycRegistryAddress.slice(0, 10)}...${kycRegistryAddress.slice(-8)}` : 'Not found'}
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-2">
                    <Label htmlFor="kycRegistry">KYC Registry Contract Address</Label>
                    <div className="flex gap-2">
                      <Input
                        id="kycRegistry"
                        placeholder="0x..."
                        value={kycRegistryAddress}
                        onChange={(e) => setKycRegistryAddress(e.target.value)}
                        className="flex-1"
                        readOnly
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          navigator.clipboard.writeText(kycRegistryAddress);
                          toast.success('Address copied');
                        }}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-success">
                      ✓ Auto-loaded from database
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="wallet">Wallet Address to Approve</Label>
                    <div className="flex gap-2">
                      <Input
                        id="wallet"
                        placeholder="0x..."
                        value={walletToApprove}
                        onChange={(e) => setWalletToApprove(e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        onClick={() => {
                          if (address) {
                            setWalletToApprove(address);
                            toast.success('Your wallet address filled');
                          }
                        }}
                        disabled={!address}
                      >
                        Use My Wallet
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      The wallet that needs KYC approval to invest
                    </p>
                  </div>
                </>
              )}

              <Button 
                onClick={handleApprove} 
                disabled={isApproving || !isConnected}
                className="w-full"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  'Approve KYC'
                )}
              </Button>

              <div className="bg-muted p-4 rounded-lg text-sm space-y-2">
                <p className="font-semibold">⚠️ Important:</p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>You must be connected with the deployer wallet (contract owner)</li>
                  <li>Get the KYC Registry address from your deployment screen</li>
                  <li>After approval, wait for the transaction to confirm</li>
                  <li>The approved wallet can then invest immediately</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      </div>
    </div>
  );
}
