import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Video from '../models/Video.js';
import Resource from '../models/Resource.js';
import Progress from '../models/Progress.js';
import EmailLog from '../models/EmailLog.js';
import Announcement from '../models/Announcement.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnkins';

const seedDatabase = async () => {
  try {
    console.log('🔄 Connecting to MongoDB to seed database...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB.');

    // 1. Clean existing database to purge old indexes
    console.log('🧹 Dropping existing database to rebuild clean collection indexes...');
    await mongoose.connection.db.dropDatabase();
    console.log('🧹 Database drop completed.');

    // 2. Create the exact 4 Domain Batches
    console.log('🌱 Seeding specific domain cohorts...');
    const batches = await Batch.insertMany([
      {
        name: 'AI/ML',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-08-01'),
        active: true
      },
      {
        name: 'ML',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-08-01'),
        active: true
      },
      {
        name: 'Full Stack',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-08-01'),
        active: true
      },
      {
        name: 'DS',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-08-01'),
        active: true
      }
    ]);
    console.log(`✅ ${batches.length} Cohort domains seeded.`);

    // Map Batch references
    const batchAiMl = batches[0];
    const batchMl = batches[1];
    const batchFullStack = batches[2];
    const batchDs = batches[3];

    // 3. Create Administrator and the 9 Real Students
    console.log('🌱 Seeding real student accounts with Gmail credentials...');
    
    // We'll generate simple passwords like "student123" for students and keep "admin123" for admin
    const studentsData = [
      {
        name: 'Admin LearnKins',
        email: 'admin@learnkins.com',
        password: 'admin123',
        role: 'admin',
        batch: null,
        active: true
      },
      {
        name: 'Krishna Jangid',
        email: 'krishna.jangid@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Naina Dayal',
        email: 'naina.dayal@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Jainab Bee',
        email: 'jainab.bee@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Heeral',
        email: 'heeral@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Lakshya Garg',
        email: 'lakshya.garg@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchMl._id,
        active: true
      },
      {
        name: 'Navya Mangal',
        email: 'navya.mangal@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Aishna Kachhawah',
        email: 'aishna.kachhawah@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      },
      {
        name: 'Krishna Samnotra',
        email: 'krishna.samnotra@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchDs._id,
        active: true
      },
      {
        name: 'Nagesh Bairwa',
        email: 'nagesh.bairwa@gmail.com',
        password: 'student123',
        role: 'student',
        batch: batchAiMl._id,
        active: true
      }
    ];

    const users = await User.insertMany(studentsData);
    console.log(`✅ ${users.length - 1} Students and 1 Admin seeded successfully.`);

    console.log('🧹 Clearing videos, resources, progress, and announcements...');
    await Video.deleteMany({});
    await Resource.deleteMany({});
    await Progress.deleteMany({});
    await Announcement.deleteMany({});
    console.log('✅ Stale dry data cleared.');

    console.log('\n🌟 Real cohort databases successfully populated!');
    console.log('------------------------------------------------------------');
    console.log('Admin Console Account:');
    console.log('  email: admin@learnkins.com | password: admin123');
    console.log('Student Accounts (Password is "student123" for all):');
    console.log('  1. Krishna Jangid: krishna.jangid@gmail.com (AI/ML)');
    console.log('  2. Naina Dayal: naina.dayal@gmail.com (AI/ML)');
    console.log('  3. Jainab Bee: jainab.bee@gmail.com (AI/ML)');
    console.log('  4. Heeral: heeral@gmail.com (AI/ML)');
    console.log('  5. Lakshya Garg: lakshya.garg@gmail.com (ML)');
    console.log('  6. Navya Mangal: navya.mangal@gmail.com (AI/ML)');
    console.log('  7. Aishna Kachhawah: aishna.kachhawah@gmail.com (AI/ML)');
    console.log('  8. Krishna Samnotra: krishna.samnotra@gmail.com (DS)');
    console.log('  9. Nagesh Bairwa: nagesh.bairwa@gmail.com (AI/ML)');
    console.log('------------------------------------------------------------\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed with fatal error:', error);
    process.exit(1);
  }
};

seedDatabase();
