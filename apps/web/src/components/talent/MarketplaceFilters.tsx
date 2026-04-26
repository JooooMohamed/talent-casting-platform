'use client';

import { TalentCategory, ExperienceLevel, AvailabilityStatus } from '@talent-casting/shared';

interface FiltersProps {
  filters: Record<string, any>;
  onChange: (f: Record<string, any>) => void;
}

export function MarketplaceFilters({ filters, onChange }: FiltersProps) {
  const select = (field: string, value: string) =>
    onChange({ [field]: filters[field] === value ? '' : value });

  return (
    <div className="card p-5 space-y-6 sticky top-6">
      <h3 className="font-semibold text-gray-800">Filters</h3>

      {/* Category */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Category</p>
        <div className="flex flex-wrap gap-1.5">
          {Object.values(TalentCategory).map((cat) => (
            <button
              key={cat}
              onClick={() => select('category', cat)}
              className={`badge cursor-pointer transition ${
                filters.category === cat
                  ? 'bg-brand-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Gender */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Gender</p>
        <div className="flex gap-1.5">
          {['male', 'female', 'non_binary'].map((g) => (
            <button
              key={g}
              onClick={() => select('gender', g)}
              className={`badge cursor-pointer transition ${
                filters.gender === g ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {g.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Experience */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Experience</p>
        <div className="flex flex-col gap-1">
          {Object.values(ExperienceLevel).map((lvl) => (
            <button
              key={lvl}
              onClick={() => select('experience', lvl)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                filters.experience === lvl ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Availability */}
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Availability</p>
        <div className="flex flex-col gap-1">
          {Object.values(AvailabilityStatus).map((avail) => (
            <button
              key={avail}
              onClick={() => select('availability', avail)}
              className={`text-left px-3 py-1.5 rounded-lg text-sm transition ${
                filters.availability === avail ? 'bg-brand-50 text-brand-700 font-medium' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {avail.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Clear */}
      <button
        onClick={() => onChange({ category: '', gender: '', experience: '', availability: '', country: '' })}
        className="text-sm text-brand-600 hover:underline"
      >
        Clear all filters
      </button>
    </div>
  );
}
