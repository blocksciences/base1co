import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Rocket, Wallet, Lock, TrendingUp, Users, Shield, FileText, Gift, BarChart3, Coins } from 'lucide-react';

const Documentation = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              LaunchBase Documentation
            </h1>
            <p className="text-xl text-muted-foreground">
              Everything you need to know about using the platform
            </p>
          </div>

          <Tabs defaultValue="getting-started" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5 h-auto">
              <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
              <TabsTrigger value="investing">Investing</TabsTrigger>
              <TabsTrigger value="staking">Staking</TabsTrigger>
              <TabsTrigger value="launching">Launching ICO</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>

            {/* Getting Started */}
            <TabsContent value="getting-started" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="h-5 w-5" />
                    Connecting Your Wallet
                  </CardTitle>
                  <CardDescription>First steps to start using LaunchBase</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">1. Install a Web3 Wallet</h4>
                    <p className="text-muted-foreground">
                      You'll need a Web3 wallet like MetaMask, Coinbase Wallet, or Rainbow Wallet to interact with the platform.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">2. Connect to Base Network</h4>
                    <p className="text-muted-foreground">
                      Make sure your wallet is connected to Base or Base Sepolia (testnet). The platform will automatically detect your network.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">3. Click "Connect Wallet"</h4>
                    <p className="text-muted-foreground">
                      Click the "Connect Wallet" button in the header and select your preferred wallet from the list.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">4. Complete KYC (Required for Investing)</h4>
                    <p className="text-muted-foreground">
                      To invest in projects, you'll need to complete KYC verification. Navigate to your Dashboard and follow the KYC process.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Network & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Supported Networks</h4>
                    <div className="flex gap-2">
                      <Badge>Base Mainnet</Badge>
                      <Badge variant="outline">Base Sepolia (Testnet)</Badge>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Security Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Wallet-based authentication</li>
                      <li>Smart contract audited security</li>
                      <li>KYC verification for investors</li>
                      <li>Multi-signature admin controls</li>
                      <li>Emergency pause functionality</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Investing */}
            <TabsContent value="investing" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    How to Invest in ICOs
                  </CardTitle>
                  <CardDescription>Step-by-step guide to investing in projects</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Step 1: Browse Projects</h4>
                    <p className="text-muted-foreground">
                      Visit the Projects page to explore available ICOs. You can filter by status (live, upcoming, ended) and view detailed information about each project.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Step 2: Complete KYC</h4>
                    <p className="text-muted-foreground">
                      Before investing, complete the KYC verification process from your Dashboard. This is a one-time requirement.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Step 3: Check Eligibility</h4>
                    <p className="text-muted-foreground">
                      On the project detail page, click "Check Eligibility" to verify if you can participate based on whitelist, queue position, or tier status.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Step 4: Invest</h4>
                    <p className="text-muted-foreground">
                      Enter the amount you want to invest (respecting min/max limits), review the transaction, and confirm in your wallet. You'll receive tokens based on the project's token rate.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Step 5: Track Your Investment</h4>
                    <p className="text-muted-foreground">
                      View all your investments in the Dashboard, including vesting schedules, claimable tokens, and ROI calculations.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Investment Limits & Tiers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Minimum & Maximum Contributions</h4>
                    <p className="text-muted-foreground">
                      Each project sets its own minimum and maximum contribution limits. These are displayed on the project detail page.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tier System</h4>
                    <p className="text-muted-foreground">
                      Higher staking tiers may get access to guaranteed allocations, early access, and higher contribution limits. Stake LIST tokens to increase your tier.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Staking */}
            <TabsContent value="staking" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Coins className="h-5 w-5" />
                    Staking LIST Tokens
                  </CardTitle>
                  <CardDescription>Earn rewards and unlock benefits</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Why Stake?</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Earn staking rewards (APY varies by lock period)</li>
                      <li>Unlock higher investment tiers</li>
                      <li>Get guaranteed allocations in popular ICOs</li>
                      <li>Access early investment opportunities</li>
                      <li>Receive platform fee discounts</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">How to Stake</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Navigate to the Staking page</li>
                      <li>Choose your lock period (longer = higher APY)</li>
                      <li>Enter the amount of LIST tokens to stake</li>
                      <li>Confirm the transaction in your wallet</li>
                      <li>Track your rewards in real-time on the Dashboard</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Tier Benefits</h4>
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Bronze Tier</span>
                        <Badge variant="outline">500+ LIST</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Silver Tier</span>
                        <Badge variant="outline">2,000+ LIST</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Gold Tier</span>
                        <Badge variant="outline">5,000+ LIST</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">Platinum Tier</span>
                        <Badge>10,000+ LIST</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Unstaking & Rewards</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Unstaking Process</h4>
                    <p className="text-muted-foreground">
                      You can unstake your tokens after the lock period expires. Visit the Staking page and click "Unstake" on your active stake. Note that early unstaking may incur penalties.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Claiming Rewards</h4>
                    <p className="text-muted-foreground">
                      Rewards accumulate automatically and can be claimed at any time from the Staking page. Claimed rewards are transferred to your wallet immediately.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Launching ICO */}
            <TabsContent value="launching" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="h-5 w-5" />
                    Launch Your ICO
                  </CardTitle>
                  <CardDescription>Guide for project creators</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Application Process</h4>
                    <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                      <li>Navigate to the "Launch ICO" page</li>
                      <li>Complete the application form with project details</li>
                      <li>Submit required documentation (whitepaper, tokenomics, etc.)</li>
                      <li>Wait for admin review and approval</li>
                      <li>Deploy your smart contracts with admin assistance</li>
                      <li>Launch your ICO on the platform</li>
                    </ol>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Required Information</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Project name, description, and category</li>
                      <li>Token details (name, symbol, supply)</li>
                      <li>Fundraising goals (soft cap, hard cap)</li>
                      <li>Token price and sale duration</li>
                      <li>Vesting schedule (if applicable)</li>
                      <li>Team information and social links</li>
                      <li>Whitepaper and technical documentation</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Platform Fees</h4>
                    <p className="text-muted-foreground">
                      LaunchBase charges a percentage of funds raised. Exact fee structure is provided during the application process. LIST stakers may receive fee discounts.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Smart Contract Deployment</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Automated Deployment</h4>
                    <p className="text-muted-foreground">
                      Once approved, admins will deploy your smart contracts on Base network. All contracts are audited and follow industry best practices for security.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Contract Features</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Pausable sales for emergency situations</li>
                      <li>Automatic refunds if soft cap is not met</li>
                      <li>Contribution limits enforcement</li>
                      <li>Vesting and token distribution</li>
                      <li>Whitelist and tier management</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Features */}
            <TabsContent value="features" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gift className="h-5 w-5" />
                    Referral Program
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Earn by Referring</h4>
                    <p className="text-muted-foreground">
                      Share your unique referral link and earn rewards when referred users invest in ICOs. Visit the Referrals page to get your link and track earnings.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Referral Rewards</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Earn a percentage of your referrals' investments</li>
                      <li>Multi-tier rewards for active referrers</li>
                      <li>Instant reward distribution</li>
                      <li>Track all referrals in your Dashboard</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Analytics Dashboard
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Real-Time Data</h4>
                    <p className="text-muted-foreground">
                      The Analytics page provides comprehensive insights into platform activity, including total investments, active projects, user growth, and more.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Available Metrics</h4>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      <li>Total value locked (TVL)</li>
                      <li>Number of active ICOs</li>
                      <li>Total participants</li>
                      <li>Token distribution statistics</li>
                      <li>Transaction volume and trends</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Project Transparency
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Transparency Reports</h4>
                    <p className="text-muted-foreground">
                      Each project has a dedicated transparency page showing real-time fundraising progress, token distribution, and transaction history. Access it from any project detail page.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Queue System
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Fair Access</h4>
                    <p className="text-muted-foreground">
                      Popular ICOs may use a queue system to ensure fair access. Higher tier stakers get priority in the queue. Check your queue position on the project detail page.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Support Section */}
          <Card className="mt-12 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
              <CardDescription>Our support team is here to assist you</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-muted-foreground">
              <p>If you have questions or need assistance, please reach out:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Join our Discord community for real-time support</li>
                <li>Follow us on Twitter for updates and announcements</li>
                <li>Contact us via Telegram for direct support</li>
                <li>Check our Medium blog for guides and tutorials</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Documentation;
