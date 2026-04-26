/**
 * Seed script — creates demo data for MVP presentation
 * Run: npx ts-node -r tsconfig-paths/register src/seed.ts
 */

import mongoose from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

// ─── Schemas (inline to avoid NestJS bootstrap) ──────────────────────────────

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['talent', 'casting', 'admin'], required: true },
    status: { type: String, default: 'active' },
    emailVerified: { type: Boolean, default: true },
  },
  { timestamps: true },
);

const TalentProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    fullName: { type: String, required: true },
    slug: { type: String, unique: true, sparse: true },
    profilePhoto: { type: Object, default: null },
    dateOfBirth: { type: Date },
    gender: { type: String },
    city: { type: String },
    country: { type: String },
    bio: { type: String },
    experience: { type: String },
    languages: { type: [Object], default: [] },
    skills: { type: [String], default: [] },
    categories: { type: [String], default: [] },
    availability: { type: String, default: 'available' },
    isPublic: { type: Boolean, default: true },
    isVerified: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    approvalStatus: { type: String, default: 'approved' },
    contactVisibility: { type: String, default: 'on_request' },
    profileViews: { type: Number, default: 0 },
    socialLinks: { type: Object, default: {} },
    portfolioVideos: { type: [Object], default: [] },
  },
  { timestamps: true },
);

const CastingProfileSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    companyName: { type: String, required: true },
    industry: { type: String },
    bio: { type: String },
    city: { type: String },
    country: { type: String },
    isVerified: { type: Boolean, default: false },
    approvalStatus: { type: String, default: 'approved' },
    savedTalents: { type: [mongoose.Types.ObjectId], default: [] },
  },
  { timestamps: true },
);

const CastingCallSchema = new mongoose.Schema(
  {
    castingUserId: { type: mongoose.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    roleType: { type: String },
    categories: { type: [String], default: [] },
    requirements: { type: Object, default: {} },
    compensation: { type: Object, default: { type: 'tbd' } },
    deadline: { type: Date },
    status: { type: String, default: 'open' },
    isPublic: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    invitedTalents: { type: [mongoose.Types.ObjectId], default: [] },
  },
  { timestamps: true },
);

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_USERS = [
  { email: 'admin@talentcasting.com', password: 'Admin@123456', role: 'admin' },
  { email: 'casting@studioone.com', password: 'Casting@123456', role: 'casting' },
  { email: 'sara.talent@example.com', password: 'Talent@123456', role: 'talent' },
  { email: 'omar.actor@example.com', password: 'Talent@123456', role: 'talent' },
  { email: 'lina.model@example.com', password: 'Talent@123456', role: 'talent' },
  { email: 'karim.voiceover@example.com', password: 'Talent@123456', role: 'talent' },
  { email: 'nadia.dancer@example.com', password: 'Talent@123456', role: 'talent' },
  { email: 'youssef.presenter@example.com', password: 'Talent@123456', role: 'talent' },
];

const SAMPLE_TALENTS = [
  {
    email: 'sara.talent@example.com',
    profile: {
      fullName: 'Sara Ahmed',
      slug: 'sara-ahmed-001',
      dateOfBirth: new Date('1996-03-15'),
      gender: 'female',
      city: 'Cairo',
      country: 'Egypt',
      bio: 'Professional actress with 6 years of experience in drama and comedy productions. Featured in multiple Egyptian TV series and theatrical plays.',
      experience: 'professional',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'fluent' }],
      skills: ['Drama Acting', 'Comedy', 'Theatre', 'Improvisation', 'Singing'],
      categories: ['drama', 'comedy', 'theatre'],
      availability: 'available',
      isVerified: true,
      isFeatured: true,
      profileViews: 342,
      socialLinks: { instagram: 'https://instagram.com/sara_acts', imdb: 'https://imdb.com/name/sara' },
    },
  },
  {
    email: 'omar.actor@example.com',
    profile: {
      fullName: 'Omar El-Sharif',
      slug: 'omar-elsharif-002',
      dateOfBirth: new Date('1990-07-22'),
      gender: 'male',
      city: 'Alexandria',
      country: 'Egypt',
      bio: 'Veteran actor specializing in action and drama. 10+ years in the industry with roles in major productions across Egypt and the Middle East.',
      experience: 'veteran',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'conversational' }, { language: 'French', level: 'basic' }],
      skills: ['Action', 'Drama', 'Stunts', 'Horse Riding', 'Martial Arts'],
      categories: ['drama', 'action'],
      availability: 'busy',
      isVerified: true,
      isFeatured: false,
      profileViews: 891,
      socialLinks: { instagram: 'https://instagram.com/omar_acts' },
    },
  },
  {
    email: 'lina.model@example.com',
    profile: {
      fullName: 'Lina Khalil',
      slug: 'lina-khalil-003',
      dateOfBirth: new Date('2000-11-05'),
      gender: 'female',
      city: 'Dubai',
      country: 'UAE',
      bio: 'Fashion and commercial model with international runway experience. Based in Dubai, available for regional campaigns.',
      experience: 'intermediate',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'fluent' }],
      skills: ['Runway Modeling', 'Commercial Modeling', 'Fashion Photography', 'Brand Ambassador'],
      categories: ['modeling', 'commercial'],
      availability: 'available',
      isVerified: true,
      isFeatured: true,
      profileViews: 1204,
      socialLinks: { instagram: 'https://instagram.com/lina_model', tiktok: 'https://tiktok.com/@linamodel' },
    },
  },
  {
    email: 'karim.voiceover@example.com',
    profile: {
      fullName: 'Karim Mansour',
      slug: 'karim-mansour-004',
      dateOfBirth: new Date('1988-01-30'),
      gender: 'male',
      city: 'Cairo',
      country: 'Egypt',
      bio: 'Professional voice-over artist with a deep, versatile voice. Worked on major animation series, commercials, and audiobooks across the Arab world.',
      experience: 'veteran',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'fluent' }],
      skills: ['Voice Acting', 'Dubbing', 'Commercial VO', 'Animation', 'Narration', 'Radio'],
      categories: ['voice_over'],
      availability: 'available',
      isVerified: false,
      isFeatured: false,
      profileViews: 567,
      socialLinks: { website: 'https://karimvo.com', youtube: 'https://youtube.com/@karimvo' },
    },
  },
  {
    email: 'nadia.dancer@example.com',
    profile: {
      fullName: 'Nadia Hassan',
      slug: 'nadia-hassan-005',
      dateOfBirth: new Date('1998-06-18'),
      gender: 'female',
      city: 'Beirut',
      country: 'Lebanon',
      bio: 'Contemporary and oriental dance performer. Winner of multiple regional dance competitions. Available for shows, music videos, and theatre productions.',
      experience: 'professional',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'fluent' }, { language: 'French', level: 'conversational' }],
      skills: ['Contemporary Dance', 'Oriental Dance', 'Choreography', 'Ballet', 'Hip Hop'],
      categories: ['dance'],
      availability: 'available',
      isVerified: false,
      isFeatured: false,
      profileViews: 234,
      socialLinks: { instagram: 'https://instagram.com/nadia_dances', youtube: 'https://youtube.com/@nadiadances' },
    },
  },
  {
    email: 'youssef.presenter@example.com',
    profile: {
      fullName: 'Youssef Tamer',
      slug: 'youssef-tamer-006',
      dateOfBirth: new Date('1993-09-12'),
      gender: 'male',
      city: 'Riyadh',
      country: 'Saudi Arabia',
      bio: 'TV presenter and MC with 7 years of live broadcast experience. Hosted major events, awards shows, and corporate presentations across the GCC.',
      experience: 'professional',
      languages: [{ language: 'Arabic', level: 'native' }, { language: 'English', level: 'fluent' }],
      skills: ['TV Presenting', 'MC', 'Live Events', 'Corporate Hosting', 'Interviewing'],
      categories: ['presenting'],
      availability: 'available',
      isVerified: true,
      isFeatured: false,
      profileViews: 412,
      socialLinks: { instagram: 'https://instagram.com/youssef_mc', youtube: 'https://youtube.com/@youssefmc' },
    },
  },
];

const SAMPLE_CASTING_CALLS = [
  {
    title: 'Lead Actress for Ramadan Drama Series 2025',
    description:
      'We are casting for the female lead role in a major Egyptian Ramadan drama series. The character is a strong, independent woman in her late 20s navigating love and career in modern Cairo. Previous TV experience required.',
    roleType: 'Lead',
    categories: ['drama'],
    requirements: { ageMin: 25, ageMax: 35, gender: 'female', experience: 'professional', country: 'Egypt' },
    compensation: { type: 'paid', details: 'Negotiable based on experience' },
    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    isFeatured: true,
  },
  {
    title: 'Male Action Star — Feature Film',
    description:
      'Seeking a physically fit male actor (30-45) for the lead role in an action feature film. Must be comfortable with stunt coordination. Filming begins Q2 2025 in Cairo and Jordan.',
    roleType: 'Lead',
    categories: ['action', 'drama'],
    requirements: { ageMin: 30, ageMax: 45, gender: 'male', experience: 'professional' },
    compensation: { type: 'paid', details: 'Competitive rate + residuals' },
    deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    isFeatured: false,
  },
  {
    title: 'Voice-Over Artist for Animation Series',
    description:
      'Looking for Arabic voice-over artists with a range of character voices for a children\'s animation series. Must have professional recording setup or access to a studio.',
    roleType: 'Supporting (Multiple)',
    categories: ['voice_over'],
    requirements: { languages: ['Arabic'], experience: 'intermediate' },
    compensation: { type: 'paid', details: 'Per-episode rate' },
    deadline: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    isFeatured: false,
  },
  {
    title: 'Fashion Models — Dubai Fashion Week Campaign',
    description:
      'Scouting for male and female models for a major fashion brand\'s Dubai Fashion Week campaign. Height: 175cm+ (female), 185cm+ (male). Portfolio required.',
    roleType: 'Model',
    categories: ['modeling'],
    requirements: { experience: 'intermediate' },
    compensation: { type: 'paid', details: 'Day rate + usage fee' },
    deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    isFeatured: true,
  },
  {
    title: 'Comedy Sketch Actors — YouTube Series',
    description:
      'We are producing a comedy sketch YouTube series and need actors with strong improvisational skills. Filming one weekend per month in Cairo. Fun, creative environment.',
    roleType: 'Ensemble Cast',
    categories: ['comedy'],
    requirements: { ageMin: 20, ageMax: 40 },
    compensation: { type: 'tbd' },
    deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    isFeatured: false,
  },
];

// ─── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.MONGODB_DB_NAME || 'talent-casting';

  if (!uri) {
    console.error('❌  MONGODB_URI not set in .env');
    process.exit(1);
  }

  console.log('🔌  Connecting to MongoDB Atlas...');
  await mongoose.connect(uri, { dbName });
  console.log('✅  Connected\n');

  const UserModel = mongoose.model('User', UserSchema);
  const TalentProfileModel = mongoose.model('TalentProfile', TalentProfileSchema);
  const CastingProfileModel = mongoose.model('CastingProfile', CastingProfileSchema);
  const CastingCallModel = mongoose.model('CastingCall', CastingCallSchema);

  // ── Clean existing seed data ──
  console.log('🧹  Cleaning previous seed data...');
  const seedEmails = SEED_USERS.map((u) => u.email);
  const oldUsers = await UserModel.find({ email: { $in: seedEmails } });
  const oldUserIds = oldUsers.map((u) => u._id);

  await Promise.all([
    UserModel.deleteMany({ email: { $in: seedEmails } }),
    TalentProfileModel.deleteMany({ userId: { $in: oldUserIds } }),
    CastingProfileModel.deleteMany({ userId: { $in: oldUserIds } }),
    CastingCallModel.deleteMany({ castingUserId: { $in: oldUserIds } }),
  ]);
  console.log('✅  Cleaned\n');

  // ── Create users ──
  console.log('👤  Creating users...');
  const createdUsers: Record<string, any> = {};

  for (const u of SEED_USERS) {
    const passwordHash = await bcrypt.hash(u.password, 12);
    const user = await UserModel.create({ email: u.email, passwordHash, role: u.role, status: 'active', emailVerified: true });
    createdUsers[u.email] = user;
    console.log(`   ✓  ${u.role.toUpperCase()} — ${u.email}  (password: ${u.password})`);
  }

  // ── Create talent profiles ──
  console.log('\n🎭  Creating talent profiles...');
  for (const t of SAMPLE_TALENTS) {
    const user = createdUsers[t.email];
    await TalentProfileModel.create({ userId: user._id, ...t.profile });
    console.log(`   ✓  ${t.profile.fullName} (${t.profile.categories.join(', ')})`);
  }

  // ── Create casting company ──
  console.log('\n🎬  Creating casting company profile...');
  const castingUser = createdUsers['casting@studioone.com'];
  await CastingProfileModel.create({
    userId: castingUser._id,
    companyName: 'Studio One Productions',
    industry: 'Film & Television',
    bio: 'Leading production house specializing in drama series and feature films across MENA.',
    city: 'Cairo',
    country: 'Egypt',
    isVerified: true,
    approvalStatus: 'approved',
  });
  console.log('   ✓  Studio One Productions');

  // ── Create casting calls ──
  console.log('\n📋  Creating casting calls...');
  for (const call of SAMPLE_CASTING_CALLS) {
    await CastingCallModel.create({ castingUserId: castingUser._id, ...call });
    console.log(`   ✓  ${call.title}`);
  }

  // ─── Summary ─────────────────────────────────────────────────────────────────
  console.log('\n' + '='.repeat(60));
  console.log('🌱  SEED COMPLETE\n');
  console.log('📧  LOGIN CREDENTIALS:\n');
  console.log('  ADMIN');
  console.log('    Email:    admin@talentcasting.com');
  console.log('    Password: Admin@123456\n');
  console.log('  CASTING USER');
  console.log('    Email:    casting@studioone.com');
  console.log('    Password: Casting@123456\n');
  console.log('  TALENT USERS (all use password: Talent@123456)');
  SAMPLE_TALENTS.forEach((t) => console.log(`    ${t.profile.fullName.padEnd(22)} ${t.email}`));
  console.log('='.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌  Seed failed:', err);
  process.exit(1);
});
