'use client';

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import imageCompression from "browser-image-compression";
import { useLanguage } from '@/context/LanguageContext'

const text: any = {
  en: {
    pageTitle: "Loan Documents",
    uploadTitle: "Upload Documents",
    submit: "Submit All Documents",
    view: "View"
  },
  hi: {
    pageTitle: "लोन दस्तावेज़",
    uploadTitle: "दस्तावेज़ अपलोड करें",
    submit: "सभी दस्तावेज़ जमा करें",
    view: "देखें"
  }
}

const LOAN_FORM_FIELDS = [
  'Aadhaar Card', 'PAN Card', 'Salary Slips (6 Months)', 
  'Bank Statements (1 Year)', 'ITR Copies (3 Years)', 
  'Property Documents', 'Business Proof', 'GST Returns',
  'Existing Loan Details', 'Passport Photo', 'Other Documents',
];

export default function LoanDocumentsPage() {
  const { language } = useLanguage()
  const router = useRouter();
  const MAX_FILE_SIZE = 300 * 1024;

  const [profile, setProfile] = useState<any>(null);
  const [uploadedDocs, setUploadedDocs] = useState<any[]>([]);
  const [selectedFY, setSelectedFY] = useState("2024-25")

  // 🔹 Load documents with FY filter
  const loadDocuments = async (userId: string) => {
  const { data } = await supabase
    .from('documents')
    .select('*')
    .eq('user_id', userId)
    .eq('category', 'loan')
    .or(`financial_year.eq.${selectedFY},financial_year.is.null`);

  setUploadedDocs(data || []);
};

  // 🔹 Auth + Profile Load
  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data);
      loadDocuments(user.id);
    };
    init();
  }, [selectedFY]);   // ✅ reload when FY changes


  // 🔹 Submit Application
  const submitApplication = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return alert("User not logged in");

    const { error } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        type: 'loan',
        status: 'submitted',
        financial_year: selectedFY   // ✅ added
      });

    if (error) alert(error.message);
    else alert('Documents submitted successfully!');
  };


  // 🔹 Upload File
  const uploadFile = async (file: File, docName: string) => {
    let uploadFileFinal = file;

    if (file.type.startsWith('image/')) {
      try {
        uploadFileFinal = await imageCompression(file, {
          maxSizeMB: 0.3,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        });
      } catch {
        alert('Image compression failed');
        return;
      }
    }

    if (uploadFileFinal.size > MAX_FILE_SIZE) {
      alert("⚠️ Max file size is 300KB.");
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const fileExt = file.name.split('.').pop();
    const filePath = `${user.id}/${Date.now()}.${fileExt}`;

    await supabase.storage
      .from('documents')
      .upload(filePath, uploadFileFinal, { upsert: true });

    const { data } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath);

    const publicUrl = data.publicUrl;

    const { data: existing } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .eq('category', 'loan')
      .eq('document_name', docName)
      .eq('financial_year', selectedFY)
      .maybeSingle();

    if (existing) {
      await supabase.from('documents')
        .update({ file_url: publicUrl, status: 'pending' })
        .eq('id', existing.id);
    } else {
      await supabase.from('documents').insert({
        user_id: user.id,
        category: 'loan',
        document_name: docName,
        document_type: file.type,
        file_url: publicUrl,
        status: 'pending',
        financial_year: selectedFY   // ✅ added
      });
    }

    loadDocuments(user.id);
  };

  if (!profile) return null;

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          {text[language].pageTitle}
        </h1>

        {/* ✅ FY Filter */}
        <select
          className="border p-2 mb-4"
          value={selectedFY}
          onChange={(e) => setSelectedFY(e.target.value)}
        >
          <option value="2025-26">FY 2025-26</option>
          <option value="2024-25">FY 2024-25</option>
          <option value="2023-24">FY 2023-24</option>
          <option value="2022-23">FY 2022-23</option>
        </select>

        <Card className="p-4 bg-blue-50 text-sm">
          <p><b>Name:</b> {profile.full_name}</p>
          <p><b>Mobile:</b> {profile.mobile}</p>
          <p><b>Email:</b> {profile.email}</p>
        </Card>

        <Card className="p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">
            {text[language].uploadTitle}
          </h2>

          <div className="grid md:grid-cols-2 gap-4">
            {LOAN_FORM_FIELDS.map(field => (
              <label key={field} className="border-2 border-dashed p-4 text-center cursor-pointer">
                <Upload className="mx-auto mb-2" />
                {field}
                <input
                  hidden
                  type="file"
                  onChange={e =>
                    e.target.files && uploadFile(e.target.files[0], field)
                  }
                />
              </label>
            ))}
          </div>
        </Card>

        {uploadedDocs.map(doc => (
          <div key={doc.id} className="flex justify-between border p-3 mt-3 rounded bg-white">
            <span>{doc.document_name}</span>
            <a href={doc.file_url} target="_blank" className="text-blue-600 underline">
              {text[language].view}
            </a>
          </div>
        ))}

        <div className="mt-6">
          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white"
            onClick={submitApplication}
          >
            {text[language].submit}
          </Button>
        </div>

      </div>
    </main>
  );
}
