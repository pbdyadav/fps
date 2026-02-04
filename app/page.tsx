'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Shield, Zap } from 'lucide-react';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-6 inline-block px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <span className="text-sm font-semibold text-primary">Welcome to Your Document Portal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
            Complete Financial & Taxation Document Portal
          </h1>

          <p className="text-lg text-foreground/70 mb-8 max-w-2xl mx-auto leading-relaxed">
            Securely manage your financial and tax documents in one place. Upload, store, and download all your important files with professional CA services.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Button
              onClick={() => router.push('/documents/loan')}
              size="lg"
              className="px-8 py-6 text-base font-semibold"
            >
              Documents for Loan
            </Button>
            <Button
              onClick={() => router.push('/documents/tax')}
              size="lg"
              variant="outline"
              className="px-8 py-6 text-base font-semibold bg-lime-600 text-background"
            >
              Income Tax Documents
            </Button>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-foreground mb-12">Why Choose Us</h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Secure Data Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow bg-secondary">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Shield className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center mb-3">
                Secure Data
              </h3>
              <p className="text-foreground/70 text-center">
                Your sensitive financial documents are encrypted and securely stored with industry-leading security protocols.
              </p>
            </Card>

            {/* Professional Service Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow bg-secondary">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center mb-3">
                Professional Service
              </h3>
              <p className="text-foreground/70 text-center">
                Expert chartered accountants review and process your documents with attention to detail and compliance.
              </p>
            </Card>

            {/* Fast Processing Card */}
            <Card className="p-8 hover:shadow-lg transition-shadow bg-secondary">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground text-center mb-3">
                Fast Processing
              </h3>
              <p className="text-foreground/70 text-center">
                Quick turnaround times ensure your documents are processed efficiently without compromising quality.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-foreground mb-8">About Our CA Firm</h2>

          <div className="bg-white rounded-lg shadow-sm p-8 space-y-6">
            <p className="text-foreground/80 leading-relaxed">
              With over 15 years of experience in chartered accounting and financial consulting, our firm specializes in helping individuals and businesses manage their tax compliance and financial documentation efficiently.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              We understand the complexity of managing multiple documents for loans, taxation, and financial compliance. Our modern digital portal simplifies this process, allowing you to securely upload, organize, and access your documents anytime, anywhere.
            </p>

            <p className="text-foreground/80 leading-relaxed">
              Our team is committed to providing professional, timely, and confidential service to ensure your financial matters are handled with the utmost care and expertise.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-foreground text-primary-foreground py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="mb-2">FinDoc Portal - Your Trusted CA Services Partner</p>
          <p className="text-sm opacity-75">Secure | Professional | Efficient</p>
        </div>
      </footer>
    </main>
  );
}
