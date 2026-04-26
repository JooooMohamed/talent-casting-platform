import Link from 'next/link';
import Image from 'next/image';
import { calculateAge, getInitials } from '../../lib/utils';

interface TalentCardProps {
  talent: {
    _id: string;
    slug: string;
    fullName: string;
    profilePhoto?: { url: string };
    dateOfBirth?: string;
    gender?: string;
    city?: string;
    country?: string;
    categories?: string[];
    experience?: string;
    availability?: string;
    isVerified?: boolean;
    isFeatured?: boolean;
  };
}

const AVAILABILITY_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  busy: 'bg-yellow-100 text-yellow-700',
  not_looking: 'bg-gray-100 text-gray-600',
};

export function TalentCard({ talent }: TalentCardProps) {
  return (
    <Link href={`/talents/${talent.slug}`}>
      <div className="card overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
        {/* Photo */}
        <div className="relative h-52 bg-gray-100">
          {talent.profilePhoto?.url ? (
            <Image
              src={talent.profilePhoto.url}
              alt={talent.fullName}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-brand-100 to-brand-200">
              <span className="text-3xl font-bold text-brand-600">{getInitials(talent.fullName)}</span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex gap-1">
            {talent.isFeatured && (
              <span className="badge bg-amber-400 text-amber-900">⭐ Featured</span>
            )}
            {talent.isVerified && (
              <span className="badge bg-blue-100 text-blue-700">✓ Verified</span>
            )}
          </div>

          {talent.availability && (
            <div className="absolute top-2 right-2">
              <span className={`badge ${AVAILABILITY_COLORS[talent.availability] || 'bg-gray-100 text-gray-600'}`}>
                {talent.availability === 'available' ? 'Available' : talent.availability === 'busy' ? 'Busy' : 'Not Looking'}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 truncate">{talent.fullName}</h3>

          <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
            {talent.dateOfBirth && <span>{calculateAge(talent.dateOfBirth)}y</span>}
            {talent.gender && <span>· {talent.gender}</span>}
            {talent.city && <span>· {talent.city}</span>}
          </div>

          {talent.categories && talent.categories.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {talent.categories.slice(0, 3).map((cat) => (
                <span key={cat} className="badge bg-brand-50 text-brand-700 capitalize">
                  {cat.replace('_', ' ')}
                </span>
              ))}
            </div>
          )}

          {talent.experience && (
            <p className="text-xs text-gray-400 mt-2 capitalize">{talent.experience}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
