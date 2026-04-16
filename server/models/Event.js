import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  student:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam:       { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  submission: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission' },
  type: {
    type: String,
    enum: ['tab_switch', 'right_click', 'devtools', 'idle', 'paste',
           'fullscreen_exit', 'answer', 'code_run', 'upload', 'start',
           'submit', 'flag', 'terminate', 'ip_change'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['INFO', 'WARN', 'CRITICAL'],
    default: 'INFO',
  },
  description: { type: String, required: true },
}, { timestamps: true });

// Index for efficient queries
eventSchema.index({ exam: 1, createdAt: -1 });
eventSchema.index({ student: 1, exam: 1 });

export default mongoose.model('Event', eventSchema);
