import mongoose from 'mongoose';

const answerSchema = new mongoose.Schema({
  questionId:     { type: mongoose.Schema.Types.ObjectId, required: true },
  questionNum:    { type: Number },
  type:           { type: String, enum: ['mcq', 'code', 'upload'] },
  selectedOption: { type: String },     // MCQ
  codeAnswer:     { type: String },     // Code
  codeLang:       { type: String },     // Code language
  uploadedFile:   { type: String },     // Upload file path
  uploadFileName: { type: String },     // Original filename
  isCorrect:      { type: Boolean },    // Auto-graded for MCQ
  marksObtained:  { type: Number, default: 0 },
}, { _id: true });

const submissionSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  exam:    { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  answers: [answerSchema],
  status:  { type: String, enum: ['in-progress', 'submitted'], default: 'in-progress' },
  startedAt:   { type: Date, default: Date.now },
  submittedAt: { type: Date },
  score: {
    total:      { type: Number, default: 0 },
    obtained:   { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed:     { type: Boolean, default: false },
    mcq:    { got: { type: Number, default: 0 }, of: { type: Number, default: 0 }, answered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    code:   { got: { type: Number, default: 0 }, of: { type: Number, default: 0 }, answered: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
    upload: { got: { type: Number, default: 0 }, of: { type: Number, default: 0 }, uploaded: { type: Number, default: 0 }, total: { type: Number, default: 0 } },
  },
  integrity: {
    tabSwitches: { type: Number, default: 0 },
    flags:       { type: Number, default: 0 },
    riskScore:   { type: Number, default: 0 },
    flagged:     { type: Boolean, default: false },
  },
  ip: { type: String },
  lastSeen: { type: Date, default: Date.now },  // updated on every answer/violation
}, { timestamps: true });

// Virtual: answered count
submissionSchema.virtual('answeredCount').get(function () {
  return this.answers.length;
});

submissionSchema.set('toJSON', { virtuals: true });
submissionSchema.set('toObject', { virtuals: true });

export default mongoose.model('Submission', submissionSchema);
