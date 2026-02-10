'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return router.push('/login');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  const saveProfile = async () => {
  const isIndividual = profile.entity_type === 'client';

  const isComplete = isIndividual
    ? profile.full_name && profile.mobile && profile.pan_number
    : profile.company_name && profile.gstin;

  const { error } = await supabase
    .from('profiles')
    .update({
      ...profile,
      profile_completed: !!isComplete
    })
    .eq('id', profile.id);

  if (error) {
    alert(error.message);
  } else {
    alert("Profile saved ✅");
    router.push('/user/dashboard');   // 🔥 redirect after save
  }
};


  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <main className="p-6 max-w-xl mx-auto">
      <Card className="p-6 space-y-4">
        <h1 className="text-2xl font-bold">My Profile</h1>

        {/* ENTITY TYPE */}
        <select
          value={profile.entity_type || 'client'}
          onChange={(e) => setProfile({ ...profile, entity_type: e.target.value })}
          className="border p-2 rounded w-full"
        >
          <option value="client">Individual</option>
          <option value="business">Business</option>
        </select>

        {/* INDIVIDUAL FORM */}
        {profile.entity_type === 'client' && (
          <>
            <input className="border p-2 rounded w-full"
              value={profile.full_name || ''}
              onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              placeholder="Full Name"
            />
            <input className="border p-2 rounded w-full"
              value={profile.mobile || ''}
              onChange={(e) => setProfile({ ...profile, mobile: e.target.value })}
              placeholder="Mobile"
            />
            <input className="border p-2 rounded w-full"
              value={profile.pan_number || ''}
              onChange={(e) => setProfile({ ...profile, pan_number: e.target.value })}
              placeholder="PAN Number"
            />
          </>
        )}

        {/* BUSINESS FORM */}
        {profile.entity_type === 'business' && (
          <>
            <input className="border p-2 rounded w-full"
              value={profile.company_name || ''}
              onChange={(e) => setProfile({ ...profile, company_name: e.target.value })}
              placeholder="Company Name"
            />
            <input className="border p-2 rounded w-full"
              value={profile.gstin || ''}
              onChange={(e) => setProfile({ ...profile, gstin: e.target.value })}
              placeholder="GSTIN"
            />
            <input className="border p-2 rounded w-full"
              value={profile.cin || ''}
              onChange={(e) => setProfile({ ...profile, cin: e.target.value })}
              placeholder="CIN"
            />
          </>
        )}
        
        <Button onClick={saveProfile}>Save Profile</Button>
      </Card>
    </main>
  );
}
