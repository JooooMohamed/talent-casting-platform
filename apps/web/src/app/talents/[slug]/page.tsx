'use client';

import { useQuery } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { api } from '../../../lib/api';
import { calculateAge, formatDate, getInitials } from '../../../lib/utils';

export default function TalentProfilePage() {
  const { slug } = useParams<{ slug: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['talent', slug],
    queryFn: () => api.get(`/talents/${slug}`).then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Loading profile...</div>
      </div>
    );
  }

  if (!data) return <div className="p-10 text-center text-gray-400">Profile not found.</div>;

  const talent = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* Hero card */}
        <div className="card overflow-hidden">
          <div className="h-32 bg-gradient-to-r from-brand-600 to-purple-600" />
          <div className="px-8 pb-8">
            <div className="flex items-end gap-6 -mt-12 mb-4">
              <div className="w-24 h-24 rounded-2xl border-4 border-white overflow-hidden bg-brand-100 flex-shrink-0">
                {talent.profilePhoto?.url ? (
                  <Image src={talent.profilePhoto.url} alt={talent.fullName} width={96} height={96} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-bold text-brand-600">
                    {getInitials(talent.fullName)}
                  </div>
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-gray-900">{talent.fullName}</h1>
                  {talent.isVerified && <span className="badge bg-blue-100 text-blue-700">✓ Verified</span>}
                  {talent.isFeatured && <span className="badge bg-amber-100 text-amber-700">⭐ Featured</span>}
                </div>
                <p className="text-gray-500 text-sm mt-0.5">
                  {talent.dateOfBirth && `${calculateAge(talent.dateOfBirth)} years · `}
                  {talent.gender && `${talent.gender} · `}
                  {[talent.city, talent.country].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {talent.categories?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {talent.categories.map((cat: string) => (
                  <span key={cat} className="badge bg-brand-50 text-brand-700 capitalize">{cat.replace('_', ' ')}</span>
                ))}
              </div>
            )}

            {talent.bio && <p className="text-gray-600 leading-relaxed">{talent.bio}</p>}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Details */}
          <div className="md:col-span-1 space-y-4">
            <div className="card p-5">
              <h2 className="font-semibold text-gray-800 mb-3">Details</h2>
              <dl className="space-y-2 text-sm">
                {talent.experience && <div className="flex justify-between"><dt className="text-gray-500">Experience</dt><dd className="font-medium capitalize">{talent.experience}</dd></div>}
                {talent.availability && <div className="flex justify-between"><dt className="text-gray-500">Availability</dt><dd className="font-medium capitalize">{talent.availability.replace('_', ' ')}</dd></div>}
                {talent.height && <div className="flex justify-between"><dt className="text-gray-500">Height</dt><dd className="font-medium">{talent.height} cm</dd></div>}
                {talent.weight && <div className="flex justify-between"><dt className="text-gray-500">Weight</dt><dd className="font-medium">{talent.weight} kg</dd></div>}
                {talent.eyeColor && <div className="flex justify-between"><dt className="text-gray-500">Eyes</dt><dd className="font-medium capitalize">{talent.eyeColor}</dd></div>}
                {talent.hairColor && <div className="flex justify-between"><dt className="text-gray-500">Hair</dt><dd className="font-medium capitalize">{talent.hairColor}</dd></div>}
              </dl>
            </div>

            {talent.languages?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Languages</h2>
                <ul className="space-y-1 text-sm">
                  {talent.languages.map((l: any) => (
                    <li key={l.language} className="flex justify-between">
                      <span className="text-gray-700">{l.language}</span>
                      <span className="text-gray-400 capitalize">{l.level}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {talent.skills?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-1.5">
                  {talent.skills.map((s: string) => (
                    <span key={s} className="badge bg-gray-100 text-gray-700">{s}</span>
                  ))}
                </div>
              </div>
            )}

            {talent.socialLinks && Object.values(talent.socialLinks).some(Boolean) && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Social</h2>
                <div className="space-y-2">
                  {Object.entries(talent.socialLinks).map(([platform, url]) =>
                    url ? (
                      <a key={platform} href={url as string} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-brand-600 hover:underline capitalize">
                        {platform}
                      </a>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Videos */}
          <div className="md:col-span-2 space-y-6">
            {talent.introVideo?.url && talent.introVideo.status === 'approved' && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Intro Video</h2>
                <video controls className="w-full rounded-lg bg-black" src={talent.introVideo.url} />
              </div>
            )}

            {talent.sceneVideo?.url && talent.sceneVideo.status === 'approved' && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Acting Scene</h2>
                <video controls className="w-full rounded-lg bg-black" src={talent.sceneVideo.url} />
              </div>
            )}

            {talent.portfolioVideos?.filter((v: any) => v.status === 'approved').length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Portfolio</h2>
                <div className="space-y-4">
                  {talent.portfolioVideos.filter((v: any) => v.status === 'approved').map((v: any, i: number) => (
                    <div key={i}>
                      {v.title && <p className="text-sm font-medium text-gray-700 mb-1">{v.title}</p>}
                      <video controls className="w-full rounded-lg bg-black" src={v.url} />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {talent.previousWorkLinks?.length > 0 && (
              <div className="card p-5">
                <h2 className="font-semibold text-gray-800 mb-3">Previous Work</h2>
                <ul className="space-y-2">
                  {talent.previousWorkLinks.map((w: any, i: number) => (
                    <li key={i}>
                      <a href={w.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline text-sm">
                        {w.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
