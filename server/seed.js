/**
 * Seed script — creates predefined Admin and Manager accounts.
 * Run: node seed.js
 * These are the ONLY admin/manager accounts. Users cannot register as admin/manager.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const PREDEFINED = [
    {
        name: 'Admin HireNet',
        email: 'admin@hirenet.com',
        password: 'Admin@123',
        role: 'admin',
        company: 'HireNet',
        title: 'Platform Administrator',
    },
    {
        name: 'TechCorp Manager',
        email: 'manager@hirenet.com',
        password: 'Manager@123',
        role: 'manager',
        company: 'TechCorp',
        title: 'Hiring Manager',
    },
];

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    for (const data of PREDEFINED) {
        const exists = await User.findOne({ email: data.email });
        if (exists) {
            console.log(`⚠️  ${data.email} already exists — skipped`);
            continue;
        }
        const user = new User(data);
        await user.save();
        console.log(`✅ Created ${data.role}: ${data.email} / ${data.password}`);
    }

    console.log('\n🎉 Seeding complete!');
    console.log('─────────────────────────────────');
    console.log('Admin   → admin@hirenet.com   / Admin@123');
    console.log('Manager → manager@hirenet.com / Manager@123');
    console.log('─────────────────────────────────');
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
