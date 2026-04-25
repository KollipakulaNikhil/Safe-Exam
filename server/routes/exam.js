import express from 'express';
import Exam from '../models/Exam.js';
import { protect, requireRole } from '../middleware/auth.js';

const router = express.Router();

// POST /api/exam — create exam (proctor only)
router.post('/', protect, requireRole('proctor'), async (req, res) => {
  try {
    const exam = await Exam.create({
      ...req.body,
      createdBy: req.user._id,
    });
    res.status(201).json(exam);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/exam — list active exams
router.get('/', protect, async (req, res) => {
  try {
    const exams = await Exam.find({ isActive: true })
      .select('name subject duration startTime isActive totalQuestions rules questions')
      .populate('createdBy', 'name')
      .sort({ createdAt: -1 });
    res.json(exams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/exam/:id — get exam for students (no correct answers)
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('createdBy', 'name');
    if (!exam) return res.status(404).json({ error: 'Exam not found' });

    // Strip correct answers for students
    const examObj = exam.toObject();
    if (req.user.role === 'student') {
      examObj.questions = examObj.questions.map(q => {
        const { answer, ...rest } = q;
        return rest;
      });
    }

    res.json(examObj);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
