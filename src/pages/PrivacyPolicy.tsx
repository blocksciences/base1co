import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';

export default function PrivacyPolicy() {
  return (
    <>
      <SEO 
        title="Privacy Policy | LaunchBase"
        description="Learn about how LaunchBase collects, uses, and protects your personal information on our ICO launchpad platform."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4 text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold">Privacy Policy</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">1. Information We Collect</h2>
                <p className="text-muted-foreground">
                  We collect information that you provide directly to us, including when you create an account, 
                  participate in ICO sales, complete KYC verification, or communicate with us. This may include 
                  your name, email address, wallet address, identification documents, and transaction history.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">2. How We Use Your Information</h2>
                <p className="text-muted-foreground">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Process your transactions and manage your account</li>
                  <li>Verify your identity through KYC procedures</li>
                  <li>Send you updates about projects and platform features</li>
                  <li>Comply with legal obligations and prevent fraud</li>
                  <li>Improve our services and develop new features</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">3. Blockchain Transparency</h2>
                <p className="text-muted-foreground">
                  Please note that transactions on the Base Network blockchain are public and permanently recorded. 
                  Your wallet address and transaction details will be visible on the blockchain explorer.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">4. Data Security</h2>
                <p className="text-muted-foreground">
                  We implement appropriate technical and organizational measures to protect your personal information 
                  against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission 
                  over the Internet is 100% secure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">5. Third-Party Services</h2>
                <p className="text-muted-foreground">
                  We may use third-party services for KYC verification, analytics, and blockchain infrastructure. 
                  These services have their own privacy policies and we recommend reviewing them.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Your Rights</h2>
                <p className="text-muted-foreground">
                  You have the right to access, correct, or delete your personal information. You may also object 
                  to processing or request data portability. Contact us to exercise these rights.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">7. Cookies and Tracking</h2>
                <p className="text-muted-foreground">
                  We use cookies and similar technologies to improve your experience on our platform. 
                  See our Cookie Policy for more details.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">8. Contact Us</h2>
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy, please contact us through our support channels.
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
