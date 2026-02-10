'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function ChangePasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (error) alert(error.message);
    else {
      alert("Password updated successfully 🔒");
      setPassword('');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">Change Password</h1>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button onClick={handleChangePassword} disabled={loading} className="w-full">
          {loading ? "Updating..." : "Update Password"}
        </Button>
      </div>
    </main>
  );
}
