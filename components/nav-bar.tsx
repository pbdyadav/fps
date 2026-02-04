'use client';

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function NavBar() {
  const [language, setLanguage] = useState('en')
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // 🛑 Prevent build crash
    if (!supabase?.auth) return

    const getUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }

    getUser()

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => listener?.subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    if (!supabase?.auth) return
    await supabase.auth.signOut()
    setUser(null)
    router.push('/')
  }

  const translations = {
    en: {
      home: 'Home',
      loanDocs: 'Loan Documents',
      taxDocs: 'Income Tax Documents',
      login: 'Login',
      logout: 'Logout',
      logoText: 'Prompt Financial Services',
    },
    hi: {
      home: 'होम',
      loanDocs: 'लोन दस्तावेज़',
      taxDocs: 'आयकर दस्तावेज़',
      login: 'लॉगिन',
      logout: 'लॉगआउट',
      logoText: 'प्रॉम्प्ट वित्तीय सेवाएँ',
    },
  };

  const t = translations[language as keyof typeof translations];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 bg-secondary">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">pfs</span>
            </div>
            <span className="font-semibold text-foreground hidden sm:inline">{t.logoText}</span>
          </Link>

          {/* Nav Links (only when logged OUT) */}
          {!user && (
            <div className="hidden md:flex gap-8">
              <Link href="/" className="text-foreground hover:text-primary">{t.home}</Link>
              <Link href="/documents/loan" className="text-foreground hover:text-primary">{t.loanDocs}</Link>
              <Link href="/documents/tax" className="text-foreground hover:text-primary">{t.taxDocs}</Link>
            </div>
          )}

          {/* Right Side */}
          <div className="flex items-center gap-4">
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm px-2 py-1 border border-border rounded-md bg-background"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
            </select>

            {/* 🔥 LOGIN / LOGOUT SWITCH */}
            {user ? (
              <Button onClick={handleLogout} size="sm">
                {t.logout}
              </Button>
            ) : (
              <Button onClick={() => router.push('/login')} size="sm">
                {t.login}
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
