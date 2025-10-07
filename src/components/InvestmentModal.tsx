import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle, CheckCircle2, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface InvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectName: string;
  projectSymbol: string;
  tokenPrice: string;
  minContribution: number;
  maxContribution: number;
  onInvest: (amount: string) => Promise<boolean>;
}

type Step = 'input' | 'confirm' | 'processing' | 'success';

export const InvestmentModal = ({
  open,
  onOpenChange,
  projectName,
  projectSymbol,
  tokenPrice,
  minContribution,
  maxContribution,
  onInvest,
}: InvestmentModalProps) => {
  const [step, setStep] = useState<Step>('input');
  const [amount, setAmount] = useState('');
  const [txHash, setTxHash] = useState('');
  
  const tokenPriceNum = parseFloat(tokenPrice.split(' ')[0]);
  const tokensToReceive = amount ? (parseFloat(amount) / tokenPriceNum).toFixed(2) : '0';
  const estimatedGas = 0.002; // Mock gas estimate

  const handleConfirm = () => {
    const amountNum = parseFloat(amount);
    if (!amount || amountNum <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    if (amountNum < minContribution) {
      toast.error(`Minimum contribution is ${minContribution.toFixed(4)} ETH`);
      return;
    }
    if (amountNum > maxContribution) {
      toast.error(`Maximum contribution is ${maxContribution.toFixed(4)} ETH`);
      return;
    }
    setStep('confirm');
  };

  const handleInvest = async () => {
    setStep('processing');
    try {
      const success = await onInvest(amount);
      if (success) {
        setStep('success');
        // Mock tx hash - in real implementation this would come from the contract
        setTxHash('0x' + Math.random().toString(16).substr(2, 64));
      } else {
        setStep('input');
      }
    } catch (error) {
      console.error('Investment error:', error);
      setStep('input');
    }
  };

  const handleClose = () => {
    setStep('input');
    setAmount('');
    setTxHash('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'input' && (
          <>
            <DialogHeader>
              <DialogTitle>Invest in {projectName}</DialogTitle>
              <DialogDescription>
                Enter the amount of ETH you want to invest
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Investment Amount (ETH)
                </label>
                <Input
                  type="number"
                  placeholder={`${minContribution.toFixed(4)} - ${maxContribution.toFixed(4)} ETH`}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-12 text-lg"
                  step="0.0001"
                  min={minContribution}
                  max={maxContribution}
                />
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Min: {minContribution.toFixed(4)} ETH</span>
                  <span>Max: {maxContribution.toFixed(4)} ETH</span>
                </div>
                {amount && parseFloat(amount) < minContribution && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Amount is below minimum ({minContribution.toFixed(4)} ETH)</span>
                  </div>
                )}
                {amount && parseFloat(amount) > maxContribution && (
                  <div className="flex items-center gap-2 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    <span>Amount exceeds maximum ({maxContribution.toFixed(4)} ETH)</span>
                  </div>
                )}
              </div>

              {amount && parseFloat(amount) > 0 && (
                <div className="p-4 rounded-lg bg-muted/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">You will receive</span>
                    <span className="text-lg font-bold text-primary">
                      {tokensToReceive} {projectSymbol}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Token Price</span>
                    <span className="font-semibold">{tokenPrice}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleConfirm} className="flex-1 bg-gradient-primary">
                Continue
              </Button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <DialogHeader>
              <DialogTitle>Confirm Purchase</DialogTitle>
              <DialogDescription>
                Review your investment details
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-lg border border-border/50 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You pay</span>
                  <span className="text-xl font-bold">{amount} ETH</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">You receive</span>
                  <span className="text-xl font-bold text-primary">
                    {tokensToReceive} {projectSymbol}
                  </span>
                </div>
                <div className="pt-3 border-t border-border/50">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Gas fee (estimate)</span>
                    <span className="font-semibold">~{estimatedGas} ETH</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-bold">
                      ~{(parseFloat(amount) + estimatedGas).toFixed(4)} ETH
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-600">
                  Please confirm this transaction in your wallet
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setStep('input')} className="flex-1">
                Back
              </Button>
              <Button onClick={handleInvest} className="flex-1 bg-gradient-primary">
                Confirm in Wallet
              </Button>
            </div>
          </>
        )}

        {step === 'processing' && (
          <>
            <DialogHeader>
              <DialogTitle>Processing Transaction</DialogTitle>
            </DialogHeader>
            
            <div className="py-12 text-center space-y-4">
              <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto" />
              <div className="space-y-2">
                <p className="font-semibold">Transaction Pending</p>
                <p className="text-sm text-muted-foreground">
                  Please wait for confirmation...
                </p>
              </div>
            </div>
          </>
        )}

        {step === 'success' && (
          <>
            <DialogHeader>
              <DialogTitle>Purchase Successful!</DialogTitle>
            </DialogHeader>
            
            <div className="py-8 text-center space-y-6">
              <div className="h-16 w-16 rounded-full bg-success/20 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold">
                  You bought {tokensToReceive} {projectSymbol} for {amount} ETH
                </p>
                <p className="text-sm text-muted-foreground">
                  Tokens have been sent to your wallet
                </p>
              </div>

              {txHash && (
                <div className="p-3 rounded-lg bg-muted/30">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-muted-foreground">Transaction</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-auto p-0 text-xs font-mono"
                      asChild
                    >
                      <a
                        href={`https://basescan.org/tx/${txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1"
                      >
                        {txHash.slice(0, 10)}...{txHash.slice(-8)}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <Button onClick={handleClose} className="w-full bg-gradient-primary">
              Done
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
