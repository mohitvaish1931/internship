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

    const adminUser = users[0];
    const s1 = users[1]; // Krishna Jangid
    const s2 = users[2]; // Naina Dayal
    const s5 = users[5]; // Lakshya Garg
    const s8 = users[8]; // Krishna Samnotra

    // 4. Create Curated Videos structured for the new Cohorts
    console.log('🌱 Seeding learning video lessons for new domains...');
    const videos = await Video.insertMany([
      {
        title: 'Introduction to Full Stack Architecture',
        description: 'Understand the flow between client browser, web server, and database.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
        day: 1,
        module: 'Getting Started',
        batch: [batchFullStack._id],
        order: 1,
        duration: 120
      },
      {
        title: 'Deep Learning & Neural Networks Foundations',
        description: 'Mathematical intuition behind Artificial Neural Networks and Backpropagation.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400',
        day: 1,
        module: 'AI Foundations',
        batch: [batchAiMl._id, batchMl._id],
        order: 1,
        duration: 180
      },
      {
        title: 'Data Wrangling with Pandas & Numpy',
        description: 'Master vector calculation and array slicing for structural data.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400',
        day: 1,
        module: 'Data Pipelines',
        batch: [batchAiMl._id, batchMl._id, batchDs._id],
        order: 2,
        duration: 150
      },
      {
        title: 'Supervised Learning Regression Models',
        description: 'Learn Cost Functions, Gradient Descent, and Linear Regression implementations.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=400',
        day: 2,
        module: 'Machine Learning',
        batch: [batchMl._id, batchAiMl._id],
        order: 3,
        duration: 210
      },
      {
        title: 'Exploratory Data Analysis (EDA) Best Practices',
        description: 'Understand data distributions, anomaly identification, and Matplotlib plotting.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=400',
        day: 1,
        module: 'Data Engineering',
        batch: [batchDs._id],
        order: 1,
        duration: 320
      }
    ]);
    console.log(`✅ ${videos.length} Videos assigned.`);

    // 5. Create Curated Resources targeting the new Cohorts
    console.log('🌱 Seeding curated documentation resources...');
    await Resource.insertMany([
      {
        title: 'TensorFlow Official Quickstart Guide',
        url: 'https://www.tensorflow.org/tutorials/quickstart/beginner',
        type: 'doc',
        category: 'Deep Learning',
        pinned: true,
        batch: [batchAiMl._id, batchMl._id]
      },
      {
        title: 'Scikit-Learn Regression Documentation',
        url: 'https://scikit-learn.org/stable/supervised_learning.html',
        type: 'doc',
        category: 'ML Math',
        pinned: false,
        batch: [batchAiMl._id, batchMl._id]
      },
      {
        title: 'Pandas Data Wrangling Cheatsheet',
        url: 'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf',
        type: 'tool',
        category: 'Data Science',
        pinned: true,
        batch: [batchDs._id, batchAiMl._id]
      },
      {
        title: 'MDN Full Stack Web Roadmap',
        url: 'https://developer.mozilla.org/en-US/docs/Learn',
        type: 'doc',
        category: 'HTML & CSS',
        pinned: true,
        batch: [batchFullStack._id]
      }
    ]);
    console.log('✅ Curated resource links seeded.');

    // 6. Seed mock Progress logs
    console.log('🌱 Seeding initial progress logs...');
    await Progress.insertMany([
      {
        student: s1._id, // Krishna Jangid
        video: videos[1]._id, // Deep Learning
        watchedPercent: 85,
        completed: false,
        lastWatched: new Date('2026-05-23')
      },
      {
        student: s1._id, // Krishna Jangid
        video: videos[2]._id, // Pandas Wrangling
        watchedPercent: 100,
        completed: true,
        lastWatched: new Date('2026-05-24')
      },
      {
        student: s2._id, // Naina Dayal
        video: videos[1]._id, // Deep Learning
        watchedPercent: 100,
        completed: true,
        lastWatched: new Date('2026-05-23')
      },
      {
        student: s5._id, // Lakshya Garg
        video: videos[3]._id, // Supervised Learning
        watchedPercent: 60,
        completed: false,
        lastWatched: new Date('2026-05-24')
      },
      {
        student: s8._id, // Krishna Samnotra
        video: videos[4]._id, // EDA Best Practices
        watchedPercent: 100,
        completed: true,
        lastWatched: new Date('2026-05-24')
      }
    ]);
    console.log('✅ Student watch progress records seeded.');

    // 7. Seed announcements
    console.log('🌱 Seeding notices...');
    await Announcement.insertMany([
      {
        title: 'Welcome to the Live LearnKins Student Desk!',
        content: 'Greetings Interns! Use this portal to watch daily curated video courses, refer to domain links, and track your gamified progress.',
        pinned: true,
        createdBy: adminUser._id
      },
      {
        title: 'First Weekly Progress Review on Friday',
        content: 'Reminder to all domain tracks (AI/ML, ML, DS, Full Stack): Make sure you complete your assigned video modules for Week 1 before Friday.',
        pinned: false,
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Notice board notices seeded.');

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
