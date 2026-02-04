'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function SuccessPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-secondary to-background flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8 sm:p-12 text-center shadow-lg">
        <div className="mb-6 flex justify-center">
          <CheckCircle2 className="w-16 h-16 text-primary animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Documents Submitted Successfully!
        </h1>

        <p className="text-foreground/70 text-lg mb-6">
          Your documents have been securely received. Our chartered accountant team will review your submission and contact you soon.
        </p>

        <div className="space-y-4 mb-8 text-left">
          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <p className="text-foreground/70">Documents are encrypted and securely stored</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <p className="text-foreground/70">We'll review within 2-3 business days</p>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-1">
              <div className="w-2 h-2 rounded-full bg-primary" />
            </div>
            <p className="text-foreground/70">You'll receive an email confirmation</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button onClick={() => router.push('/')} className="w-full">
            Return to Home
          </Button>
          <Button onClick={() => router.push('/user/dashboard')} variant="outline" className="w-full">
            View Dashboard
          </Button>
        </div>

        <p className="text-sm text-foreground/60 mt-8">
          Need help? Contact us at <span className="text-primary font-semibold">support@findoc.in</span>
        </p>
      </Card>
    </main>
  );
}
