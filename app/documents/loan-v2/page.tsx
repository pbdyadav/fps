'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/lib/supabase";

export default function LoanV2Page() {

  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const [uploadedFiles, setUploadedFiles] = useState<{
    [key: string]: {
      name: string;
      path?: string;
      fileObject?: File;
    }[];
  }>({});

  useEffect(() => {
    fetchDocumentStructure();
  }, []);

  useEffect(() => {
    fetchUserDocuments();
  }, []);


  const fetchUserDocuments = async () => {

    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user?.id;

    if (!userId) return;

    const { data, error } = await supabase
      .from("client_documents")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    // Group by type_id
    const grouped: any = {};

    data?.forEach((doc) => {
      if (!grouped[doc.type_id]) {
        grouped[doc.type_id] = [];
      }

      grouped[doc.type_id].push({
        name: doc.file_name,
        path: doc.file_path
      });
    });

    setUploadedFiles(grouped);
  };
  const fetchDocumentStructure = async () => {
    const { data: cats } = await supabase
      .from("document_categories")
      .select("*")
      .eq("is_active", true)
      .order("order_no");

    const { data: docTypes } = await supabase
      .from("document_types")
      .select("*")
      .eq("is_active", true)
      .order("order_no");

    setCategories(cats || []);
    setTypes(docTypes || []);
  };

  const clientId = "demo-client";
  const handleView = async (filePath: string) => {

    const { data, error } = await supabase.storage
      .from("loan-documents")
      .createSignedUrl(filePath, 60); // 60 seconds

    if (error) {
      console.error("Signed URL error:", error.message);
      return;
    }

    window.open(data.signedUrl, "_blank");
  };
  const handleSubmit = async (category: any) => {

    const categoryTypes = types.filter(
      (t) => t.category_id === category.id
    );

    // 🔴 Required validation
    for (let type of categoryTypes) {
      if (type.is_required) {
        if (!uploadedFiles[type.id] || uploadedFiles[type.id].length === 0) {
          alert(`Please upload required document: ${type.name}`);
          return;
        }
      }
    }

    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    if (!userId) {
      alert("User not found");
      return;
    }

    for (let type of categoryTypes) {

      const files = uploadedFiles[type.id];
      if (!files) continue;

      for (let file of files) {

        // Skip already saved DB files
        if (!file.fileObject) continue;

        const timestamp = Date.now();
        const filePath = `${userId}/${category.id}/${type.id}/${timestamp}-${file.name}`;

        // 1️⃣ Upload to Storage
        const { error: uploadError } = await supabase.storage
          .from('loan-documents')
          .upload(filePath, file.fileObject);


        if (uploadError) {
          console.error("Upload error:", uploadError.message);
          continue;
        }

        // 2️⃣ Insert into Database
        const { error: dbError } = await supabase
          .from('client_documents')
          .insert({
            user_id: userId,
            category_id: category.id,
            type_id: type.id,
            file_name: file.name,
            file_path: filePath
          });

        if (dbError) {
          console.error("DB insert error:", dbError.message);
        }
      }
    }
    alert(`${category.name} uploaded & saved successfully!`);

    await fetchUserDocuments();

  };

  // ✅ FIXED TypeScript Error Here
  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    docId: string
  ) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).map((file) => ({
      name: file.name,
      fileObject: file
    }));

    setUploadedFiles((prev) => ({
      ...prev,
      [docId]: [...(prev[docId] || []), ...files],
    }));

    // Reset input so same file can be selected again
    e.target.value = "";
  };

  const removeFile = async (docId: string, fileIndex: number) => {

    const fileToRemove = uploadedFiles[docId]?.[fileIndex];

    if (!fileToRemove) return;

    try {
      // 🔹 If file already saved in DB (has path)
      if (fileToRemove.path) {

        // 1️⃣ Delete from Storage
        const { error: storageError } = await supabase.storage
          .from("loan-documents")
          .remove([fileToRemove.path]);

        if (storageError) {
          console.error("Storage delete error:", storageError.message);
          return;
        }

        // Delete from Database first
        const { error: dbError } = await supabase
          .from("client_documents")
          .delete()
          .eq("user_id", (await supabase.auth.getUser()).data.user?.id)
          .eq("file_path", fileToRemove.path);

        if (dbError) {
          console.error("DB delete error:", dbError.message);
          return;
        }
      }

      // 3️⃣ Remove from UI state
      setUploadedFiles((prev) => {
        const updated = { ...prev };
        updated[docId] = updated[docId].filter(
          (_: any, index: number) => index !== fileIndex
        );
        return updated;
      });

    } catch (err) {
      console.error("Unexpected delete error:", err);
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 p-6">
      <div className="max-w-5xl mx-auto space-y-6">

        <h1 className="text-3xl font-bold text-gray-800">
          Loan Documents (* Document upload mandatory)
        </h1>

        {categories.map((category) => {
          const categoryTypes = types.filter(
            (t) => t.category_id === category.id
          );

          if (categoryTypes.length === 0) return null;

          return (
            <Card
              key={category.id}
              className="p-6 rounded-2xl shadow-md border bg-white"
            >

              {/* HEADER */}
              <div
                className="flex justify-between items-center cursor-pointer"
                onClick={() =>
                  setOpenSection(
                    openSection === category.id ? null : category.id
                  )
                }
              >
                <h2 className="text-lg font-bold">
                  {category.name}
                </h2>
                <span>
                  {openSection === category.id ? "▲" : "▼"}
                </span>
              </div>

              {/* BODY */}
              {openSection === category.id && (
                <div className="mt-6 space-y-6">

                  {categoryTypes.map((type, index) => (
                    <div key={type.id} className="border-b pb-4">

                      <div className="grid grid-cols-[50px_1fr_150px] gap-4 items-start">

                        <div className="text-sm text-gray-500 pt-1">
                          {index + 1}.
                        </div>

                        <div className="text-sm font-medium text-gray-800 break-words text-left">
                          {type.name}
                          {type.is_required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </div>

                        <label className="cursor-pointer">
                          <span className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm inline-block text-center">
                            Browse File
                          </span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) =>
                              handleFileUpload(e, type.id)
                            }
                          />
                        </label>
                      </div>
                      {/* Uploaded Files */}
                      {uploadedFiles[type.id] &&
                        uploadedFiles[type.id].length > 0 && (
                          <div className="mt-3 ml-[50px] space-y-2">
                            {uploadedFiles[type.id].map((file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                className="flex items-center bg-gray-100 px-12 py-2 rounded text-sm"
                              >
                                <span className="truncate flex-1">
                                  {file.name}
                                </span>
                                <div className="flex items-center gap-10">
                                  <button
                                    onClick={() => handleView(file.path)}
                                    className="px-8 py-1 bg-green-400 text-blue rounded-md text-sm inline-block text-center"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() =>
                                      removeFile(type.id, fileIndex)
                                    }
                                    className="px-6.5 py-1 bg-red-400 text-white rounded-md text-sm inline-block text-center"
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                    </div>
                  ))}

                  {/* ✅ Submit Button Properly Inside Expanded Section */}
                  <div className="pt-4 ml-[50px]">
                    <button
                      onClick={() => handleSubmit(category)}
                      className="px-5 py-2 bg-green-600 text-white rounded-md text-sm"
                    >
                      Submit {category.name}
                    </button>
                  </div>

                </div>
              )}
            </Card>
          );
        })}

      </div>
    </main>
  );
}
