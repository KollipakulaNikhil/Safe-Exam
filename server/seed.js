import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import Exam from './models/Exam.js';
import Submission from './models/Submission.js';
import Event from './models/Event.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/examguard';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Exam.deleteMany({});
    await Submission.deleteMany({});
    await Event.deleteMany({});
    console.log('🗑️  Cleared all collections');

    // Create users
    const proctor = await User.create({
      name: 'Dr. Sarah Mitchell',
      email: 'proctor@exam.com',
      password: 'proctor123',
      role: 'proctor',
    });

    const studentUsers = [];
    const studentData = [
      { name: 'Alex Johnson',    email: 'student@exam.com', password: 'student123' },
      { name: 'Emma Davis',      email: 'emma@uni.edu',     password: 'pass123' },
      { name: 'Michael Chen',    email: 'michael@uni.edu',  password: 'pass123' },
      { name: 'Sarah Williams',  email: 'sarah@uni.edu',    password: 'pass123' },
      { name: 'David Rodriguez', email: 'david@uni.edu',    password: 'pass123' },
      { name: 'Priya Patel',     email: 'priya@uni.edu',    password: 'pass123' },
      { name: 'James Wilson',    email: 'james@uni.edu',    password: 'pass123' },
      { name: 'Olivia Brown',    email: 'olivia@uni.edu',   password: 'pass123' },
      { name: 'Lucas Kim',       email: 'lucas@uni.edu',    password: 'pass123' },
      { name: 'Sophia Martinez', email: 'sophia@uni.edu',   password: 'pass123' },
    ];

    for (const s of studentData) {
      const user = await User.create({ ...s, role: 'student' });
      studentUsers.push(user);
    }
    console.log(`👥 Created ${studentUsers.length} students + 1 proctor`);

    // Create exam
    const exam = await Exam.create({
      name: 'Advanced Data Structures & Algorithms',
      subject: 'Computer Science',
      duration: 90,
      createdBy: proctor._id,
      startTime: new Date(),
      isActive: true,
      rules: [
        'Camera must remain on throughout the exam',
        'Tab switching is monitored — max 3 switches allowed',
        'Right-click and developer tools are disabled',
        'Fullscreen mode is required during the exam',
        'All activity is recorded and logged',
      ],
      questions: [
        { num: 1, type: 'mcq', marks: 2, text: 'What is the time complexity of searching in a balanced Binary Search Tree?', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], answer: 'O(log n)' },
        { num: 2, type: 'mcq', marks: 2, text: 'Which data structure is used for BFS traversal?', options: ['Stack', 'Queue', 'Priority Queue', 'Deque'], answer: 'Queue' },
        { num: 3, type: 'mcq', marks: 2, text: 'What is the worst-case time complexity of QuickSort?', options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'], answer: 'O(n²)' },
        { num: 4, type: 'mcq', marks: 2, text: 'Which tree traversal visits the root between its left and right subtrees?', options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'], answer: 'Inorder' },
        { num: 5, type: 'mcq', marks: 2, text: 'Maximum number of edges in an undirected graph with V vertices?', options: ['V', 'V-1', 'V(V-1)/2', 'V²'], answer: 'V(V-1)/2' },
        { num: 6, type: 'mcq', marks: 2, text: "Which algorithm uses a greedy approach for finding the shortest path?", options: ['Bellman-Ford', 'Floyd-Warshall', "Dijkstra's", 'DFS'], answer: "Dijkstra's" },
        { num: 7, type: 'mcq', marks: 2, text: 'What is the space complexity of Merge Sort?', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], answer: 'O(n)' },
        { num: 8, type: 'mcq', marks: 2, text: 'Which data structure follows the LIFO principle?', options: ['Queue', 'Stack', 'Array', 'Linked List'], answer: 'Stack' },
        { num: 9, type: 'code', marks: 5, text: 'Write a function to reverse a linked list iteratively.', starter: 'function reverseList(head) {\n  // Write your solution here\n\n}' },
        { num: 10, type: 'code', marks: 5, text: 'Implement a function to check if a binary tree is a valid BST.', starter: 'function isValidBST(root) {\n  // Write your solution here\n\n}' },
        { num: 11, type: 'code', marks: 5, text: "Implement Dijkstra's shortest path algorithm.", starter: 'function dijkstra(graph, source) {\n  // Write your solution here\n\n}' },
        { num: 12, type: 'mcq', marks: 2, text: 'Minimum number of edges in a connected graph with n vertices?', options: ['n', 'n-1', 'n+1', 'n/2'], answer: 'n-1' },
        { num: 13, type: 'mcq', marks: 2, text: 'Which sorting algorithm has the best average-case time complexity?', options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'], answer: 'Merge Sort' },
        { num: 14, type: 'upload', marks: 10, text: 'Upload your solution for the graph coloring problem.', formats: '.pdf, .py, .java, .cpp, .zip' },
        { num: 15, type: 'upload', marks: 10, text: 'Upload your Red-Black Tree implementation with test cases.', formats: '.pdf, .py, .java, .cpp, .zip' },
      ],
    });
    console.log(`📝 Created exam: ${exam.name} (${exam.questions.length} questions)`);

    // Create mock submissions for other students (not the main student@exam.com)
    const riskProfiles = [
      // studentUsers[1] = Emma (high risk)
      { idx: 1, tabs: 5, risk: 67, flagged: true,  answered: 6,  mcqAnswers: { 0: 'O(log n)', 1: 'Stack', 2: 'O(n²)', 3: 'Preorder', 5: "Dijkstra's" } },
      // studentUsers[2] = Michael (low risk)
      { idx: 2, tabs: 0, risk: 3,  flagged: false, answered: 11, mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n²)', 3: 'Inorder', 4: 'V(V-1)/2', 5: "Dijkstra's", 6: 'O(n)', 7: 'Stack', 11: 'n-1', 12: 'Merge Sort' } },
      // studentUsers[3] = Sarah (idle)
      { idx: 3, tabs: 2, risk: 28, flagged: false, answered: 4,  mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n)', 7: 'Stack' } },
      // studentUsers[4] = David
      { idx: 4, tabs: 1, risk: 8,  flagged: false, answered: 10, mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n²)', 3: 'Inorder', 4: 'V(V-1)/2', 5: "Dijkstra's", 6: 'O(n)', 7: 'Stack', 11: 'n-1', 12: 'Merge Sort' } },
      // studentUsers[5] = Priya (very high risk)
      { idx: 5, tabs: 7, risk: 82, flagged: true,  answered: 3,  mcqAnswers: { 0: 'O(1)', 1: 'Deque', 7: 'Queue' } },
      // studentUsers[6] = James (submitted)
      { idx: 6, tabs: 0, risk: 5,  flagged: false, answered: 15, submitted: true, mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n²)', 3: 'Inorder', 4: 'V(V-1)/2', 5: "Dijkstra's", 6: 'O(n)', 7: 'Stack', 11: 'n-1', 12: 'Merge Sort' } },
      // studentUsers[7] = Olivia
      { idx: 7, tabs: 1, risk: 15, flagged: false, answered: 7,  mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n²)', 3: 'Postorder', 4: 'V', 5: "Dijkstra's", 7: 'Stack' } },
      // studentUsers[8] = Lucas (medium risk)
      { idx: 8, tabs: 3, risk: 42, flagged: false, answered: 5,  mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n log n)', 7: 'Stack', 12: 'Merge Sort' } },
      // studentUsers[9] = Sophia (clean)
      { idx: 9, tabs: 0, risk: 0,  flagged: false, answered: 12, mcqAnswers: { 0: 'O(log n)', 1: 'Queue', 2: 'O(n²)', 3: 'Inorder', 4: 'V(V-1)/2', 5: "Dijkstra's", 6: 'O(n)', 7: 'Stack', 11: 'n-1', 12: 'Merge Sort' } },
    ];

    for (const profile of riskProfiles) {
      const student = studentUsers[profile.idx];
      const answers = [];

      // MCQ answers
      for (const [qIdxStr, selected] of Object.entries(profile.mcqAnswers)) {
        const qIdx = parseInt(qIdxStr);
        const q = exam.questions[qIdx];
        answers.push({
          questionId: q._id,
          questionNum: q.num,
          type: 'mcq',
          selectedOption: selected,
          isCorrect: selected === q.answer,
          marksObtained: selected === q.answer ? q.marks : 0,
        });
      }

      // Add code answers if answered > mcq count
      if (profile.answered > Object.keys(profile.mcqAnswers).length) {
        const codeQ = exam.questions.filter(q => q.type === 'code');
        for (let i = 0; i < Math.min(codeQ.length, profile.answered - Object.keys(profile.mcqAnswers).length); i++) {
          answers.push({
            questionId: codeQ[i]._id,
            questionNum: codeQ[i].num,
            type: 'code',
            codeAnswer: `// Solution for Q${codeQ[i].num}\nfunction solve() {\n  // ...\n}`,
            codeLang: 'javascript',
            marksObtained: Math.round(codeQ[i].marks * 0.8),
          });
        }
      }

      const sub = await Submission.create({
        student: student._id,
        exam: exam._id,
        answers,
        status: profile.submitted ? 'submitted' : 'in-progress',
        startedAt: new Date(Date.now() - 2700000),
        submittedAt: profile.submitted ? new Date(Date.now() - 600000) : undefined,
        integrity: {
          tabSwitches: profile.tabs,
          flags: profile.flagged ? 1 : 0,
          riskScore: profile.risk,
          flagged: profile.flagged,
        },
        ip: `192.168.1.${101 + profile.idx}`,
        // Set lastSeen: high-risk and many-answered students appear active; others idle
        lastSeen: profile.answered >= 8 || profile.risk > 40
          ? new Date(Date.now() - 60000)   // 1 minute ago — appears ACTIVE
          : new Date(Date.now() - 3600000), // 1 hour ago — appears IDLE
      });

      // Create some violation events for high-risk students
      if (profile.tabs > 0) {
        for (let t = 0; t < Math.min(profile.tabs, 3); t++) {
          await Event.create({
            student: student._id,
            exam: exam._id,
            submission: sub._id,
            type: 'tab_switch',
            severity: profile.tabs > 3 ? 'CRITICAL' : 'WARN',
            description: `Switched to another browser tab (switch #${t + 1})`,
          });
        }
      }
      if (profile.flagged) {
        await Event.create({
          student: student._id,
          exam: exam._id,
          submission: sub._id,
          type: 'devtools',
          severity: 'CRITICAL',
          description: 'Developer tools opened (F12 pressed)',
        });
      }
    }

    console.log(`📊 Created ${riskProfiles.length} mock submissions with events`);
    console.log('\n🎉 Seed complete! Demo credentials:');
    console.log('   Student: student@exam.com / student123');
    console.log('   Proctor: proctor@exam.com / proctor123');
    console.log(`   Exam ID: ${exam._id}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

seed();
