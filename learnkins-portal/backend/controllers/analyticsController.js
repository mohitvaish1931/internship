import User from '../models/User.js';
import Batch from '../models/Batch.js';
import Video from '../models/Video.js';
import Progress from '../models/Progress.js';
import EmailLog from '../models/EmailLog.js';

// Get Administrative Global Statistics (Admin Only)
export const getAdminStats = async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalVideos = await Video.countDocuments();
    const totalBatches = await Batch.countDocuments();
    const totalEmails = await EmailLog.countDocuments();

    // Fetch recent active students
    const recentStudents = await User.find({ role: 'student', active: true })
      .populate('batch')
      .sort({ createdAt: -1 })
      .limit(5);

    // Calculate Batch-wise Stats
    const batches = await Batch.find();
    const batchStats = [];

    for (const batch of batches) {
      const studentCount = await User.countDocuments({ role: 'student', batch: batch._id });
      
      // Fetch all videos assigned to this batch
      const batchVideos = await Video.find({ batch: batch._id });
      const totalVideosCount = batchVideos.length;

      let avgCompletionPercent = 0;

      if (studentCount > 0 && totalVideosCount > 0) {
        // Find all student IDs in this batch
        const students = await User.find({ role: 'student', batch: batch._id });
        const studentIds = students.map(s => s._id);

        // Fetch completed progress entries
        const completedProgressCount = await Progress.countDocuments({
          student: { $in: studentIds },
          video: { $in: batchVideos.map(v => v._id) },
          completed: true
        });

        // Average Completion = (Total completed videos) / (Total expected completions) * 100
        const totalExpectedCompletions = studentCount * totalVideosCount;
        avgCompletionPercent = Math.round((completedProgressCount / totalExpectedCompletions) * 100);
      }

      batchStats.push({
        batchId: batch._id,
        name: batch.name,
        studentCount,
        videoCount: totalVideosCount,
        avgCompletion: avgCompletionPercent
      });
    }

    return res.status(200).json({
      metrics: {
        totalStudents,
        totalVideos,
        totalBatches,
        totalEmails
      },
      recentStudents,
      batchStats
    });
  } catch (error) {
    console.error('Error calculating admin stats:', error);
    return res.status(500).json({ message: 'Server error compiling administrative analytics.' });
  }
};

// Get Batch Performance Drilldown (Admin Only)
export const getBatchAnalytics = async (req, res) => {
  const { id } = req.params;

  try {
    const batch = await Batch.findById(id);
    if (!batch) {
      return res.status(404).json({ message: 'Batch not found.' });
    }

    // Fetch all students in batch
    const students = await User.find({ role: 'student', batch: id });
    
    // Fetch all videos assigned to batch
    const batchVideos = await Video.find({ batch: id });
    const totalVideosCount = batchVideos.length;

    const studentBreakdowns = [];

    for (const student of students) {
      const studentProgress = await Progress.find({
        student: student._id,
        video: { $in: batchVideos.map(v => v._id) }
      });

      const completedCount = studentProgress.filter(p => p.completed).length;
      
      let overallPercent = 0;
      if (totalVideosCount > 0) {
        overallPercent = Math.round((completedCount / totalVideosCount) * 100);
      }

      studentBreakdowns.push({
        studentId: student._id,
        name: student.name,
        email: student.email,
        active: student.active,
        completedVideos: completedCount,
        totalVideos: totalVideosCount,
        overallCompletionPercent: overallPercent
      });
    }

    return res.status(200).json({
      batch: {
        id: batch._id,
        name: batch.name
      },
      studentsCount: students.length,
      videosCount: totalVideosCount,
      studentBreakdowns
    });
  } catch (error) {
    console.error('Error compiling batch analytics:', error);
    return res.status(500).json({ message: 'Server error compiling batch analytics.' });
  }
};

// Get Individual Student Progress & Badges (Admin + Acting Student)
export const getStudentAnalytics = async (req, res) => {
  const { id } = req.params;

  try {
    // Verification: Students can only view their own analytics
    if (req.user.role === 'student' && req.user._id.toString() !== id) {
      return res.status(403).json({ message: 'Access denied. You can only query your own progress metrics.' });
    }

    const student = await User.findById(id).populate('batch');
    if (!student || student.role !== 'student') {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const studentBatchId = student.batch?._id;

    if (!studentBatchId) {
      return res.status(200).json({
        student: { name: student.name, email: student.email, batch: null },
        progressList: [],
        badges: []
      });
    }

    // Fetch batch videos
    const videos = await Video.find({ batch: studentBatchId }).sort({ module: 1, order: 1 });
    const totalVideosCount = videos.length;

    // Fetch student's progress entries
    const progresses = await Progress.find({ student: id });

    // Map progress to videos
    const progressList = videos.map(video => {
      const match = progresses.find(p => p.video.toString() === video._id.toString());
      return {
        videoId: video._id,
        title: video.title,
        module: video.module,
        day: video.day,
        duration: video.duration,
        watchedPercent: match ? match.watchedPercent : 0,
        completed: match ? match.completed : false,
        lastWatched: match ? match.lastWatched : null
      };
    });

    const completedCount = progressList.filter(p => p.completed).length;
    
    let overallProgress = 0;
    if (totalVideosCount > 0) {
      overallProgress = Math.round((completedCount / totalVideosCount) * 100);
    }

    // Gamified Badges calculation
    const badges = [];

    // Badge 1: First Step / First Video completed
    if (completedCount >= 1) {
      badges.push({
        id: 'first_step',
        title: 'First Step',
        description: 'Completed your first learning video module!',
        icon: '🎯',
        earnedAt: progressList.find(p => p.completed)?.lastWatched || new Date()
      });
    }

    // Badge 2: Halfway Hero / 50% watch rate
    if (overallProgress >= 50 && totalVideosCount > 0) {
      badges.push({
        id: 'halfway_hero',
        title: 'Halfway Hero',
        description: 'Crossed over 50% completion of your batch course!',
        icon: '⚡',
        earnedAt: new Date()
      });
    }

    // Badge 3: Certification Master / 100% completed
    if (overallProgress === 100 && totalVideosCount > 0) {
      badges.push({
        id: 'mastery',
        title: 'LearnKins Master',
        description: 'Completed every video module assigned to your cohort!',
        icon: '🏆',
        earnedAt: new Date()
      });
    }

    return res.status(200).json({
      student: {
        id: student._id,
        name: student.name,
        email: student.email,
        batchName: student.batch.name
      },
      stats: {
        totalVideos: totalVideosCount,
        completedVideos: completedCount,
        overallCompletion: overallProgress
      },
      progressList,
      badges
    });
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    return res.status(500).json({ message: 'Server error retrieving analytics profiles.' });
  }
};
