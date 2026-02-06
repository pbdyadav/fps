'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function AdminDashboard() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [viewType, setViewType] = useState<'client' | 'business'>('client');

  const filteredClients = clients.filter(c => {
    const term = search.toLowerCase();
    return (
      c.entity_type === viewType &&
      (
        c.full_name?.toLowerCase().includes(term) ||
        c.email?.toLowerCase().includes(term) ||
        c.mobile?.includes(term)
      )
    );
  });

  <input
    placeholder="Search by name, email or mobile"
    className="border p-2 rounded w-full mb-4"
    onChange={(e) => setSearch(e.target.value)}
  />
  // ================= FETCH CLIENTS =================
  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, mobile, role, entity_type')
      .neq('role', 'admin');

    setClients(data || []);
  };

  // ================= FETCH CLIENT DETAILS =================
  const fetchClientDetails = async (id: string) => {
    setSelectedClientId(id);

    const { data } = await supabase.from('profiles').select('*').eq('id', id).single();
    setClientProfile(data);

    const { data: docs } = await supabase.from('documents').select('*').eq('user_id', id);
    setUserDocs(docs || []);

    const { data: apps } = await supabase.from('applications').select('*').eq('user_id', id);
    setApplications(apps || []);
  };

  const loadUserDocuments = async (userId: string) => {
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (!error) setUserDocs(data || []);
  };

  // ================= ADMIN CHECK =================
  useEffect(() => {
    const initAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');

      const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
      if (profile?.role !== 'admin') return router.replace('/');

      fetchClients();
    };
    initAdmin();
  }, []);

  // ================= DOC APPROVAL =================
  const updateDocStatus = async (docId: string, status: string) => {
    await supabase.from('documents').update({ status }).eq('id', docId);

    if (selectedClientId) {
      loadUserDocuments(selectedClientId);
    }
  };

  // ================= APP APPROVAL =================
  const updateAppStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    fetchClientDetails(selectedClientId!);
  };

  // ================= DELETE CLIENT =================
  const handleDeleteClient = async (id: string) => {
    const confirmDelete = prompt("Type DELETE to confirm");
    if (confirmDelete !== "DELETE") return;

    await supabase.from('profiles').delete().eq('id', id);
    fetchClients();
    setSelectedClientId(null);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex justify-between mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        </div>

        <div className="flex gap-2 items-stretch">

          {/* CLIENT LIST */}
          <div className="w-2/3">
            <Card className="p-6 h-[75vh] overflow-y-auto ">
              <h2 className="text-2xl font-bold mb-6">Clients</h2>
              <input
                type="text"
                placeholder="Search by name, email or mobile"
                className="border p-2 rounded w-full mb-4"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map(client => (
                    <tr key={client.id} className="border-b">
                      <td>{client.full_name}</td>
                      <td>{client.email}</td>
                      <td>{client.mobile}</td>
                      <td>{client.role}</td>
                      <td className="flex items-center">
                        {/* VIEW BUTTON */}
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => fetchClientDetails(client.id)}
                        >
                          <Eye size={20} />
                        </button>

                        {/* SPACER */}
                        <div className="flex-1"></div>

                        {/* DELETE BUTTON */}
                        <button
                          className="text-red-500 hover:text-red-700 ml-4"
                          onClick={() => handleDeleteClient(client.id)}
                          title="Delete Client"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* DETAILS PANEL */}
          {selectedClientId && clientProfile && (
            <div className="w-1/3">
              <Card className="p-6 sticky top-6 h-[75vh] overflow-y-auto space-y-4">
                <h2 className="text-xl font-bold">Client Details</h2>
                <p><b>Name:</b> {clientProfile.full_name}</p>
                <p><b>Email:</b> {clientProfile.email}</p>
                <p><b>Mobile:</b> {clientProfile.mobile}</p>

                {/* DOCUMENTS */}
                <hr />
                <h3 className="font-bold mt-4">Documents</h3>

                {userDocs.length === 0 && (
                  <p className="text-sm text-gray-500">No documents uploaded</p>
                )}

                <div className="grid grid-cols-2 gap-3">
                  {userDocs.map(doc => (
                    <div key={doc.id} className="border rounded p-2 bg-white text-xs space-y-1">

                      <div className="flex justify-between">
                        <span className="font-medium truncate">{doc.document_name}</span>
                        <span className={`px-1 py-0.5 rounded text-[10px]
                            ${doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                            doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                              'bg-yellow-100 text-yellow-700'}`}>
                          {doc.status || 'pending'}
                        </span>
                      </div>

                      {/* IMAGE PREVIEW */}
                      {/\.(jpg|jpeg|png|webp)$/i.test(doc.file_url) && (
                        <img
                          src={doc.file_url}
                          alt="preview"
                          className="w-full h-24 object-cover rounded border"
                        />
                      )}

                      {/* PDF PREVIEW */}
                      {/\.pdf$/i.test(doc.file_url) && (
                        <iframe
                          src={doc.file_url}
                          className="w-full h-24 border rounded"
                        />
                      )}

                      <div className="flex justify-between text-[11px]">
                        <a href={doc.file_url} target="_blank" className="text-blue-600">View</a>
                        <a href={doc.file_url} download className="text-green-600">Download</a>
                      </div>

                      {doc.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded text-[10px]"
                            onClick={() => updateDocStatus(doc.id, 'approved')}
                          >Approve</button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded text-[10px]"
                            onClick={() => updateDocStatus(doc.id, 'rejected')}
                          >Reject</button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>


                {/* APPLICATIONS */}
                <hr />
                <h3 className="font-bold">Applications</h3>

                {applications.map(app => (
                  <div key={app.id} className="border p-3 rounded bg-gray-50">
                    <p><b>Type:</b> {app.type}</p>
                    <p><b>Status:</b> {app.status}</p>

                    {app.status === 'submitted' && (
                      <div className="flex gap-2 mt-2">
                        <Button className="bg-green-600 text-white" onClick={() => updateAppStatus(app.id, 'approved')}>
                          Approve
                        </Button>
                        <Button className="bg-red-600 text-white" onClick={() => updateAppStatus(app.id, 'rejected')}>
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                ))}

                <Button onClick={() => setSelectedClientId(null)}>Close</Button>
              </Card>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
