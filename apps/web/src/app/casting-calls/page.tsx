'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Search } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate } from '../../lib/utils';
import { useAuthStore } from '../../store/auth.store';

export default function CastingCallsPage() {
  const qc = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [applyTarget, setApplyTarget] = useState<any | null>(null);
  const [coverMessage, setCoverMessage] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['casting-calls', search],
    queryFn: () => api.get('/casting-calls', { params: { search, limit: 30 } }).then((r) => r.data.data),
  });

  const applyMutation = useMutation({
    mutationFn: () => api.post(`/casting-calls/${applyTarget._id}/apply`, { coverMessage }),
    onSuccess: () => {
      setApplyTarget(null);
      setCoverMessage('');
      qc.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });

  const isTalent = user?.role === 'talent';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Casting Calls</h1>
              <p className="text-sm text-gray-500 mt-1">Open roles from production companies and casting teams.</p>
            </div>
            <Link href="/marketplace" className="btn-secondary text-sm">Browse Talents</Link>
          </div>
          <div className="relative max-w-xl mt-5">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-9"
              placeholder="Search title, role, production details..."
            />
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {isLoading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="card h-40 animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (!data?.items || data.items.length === 0) ? (
          <div className="card p-10 text-center text-gray-400">No casting calls found.</div>
        ) : (
          <div className="grid gap-4">
            {data.items.map((call: any) => (
              <article key={call._id} className="card p-5">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-gray-900">{call.title}</h2>
                      <span className="badge bg-green-100 text-green-700 capitalize">{call.status}</span>
                      {call.isFeatured && <span className="badge bg-amber-100 text-amber-700">Featured</span>}
                    </div>
                    {call.roleType && <p className="text-sm text-brand-600 font-medium mt-1">{call.roleType}</p>}
                    <p className="text-sm text-gray-600 mt-3 line-clamp-3">{call.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-4">
                      {call.categories?.map((c: string) => (
                        <span key={c} className="badge bg-brand-50 text-brand-700 capitalize">{c.replace('_', ' ')}</span>
                      ))}
                    </div>
                    {call.deadline && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-4">
                        <CalendarDays className="h-4 w-4" />
                        Deadline {formatDate(call.deadline)}
                      </div>
                    )}
                  </div>
                  <div className="flex md:flex-col gap-2 md:w-40">
                    {isTalent ? (
                      <button onClick={() => setApplyTarget(call)} className="btn-primary w-full text-sm">Apply</button>
                    ) : (
                      <Link href="/auth/login" className="btn-primary w-full text-sm text-center">Sign in to apply</Link>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {applyTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">Apply to {applyTarget.title}</h2>
            <textarea
              value={coverMessage}
              onChange={(e) => setCoverMessage(e.target.value)}
              className="input mt-4 min-h-32"
              placeholder="Short cover message..."
            />
            {applyMutation.error && (
              <p className="text-sm text-red-600 mt-3">
                {(applyMutation.error as any).response?.data?.error || 'Could not submit application.'}
              </p>
            )}
            <div className="flex justify-end gap-3 mt-5">
              <button type="button" onClick={() => setApplyTarget(null)} className="btn-secondary">Cancel</button>
              <button
                type="button"
                onClick={() => applyMutation.mutate()}
                disabled={applyMutation.isPending}
                className="btn-primary"
              >
                {applyMutation.isPending ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
