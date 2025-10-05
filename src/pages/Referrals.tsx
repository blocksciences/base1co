import { Header } from "@/components/Header";
import { ReferralDashboard } from "@/components/ReferralDashboard";
import { useAccount } from "wagmi";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const Referrals = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        {!isConnected ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please connect your wallet to access the referral program
            </AlertDescription>
          </Alert>
        ) : (
          <ReferralDashboard />
        )}
      </main>
    </div>
  );
};

export default Referrals;
