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

export const forgotPassword = (email) =>
  api.post('/forgot-password', { email });

export const resetPassword = (token, newPassword) =>
  api.post('/reset-password', { token, new_password: newPassword });

export const getUserProfile = (userId) =>
  api.get(`/user/${userId}`);

// Doküman İşlemleri
export const uploadDocument = (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('user_id', userId);
  return api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const getDocuments = (userId) =>
  api.get('/documents', { params: { user_id: userId } });

export const deleteDocument = (docId, userId) =>
  api.delete(`/documents/${docId}`, { params: { user_id: userId } });

// Quiz İşlemleri
export const getTopicLevel = (userId, topic) =>
  api.get('/topic-level', { params: { user_id: userId, topic } });

export const getQuiz = (userId, topic, numQuestions = 5, questionType = 'mixed') =>
  api.get('/quiz', {
    params: { user_id: userId, topic, num_questions: numQuestions, question_type: questionType },
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

export const evaluateAnswers = (answersBatch) =>
  api.post('/evaluate-answers', { answers: answersBatch });

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
