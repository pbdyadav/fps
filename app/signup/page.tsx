'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { motion } from "framer-motion";
import { User, Mail, Lock, Building2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [entityType, setEntityType] = useState('client');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } }
    });

    if (error) {
      alert(error.message);
      setLoading(false);
      return;
    }

    const user = data?.user;
    if (!user) {
      alert("Signup failed");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        full_name: name,
        email: email,
        role: 'user',
        entity_type: entityType
      })
      .eq('id', user.id);

    if (profileError) {
      alert(profileError.message);
      setLoading(false);
      return;
    }

    alert('Account created successfully! Please login.');
    router.push('/login');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">

      {/* Glow effect */}
      <div className="absolute w-96 h-96 bg-primary/20 blur-3xl rounded-full top-20 right-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white">

          <h1 className="text-3xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-sm text-gray-300 mb-6">
            Register to access your secure document portal
          </p>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div className="relative">
              <User className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Full Name"
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Entity Type */}
            <div className="relative">
              <Building2 className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <select
                value={entityType}
                onChange={(e) => setEntityType(e.target.value)}
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              >
                <option value="client">Individual</option>
                <option value="business">Business / Company</option>
              </select>
            </div>

            {/* Email */}
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                placeholder="Email Address"
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                placeholder="Password (min 6 characters)"
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <Button type="submit" className="w-full py-6 text-base font-semibold" disabled={loading}>
              {loading ? "Creating Account..." : "Create Secure Account"}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-300">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Login
            </Link>
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
