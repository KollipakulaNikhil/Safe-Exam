import Event from './models/Event.js';
import Submission from './models/Submission.js';

export default function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join exam room
    socket.on('join_exam', ({ examId, userId, role }) => {
      const room = `exam:${examId}`;
      socket.join(room);
      socket.examId = examId;
      socket.userId = userId;
      socket.userRole = role;
      console.log(`  → ${role} ${userId} joined room ${room}`);
    });

    // Student sends violation
    socket.on('violation', async (data) => {
      try {
        const { examId, submissionId, type, severity, description } = data;

        // Save event to DB
        const event = await Event.create({
          student: socket.userId,
          exam: examId,
          submission: submissionId,
          type,
          severity,
          description,
        });

        // Update submission integrity
        const submission = await Submission.findById(submissionId);
        if (submission) {
          if (type === 'tab_switch') {
            submission.integrity.tabSwitches += 1;
          }
          // Increase risk score based on severity
          const riskIncrease = severity === 'CRITICAL' ? 15 : severity === 'WARN' ? 5 : 0;
          submission.integrity.riskScore = Math.min(100, submission.integrity.riskScore + riskIncrease);

          // Auto-flag if risk is high
          if (submission.integrity.riskScore >= 60) {
            submission.integrity.flagged = true;
          }
          await submission.save();
        }

        // Populate and broadcast to proctors in the room
        const populatedEvent = await Event.findById(event._id).populate('student', 'name email');

        io.to(`exam:${examId}`).emit('new_event', {
          event: populatedEvent,
          studentUpdate: submission ? {
            submissionId: submission._id,
            riskScore: submission.integrity.riskScore,
            tabSwitches: submission.integrity.tabSwitches,
            flagged: submission.integrity.flagged,
          } : null,
        });

      } catch (err) {
        console.error('Socket violation error:', err.message);
      }
    });

    // Student saved an answer
    socket.on('answer_saved', (data) => {
      const { examId, studentName, questionNum, answeredCount, totalQuestions } = data;
      io.to(`exam:${examId}`).emit('student_progress', {
        studentName,
        questionNum,
        answeredCount,
        totalQuestions,
      });
    });

    // Student submitted exam
    socket.on('exam_submitted', (data) => {
      const { examId, studentName, submissionId } = data;
      io.to(`exam:${examId}`).emit('student_submitted', {
        studentName,
        submissionId,
      });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
    });
  });
}
