'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Notifications() {
  const [notes, setNotes] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
      setNotes(data || [])
    }
    load()
  }, [])

  return (
    <main className="p-6 max-w-2xl mx-auto space-y-3">
      <h1 className="text-2xl font-bold">Notifications</h1>
      {notes.map(n => (
        <div key={n.id} className="border p-3 rounded bg-white shadow">
          <p className="font-bold">{n.title}</p>
          <p className="text-sm">{n.message}</p>
        </div>
      ))}
    </main>
  )
}
