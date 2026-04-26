import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-purple-50">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <span className="text-2xl font-bold text-brand-700">TalentCasting</span>
        <div className="flex gap-3">
          <Link href="/auth/login" className="btn-secondary text-sm">Sign In</Link>
          <Link href="/auth/register" className="btn-primary text-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-16 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
          Where Talent Meets<br />
          <span className="text-brand-600">Opportunity</span>
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10">
          The professional marketplace for actors, models, voice artists, dancers and production companies.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/register?role=talent" className="btn-primary text-base px-8 py-3">
            I&apos;m a Talent
          </Link>
          <Link href="/auth/register?role=casting" className="btn-secondary text-base px-8 py-3">
            I&apos;m Casting
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16 grid md:grid-cols-3 gap-8">
        {[
          { icon: '🎭', title: 'Showcase Your Talent', desc: 'Upload your intro video, scene reel, and portfolio to stand out.' },
          { icon: '🔍', title: 'Discover & Filter', desc: 'Search by category, location, experience, language and more.' },
          { icon: '📋', title: 'Casting Calls', desc: 'Post and apply to casting calls with a clean application workflow.' },
        ].map((f) => (
          <div key={f.title} className="card p-6 text-center">
            <div className="text-4xl mb-4">{f.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm">{f.desc}</p>
          </div>
        ))}
      </section>

      {/* Marketplace CTA */}
      <section className="bg-brand-700 text-white py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Browse the Marketplace</h2>
        <p className="text-brand-200 mb-8">Thousands of verified talents ready to work.</p>
        <Link href="/marketplace" className="bg-white text-brand-700 font-semibold px-8 py-3 rounded-lg hover:bg-brand-50 transition">
          Explore Talents
        </Link>
      </section>
    </main>
  );
}
