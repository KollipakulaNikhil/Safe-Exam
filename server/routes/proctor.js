import express from 'express';
import Submission from '../models/Submission.js';
import Event from '../models/Event.js';
import Exam from '../models/Exam.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// GET /api/proctor/dashboard/:examId — full dashboard data
router.get('/dashboard/:examId', protect, requireRole('proctor'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.examId);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    const submissions = await Submission.find({ exam: req.params.examId })
      .populate('student', 'name email')
      .sort({ startedAt: -1 });

    // Build student data for dashboard
    const students = submissions.map(sub => ({
      id: sub._id,
      studentId: sub.student._id,
      name: sub.student.name,
      email: sub.student.email,
      status: sub.status === 'submitted' ? 'submitted' :
              sub.integrity.flagged ? 'flagged' :
              sub.integrity.tabSwitches > 2 ? 'flagged' : 'active',
      risk: sub.integrity.riskScore,
      tabs: sub.integrity.tabSwitches,
      answered: sub.answers.length,
      flagged: sub.integrity.flagged,
      ip: sub.ip || '—',
      startedAt: sub.startedAt,
      submittedAt: sub.submittedAt,
    }));

    // Stats
    const activeCount = students.filter(s => s.status === 'active').length;
    const flaggedCount = students.filter(s => s.flagged).length;
    const submittedCount = students.filter(s => s.status === 'submitted').length;
    const totalTabs = students.reduce((a, s) => a + s.tabs, 0);
    const avgRisk = students.length > 0
      ? Math.round(students.reduce((a, s) => a + s.risk, 0) / students.length)
      : 0;

    res.json({
      exam: { name: exam.name, subject: exam.subject, duration: exam.duration, totalQuestions: exam.questions.length },
      students,
      stats: { activeCount, flaggedCount, submittedCount, totalTabs, avgRisk, totalStudents: students.length },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proctor/events/:examId — event log
router.get('/events/:examId', protect, requireRole('proctor'), async (req, res) => {
  try {
    const { severity } = req.query;
    const filter = { exam: req.params.examId };
    if (severity && severity !== 'all') {
      filter.severity = severity.toUpperCase();
    }

    const events = await Event.find(filter)
      .populate('student', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/proctor/student/:submissionId — single student detail
router.get('/student/:submissionId', protect, requireRole('proctor'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('student', 'name email')
      .populate('exam');

    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    // Get timeline events for this student
    const timeline = await Event.find({
      submission: submission._id,
    }).sort({ createdAt: 1 });

    // Build answer details with question text
    const answerDetails = submission.answers.map(ans => {
      const question = submission.exam.questions.find(
        q => q._id.toString() === ans.questionId.toString()
      );
      return {
        ...ans.toObject(),
        questionText: question?.text || '',
        questionMarks: question?.marks || 0,
        correctAnswer: question?.answer || null,
      };
    });

    res.json({
      submission: {
        ...submission.toObject(),
        answers: answerDetails,
      },
      timeline,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/proctor/flag/:submissionId — flag a student
router.post('/flag/:submissionId', protect, requireRole('proctor'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId).populate('student', 'name');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });

    submission.integrity.flagged = !submission.integrity.flagged;
    if (submission.integrity.flagged) {
      submission.integrity.flags += 1;
      submission.integrity.riskScore = Math.min(100, submission.integrity.riskScore + 20);
    }
    await submission.save();

    await Event.create({
      student: submission.student._id,
      exam: submission.exam,
      submission: submission._id,
      type: 'flag',
      severity: 'CRITICAL',
      description: submission.integrity.flagged
        ? `Flagged by proctor for review`
        : `Unflagged by proctor`,
    });

    res.json({ message: submission.integrity.flagged ? 'Student flagged' : 'Flag removed', submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/proctor/terminate/:submissionId — force-submit
router.post('/terminate/:submissionId', protect, requireRole('proctor'), async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('student', 'name')
      .populate('exam');
    if (!submission) return res.status(404).json({ error: 'Submission not found' });
    if (submission.status === 'submitted') {
      return res.status(400).json({ error: 'Already submitted' });
    }

    // Force submit — auto-grade what we have
    submission.status = 'submitted';
    submission.submittedAt = new Date();

    // Quick auto-grade
    let totalMarks = 0;
    let obtainedMarks = 0;
    for (const question of submission.exam.questions) {
      totalMarks += question.marks;
      const ans = submission.answers.find(a => a.questionId.toString() === question._id.toString());
      if (ans) {
        if (question.type === 'mcq' && ans.selectedOption === question.answer) {
          ans.isCorrect = true;
          ans.marksObtained = question.marks;
          obtainedMarks += question.marks;
        }
      }
    }

    const pct = totalMarks > 0 ? Math.round((obtainedMarks / totalMarks) * 1000) / 10 : 0;
    submission.score = {
      total: totalMarks,
      obtained: obtainedMarks,
      percentage: pct,
      passed: pct >= 40,
    };

    await submission.save();

    await Event.create({
      student: submission.student._id,
      exam: submission.exam._id,
      submission: submission._id,
      type: 'terminate',
      severity: 'CRITICAL',
      description: `Session terminated by proctor`,
    });

    res.json({ message: 'Student session terminated', submission });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
