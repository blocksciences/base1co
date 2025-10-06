import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';

export default function CookiePolicy() {
  return (
    <>
      <SEO 
        title="Cookie Policy | LaunchBase"
        description="Learn about how LaunchBase uses cookies and similar technologies to enhance your experience on our platform."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4 text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold">Cookie Policy</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">1. What Are Cookies?</h2>
                <p className="text-muted-foreground">
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">2. Types of Cookies We Use</h2>
                
                <div className="space-y-4 ml-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies are necessary for the platform to function properly. They enable core 
                      functionality such as security, network management, and accessibility. You cannot opt 
                      out of these cookies.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Functionality Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies allow the platform to remember choices you make (such as your wallet 
                      connection and language preferences) and provide enhanced features.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Analytics Cookies</h3>
                    <p className="text-muted-foreground">
                      We use analytics cookies to understand how visitors interact with our platform. 
                      This helps us improve our services and user experience.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Performance Cookies</h3>
                    <p className="text-muted-foreground">
                      These cookies help us measure and improve the performance of our platform by 
                      collecting information about how pages load and whether users encounter errors.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">3. Local Storage</h2>
                <p className="text-muted-foreground">
                  In addition to cookies, we use browser local storage to save your wallet connection state 
                  and preferences. This data remains on your device and is not transmitted to our servers.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">4. Third-Party Cookies</h2>
                <p className="text-muted-foreground">
                  Some cookies are placed by third-party services that appear on our pages. These include:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Wallet connection providers (MetaMask, WalletConnect, etc.)</li>
                  <li>Analytics services</li>
                  <li>KYC verification providers</li>
                  <li>Blockchain infrastructure providers</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">5. Cookie Duration</h2>
                <p className="text-muted-foreground">
                  Cookies may be session cookies (deleted when you close your browser) or persistent cookies 
                  (remaining on your device for a set period or until you delete them).
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Managing Cookies</h2>
                <p className="text-muted-foreground">
                  Most web browsers allow you to control cookies through their settings. You can:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Delete existing cookies from your browser</li>
                  <li>Block cookies from being set</li>
                  <li>Receive notifications when cookies are set</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Please note that blocking certain cookies may impact your ability to use some features 
                  of our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">7. Web3 Wallet Data</h2>
                <p className="text-muted-foreground">
                  When you connect your cryptocurrency wallet, your wallet address is stored locally in your 
                  browser. This is necessary for the platform to interact with blockchain networks on your behalf.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">8. Updates to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this Cookie Policy from time to time. We will notify you of any significant 
                  changes by posting a notice on our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">9. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about our use of cookies, please contact us through our support channels.
                </p>
              </section>
            </Card>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}
