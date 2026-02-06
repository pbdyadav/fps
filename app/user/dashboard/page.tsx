
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Download, Upload, File, Shield } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface Document {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  size: string;
  category: 'Tax' | 'Loan';
}

export default function UserDashboard() {
  const router = useRouter();

  // ✅ HOOKS MUST BE INSIDE COMPONENT
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        router.push('/login');
      } else {
        setUser(data.user);
      }

      setLoading(false);
    };

    checkUser();
  }, [router]);

  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: 'ITR-2024.pdf',
      type: 'Income Tax Return',
      uploadedDate: '2024-01-25',
      size: '2.4 MB',
      category: 'Tax',
    },
  ]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  const handleDownload = (docName: string) => {
    console.log(`Downloading ${docName}`);
  };

  const handleUpload = () => {
    router.push('/documents/upload');
  };

  if (loading) return <p className="p-10 text-center">Loading dashboard...</p>;

  return (
  <main className="min-h-screen p-6 bg-gray-100">
    <div className="flex justify-between mb-6 items-center">
      <h1 className="text-3xl font-bold">
        Welcome {user?.user_metadata?.full_name || 'User'}
      </h1>
      {/*<Button onClick={handleLogout}>Logout</Button>*/}
    </div>

    <Card className="p-6 mb-6">
      Logged in as: <b>{user?.email}</b>
    </Card>

    {/* ACTION CARDS */}
    <div className="grid md:grid-cols-2 gap-6">

      <Card className="p-6 flex flex-col items-center text-center shadow-md">
        <Upload className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-xl font-bold mb-2">Loan Documents</h2>
        <p className="text-sm mb-4 text-gray-500">Upload KYC, bank, property, loan papers</p>
        <Button onClick={() => router.push('/documents/loan')} className="w-full">
          Go to Loan Upload
        </Button>
      </Card>

      <Card className="p-6 flex flex-col items-center text-center shadow-md">
        <File className="w-10 h-10 text-primary mb-3" />
        <h2 className="text-xl font-bold mb-2">Tax Documents</h2>
        <p className="text-sm mb-4 text-gray-500">Upload ITR, PAN, Aadhaar, LIC, GST</p>
        <Button onClick={() => router.push('/documents/tax')} className="w-full">
          Go to Tax Upload
        </Button>
      </Card>

    </div>
  </main>
);

}
