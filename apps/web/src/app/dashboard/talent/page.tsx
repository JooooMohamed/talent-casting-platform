'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../../lib/api';

export default function TalentDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'profile' | 'applications' | 'notifications'>('profile');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-talent-profile'],
    queryFn: () => api.get('/talents/me/profile').then((r) => r.data.data).catch(() => null),
  });

  const { data: applications } = useQuery({
    queryKey: ['my-applications'],
    queryFn: () => api.get('/casting-calls').then((r) => r.data.data),
    enabled: tab === 'applications',
  });

  const [form, setForm] = useState({ fullName: '', bio: '', city: '', country: '' });
  const [submitting, setSubmitting] = useState(false);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/talents/me/profile', form);
      qc.invalidateQueries({ queryKey: ['my-talent-profile'] });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
        {profile?.approvalStatus && (
          <div className={`mt-2 inline-flex px-3 py-1 rounded-full text-xs font-medium ${
            profile.approvalStatus === 'approved' ? 'bg-green-100 text-green-700' :
            profile.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            Profile: {profile.approvalStatus}
            {profile.rejectionReason && ` — ${profile.rejectionReason}`}
          </div>
        )}
      </div>

      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          {(['profile', 'applications', 'notifications'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition capitalize ${
                tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'profile' && (
          <div className="card p-8">
            <h2 className="text-xl font-semibold mb-6">Edit Profile</h2>
            <form onSubmit={saveProfile} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    required
                    className="input"
                    defaultValue={profile?.fullName}
                    placeholder="Your full name"
                    onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    className="input"
                    defaultValue={profile?.city}
                    placeholder="Cairo"
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input
                    className="input"
                    defaultValue={profile?.country}
                    placeholder="Egypt"
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                <textarea
                  rows={4}
                  className="input"
                  defaultValue={profile?.bio}
                  placeholder="Tell casting directors about yourself..."
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Saving...' : 'Save Profile'}
              </button>
            </form>
          </div>
        )}

        {tab === 'applications' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Casting Calls</h2>
            <p className="text-sm text-gray-500">Browse and apply to casting calls from the <a href="/casting-calls" className="text-brand-600 hover:underline">Casting Board</a>.</p>
          </div>
        )}

        {tab === 'notifications' && (
          <div className="card p-8 text-center text-gray-400">
            No notifications yet.
          </div>
        )}
      </div>
    </div>
  );
}
