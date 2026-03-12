const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const allowedUsers = [
    {
        name: 'Shiva Praasd',
        email: '22eg105h13@anurag.edu.in',
        password: '22EG105H13',
        role: 'admin'
    },
    {
        name: 'Likitha',
        email: '22eg105h30@anurag.edu.in',
        password: '22EG105H30',
        role: 'participant'
    },
    {
        name: 'Aashritha',
        email: '22eg105h37@anurag.edu.in',
        password: '22EG105H37',
        role: 'participant'
    },
    {
        name: 'Nikhil',
        email: '22eg105h40@anurag.edu.in',
        password: '22EG105H40',
        role: 'participant'
    }
];

async function seedAllowedUsers() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Optional: Clear existing users if you want to start fresh
        // await User.deleteMany({});

        for (const userData of allowedUsers) {
            const existing = await User.findOne({ email: userData.email });
            if (existing) {
                console.log(`User ${userData.email} already exists, skipping...`);
                continue;
            }

            const user = new User({
                name: userData.name,
                email: userData.email,
                passwordHash: userData.password, // Pre-save hook will hash it
                role: userData.role,
                onboardingComplete: true,
                groupType: 'A'
            });

            await user.save();
            console.log(`Created user: ${userData.name} (${userData.email})`);
        }

        console.log('Seeding complete');
        process.exit(0);
    } catch (err) {
        console.error('Error seeding users:', err);
        process.exit(1);
    }
}

seedAllowedUsers();
