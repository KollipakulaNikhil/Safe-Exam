import mongoose from 'mongoose';

const questionSchema = new mongoose.Schema({
  num:     { type: Number, required: true },
  type:    { type: String, enum: ['mcq', 'code', 'upload'], required: true },
  marks:   { type: Number, required: true },
  text:    { type: String, required: true },
  options: [String],                          // MCQ only
  answer:  { type: String },                  // MCQ correct answer
  starter: { type: String },                  // code starter template
  formats: { type: String },                  // upload accepted formats
}, { _id: true });

const examSchema = new mongoose.Schema({
  name:      { type: String, required: true },
  subject:   { type: String, required: true },
  duration:  { type: Number, required: true },  // minutes
  rules:     [String],
  questions: [questionSchema],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  startTime: { type: Date, default: Date.now },
  isActive:  { type: Boolean, default: true },
}, { timestamps: true });

// Virtual to get total questions
examSchema.virtual('totalQuestions').get(function () {
  return this.questions.length;
});

examSchema.set('toJSON', { virtuals: true });
examSchema.set('toObject', { virtuals: true });

export default mongoose.model('Exam', examSchema);
