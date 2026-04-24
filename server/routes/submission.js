import express from 'express';
import Submission from '../models/Submission.js';
import Exam from '../models/Exam.js';
import Event from '../models/Event.js';
import { protect, requireRole } from '../middleware/auth.js';
import upload from '../middleware/upload.js';

const router = express.Router();

// POST /api/submission/start/:examId — start an exam session
router.post('/start/:examId', protect, requireRole('student'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    if (!exam.isActive) return res.status(400).json({ error: 'Exam is not active' });

    // Check if student already started this exam
    let submission = await Submission.findOne({
      student: req.user._id,
      exam: exam._id,
    });

    if (submission && submission.status === 'submitted') {
      return res.status(400).json({ error: 'You have already submitted this exam' });
    }

    if (!submission) {
      submission = await Submission.create({
        student: req.user._id,
        exam: exam._id,
        ip: req.ip || req.connection?.remoteAddress,
        startedAt: new Date(),
      });

      // Log start event
      await Event.create({
        student: req.user._id,
        exam: exam._id,
        submission: submission._id,
        type: 'start',
        severity: 'INFO',
        description: 'Started exam session',
      });
    }

    res.json({
      submissionId: submission._id,
      status: submission.status,
      startedAt: submission.startedAt,
      answers: submission.answers,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/submission/:id/answer — save/update an answer
router.put('/:id/answer', protect, requireRole('student'), async (req, res) => {
  try {
    const { questionId, questionNum, type, selectedOption, codeAnswer, codeLang } = req.body;

    const submission = await Submission.findOne({
      _id: req.params.id,
      student: req.user._id,
      status: 'in-progress',
    });

    if (!submission) {
      return res.status(404).json({ error: 'Active submission not found' });
    }

    // Update or add answer
    const existingIdx = submission.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    const answerData = { questionId, questionNum, type, selectedOption, codeAnswer, codeLang };

    if (existingIdx >= 0) {
      Object.assign(submission.answers[existingIdx], answerData);
    } else {
      submission.answers.push(answerData);
    }

    await submission.save();

    res.json({ message: 'Answer saved', answeredCount: submission.answers.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/submission/:id/upload — upload file for a question
router.post('/:id/upload', protect, requireRole('student'), upload.single('file'), async (req, res) => {
  try {
    const { questionId, questionNum } = req.body;

    const submission = await Submission.findOne({
      _id: req.params.id,
      student: req.user._id,
      status: 'in-progress',
    });

    if (!submission) return res.status(404).json({ error: 'Active submission not found' });
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const answerData = {
      questionId,
      questionNum: Number(questionNum),
      type: 'upload',
      uploadedFile: `/uploads/${req.file.filename}`,
      uploadFileName: req.file.originalname,
    };

    const existingIdx = submission.answers.findIndex(
      a => a.questionId.toString() === questionId
    );

    if (existingIdx >= 0) {
      Object.assign(submission.answers[existingIdx], answerData);
    } else {
      submission.answers.push(answerData);
    }

    await submission.save();

    // Log upload event
    await Event.create({
      student: req.user._id,
      exam: submission.exam,
      submission: submission._id,
      type: 'upload',
      severity: 'INFO',
      description: `Uploaded ${req.file.originalname} (${(req.file.size / 1024).toFixed(1)} KB)`,
    });

    res.json({
      message: 'File uploaded',
      file: {
        name: req.file.originalname,
        size: req.file.size,
        path: `/uploads/${req.file.filename}`,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/submission/:id/submit — submit exam + auto-grade MCQs
router.put('/:id/submit', protect, requireRole('student'), async (req, res) => {
  try {
    const submission = await Submission.findOne({
      _id: req.params.id,
      student: req.user._id,
      status: 'in-progress',
    });

    if (!submission) return res.status(404).json({ error: 'Active submission not found' });

    const exam = await Exam.findById(submission.exam);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Auto-grade MCQs
    let totalMarks = 0;
    let obtainedMarks = 0;
    const mcqStats = { got: 0, of: 0, answered: 0, total: 0 };
    const codeStats = { got: 0, of: 0, answered: 0, total: 0 };
    const uploadStats = { got: 0, of: 0, uploaded: 0, total: 0 };

    for (const question of exam.questions) {
      totalMarks += question.marks;

      if (question.type === 'mcq') {
        mcqStats.total++;
        mcqStats.of += question.marks;
        const ans = submission.answers.find(a => a.questionId.toString() === question._id.toString());
        if (ans) {
          mcqStats.answered++;
          if (ans.selectedOption === question.answer) {
            ans.isCorrect = true;
            ans.marksObtained = question.marks;
            mcqStats.got += question.marks;
            obtainedMarks += question.marks;
          } else {
            ans.isCorrect = false;
            ans.marksObtained = 0;
          }
        }
      } else if (question.type === 'code') {
        codeStats.total++;
        codeStats.of += question.marks;
        const ans = submission.answers.find(a => a.questionId.toString() === question._id.toString());
        if (ans && ans.codeAnswer) {
          codeStats.answered++;
          // Give partial marks for code (mock: 80% of marks for any submitted code)
          const marks = Math.round(question.marks * 0.8);
          ans.marksObtained = marks;
          codeStats.got += marks;
          obtainedMarks += marks;
        }
      } else if (question.type === 'upload') {
        uploadStats.total++;
        uploadStats.of += question.marks;
        const ans = submission.answers.find(a => a.questionId.toString() === question._id.toString());
        if (ans && ans.uploadedFile) {
          uploadStats.uploaded++;
          // Give partial marks for uploads (mock: 40% of marks)
          const marks = Math.round(question.marks * 0.4);
          ans.marksObtained = marks;
          uploadStats.got += marks;
          obtainedMarks += marks;
        }
      }
    }

    const pct = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 1000) / 10 : 0;

    submission.status = 'submitted';
    submission.submittedAt = new Date();
    submission.score = {
      total: totalMarks,
      obtained: obtainedMarks,
      percentage: pct,
      passed: pct >= 40,
      mcq: mcqStats,
      code: codeStats,
      upload: uploadStats,
    };

    await submission.save();

    // Log submit event
    await Event.create({
      student: req.user._id,
      exam: submission.exam,
      submission: submission._id,
      type: 'submit',
      severity: 'INFO',
      description: `Exam submitted — Score: ${obtainedMarks}/${totalMarks} (${pct}%)`,
    });

    res.json({
      message: 'Exam submitted successfully',
      submissionId: submission._id,
      score: submission.score,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/submission/:id/result — get result after submission
router.get('/:id/result', protect, async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('student', 'name email')
      .populate('exam', 'name subject duration');

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Students can only see their own results
    // submission.student may be a populated object OR a raw ObjectId — handle both
    const studentId = submission.student?._id || submission.student;
    if (req.user.role === 'student' && studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Submission must be submitted before result is available
    if (submission.status !== 'submitted') {
      return res.status(400).json({ error: 'Exam has not been submitted yet' });
    }

    // Get integrity events
    const events = await Event.find({
      submission: submission._id,
      severity: { $in: ['WARN', 'CRITICAL'] },
    }).sort({ createdAt: 1 });

    const integrityLog = events.map(e => `${e.type} at ${e.createdAt.toLocaleTimeString()}`);

    // Calculate duration
    const durationMs = submission.submittedAt
      ? submission.submittedAt - submission.startedAt
      : Date.now() - submission.startedAt;
    const durationMin = Math.round(durationMs / 60000);

    res.json({
      submission,
      duration: `${durationMin} minutes`,
      integrityLog,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
