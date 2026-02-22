require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const mongoose = require('mongoose');
const User = require('../models/User');

const users = [
  {
    name: 'Demo Participant',
    email: 'demo.participant@vr-retail.local',
    password: 'Demo@12345',
    role: 'participant',
    onboardingComplete: true
  },
  {
    name: 'Demo Researcher',
    email: 'demo.researcher@vr-retail.local',
    password: 'Research@12345',
    role: 'researcher',
    onboardingComplete: true
  },
  {
    name: 'Demo Admin',
    email: 'demo.admin@vr-retail.local',
    password: 'Admin@12345',
    role: 'admin',
    onboardingComplete: true
  }
];

async function run() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/vr-retail';
  await mongoose.connect(uri);

  for (const u of users) {
    const existing = await User.findOne({ email: u.email });
    if (existing) {
      console.log(`Skipping existing user: ${u.email}`);
      continue;
    }
    const user = new User({
      name: u.name,
      email: u.email,
      passwordHash: u.password,
      role: u.role,
      onboardingComplete: u.onboardingComplete
    });
    await user.save();
    console.log(`Created user: ${u.email} (${u.role})`);
  }

  await mongoose.disconnect();
  console.log('Seeding complete');
}

run().catch(async (e) => {
  console.error(e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});
