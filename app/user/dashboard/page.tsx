'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Upload, File } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function UserDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);

  // 🔔 Load Notifications
  const loadNotifications = async (userId: string) => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };
  const loadApplications = async (userId: string) => {
    const { data } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setApplications(data || []);
  };
  // 🔐 Check Login
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

  // 🔔 Load notifications after user found
  useEffect(() => {
    if (user) {
      loadNotifications(user.id);
      loadApplications(user.id);   // ⭐ ADD THIS
    }
  }, [user]);

  // ✅ Mark as Read
  const markAsRead = async (id: string) => {
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id);

    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, is_read: true } : n)
    );
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) return <p className="p-10 text-center">Loading dashboard...</p>;

  return (
    <main className="min-h-screen p-6 bg-gray-100">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-3xl font-bold">
          Welcome {user?.user_metadata?.full_name || 'User'}
        </h1>

        {unreadCount > 0 && (
          <span className="bg-red-600 text-white text-xs px-3 py-1 rounded-full">
            {unreadCount} New
          </span>
        )}
      </div>

      <Card className="p-6 mb-6">
        Logged in as: <b>{user?.email}</b>
      </Card>

      {/* 🔔 Notifications */}
      {notifications.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-400 p-4 rounded mb-6">
          <h2 className="font-bold text-yellow-700 mb-2">🔔 Notifications</h2>

          {notifications.map((note) => (
            <div
              key={note.id}
              className={`border-b py-2 ${!note.is_read ? 'bg-yellow-100' : ''}`}
            >
              <p className="font-semibold">{note.title}</p>
              <p className="text-sm">{note.message}</p>

              {!note.is_read && (
                <button
                  onClick={() => markAsRead(note.id)}
                  className="text-xs text-blue-600 underline mt-1"
                >
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
      {/* 📄 My Applications */}
      {applications.length > 0 && (
        <div className="bg-white border p-4 rounded mb-6">
          <h2 className="text-xl font-bold mb-3">📄 My Applications</h2>

          <div className="space-y-2">
            {applications.map((app) => (
              <div
                key={app.id}
                className="flex justify-between items-center border p-3 rounded bg-gray-50"
              >
                <div>
                  <p className="font-semibold capitalize">{app.type} Service</p>
                  <p className="text-xs text-gray-500">
                    {new Date(app.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="text-sm font-bold">
                  {app.status === 'submitted' && <span className="text-yellow-600">🟡 Pending</span>}
                  {app.status === 'approved' && <span className="text-green-600">🟢 Approved</span>}
                  {app.status === 'rejected' && <span className="text-red-600">🔴 Rejected</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* 📁 ACTION CARDS ONLY (NO LEFT MENU HERE) */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 flex flex-col items-center text-center shadow-md">
          <Upload className="w-10 h-10 text-primary mb-3" />
          <h2 className="text-xl font-bold mb-2">Loan Documents</h2>
          <p className="text-sm mb-4 text-gray-500">
            Upload KYC, bank, property, loan papers
          </p>
          <Button onClick={() => router.push('/documents/loan-v2')} className="w-full">
            Go to Loan Upload
          </Button>
        </Card>

        <Card className="p-6 flex flex-col items-center text-center shadow-md">
          <File className="w-10 h-10 text-primary mb-3" />
          <h2 className="text-xl font-bold mb-2">Tax Documents</h2>
          <p className="text-sm mb-4 text-gray-500">
            Upload ITR, PAN, Aadhaar, LIC, GST
          </p>
          <Button onClick={() => router.push('/documents/tax')} className="w-full">
            Go to Tax Upload
          </Button>
        </Card>
      </div>
    </main>
  );
}
