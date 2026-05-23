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

    // 1. Clean existing database to purge old duplicate indexes
    console.log('🧹 Dropping existing database to rebuild clean collection indexes...');
    await mongoose.connection.db.dropDatabase();
    console.log('🧹 Database drop completed.');

    // 2. Create Batches
    console.log('🌱 Seeding batches...');
    const batches = await Batch.insertMany([
      {
        name: 'Batch Alpha (Full Stack Web Dev)',
        startDate: new Date('2026-05-01'),
        endDate: new Date('2026-08-01'),
        active: true
      },
      {
        name: 'Batch Beta (Data Science & AI)',
        startDate: new Date('2026-05-15'),
        endDate: new Date('2026-08-15'),
        active: true
      },
      {
        name: 'Batch Gamma (UI/UX Product Design)',
        startDate: new Date('2026-06-01'),
        endDate: new Date('2026-09-01'),
        active: true
      }
    ]);
    console.log(`✅ ${batches.length} Batches seeded.`);

    const batchAlphaId = batches[0]._id;
    const batchBetaId = batches[1]._id;
    const batchGammaId = batches[2]._id;

    // 3. Create Users (Admin & Students)
    console.log('🌱 Seeding users...');
    const users = await User.insertMany([
      {
        name: 'Admin LearnKins',
        email: 'admin@learnkins.com',
        password: 'admin123', // Simple plaintext password
        role: 'admin',
        batch: null,
        active: true
      },
      {
        name: 'Aarav Sharma',
        email: 'student1@learnkins.com',
        password: 'student123',
        role: 'student',
        batch: batchAlphaId,
        active: true
      },
      {
        name: 'Ananya Iyer',
        email: 'student2@learnkins.com',
        password: 'student123',
        role: 'student',
        batch: batchAlphaId,
        active: true
      },
      {
        name: 'Ishaan Verma',
        email: 'student3@learnkins.com',
        password: 'student123',
        role: 'student',
        batch: batchBetaId,
        active: true
      },
      {
        name: 'Riya Sen',
        email: 'student4@learnkins.com',
        password: 'student123',
        role: 'student',
        batch: batchGammaId,
        active: false // Inactive user for testing deactivation
      }
    ]);
    console.log(`✅ ${users.length} Users seeded.`);

    const adminUser = users[0];
    const student1 = users[1];
    const student2 = users[2];
    const student3 = users[3];

    // 4. Create Videos
    console.log('🌱 Seeding videos...');
    const videos = await Video.insertMany([
      {
        title: 'Introduction to Full Stack Architecture',
        description: 'Understand the flow between client browser, web server, and database.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400&auto=format&fit=crop&q=60',
        day: 1,
        module: 'Getting Started',
        batch: [batchAlphaId, batchBetaId],
        order: 1,
        duration: 120
      },
      {
        title: 'Mastering Advanced Responsive Grids',
        description: 'Learn Flexbox, CSS Grid layouts, and mobile-first responsive media queries.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=400&auto=format&fit=crop&q=60',
        day: 2,
        module: 'CSS Mastery',
        batch: [batchAlphaId, batchGammaId],
        order: 2,
        duration: 180
      },
      {
        title: 'Python Pandas & NumPy Foundations',
        description: 'Hands-on look at vector calculations and tabular data manipulation.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&auto=format&fit=crop&q=60',
        day: 1,
        module: 'Data Pipelines',
        batch: [batchBetaId],
        order: 1,
        duration: 150
      },
      {
        title: 'Supervised Learning Regression Models',
        description: 'Mathematical intuition behind Cost Functions, Gradient Descent, and Linear Regression.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=400&auto=format&fit=crop&q=60',
        day: 2,
        module: 'Machine Learning',
        batch: [batchBetaId],
        order: 2,
        duration: 210
      },
      {
        title: 'Figma Auto Layout and Component Systems',
        description: 'Speed up product designs using dynamic auto layouts and nested component hierarchies.',
        cloudinaryUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
        thumbnail: 'https://images.unsplash.com/photo-1561070791-26c113006238?w=400&auto=format&fit=crop&q=60',
        day: 1,
        module: 'Interface Engineering',
        batch: [batchGammaId],
        order: 1,
        duration: 320
      }
    ]);
    console.log(`✅ ${videos.length} Videos seeded.`);

    // 5. Create Resources
    console.log('🌱 Seeding resources...');
    const resources = await Resource.insertMany([
      {
        title: 'MDN Web Docs - HTML Reference',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        type: 'doc',
        category: 'HTML & CSS',
        pinned: true,
        batch: [batchAlphaId, batchGammaId]
      },
      {
        title: 'CSS Tricks Complete Guide to Grid',
        url: 'https://css-tricks.com/snippets/css/complete-guide-grid/',
        type: 'article',
        category: 'Styling',
        pinned: false,
        batch: [batchAlphaId, batchGammaId]
      },
      {
        title: 'Pandas Data Wrangling Cheatsheet',
        url: 'https://pandas.pydata.org/Pandas_Cheat_Sheet.pdf',
        type: 'tool',
        category: 'Data Science',
        pinned: true,
        batch: [batchBetaId]
      },
      {
        title: 'Kaggle Machine Learning Playground',
        url: 'https://www.kaggle.com',
        type: 'repo',
        category: 'Competitions',
        pinned: false,
        batch: [batchBetaId]
      },
      {
        title: 'React Dev docs - Quick Start Guide',
        url: 'https://react.dev/learn',
        type: 'doc',
        category: 'React',
        pinned: true,
        batch: [batchAlphaId]
      }
    ]);
    console.log(`✅ ${resources.length} Resources seeded.`);

    // 6. Seed Progress Records (to showcase analytics instantly)
    console.log('🌱 Seeding initial progress records...');
    await Progress.insertMany([
      {
        student: student1._id,
        video: videos[0]._id, // Intro Full Stack
        watchedPercent: 85,
        completed: false,
        lastWatched: new Date('2026-05-22')
      },
      {
        student: student1._id,
        video: videos[1]._id, // Responsive grids
        watchedPercent: 100,
        completed: true,
        lastWatched: new Date('2026-05-23')
      },
      {
        student: student2._id,
        video: videos[0]._id, // Intro Full Stack
        watchedPercent: 100,
        completed: true,
        lastWatched: new Date('2026-05-22')
      },
      {
        student: student3._id,
        video: videos[2]._id, // Pandas Foundations
        watchedPercent: 50,
        completed: false,
        lastWatched: new Date('2026-05-23')
      }
    ]);
    console.log('✅ Progress records seeded.');

    // 7. Seed Notice Board Announcements
    console.log('🌱 Seeding notices...');
    await Announcement.insertMany([
      {
        title: 'Welcome to the Summer 2026 Internship Portal!',
        content: 'Greetings Interns! Use this portal to watch your daily curated videos, access target resources, and monitor your personal completion analytics.',
        pinned: true,
        createdBy: adminUser._id
      },
      {
        title: 'First Weekly Progress Evaluation on Friday',
        content: 'Reminder to all batches: Make sure you complete your assigned video modules for Week 1 before Friday 6 PM. Pinned resources are excellent references for your study.',
        pinned: false,
        createdBy: adminUser._id
      }
    ]);
    console.log('✅ Announcements notice board seeded.');

    console.log('\n🌟 Database successfully loaded with LearnKins seed data!');
    console.log('------------------------------------------------------------');
    console.log(`Admin Portal: email: admin@learnkins.com | password: admin123`);
    console.log(`Student Portal (Alpha): email: student1@learnkins.com | password: student123`);
    console.log(`Student Portal (Beta): email: student3@learnkins.com | password: student123`);
    console.log('------------------------------------------------------------\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding process encountered a fatal error:', error);
    process.exit(1);
  }
};

seedDatabase();
