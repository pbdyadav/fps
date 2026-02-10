'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const sendNotification = async (userId: string, title: string, message: string) => {
  const { error } = await supabase.from('notifications').insert([
    { user_id: userId, title, message },
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
  const [noteTitle, setNoteTitle] = useState('');
  const [noteMessage, setNoteMessage] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();
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
        fetchClients();
      }
    };
    checkAccess();
  }, []);

  const fetchClients = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, mobile, role, entity_type');
    setClients(data || []);
  };

  const fetchClientDetails = async (id: string) => {
    setSelectedClientId(id);
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', id).single();
    setClientProfile(profile);
    loadUserDocuments(id);
    const { data: apps } = await supabase.from('applications').select('*').eq('user_id', id);
    setApplications(apps || []);
  };

  const loadUserDocuments = async (userId: string) => {
    const { data } = await supabase.from('documents').select('*').eq('user_id', userId);
    setUserDocs(data || []);
  };

  const updateUserRole = async (userId: string, newRole: string) => {
    await supabase.from('profiles').update({ role: newRole }).eq('id', userId);
    fetchClients();
  };

  const updateDocStatus = async (docId: string, status: string) => {
    const { error } = await supabase.from('documents').update({ status: status }).eq('id', docId);
    if (!error) {
      loadUserDocuments(selectedClientId!);
    } else {
      alert(`Update failed: ${error.message}`);
    }
  };

  const updateAppStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('applications').update({ status: status }).eq('id', id);
    if (!error) {
      fetchClientDetails(selectedClientId!);
    } else {
      alert(`Update failed: ${error.message}`);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const confirmDelete = prompt("Type DELETE to confirm deletion of this user:");
    if (confirmDelete !== "DELETE") return;
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (!error) {
      alert("User Deleted");
      fetchClients();
      if (selectedClientId === id) setSelectedClientId(null);
    }
  };

  const handleManualNotification = async () => {
    if (!noteUser || !noteTitle || !noteMessage) return alert("All fields required");
    await supabase.from('notifications').insert([{ user_id: noteUser, title: noteTitle, message: noteMessage }]);
    alert("Notification Sent ✅");
    setNoteTitle(''); setNoteMessage('');
  };

  const filteredClients = clients.filter(c => {
    const term = search.toLowerCase();
    const matchesSearch = (
      c.full_name?.toLowerCase().includes(term) ||
      c.email?.toLowerCase().includes(term) ||
      c.mobile?.includes(term)
    );
    return c.entity_type === viewType && matchesSearch;
  });

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <div className="flex gap-3">
             <Button variant={viewType === 'client' ? 'default' : 'outline'} onClick={() => setViewType('client')}>Individual</Button>
             <Button variant={viewType === 'business' ? 'default' : 'outline'} onClick={() => setViewType('business')}>Business</Button>
          </div>
        </div>

        {/* NOTIFICATION CARD */}
        <Card className="p-6 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold">Quick Notify</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative" ref={dropdownRef}>
              <input
                type="text"
                placeholder="Search client..."
                value={clientSearch}
                onChange={(e) => { setClientSearch(e.target.value); setShowDropdown(true); }}
                className="border p-2 w-full rounded focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              {showDropdown && (
                <div className="absolute z-[100] bg-white border w-full max-h-48 overflow-y-auto rounded shadow-xl mt-1">
                  {clients.filter(c => c.full_name?.toLowerCase().includes(clientSearch.toLowerCase())).map(u => (
                    <div key={u.id} className="p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 text-sm" onClick={() => {
                      setNoteUser(u.id);
                      setClientSearch(u.full_name);
                      setShowDropdown(false);
                    }}>{u.full_name}</div>
                  ))}
                </div>
              )}
            </div>
            <input placeholder="Title" value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="border p-2 rounded text-sm" />
            <div className="flex gap-2">
              <input placeholder="Message" value={noteMessage} onChange={(e) => setNoteMessage(e.target.value)} className="border p-2 flex-1 rounded text-sm" />
              <Button onClick={handleManualNotification}>Send</Button>
            </div>
          </div>
        </Card>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* CLIENT LIST TABLE */}
          <Card className="flex-1 p-6 overflow-x-auto shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h2 className="text-2xl font-bold">User Records</h2>
               <input placeholder="Filter list..." className="border p-2 rounded w-64 shadow-sm text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-400 text-xs uppercase tracking-wider">
                  <th className="p-4 font-semibold">Client Info</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Management</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-700">{client.full_name}</div>
                      <div className="text-xs text-gray-500">{client.email}</div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold uppercase">{client.role}</span>
                    </td>
                    <td className="p-4">
                      {(myRole === 'admin' || myRole === 'master') && (
                        <select 
                          className="border text-xs p-1.5 rounded-md bg-white shadow-sm"
                          value={client.role}
                          onChange={(e) => updateUserRole(client.id, e.target.value)}
                        >
                          <option value="user">User</option>
                          <option value="staff">Staff</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex gap-6 items-center">
                        <button 
                          onClick={() => fetchClientDetails(client.id)}
                          className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-all"
                          title="View Details"
                        >
                          <Eye size={22}/>
                        </button>
                        {myRole === 'admin' && (
                          <button 
                            onClick={() => handleDeleteClient(client.id)}
                            className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all"
                            title="Delete User"
                          >
                            <Trash2 size={22}/>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>

          {/* RIGHT DETAILS PANEL WITH THUMBNAILS */}
          {/* RIGHT DETAILS PANEL - UPDATED FOR TWO COLUMNS */}
{selectedClientId && clientProfile && (
  <Card className="w-full lg:w-[500px] p-6 space-y-6 h-fit sticky top-6 bg-white shadow-2xl border-t-4 border-blue-600 animate-in fade-in slide-in-from-right-4">
    <div className="flex justify-between items-start border-b pb-4">
      <div>
        <h2 className="text-xl font-black text-gray-800">{clientProfile.full_name}</h2>
        <p className="text-sm font-medium text-gray-500">{clientProfile.mobile}</p>
      </div>
      <Button variant="ghost" size="sm" className="rounded-full h-8 w-8 p-0" onClick={() => setSelectedClientId(null)}>✕</Button>
    </div>

    <div>
      <h3 className="font-bold mb-4 flex items-center gap-2 text-blue-700 uppercase text-xs tracking-wider">Documents & Previews</h3>
      
      {/* GRID CONTAINER FOR TWO COLUMNS */}
      <div className="grid grid-cols-2 gap-3">
        {userDocs.length === 0 && (
          <p className="col-span-2 text-xs text-gray-400 italic bg-gray-50 p-3 rounded text-center">No documents found.</p>
        )}
        
        {userDocs.map(doc => (
          <div key={doc.id} className="border border-gray-100 rounded-xl p-3 bg-gray-50 shadow-sm space-y-2">
            <div className="flex justify-between items-center gap-1">
              <span className="font-bold text-[9px] text-gray-700 truncate flex-1">{doc.document_name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[7px] font-black uppercase whitespace-nowrap ${
                doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
              }`}>{doc.status || 'Pending'}</span>
            </div>

            {/* THUMBNAIL */}
            <div className="w-full h-24 bg-gray-200 rounded-lg overflow-hidden border border-gray-100 relative">
               {/\.(jpg|jpeg|png|webp)$/i.test(doc.file_url) ? (
                  <img src={doc.file_url} alt="preview" className="w-full h-full object-cover" />
               ) : /\.pdf$/i.test(doc.file_url) ? (
                  <iframe src={doc.file_url} className="w-full h-full pointer-events-none scale-75" scrolling="no" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-[8px] text-gray-400">No Preview</div>
               )}
            </div>
            
            <div className="flex gap-1 text-center">
              <a href={doc.file_url} target="_blank" className="flex-1 bg-white border py-1 rounded-md text-[8px] font-bold text-gray-600 hover:shadow-sm">View</a>
              <a href={doc.file_url} download className="flex-1 bg-white border py-1 rounded-md text-[8px] font-bold text-gray-600 hover:shadow-sm">Save</a>
            </div>

            {(myRole === 'admin' || myRole === 'staff') && (
              <div className="flex gap-1 pt-1">
                <button 
                  onClick={() => updateDocStatus(doc.id, 'approved')}
                  className="flex-1 bg-green-600 text-white py-1 rounded-md text-[8px] font-black hover:bg-green-700"
                >Approve</button>
                <button 
                  onClick={() => updateDocStatus(doc.id, 'rejected')}
                  className="flex-1 bg-red-600 text-white py-1 rounded-md text-[8px] font-black hover:bg-red-700"
                >Reject</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>

    {/* SERVICES SECTION */}
    <div className="pt-4 border-t">
      <h3 className="font-bold mb-3 text-blue-700 uppercase text-xs tracking-wider">Services</h3>
      <div className="grid grid-cols-1 gap-2">
        {applications.map(app => (
          <div key={app.id} className="bg-white border-2 border-blue-50 p-3 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-2">
               <p className="text-xs font-black text-gray-700">{app.type}</p>
               <p className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter">{app.status}</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" className="flex-1 h-7 text-[9px] font-bold bg-green-600 hover:bg-green-700" onClick={() => updateAppStatus(app.id, 'approved')}>Approve</Button>
              <Button size="sm" className="flex-1 h-7 text-[9px] font-bold bg-red-600 hover:bg-red-700" onClick={() => updateAppStatus(app.id, 'rejected')}>Reject</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </Card>
)}
        </div>
      </div>
    </main>
  );
}