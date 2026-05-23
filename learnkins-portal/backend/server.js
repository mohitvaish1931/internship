import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes Import
import authRoutes from './routes/auth.js';
import batchRoutes from './routes/batches.js';
import studentRoutes from './routes/students.js';
import videoRoutes from './routes/videos.js';
import resourceRoutes from './routes/resources.js';
import emailRoutes from './routes/email.js';
import analyticsRoutes from './routes/analytics.js';
import announcementRoutes from './routes/announcements.js';

// Controller/Middleware Import for Progress endpoint
import { updateProgress } from './controllers/videoController.js';
import { requireAuth } from './middleware/auth.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnkins';

// Middlewares
app.use(cors());
app.use(express.json());

// Set up static files paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsPath = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use('/uploads', express.static(uploadsPath));

// API Endpoint Mappings
app.use('/api/auth', authRoutes);
app.use('/api/batches', batchRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/announcements', announcementRoutes);

// Direct mapping for student progress updates
app.post('/api/progress/update', requireAuth, updateProgress);

// Root Hello Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', service: 'LearnKins Portal Backend Server API' });
});

// Database Connection & Boot Setup
console.log('🔌 Connecting to MongoDB Database...');
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Database connection established.');
    app.listen(PORT, () => {
      console.log(`🚀 LearnKins Portal Backend Server successfully running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('❌ Failed to establish MongoDB Database connection:', err);
    process.exit(1);
  });
