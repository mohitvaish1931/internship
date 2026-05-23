import mongoose from 'mongoose';

const progressSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  watchedPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  lastWatched: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index so that we only have at most one progress entry per student per video
progressSchema.index({ student: 1, video: 1 }, { unique: true });

const Progress = mongoose.model('Progress', progressSchema);
export default Progress;
