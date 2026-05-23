import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  url: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['doc', 'tool', 'article', 'repo'],
    default: 'doc'
  },
  category: {
    type: String,
    default: 'General'
  },
  pinned: {
    type: Boolean,
    default: false
  },
  batch: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch'
  }]
}, {
  timestamps: true
});

const Resource = mongoose.model('Resource', resourceSchema);
export default Resource;
