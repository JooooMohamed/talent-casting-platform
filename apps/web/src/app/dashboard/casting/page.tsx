'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import Link from 'next/link';
import { api } from '../../../lib/api';
import { formatDate } from '../../../lib/utils';

export default function CastingDashboard() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<'saved' | 'calls' | 'create'>('saved');
  const [newCall, setNewCall] = useState({ title: '', description: '', roleType: '', deadline: '' });

  const { data: saved } = useQuery({
    queryKey: ['saved-talents'],
    queryFn: () => api.get('/casting/me/saved').then((r) => r.data.data),
    enabled: tab === 'saved',
  });

  const { data: calls } = useQuery({
    queryKey: ['my-casting-calls'],
    queryFn: () => api.get('/casting-calls/my/calls').then((r) => r.data.data),
    enabled: tab === 'calls',
  });

  const createMutation = useMutation({
    mutationFn: (dto: any) => api.post('/casting-calls', dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['my-casting-calls'] });
      setTab('calls');
    },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">Casting Dashboard</h1>
      </div>

      <div className="bg-white border-b px-6">
        <div className="flex gap-6">
          {[{ key: 'saved', label: 'Saved Talents' }, { key: 'calls', label: 'My Casting Calls' }, { key: 'create', label: '+ Post Casting Call' }].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`py-3 text-sm font-medium border-b-2 transition ${
                tab === t.key ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Saved Talents */}
        {tab === 'saved' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Saved Talents</h2>
              <Link href="/marketplace" className="btn-primary text-sm">Browse Marketplace</Link>
            </div>
            {(!saved || saved.length === 0) ? (
              <div className="card p-10 text-center text-gray-400">No saved talents yet. <Link href="/marketplace" className="text-brand-600 hover:underline">Browse talents</Link>.</div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {saved.map((t: any) => (
                  <div key={t._id} className="card p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center font-bold text-brand-600">
                      {t.fullName?.[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{t.fullName}</p>
                      <p className="text-sm text-gray-500">{t.city}, {t.country}</p>
                    </div>
                    <Link href={`/talents/${t.slug}`} className="text-sm text-brand-600 hover:underline">View</Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* My Casting Calls */}
        {tab === 'calls' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">My Casting Calls</h2>
              <button onClick={() => setTab('create')} className="btn-primary text-sm">+ New</button>
            </div>
            {(!calls?.items || calls.items.length === 0) ? (
              <div className="card p-10 text-center text-gray-400">No casting calls yet.</div>
            ) : (
              calls.items.map((call: any) => (
                <div key={call._id} className="card p-5">
                  <div className="flex justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">{call.title}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{call.description}</p>
                    </div>
                    <span className={`badge h-fit ${call.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {call.status}
                    </span>
                  </div>
                  {call.deadline && (
                    <p className="text-xs text-gray-400 mt-2">Deadline: {formatDate(call.deadline)}</p>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Create Casting Call */}
        {tab === 'create' && (
          <div className="card p-8 max-w-2xl">
            <h2 className="text-xl font-semibold mb-6">Post a Casting Call</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate(newCall);
              }}
              className="space-y-5"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input required className="input" placeholder="e.g. Lead Actor for Drama Series" value={newCall.title} onChange={(e) => setNewCall({ ...newCall, title: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role Type</label>
                <input className="input" placeholder="e.g. Lead, Supporting, Extra" value={newCall.roleType} onChange={(e) => setNewCall({ ...newCall, roleType: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea required rows={5} className="input" placeholder="Describe the role, requirements, and production details..." value={newCall.description} onChange={(e) => setNewCall({ ...newCall, description: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                <input type="date" className="input" value={newCall.deadline} onChange={(e) => setNewCall({ ...newCall, deadline: e.target.value })} />
              </div>
              <div className="flex gap-3">
                <button type="submit" disabled={createMutation.isPending} className="btn-primary">
                  {createMutation.isPending ? 'Publishing...' : 'Publish Casting Call'}
                </button>
                <button type="button" onClick={() => setTab('calls')} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
