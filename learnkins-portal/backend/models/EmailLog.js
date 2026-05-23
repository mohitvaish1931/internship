import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
  sentBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipients: [{
    type: String,
    required: true
  }],
  subject: {
    type: String,
    required: true
  },
  template: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    default: 'sent'
  }
}, {
  timestamps: true
});

const EmailLog = mongoose.model('EmailLog', emailLogSchema);
export default EmailLog;
