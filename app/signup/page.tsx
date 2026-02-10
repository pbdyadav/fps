'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entityType, setEntityType] = useState('client');

  const handleSignup = async (e: any) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = data?.user;
    if (!user) {
      alert("Signup failed");
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        email: email,
        role: 'user',
        entity_type: entityType   // ⭐ IMPORTANT
      })
      .eq('id', user.id);

    if (profileError) {
      alert(profileError.message);
      return;
    }

    alert('Signup successful! Please login.');
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-muted">
      <Card className="p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Create Account</h1>

        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
          <select
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
            className="w-full border p-2 rounded"
          >
            <option value="client">Individual</option>
            <option value="business">Business / Company</option>
          </select>
          <input
            type="email"
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <input
            type="password"
            placeholder="Password (min 6 chars)"
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />

          <Button type="submit" className="w-full">Sign Up</Button>
        </form>

        <p className="text-sm mt-4">
          Already have account? <Link href="/login" className="text-primary">Login</Link>
        </p>
      </Card>
    </main>
  );
}
