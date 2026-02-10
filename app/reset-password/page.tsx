'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

export default function ResetPassword() {
  const [password, setPassword] = useState('');

  const handleReset = async () => {
    const { error } = await supabase.auth.updateUser({ password });

    if (error) alert(error.message);
    else alert("Password reset successful 🔐");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow w-full max-w-md space-y-4">
        <h1 className="text-xl font-bold">Set New Password</h1>

        <input
          type="password"
          placeholder="New Password"
          className="w-full border p-2 rounded"
          onChange={(e) => setPassword(e.target.value)}
        />

        <Button onClick={handleReset} className="w-full">
          Reset Password
        </Button>
      </div>
    </main>
  );
}
