import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  startDate: {
    type: Date
  },
  endDate: {
    type: Date
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const Batch = mongoose.model('Batch', batchSchema);
export default Batch;
