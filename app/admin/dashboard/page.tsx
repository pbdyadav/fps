'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Trash2, Download, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const sendNotification = async (userId: string, title: string, message: string) => {
  const { error } = await supabase.from('notifications').insert([
    { user_id: userId, title, message },
  ]);
  if (error) alert('Error sending notification');
  else alert('Notification Sent ✅');
};

export default function AdminDashboard() {

  const getFinancialYear = () => {
    const now = new Date();
    const year = now.getMonth() < 3 ? now.getFullYear() - 1 : now.getFullYear();
    return `${year}-${year + 1}`;
  };
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
  const [selectedFY, setSelectedFY] = useState("2024-25")
  const [categories, setCategories] = useState<any[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [types, setTypes] = useState<any[]>([]);
  const [newType, setNewType] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [editingTypeId, setEditingTypeId] = useState<string | null>(null);
  const [editingTypeName, setEditingTypeName] = useState('');
  const [showDocManager, setShowDocManager] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const downloadClientReport = async () => {


    // ✅ SECURITY CHECK
    if (myRole !== 'admin') {
      alert("Unauthorized");
      return;
    }

    const { data: profiles } = await supabase.from('profiles').select('*');
    const { data: apps } = await supabase.from('applications').select('*');

    if (!profiles) return alert("No data");

    const finalData = profiles.map(profile => {
      const userApps = apps?.filter(a => a.user_id === profile.id);

      const loanApp = userApps?.find(a => a.type === 'loan');
      const taxApp = userApps?.find(a => a.type === 'tax');

      return {
        Name: profile.full_name,
        Email: profile.email,
        Mobile: profile.mobile,
        Address: profile.address,
        PAN: profile.pan_number,
        GST: profile.gst_number,
        Type: profile.entity_type,
        Loan_Status: loanApp?.status || "Not Applied",
        Tax_Status: taxApp?.status || "Not Applied",
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(finalData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clients");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "CA_Client_Report.xlsx");
  };

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
        fetchCategories();
        fetchTypes();
      }
    };

    checkAccess();
  }, []);
  useEffect(() => {
    if (selectedClientId) {
      loadUserDocuments(selectedClientId);
    }
  }, [selectedFY]);

  const fetchCategories = async () => {
    const { data } = await supabase
      .from('document_categories')
      .select('*')
      .order('order_no');

    setCategories(data || []);
  };

  const addCategory = async () => {
    if (!newCategory) return;

    await supabase.from('document_categories').insert([
      { name: newCategory }
    ]);

    setNewCategory('');
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await supabase.from('document_categories').delete().eq('id', id);
    fetchCategories();
  };

  const updateCategory = async (id: string) => {
    if (!editingName.trim()) return;

    const { error } = await supabase
      .from('document_categories')
      .update({ name: editingName })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingId(null);
    setEditingName('');
    fetchCategories();
  };


  const fetchTypes = async () => {
    const { data } = await supabase
      .from('document_types')
      .select('*')
      .order('order_no');

    setTypes(data || []);
  };




  const addType = async (categoryId: string) => {
    if (!newType.trim()) return;

    const { error } = await supabase
      .from('document_types')
      .insert([
        { name: newType, category_id: categoryId }
      ]);

    if (error) {
      alert(error.message);
      return;
    }

    setNewType('');
    setSelectedCategory(null);
    fetchTypes();
  };



  const deleteType = async (id: string) => {
    const { error } = await supabase
      .from('document_types')
      .delete()
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    fetchTypes();
  };


  const updateType = async (id: string) => {
    if (!editingTypeName.trim()) return;

    const { error } = await supabase
      .from('document_types')
      .update({ name: editingTypeName })
      .eq('id', id);

    if (error) {
      alert(error.message);
      return;
    }

    setEditingTypeId(null);
    setEditingTypeName('');
    fetchTypes();
  };

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
    const { data } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', userId)
      .eq('financial_year', selectedFY);   // ⭐ CRITICAL FIX

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
    <main className="min-h-screen bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 p-6">
      <div className="max-w-7xl mx-auto space-y-6 backdrop-blur-sm">
        <div className="flex justify-between items-center">

          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          {myRole === 'admin' && (
            <Button
              onClick={downloadClientReport}
              className="bg-green-600 text-white"
            >
              Download Client Report
            </Button>
          )}


          <select
            className="border p-2 rounded"
            value={selectedFY}
            onChange={(e) => setSelectedFY(e.target.value)}
          >
            <option value="2025-26">FY 2025-26</option>
            <option value="2024-25">FY 2024-25</option>
            <option value="2023-24">FY 2023-24</option>
            <option value="2022-23">FY 2022-23</option>
          </select>
        </div>

        {/* DOCUMENT CATEGORY TOGGLE BUTTON */}
        <Card className="p-4 shadow-md rounded-2xl border bg-white">
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">📂 Document Management</h2>
            <Button
              variant="outline"
              onClick={() => setShowDocManager(!showDocManager)}
            >
              {showDocManager ? "Close" : "Open"}
            </Button>
          </div>
        </Card>

        {/* DOCUMENT MANAGER PANEL */}
        {showDocManager && (
          <Card className="p-6 shadow-xl rounded-2xl border bg-white mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* LEFT SIDE - CATEGORIES */}
              <div className="border-r pr-4 max-h-[400px] overflow-y-auto">
                <h3 className="font-bold mb-3">Categories</h3>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    placeholder="New Category"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border p-2 rounded w-full"
                  />
                  <Button onClick={addCategory}>Add</Button>
                </div>

                {categories.map(cat => (
                  <div
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={`p-2 rounded cursor-pointer flex justify-between items-center ${activeCategoryId === cat.id
                      ? "bg-blue-100"
                      : "hover:bg-gray-100"
                      }`}
                  >
                    {editingId === cat.id ? (
                      <input
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="border p-1 rounded text-sm"
                      />
                    ) : (
                      <span>{cat.name}</span>
                    )}
                    <div className="flex gap-1">
                      {editingId === cat.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCategory(cat.id);
                            }}
                          >
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(null);
                            }}
                          >
                            Cancel
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingId(cat.id);
                              setEditingName(cat.name);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteCategory(cat.id);
                            }}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* RIGHT SIDE - TYPES */}
              <div className="max-h-[400px] overflow-y-auto">
                <h3 className="font-bold mb-3">Document Types</h3>

                {activeCategoryId ? (
                  <>
                    <div className="flex gap-2 mb-4">
                      <input
                        value={newType}
                        onChange={(e) => setNewType(e.target.value)}
                        placeholder="New Document Type"
                        className="border p-2 rounded w-full"
                      />
                      <Button onClick={() => addType(activeCategoryId)}>Add</Button>
                    </div>

                    {types
                      .filter(t => t.category_id === activeCategoryId)
                      .map(type => (
                        <div
                          key={type.id}
                          className="border p-3 rounded mb-3 space-y-2"
                        >

                          {/* TOP ROW */}
                          <div className="flex justify-between items-center">
                            {editingTypeId === type.id ? (
                              <input
                                value={editingTypeName}
                                onChange={(e) => setEditingTypeName(e.target.value)}
                                className="border p-1 rounded text-sm"
                              />
                            ) : (
                              <span className="font-medium">{type.name}</span>
                            )}

                            <div className="flex gap-2">
                              {editingTypeId === type.id ? (
                                <>
                                  <Button size="sm" onClick={() => updateType(type.id)}>Save</Button>
                                  <Button size="sm" variant="outline" onClick={() => setEditingTypeId(null)}>Cancel</Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setEditingTypeId(type.id);
                                      setEditingTypeName(type.name);
                                    }}
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteType(type.id)}
                                  >
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* SETTINGS ROW */}
                          <div className="flex items-center gap-6 text-xs">

                            {/* REQUIRED */}
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={type.is_required}
                                onChange={async () => {
                                  await supabase
                                    .from('document_types')
                                    .update({ is_required: !type.is_required })
                                    .eq('id', type.id);
                                  fetchTypes();
                                }}
                              />
                              Required
                            </label>

                            {/* ACTIVE */}
                            <label className="flex items-center gap-1 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={type.is_active}
                                onChange={async () => {
                                  await supabase
                                    .from('document_types')
                                    .update({ is_active: !type.is_active })
                                    .eq('id', type.id);
                                  fetchTypes();
                                }}
                              />
                              Active
                            </label>

                          </div>


                        </div>
                      ))}
                  </>
                ) : (
                  <p className="text-gray-400 text-sm">
                    Select a category to manage document types.
                  </p>
                )}
              </div>

            </div>
          </Card>
        )}

        <div className="flex gap-3">
          <Button variant={viewType === 'client' ? 'default' : 'outline'} onClick={() => setViewType('client')}>Individual</Button>
          <Button variant={viewType === 'business' ? 'default' : 'outline'} onClick={() => setViewType('business')}>Business</Button>
        </div>
      </div>

      <Card className="p-6 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl">
        <h2 className="text-xl font-bold mb-4 text-slate-800 tracking-tight">
          📅 Financial Year {getFinancialYear()}
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">FY Start</p>
            <p className="font-bold">1 April</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">FY End</p>
            <p className="font-bold">31 March</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">ITR Due</p>
            <p className="font-bold">31 July</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">Audit Due</p>
            <p className="font-bold">31 October</p>
          </div>

          <div className="bg-white p-3 rounded-lg shadow-sm">
            <p className="text-gray-500 text-xs">GST Annual</p>
            <p className="font-bold">31 December</p>
          </div>
        </div>
      </Card>

      {/* NOTIFICATION CARD */}
      <Card className="p-6 space-y-4 shadow-xl rounded-2xl border border-slate-200 bg-white">
        <h2 className="text-lg font-bold">Quick Notify To Client</h2>
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
        <Card className="flex-1 p-6 overflow-x-auto shadow-xl rounded-2xl border border-slate-200 bg-white">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">User Records</h2>
            <input placeholder="Filter list..." className="border p-2 rounded w-64 shadow-sm text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Client Info</th>
                <th className="p-4 font-semibold">Role</th>
                <th className="p-4 font-semibold">Management</th>
                <th className="p-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredClients.map((client) => (
                <tr key={client.id} className="border-b hover:bg-slate-50 transition-all duration-200">
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
                        <option value="master">Master User</option>
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
                        <Eye size={22} />
                      </button>
                      {myRole === 'admin' && (
                        <button
                          onClick={() => handleDeleteClient(client.id)}
                          className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-all"
                          title="Delete User"
                        >
                          <Trash2 size={22} />
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
          <Card className="w-full lg:w-[500px] p-6 space-y-6 h-fit sticky top-6 bg-white/95 backdrop-blur-xl shadow-2xl border border-slate-200 rounded-2xl animate-in fade-in slide-in-from-right-4">
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
                  <div key={doc.id} className="border border-slate-200 rounded-xl p-3 bg-white shadow-md hover:shadow-lg transition-all space-y-2">
                    <div className="flex justify-between items-center gap-1">
                      <span className="font-bold text-[9px] text-gray-700 truncate flex-1">{doc.document_name}</span>
                      <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black uppercase whitespace-nowrap ${doc.status === 'approved' ? 'bg-green-100 text-green-700' : doc.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'
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
                      <a href={doc.file_url} target="_blank" className="flex-1 bg-white border py-1 rounded-md text-[12px] font-bold text-gray-600 hover:shadow-sm">View</a>
                      <a href={doc.file_url} download className="flex-1 bg-white border py-1 rounded-md text-[12px] font-bold text-gray-600 hover:shadow-sm">Download</a>
                    </div>

                    {(myRole === 'admin' || myRole === 'staff') && (
                      <div className="flex gap-1 pt-1">
                        <button
                          onClick={() => updateDocStatus(doc.id, 'approved')}
                          className="flex-1 bg-green-600 text-white py-1 rounded-md text-[12px] font-black hover:bg-green-700"
                        >Approve</button>
                        <button
                          onClick={() => updateDocStatus(doc.id, 'rejected')}
                          className="flex-1 bg-red-600 text-white py-1 rounded-md text-[12px] font-black hover:bg-red-700"
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
                  <div key={app.id} className="bg-white border border-slate-200 p-3 rounded-xl shadow-md hover:shadow-lg transition-all">
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
    </main >
  );
}