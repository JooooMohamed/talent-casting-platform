'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '../../lib/api';

export default function AdminDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'overview' | 'pending' | 'users'>('overview');

  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => api.get('/admin/dashboard').then((r) => r.data.data),
  });

  const { data: pending } = useQuery({
    queryKey: ['pending-talents'],
    queryFn: () => api.get('/admin/talents/pending').then((r) => r.data.data),
    enabled: tab === 'pending',
  });

  const { data: users } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => api.get('/admin/users').then((r) => r.data.data),
    enabled: tab === 'users',
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => api.put(`/admin/talents/${id}/approve`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-talents'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      api.put(`/admin/talents/${id}/reject`, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['pending-talents'] }),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          {(['overview', 'pending', 'users'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-3 text-sm font-medium border-b-2 transition capitalize ${
                tab === t ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'pending' ? 'Pending Approvals' : t}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Overview */}
        {tab === 'overview' && stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: stats.totalUsers },
              { label: 'Total Talents', value: stats.talents?.total },
              { label: 'Approved', value: stats.talents?.approved },
              { label: 'Pending Review', value: stats.talents?.pending },
            ].map((s) => (
              <div key={s.label} className="card p-6 text-center">
                <div className="text-3xl font-bold text-brand-600">{s.value ?? 0}</div>
                <div className="text-sm text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Approvals */}
        {tab === 'pending' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Pending Profile Approvals</h2>
            {pending?.items?.length === 0 && (
              <div className="card p-10 text-center text-gray-400">No pending profiles.</div>
            )}
            {pending?.items?.map((profile: any) => (
              <div key={profile._id} className="card p-5 flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{profile.fullName}</p>
                  <p className="text-sm text-gray-500">{profile.city}, {profile.country} · {profile.experience}</p>
                  <div className="flex gap-1 mt-1">
                    {profile.categories?.map((c: string) => (
                      <span key={c} className="badge bg-gray-100 text-gray-600 text-xs capitalize">{c}</span>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => approveMutation.mutate(profile._id)}
                    className="btn-primary text-sm py-1.5 px-4"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) rejectMutation.mutate({ id: profile._id, reason });
                    }}
                    className="btn-secondary text-sm py-1.5 px-4 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users */}
        {tab === 'users' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">Email</th>
                  <th className="px-4 py-3 text-left">Role</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users?.items?.map((user: any) => (
                  <tr key={user._id}>
                    <td className="px-4 py-3 font-medium">{user.email}</td>
                    <td className="px-4 py-3 capitalize">{user.role}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${user.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() =>
                          api.put(`/admin/users/${user._id}/status`, {
                            status: user.status === 'active' ? 'suspended' : 'active',
                          }).then(() => qc.invalidateQueries({ queryKey: ['admin-users'] }))
                        }
                        className="text-xs text-brand-600 hover:underline"
                      >
                        {user.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
