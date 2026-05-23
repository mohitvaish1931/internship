import Video from '../models/Video.js';
import Progress from '../models/Progress.js';
import { uploadToCloud } from '../utils/cloudinary.js';
import fs from 'fs';

// Get Videos List (Filtered for Students, Comprehensive for Admins)
export const getVideos = async (req, res) => {
  try {
    const userRole = req.user.role;

    if (userRole === 'admin') {
      // Admins get everything
      const videos = await Video.find().populate('batch').sort({ module: 1, order: 1 });
      return res.status(200).json({ videos });
    } else {
      // Students only get videos that match their batch
      const studentBatchId = req.user.batch?._id || req.user.batch;

      if (!studentBatchId) {
        return res.status(200).json({ videos: [], message: 'You are not assigned to any batch yet.' });
      }

      // Fetch videos targeting this batch
      const videos = await Video.find({ batch: studentBatchId }).sort({ module: 1, order: 1 });

      // Gather student's progress for these videos
      const videoIds = videos.map(v => v._id);
      const progresses = await Progress.find({
        student: req.user._id,
        video: { $in: videoIds }
      });

      // Map progress to each video record
      const videosWithProgress = videos.map(video => {
        const progress = progresses.find(p => p.video.toString() === video._id.toString());
        return {
          ...video.toObject(),
          progress: progress ? {
            watchedPercent: progress.watchedPercent,
            completed: progress.completed,
            lastWatched: progress.lastWatched
          } : {
            watchedPercent: 0,
            completed: false,
            lastWatched: null
          }
        };
      });

      return res.status(200).json({ videos: videosWithProgress });
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    return res.status(500).json({ message: 'Server error fetching video listings.' });
  }
};

// Get Single Video Details
export const getVideoById = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findById(id).populate('batch');
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    // Check if student has permission to view this video
    if (req.user.role === 'student') {
      const studentBatchId = req.user.batch?._id || req.user.batch;
      const isAuthorized = video.batch.some(b => b._id.toString() === studentBatchId.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Access denied. Video is not assigned to your batch.' });
      }
    }

    // Fetch progress if student is requesting
    let progress = null;
    if (req.user.role === 'student') {
      progress = await Progress.findOne({
        student: req.user._id,
        video: video._id
      });
    }

    return res.status(200).json({
      video,
      progress: progress ? {
        watchedPercent: progress.watchedPercent,
        completed: progress.completed
      } : {
        watchedPercent: 0,
        completed: false
      }
    });
  } catch (error) {
    console.error('Error fetching video by ID:', error);
    return res.status(500).json({ message: 'Server error fetching video details.' });
  }
};

// Create / Upload Video (Admin Only)
export const createVideo = async (req, res) => {
  const { title, description, videoUrl, thumbnail, day, module, batchIds, order, duration } = req.body;

  try {
    if (!title || !day || !module || !batchIds || batchIds.length === 0) {
      return res.status(400).json({ message: 'Title, day, module, and at least one target batch are required.' });
    }

    // Determine video source: Multer uploaded file OR direct input URL
    let finalVideoUrl = videoUrl;
    if (req.file) {
      try {
        const cloudUrl = await uploadToCloud(req.file.path);
        if (cloudUrl) {
          finalVideoUrl = cloudUrl;
          fs.unlinkSync(req.file.path); // Delete local temp file
        } else {
          finalVideoUrl = `/uploads/${req.file.filename}`;
        }
      } catch (err) {
        console.error('Cloudinary upload error in createVideo, using local fallback:', err);
        finalVideoUrl = `/uploads/${req.file.filename}`;
      }
    }

    if (!finalVideoUrl) {
      return res.status(400).json({ message: 'A video source (either a file upload or a video URL) is required.' });
    }

    const newVideo = new Video({
      title,
      description,
      cloudinaryUrl: finalVideoUrl,
      thumbnail: thumbnail || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
      day: Number(day),
      module,
      batch: Array.isArray(batchIds) ? batchIds : [batchIds],
      order: Number(order || 0),
      duration: Number(duration || 0)
    });

    await newVideo.save();
    return res.status(201).json({ message: 'Video added successfully', video: newVideo });
  } catch (error) {
    console.error('Error creating video:', error);
    return res.status(500).json({ message: 'Server error adding video.' });
  }
};

// Update Video (Admin Only)
export const updateVideo = async (req, res) => {
  const { id } = req.params;
  const { title, description, videoUrl, thumbnail, day, module, batchIds, order, duration } = req.body;

  try {
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    if (title !== undefined) video.title = title;
    if (description !== undefined) video.description = description;
    if (videoUrl !== undefined) video.cloudinaryUrl = videoUrl;
    if (thumbnail !== undefined) video.thumbnail = thumbnail;
    if (day !== undefined) video.day = Number(day);
    if (module !== undefined) video.module = module;
    if (batchIds !== undefined) video.batch = Array.isArray(batchIds) ? batchIds : [batchIds];
    if (order !== undefined) video.order = Number(order);
    if (duration !== undefined) video.duration = Number(duration);

    if (req.file) {
      try {
        const cloudUrl = await uploadToCloud(req.file.path);
        if (cloudUrl) {
          video.cloudinaryUrl = cloudUrl;
          fs.unlinkSync(req.file.path);
        } else {
          video.cloudinaryUrl = `/uploads/${req.file.filename}`;
        }
      } catch (err) {
        console.error('Cloudinary upload error in updateVideo, using local fallback:', err);
        video.cloudinaryUrl = `/uploads/${req.file.filename}`;
      }
    }

    await video.save();
    return res.status(200).json({ message: 'Video details updated successfully', video });
  } catch (error) {
    console.error('Error updating video:', error);
    return res.status(500).json({ message: 'Server error updating video.' });
  }
};

// Delete Video (Admin Only)
export const deleteVideo = async (req, res) => {
  const { id } = req.params;

  try {
    const video = await Video.findByIdAndDelete(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found.' });
    }

    // Cascade delete progress records linked to this video
    await Progress.deleteMany({ video: id });

    return res.status(200).json({ message: 'Video and associated student progress records deleted successfully.' });
  } catch (error) {
    console.error('Error deleting video:', error);
    return res.status(500).json({ message: 'Server error deleting video.' });
  }
};

// Update Student Watch Progress (Student Only)
export const updateProgress = async (req, res) => {
  const { videoId, watchedPercent } = req.body;
  const studentId = req.user._id;

  try {
    if (!videoId || watchedPercent === undefined) {
      return res.status(400).json({ message: 'Video ID and watch percentage (0-100) are required.' });
    }

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ message: 'Target video not found.' });
    }

    const numericPercent = Math.min(100, Math.max(0, Number(watchedPercent)));
    
    // Automatically flag completed if watched percentage crosses 90%
    const isCompleted = numericPercent >= 90;

    const progress = await Progress.findOneAndUpdate(
      { student: studentId, video: videoId },
      {
        watchedPercent: numericPercent,
        completed: isCompleted,
        lastWatched: new Date()
      },
      { new: true, upsert: true }
    );

    return res.status(200).json({
      message: 'Watch progress recorded successfully.',
      progress
    });
  } catch (error) {
    console.error('Error tracking watch progress:', error);
    return res.status(500).json({ message: 'Server error tracking watch progress.' });
  }
};
