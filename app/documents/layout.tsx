'use client';
import Link from 'next/link';

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-primary text-white p-6 space-y-4">
        <h2 className="text-xl font-bold mb-6">Client Panel</h2>
        <Link href="/documents/loan-v2" className="block">Loan Documents</Link>
        <Link href="/documents/tax" className="block">Income Tax Documents</Link>
      </div>

      {/* Main */}
      <div className="flex-1 p-8 bg-background">{children}</div>
    </div>
  );
}