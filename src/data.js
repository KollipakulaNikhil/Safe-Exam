// =============================================
// All mock data for ExamGuard UI
// =============================================

export const USERS = {
  student: {
    id: 'student-01',
    name: 'Alex Johnson',
    email: 'student@exam.com',
    password: 'student123',
    role: 'student',
  },
  proctor: {
    id: 'proctor-01',
    name: 'Dr. Sarah Mitchell',
    email: 'proctor@exam.com',
    password: 'proctor123',
    role: 'proctor',
  },
};

export const EXAM = {
  id: 'exam-01',
  name: 'Advanced Data Structures & Algorithms',
  subject: 'Computer Science',
  duration: 90,           // minutes
  totalQuestions: 15,
  startTime: new Date().toISOString(),
  rules: [
    'Camera must remain on throughout the exam',
    'Tab switching is monitored — max 3 switches allowed',
    'Right-click and developer tools are disabled',
    'Fullscreen mode is required during the exam',
    'All activity is recorded and logged',
  ],
  questions: [
    {
      id: 'q1', num: 1, type: 'mcq', marks: 2,
      text: 'What is the time complexity of searching in a balanced Binary Search Tree?',
      options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'],
    },
    {
      id: 'q2', num: 2, type: 'mcq', marks: 2,
      text: 'Which data structure is used for BFS traversal?',
      options: ['Stack', 'Queue', 'Priority Queue', 'Deque'],
    },
    {
      id: 'q3', num: 3, type: 'mcq', marks: 2,
      text: 'What is the worst-case time complexity of QuickSort?',
      options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
    },
    {
      id: 'q4', num: 4, type: 'mcq', marks: 2,
      text: 'Which tree traversal visits the root between its left and right subtrees?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level-order'],
    },
    {
      id: 'q5', num: 5, type: 'mcq', marks: 2,
      text: 'Maximum number of edges in an undirected graph with V vertices?',
      options: ['V', 'V-1', 'V(V-1)/2', 'V²'],
    },
    {
      id: 'q6', num: 6, type: 'mcq', marks: 2,
      text: "Which algorithm uses a greedy approach for finding the shortest path?",
      options: ['Bellman-Ford', 'Floyd-Warshall', "Dijkstra's", 'DFS'],
    },
    {
      id: 'q7', num: 7, type: 'mcq', marks: 2,
      text: 'What is the space complexity of Merge Sort?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
    },
    {
      id: 'q8', num: 8, type: 'mcq', marks: 2,
      text: 'Which data structure follows the LIFO principle?',
      options: ['Queue', 'Stack', 'Array', 'Linked List'],
    },
    {
      id: 'q9', num: 9, type: 'code', marks: 5,
      text: 'Write a function to reverse a linked list iteratively. The function takes the head of the linked list and returns the new head after reversal.',
      starter: 'function reverseList(head) {\n  // Write your solution here\n\n}',
    },
    {
      id: 'q10', num: 10, type: 'code', marks: 5,
      text: 'Implement a function to check if a binary tree is a valid Binary Search Tree (BST). Return true if valid, false otherwise.',
      starter: 'function isValidBST(root) {\n  // Write your solution here\n\n}',
    },
    {
      id: 'q11', num: 11, type: 'code', marks: 5,
      text: "Implement Dijkstra's shortest path algorithm. Given a weighted adjacency list and a source vertex, return the shortest distances to all other vertices.",
      starter: 'function dijkstra(graph, source) {\n  // Write your solution here\n\n}',
    },
    {
      id: 'q12', num: 12, type: 'mcq', marks: 2,
      text: 'Minimum number of edges in a connected graph with n vertices?',
      options: ['n', 'n-1', 'n+1', 'n/2'],
    },
    {
      id: 'q13', num: 13, type: 'mcq', marks: 2,
      text: 'Which sorting algorithm has the best average-case time complexity?',
      options: ['Bubble Sort', 'Selection Sort', 'Merge Sort', 'Insertion Sort'],
    },
    {
      id: 'q14', num: 14, type: 'upload', marks: 10,
      text: 'Upload your solution for the graph coloring problem. Include your source code and a brief explanation document.',
      formats: '.pdf, .py, .java, .cpp, .zip',
    },
    {
      id: 'q15', num: 15, type: 'upload', marks: 10,
      text: 'Upload your Red-Black Tree implementation with test cases.',
      formats: '.pdf, .py, .java, .cpp, .zip',
    },
  ],
};

export const STUDENTS = [
  { id:'s1', name:'Alex Johnson',    email:'ajohnson@uni.edu', status:'active',    risk:12, tabs:1, answered:8,  flagged:false, ip:'192.168.1.101' },
  { id:'s2', name:'Emma Davis',      email:'edavis@uni.edu',   status:'flagged',   risk:67, tabs:5, answered:6,  flagged:true,  ip:'192.168.1.102' },
  { id:'s3', name:'Michael Chen',    email:'mchen@uni.edu',    status:'active',    risk:3,  tabs:0, answered:11, flagged:false, ip:'192.168.1.103' },
  { id:'s4', name:'Sarah Williams',  email:'swilliams@uni.edu',status:'idle',      risk:28, tabs:2, answered:4,  flagged:false, ip:'192.168.1.104' },
  { id:'s5', name:'David Rodriguez', email:'drod@uni.edu',     status:'active',    risk:8,  tabs:1, answered:10, flagged:false, ip:'192.168.1.105' },
  { id:'s6', name:'Priya Patel',     email:'ppatel@uni.edu',   status:'flagged',   risk:82, tabs:7, answered:3,  flagged:true,  ip:'10.0.0.55' },
  { id:'s7', name:'James Wilson',    email:'jwilson@uni.edu',  status:'submitted', risk:5,  tabs:0, answered:15, flagged:false, ip:'192.168.1.107' },
  { id:'s8', name:'Olivia Brown',    email:'obrown@uni.edu',   status:'active',    risk:15, tabs:1, answered:7,  flagged:false, ip:'192.168.1.108' },
  { id:'s9', name:'Lucas Kim',       email:'lkim@uni.edu',     status:'active',    risk:42, tabs:3, answered:5,  flagged:false, ip:'192.168.1.109' },
  { id:'s10',name:'Sophia Martinez', email:'smartinez@uni.edu',status:'active',    risk:0,  tabs:0, answered:12, flagged:false, ip:'192.168.1.110' },
];

export const EVENTS = [
  { id:'e1',  student:'Emma Davis',      severity:'CRITICAL', desc:'Switched tabs 5 times — threshold exceeded', time: Date.now()-120000 },
  { id:'e2',  student:'Priya Patel',     severity:'CRITICAL', desc:'IP address changed mid-exam',                time: Date.now()-300000 },
  { id:'e3',  student:'Priya Patel',     severity:'CRITICAL', desc:'Developer tools opened (F12 pressed)',       time: Date.now()-480000 },
  { id:'e4',  student:'Lucas Kim',       severity:'WARN',     desc:'Switched to another browser tab',           time: Date.now()-600000 },
  { id:'e5',  student:'Sarah Williams',  severity:'WARN',     desc:'Student idle for 3 minutes',                time: Date.now()-720000 },
  { id:'e6',  student:'Emma Davis',      severity:'WARN',     desc:'Right-click attempted and blocked',         time: Date.now()-840000 },
  { id:'e7',  student:'Alex Johnson',    severity:'INFO',     desc:'Submitted answer for Question 8',           time: Date.now()-900000 },
  { id:'e8',  student:'James Wilson',    severity:'INFO',     desc:'Exam submitted successfully',               time: Date.now()-1080000 },
  { id:'e9',  student:'Michael Chen',    severity:'INFO',     desc:'Submitted code solution for Q11',           time: Date.now()-1200000 },
  { id:'e10', student:'Sophia Martinez', severity:'INFO',     desc:'Ran code for Q9 in Python',                 time: Date.now()-1320000 },
  { id:'e11', student:'Lucas Kim',       severity:'WARN',     desc:'Exited fullscreen mode',                    time: Date.now()-1500000 },
  { id:'e12', student:'Priya Patel',     severity:'CRITICAL', desc:'Paste action detected and blocked',         time: Date.now()-1680000 },
];

export const TIMELINE = [
  { id:'t1', type:'start',       desc:'Started exam session',          sev:'INFO', time: Date.now()-2700000 },
  { id:'t2', type:'answer',      desc:'Answered Q1 (MCQ)',              sev:'INFO', time: Date.now()-2520000 },
  { id:'t3', type:'answer',      desc:'Answered Q2 (MCQ)',              sev:'INFO', time: Date.now()-2400000 },
  { id:'t4', type:'tab_switch',  desc:'Switched to another tab',        sev:'WARN', time: Date.now()-2280000 },
  { id:'t5', type:'answer',      desc:'Answered Q3 (MCQ)',              sev:'INFO', time: Date.now()-2100000 },
  { id:'t6', type:'right_click', desc:'Right-click blocked',            sev:'WARN', time: Date.now()-1800000 },
  { id:'t7', type:'code_run',    desc:'Ran code for Q9 in JavaScript',  sev:'INFO', time: Date.now()-1500000 },
  { id:'t8', type:'idle',        desc:'Idle for 2 minutes',             sev:'WARN', time: Date.now()-1200000 },
  { id:'t9', type:'answer',      desc:'Submitted code answer for Q10',  sev:'INFO', time: Date.now()-900000 },
  { id:'t10',type:'upload',      desc:'Uploaded assignment.pdf (2.4 MB)',sev:'INFO', time: Date.now()-600000 },
];

export const RESULT = {
  examName: 'Advanced Data Structures & Algorithms',
  subject: 'Computer Science',
  total: 55, obtained: 38, pct: 69.1, passed: true,
  mcq:    { got: 16, of: 26, answered: 10, total: 13 },
  code:   { got: 14, of: 15, answered: 3,  total: 3  },
  upload: { got: 8,  of: 20, uploaded: 2,  total: 2  },
  integrity: {
    tabSwitches: 2,
    flags: 0,
    risk: 12,
    log: ['Tab switch at 14:23', 'Tab switch at 14:45'],
  },
  duration: '78 minutes',
  submittedAt: new Date(Date.now() - 600000).toISOString(),
};
