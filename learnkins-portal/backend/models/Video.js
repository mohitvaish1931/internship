import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  cloudinaryUrl: {
    type: String,
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  day: {
    type: Number,
    required: true,
    default: 1
  },
  module: {
    type: String,
    required: true,
    default: 'Module 1'
  },
  batch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }],
  order: {
    type: Number,
    default: 0
  },
  duration: {
    type: Number,
    default: 0 // Duration in seconds
  }
}, {
  timestamps: true
});

const Video = mongoose.model('Video', videoSchema);
export default Video;
