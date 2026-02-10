'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import imageCompression from "browser-image-compression";


const LOAN_FORM_FIELDS = [
  'Aadhaar Card', 'PAN Card', 'Salary Slips (6 Months)', 'Bank Statements (1 Year)',
  'ITR Copies (3 Years)', 'Property Documents', 'Business Proof', 'GST Returns',
  'Existing Loan Details', 'Passport Photo', 'Other Documents',
];

export default function LoanDocumentsPage() {
  const router = useRouter();
  const MAX_FILE_SIZE = 300 * 1024; // 300KB

  const [profile, setProfile] = useState<any>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);

  const submitApplication = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User not logged in");

    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        type: 'loan',   // tax page me 'tax'
        status: 'submitted'
      });

    if (error) alert(error.message);
    else alert('Documents submitted successfully!');
  };
  useEffect(() => {
  if (!profile) return;

  if (!profile.profile_completed) {
    router.push('/profile');
  }
}, [profile]);
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      setProfile(data);
      loadDocuments(user.id);
    };
    init();
  }, []);

  const loadDocuments = async (userId: string) => {
    const { data } = await supabase.from('documents').select('*')
      .eq('user_id', userId).eq('category', 'loan');
    setUploadedDocs(data || []);
  };



  const uploadFile = async (file: File, docName: string) => {
    let uploadFileFinal = file;

    if (file.type.startsWith('image/')) {
      const options = {
        maxSizeMB: 0.3,          // 300 KB
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };

      try {
        uploadFileFinal = await imageCompression(file, options);
      } catch (err) {
        alert('Image compression failed');
        return;
      }
    }
    if (uploadFileFinal.size > MAX_FILE_SIZE) {
      alert("⚠️ Max file size is 300KB. Please compress and upload again.");
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    const path = `${user!.id}/${Date.now()}_${file.name}`;

    await supabase.storage.from('documents').upload(path, uploadFileFinal, { upsert: true });

    const { data } = supabase.storage.from('documents').getPublicUrl(path);
    const publicUrl = data.publicUrl;

    const { data: existing } = await supabase.from('documents')
      .select('*').eq('user_id', user!.id)
      .eq('category', 'loan').eq('document_name', docName).maybeSingle();

    if (existing) {
      await supabase.from('documents').update({ file_url: publicUrl }).eq('id', existing.id);
    } else {
      await supabase.from('documents').insert({
        user_id: user!.id, category: 'loan',
        document_name: docName, document_type: docName,
        file_url: publicUrl
      });
    }
    loadDocuments(user!.id);
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Loan Documents</h1>

        <Card className="p-4 bg-blue-50 text-sm">
          <p><b>Name:</b> {profile.full_name}</p>
          <p><b>Mobile:</b> {profile.mobile}</p>
          <p><b>Email:</b> {profile.email}</p>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Upload Documents</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {LOAN_FORM_FIELDS.map(field => (
              <label key={field} className="border-2 border-dashed p-4 text-center cursor-pointer">
                <Upload className="mx-auto mb-2" />
                {field}
                <input hidden type="file" onChange={e => e.target.files && uploadFile(e.target.files[0], field)} />
              </label>
            ))}
          </div>
        </Card>

        {uploadedDocs.map(doc => (
          <div key={doc.id} className="flex justify-between border p-3 mt-3 rounded bg-white">
            <span>{doc.document_name}</span>
            <a href={doc.file_url} target="_blank" className="text-blue-600 underline">View</a>
          </div>
        ))}

        {/* ✅ ONE FINAL SUBMIT BUTTON */}
        <div className="mt-6">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={submitApplication}
          >
            Submit All Documents
          </Button>
        </div>
      </div>
    </main>
  );
}
