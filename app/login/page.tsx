'use client';

import React, { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { motion } from "framer-motion";
import { Lock, Mail } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword(formData);
    if (error) return alert(error.message);

    const { data: { user } } = await supabase.auth.getUser();
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user?.id).single();

    if (profile?.role === 'admin' || profile?.role === 'staff' || profile?.role === 'master')
      router.push('/admin/dashboard');
    else
      router.push('/user/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4">

      {/* Floating Glow */}
      <div className="absolute w-96 h-96 bg-primary/20 blur-3xl rounded-full top-10 left-10 animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="relative z-10 w-full max-w-md p-8 backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl text-white">

          <h1 className="text-3xl font-bold text-center mb-2">Welcome Back</h1>
          <p className="text-center text-sm text-gray-300 mb-6">Secure Client Portal Login</p>

          <form onSubmit={handleLogin} className="space-y-5">

            <div className="relative">
              <Mail className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="w-full pl-10 p-3 rounded-lg bg-white/5 border border-white/20 focus:ring-2 focus:ring-primary outline-none"
              />
            </div>

            <div className="text-right text-sm">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" className="w-full py-6 text-base font-semibold" disabled={loading}>
              {loading ? "Signing in..." : "Secure Login"}
            </Button>
          </form>

          <p className="text-sm text-center mt-6 text-gray-300">
            Don’t have an account? <Link href="/signup" className="text-primary">Sign up</Link>
          </p>
        </Card>
      </motion.div>
    </main>
  );
}
