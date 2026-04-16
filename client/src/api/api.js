import axios from 'axios';

// Axios instance with base URL and JWT interceptor
const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('examguard_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('examguard_token');
      localStorage.removeItem('examguard_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ────────────── AUTH ──────────────
export const loginUser = (email, password) =>
  api.post('/auth/login', { email, password });

export const registerUser = (data) =>
  api.post('/auth/register', data);

export const getMe = () =>
  api.get('/auth/me');

// ────────────── EXAMS ──────────────
export const getExams = () =>
  api.get('/exam');

export const getExam = (id) =>
  api.get(`/exam/${id}`);

// ────────────── SUBMISSIONS ──────────────
export const startExam = (examId) =>
  api.post(`/submission/start/${examId}`);

export const saveAnswer = (submissionId, answerData) =>
  api.put(`/submission/${submissionId}/answer`, answerData);

export const submitExam = (submissionId) =>
  api.put(`/submission/${submissionId}/submit`);

export const getResult = (submissionId) =>
  api.get(`/submission/${submissionId}/result`);

export const uploadFile = (submissionId, formData) =>
  api.post(`/submission/${submissionId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// ────────────── PROCTOR ──────────────
export const getDashboard = (examId) =>
  api.get(`/proctor/dashboard/${examId}`);

export const getEvents = (examId, severity) =>
  api.get(`/proctor/events/${examId}`, { params: { severity } });

export const getStudentDetail = (submissionId) =>
  api.get(`/proctor/student/${submissionId}`);

export const flagStudent = (submissionId) =>
  api.post(`/proctor/flag/${submissionId}`);

export const terminateStudent = (submissionId) =>
  api.post(`/proctor/terminate/${submissionId}`);

export default api;
