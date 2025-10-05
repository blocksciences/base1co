import { Header } from "@/components/Header";
import { AdvancedAnalytics } from "@/components/AdvancedAnalytics";

const Analytics = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 mt-20">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Platform Analytics</h1>
            <p className="text-muted-foreground mt-2">
              Real-time insights into platform performance
            </p>
          </div>
          <AdvancedAnalytics />
        </div>
      </main>
    </div>
  );
};

export default Analytics;
