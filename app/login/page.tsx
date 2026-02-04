'use client';

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: formData.email,
    password: formData.password,
  });

  if (error) {
    alert(error.message);
    return;
  }

  // 🔍 Role check after login
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', data.user.id)
    .single();

  if (profile?.role === 'admin') {
    router.push('/admin/dashboard');  // 👑 Admin
  } else {
    router.push('/user/dashboard');   // 👤 Normal User
  }
};


  return (
    <main className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Login</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className="w-full border p-2 rounded"
          />

          <Button type="submit" className="w-full">Login</Button>
        </form>

        <p className="text-sm mt-4">
          Don’t have an account? <Link href="/signup" className="text-primary">Sign up</Link>
        </p>
      </Card>
    </main>
  );
}
