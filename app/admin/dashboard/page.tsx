'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRef } from 'react';


const sendNotification = async (userId: string, title: string, message: string) => {
  const { error } = await supabase.from('notifications').insert([
    { user_id: userId, title, message, },
  ]);

  if (error) alert('Error sending notification');
  else alert('Notification Sent ✅');
};
export default function AdminDashboard() {
  const router = useRouter();
  const [myRole, setMyRole] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [userDocs, setUserDocs] = useState<any[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [clientProfile, setClientProfile] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [noteUser, setNoteUser] = useState('');
  const [viewType, setViewType] = useState<'client' | 'business'>('client');
  const [selectedUser, setSelectedUser] = useState('');
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return router.push('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (!profile || !['admin', 'staff', 'master'].includes(profile.role)) {
        router.push('/login');
      } else {
        setMyRole(profile.role);
      }
    };

    checkAccess();
  }, []);
  // ================= FETCH CLIENTS =================
  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, mobile, role, entity_type')
      

    setClients(data || []);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchClients();
  };

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
    const { data } = await supabase.from('documents').select('*').eq('user_id', userId);
    setUserDocs(data || []);
  };

  const searchedClients = filteredClients.filter(c =>
    `${c.full_name} ${c.email}`.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // ================= ADMIN CHECK =================
  useEffect(() => {
    const initAdmin = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return router.replace('/login');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (!profile) return router.replace('/');
      setMyRole(profile?.role || '');
      //setMyRole(profile.role); // ✅ IMPORTANT

      if (profile.role !== 'admin' && profile.role !== 'staff' && profile.role !== 'master')
        return router.replace('/');

      fetchClients();
    };

    initAdmin();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);

      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  // ================= APPROVAL FUNCTIONS =================
  const updateDocStatus = async (docId: string, status: string) => {
    await supabase.from('documents').update({ status }).eq('id', docId);

    if (selectedClientId) loadUserDocuments(selectedClientId);

  };

  // ================= APP APPROVAL =================
  const updateAppStatus = async (id: string, status: string) => {
    await supabase.from('applications').update({ status }).eq('id', id);
    fetchClientDetails(selectedClientId!);
  };

  // ================= MANUAL NOTIFICATION =================
  const handleManualNotification = async () => {
    if (!noteUser || !noteTitle || !noteMessage) return alert("All fields required");

    await supabase.from('notifications').insert([
      { user_id: noteUser, title: noteTitle, message: noteMessage }
    ]);

    alert("Notification Sent ✅");
    setNoteTitle('');
    setNoteMessage('');
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

        <Card className="p-6 space-y-3">
          <h2 className="text-lg font-bold">Send Notification to Client</h2>


          <div className="relative">
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search client..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setShowDropdown(true);
                }}
                className="border p-2 w-full rounded"
              />

              {showDropdown && (
                <div className="absolute z-50 bg-white border w-full max-h-48 overflow-y-auto rounded shadow">
                  {filteredClients.length === 0 && (
                    <div className="p-2 text-gray-500 text-sm">No clients found</div>
                  )}

                  {filteredClients.map(u => (
                    <div
                      key={u.id}
                      className="p-2 hover:bg-gray-100 cursor-pointer text-sm"
                      onClick={() => {
                        setNoteUser(u.id);
                        setSearch(`${u.full_name} (${u.email})`);
                        setShowDropdown(false);
                      }}
                    >
                      {u.full_name} ({u.email})
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>


          <input placeholder="Massage Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="border p-2 w-full rounded" />
          <textarea placeholder="Message" value={noteMessage} onChange={(e) => setNoteMessage(e.target.value)} className="border p-2 w-full rounded" />

          <Button onClick={handleManualNotification}>Send</Button>
        </Card>

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
                    <th>Current Role</th>
                    <th>Change Role</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClients.map((client) => (
                    <tr key={client.id} className="border-b">
                      <td>{client.full_name}</td>
                      <td>{client.email}</td>
                      <td>{client.mobile}</td>

                      {/* CURRENT ROLE */}
                      <td className="font-medium capitalize">{client.role}</td>

                      {/* CHANGE ROLE — ONLY ADMIN */}
                      <td>
                        {myRole === 'admin' ? (
                          <select
                            value={client.role}
                            onChange={(e) => updateUserRole(client.id, e.target.value)}
                            className="border p-1 rounded text-sm"
                          >
                            <option value="user">User</option>
                            <option value="master">Master Viewer</option>
                            <option value="staff">Staff</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span className="text-gray-400 text-xs">No Permission</span>
                        )}
                      </td>

                      {/* ACTION BUTTONS */}
                      <td className="flex items-center gap-2">
                        <button
                          className="text-blue-600 hover:text-blue-800"
                          onClick={() => fetchClientDetails(client.id)}
                        >
                          View
                        </button>

                        {(myRole === 'admin' || myRole === 'staff') && (
                          <Button
                            onClick={() =>
                              sendNotification(
                                client.id,
                                'Document Update',
                                'Your document has been reviewed. Please check dashboard.'
                              )
                            }
                            className="bg-blue-600 text-white"
                          >
                            Notify
                          </Button>
                        )}
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
                      {/* VIEW / DOWNLOAD for ALL ROLES */}
                      <div className="flex justify-between text-[11px]">
                        <a href={doc.file_url} target="_blank" className="text-blue-600">View</a>
                        <a href={doc.file_url} download className="text-green-600">Download</a>
                      </div>
                      {/* APPROVAL BUTTONS */}
                      {(myRole === 'admin' || myRole === 'staff') && doc.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            className="bg-green-600 text-white px-2 py-1 rounded text-[10px]"
                            onClick={() => updateDocStatus(doc.id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="bg-red-600 text-white px-2 py-1 rounded text-[10px]"
                            onClick={() => updateDocStatus(doc.id, 'rejected')}
                          >
                            Reject
                          </button>
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
