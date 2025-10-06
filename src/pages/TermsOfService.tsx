import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SEO } from '@/components/SEO';
import { Card } from '@/components/ui/card';

export default function TermsOfService() {
  return (
    <>
      <SEO 
        title="Terms of Service | LaunchBase"
        description="Read the terms and conditions for using LaunchBase ICO launchpad platform and participating in token sales."
      />
      <div className="min-h-screen bg-background">
        <Header />
        
        <main className="container px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="space-y-4 text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold">Terms of Service</h1>
              <p className="text-muted-foreground text-lg">
                Last updated: {new Date().toLocaleDateString()}
              </p>
            </div>

            <Card className="p-8 space-y-8">
              <section className="space-y-4">
                <h2 className="text-2xl font-bold">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground">
                  By accessing and using LaunchBase, you accept and agree to be bound by these Terms of Service. 
                  If you do not agree to these terms, please do not use our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">2. Eligibility</h2>
                <p className="text-muted-foreground">
                  You must be at least 18 years old and legally capable of entering into binding contracts. 
                  You must comply with all applicable laws in your jurisdiction, including those related to 
                  cryptocurrency and securities.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">3. KYC Requirements</h2>
                <p className="text-muted-foreground">
                  To participate in ICO sales, you must complete our Know Your Customer (KYC) verification process. 
                  You agree to provide accurate and complete information and understand that false information may 
                  result in account termination.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">4. Investment Risks</h2>
                <p className="text-muted-foreground">
                  Cryptocurrency investments carry significant risk. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Token values can be extremely volatile</li>
                  <li>You may lose your entire investment</li>
                  <li>Projects may fail to deliver on their promises</li>
                  <li>Regulatory changes may affect token value</li>
                  <li>Smart contracts may contain vulnerabilities</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">5. Platform Services</h2>
                <p className="text-muted-foreground">
                  LaunchBase provides a platform for connecting project creators with investors. We do not provide 
                  investment advice and are not responsible for the success or failure of any project listed on 
                  our platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">6. Prohibited Activities</h2>
                <p className="text-muted-foreground">
                  You agree not to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Use the platform for money laundering or terrorist financing</li>
                  <li>Manipulate markets or engage in wash trading</li>
                  <li>Access accounts that don't belong to you</li>
                  <li>Interfere with the platform's operation</li>
                  <li>Violate any applicable laws or regulations</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">7. Smart Contracts</h2>
                <p className="text-muted-foreground">
                  Transactions on LaunchBase are executed through smart contracts on the Base Network. 
                  Once executed, transactions cannot be reversed. You are responsible for reviewing smart 
                  contract code before participating.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">8. Fees</h2>
                <p className="text-muted-foreground">
                  We may charge fees for platform services, including transaction fees and listing fees. 
                  All fees will be clearly disclosed before you complete a transaction.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  LaunchBase and its affiliates shall not be liable for any indirect, incidental, special, 
                  consequential, or punitive damages resulting from your use of the platform.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">10. Changes to Terms</h2>
                <p className="text-muted-foreground">
                  We reserve the right to modify these terms at any time. Continued use of the platform 
                  after changes constitutes acceptance of the modified terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-bold">11. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact our support team.
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
