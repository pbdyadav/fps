'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, Shield, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import BackgroundParticles from '@/components/BackgroundParticles';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">

      {/* PARTICLES BACKGROUND */}
  <BackgroundParticles />
  
      {/* Glow Effects */}
      <div className="absolute w-[500px] h-[500px] bg-indigo-500/20 blur-3xl rounded-full -top-20 -left-20 animate-pulse" />
      <div className="absolute w-[400px] h-[400px] bg-purple-500/20 blur-3xl rounded-full bottom-0 right-0 animate-pulse" />

      {/* HERO */}
      <section className="relative py-28 px-6">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-5xl mx-auto text-center"
        >

          <div className="inline-block px-5 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md mb-8">
            <span className="text-sm font-semibold tracking-wide">
              Secure CA Document Management System
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold leading-tight mb-8 tracking-tight">
            Premium Financial <br /> Document Portal
          </h1>

          <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            A secure, modern and professional platform designed for Chartered Accountants
            and clients to manage taxation and loan documents seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button
              onClick={() => router.push('/login')}
              size="lg"
              className="px-10 py-6 text-base font-semibold bg-white text-slate-900 hover:bg-gray-200 shadow-xl rounded-2xl"
            >
              Client Login
            </Button>

            <Button
              onClick={() => router.push('/signup')}
              size="lg"
              
              className="px-10 py-6 text-base font-semibold bg-blue-200 text-slate-900 hover:bg-gray-200 shadow-xl rounded-2xl"
            >
              Create Account
            </Button>
          </div>
        </motion.div>
      </section>

      {/* FEATURES */}
<section className="py-24 px-6 relative bg-slate-950 text-white"> {/* Background color ensure karne ke liye */}
  <div className="max-w-6xl mx-auto">

    <h2 className="text-3xl font-bold text-center mb-16 tracking-tight text-white">
      Why Choose Our Platform
    </h2>

    <div className="grid md:grid-cols-3 gap-10">

      {/* Card 1 */}
      <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300">
        <div className="w-14 h-14 rounded-xl bg-indigo-500/30 flex items-center justify-center mb-6">
          <Shield className="w-7 h-7 text-indigo-300" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Enterprise Security</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Bank-level encryption ensures your financial records and documents remain completely protected.
        </p>
      </Card>

      {/* Card 2 */}
      <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300">
        <div className="w-14 h-14 rounded-xl bg-purple-500/30 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-7 h-7 text-purple-300" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Professional Workflow</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Structured approval and document review system built specifically for CA operations.
        </p>
      </Card>

      {/* Card 3 */}
      <Card className="p-8 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl hover:scale-105 transition-all duration-300">
        <div className="w-14 h-14 rounded-xl bg-pink-500/30 flex items-center justify-center mb-6">
          <Zap className="w-7 h-7 text-pink-300" />
        </div>
        <h3 className="text-xl font-bold mb-4 text-white">Fast & Efficient</h3>
        <p className="text-slate-300 text-sm leading-relaxed">
          Quick uploads, instant access, and streamlined document processing for better productivity.
        </p>
      </Card>

    </div>
  </div>
</section>

      {/* ABOUT */}
      <section className="py-24 px-6 bg-white/5 backdrop-blur-md border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center space-y-8">

          <h2 className="text-3xl font-bold tracking-tight">
            Designed for Modern CA Firms
          </h2>

          <p className="text-gray-300 leading-relaxed">
            Built with cutting-edge technology, this portal simplifies financial document
            management for individuals and businesses. It enhances transparency,
            efficiency, and communication between CA firms and their clients.
          </p>

          <p className="text-gray-400 text-sm">
            Secure • Professional • Efficient
          </p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 text-center border-t border-white/10 text-gray-400 text-sm">
        © {new Date().getFullYear()} FinDoc Portal. All rights reserved.
      </footer>

    </main>
  );
}
