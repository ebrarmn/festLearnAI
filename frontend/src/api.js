import axios from 'axios';

const API_BASE = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Kullanıcı İşlemleri
export const registerUser = (userData) =>
  api.post('/register', userData);

export const loginUser = (emailOrUsername, password) =>
  api.post('/login', { email_or_username: emailOrUsername, password });

export const getUserProfile = (userId) =>
  api.get(`/user/${userId}`);

// Doküman İşlemleri
export const uploadDocument = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = () =>
  api.get('/documents');

// Quiz İşlemleri
export const getQuiz = (userId, topic, numQuestions = 5) =>
  api.get('/quiz', {
    params: { user_id: userId, topic, num_questions: numQuestions },
  });

export const saveScore = (userId, topic, score, totalQuestions, correctAnswers, timeSpent) =>
  api.post('/save-score', {
    user_id: userId,
    topic,
    score,
    total_questions: totalQuestions,
    correct_answers: correctAnswers,
    time_spent: timeSpent,
  });

// Analitik
export const getAnalytics = (userId) =>
  api.get(`/analytics/${userId}`);

// Liderlik Tablosu
export const getLeaderboard = (limit = 20) =>
  api.get('/leaderboard', { params: { limit } });

// Rozetler
export const getAllBadges = () =>
  api.get('/badges');

export const getUserBadges = (userId) =>
  api.get(`/badges/${userId}`);

export default api;
