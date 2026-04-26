'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { TalentCard } from '../../components/talent/TalentCard';
import { MarketplaceFilters } from '../../components/talent/MarketplaceFilters';
import { TalentCategory, AvailabilityStatus } from '@talent-casting/shared';

export default function MarketplacePage() {
  const [filters, setFilters] = useState({
    page: 1,
    limit: 20,
    search: '',
    category: '',
    gender: '',
    country: '',
    experience: '',
    availability: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['talents', filters],
    queryFn: () =>
      api.get('/talents', { params: filters }).then((r) => r.data.data),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Talent Marketplace</h1>
          <input
            type="text"
            placeholder="Search by name, skill, city..."
            className="input max-w-lg"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
          />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-8">
        {/* Filters sidebar */}
        <aside className="w-64 flex-shrink-0 hidden lg:block">
          <MarketplaceFilters filters={filters} onChange={(f) => setFilters({ ...filters, ...f, page: 1 })} />
        </aside>

        {/* Results */}
        <div className="flex-1">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="card p-4 h-72 animate-pulse bg-gray-100" />
              ))}
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{data?.total ?? 0} talents found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {data?.items?.map((talent: any) => (
                  <TalentCard key={talent._id} talent={talent} />
                ))}
              </div>

              {/* Pagination */}
              {data?.totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: data.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setFilters({ ...filters, page: p })}
                      className={`w-9 h-9 rounded-lg text-sm font-medium transition ${
                        p === filters.page
                          ? 'bg-brand-600 text-white'
                          : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
