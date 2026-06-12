import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Quiz from './pages/Quiz';
import Analytics from './pages/Analytics';
import Leaderboard from './pages/Leaderboard';
import Badges from './pages/Badges';
import Rules from './pages/Rules';
import Login from './pages/Login';
import OnboardingTour from './components/OnboardingTour';

import ResetPassword from './pages/ResetPassword';
import './index.css';

function AppContent() {
  const [user, setUser] = useState(null);
  const [quizActive, setQuizActive] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const saved = localStorage.getItem('festlearn_user');
    if (saved) {
      setUser(JSON.parse(saved));
      // Mevcut kullanıcı için onboarding kontrolü
      const done = localStorage.getItem('festlearn_onboarding_done');
      if (!done) setShowOnboarding(true);
    }
  }, []);

  const handleLogin = (userData, isNewUser = false) => {
    setUser(userData);
    localStorage.setItem('festlearn_user', JSON.stringify(userData));
    // Yeni kayıt olan kullanıcılara onboarding göster
    if (isNewUser) {
      localStorage.removeItem('festlearn_onboarding_done');
      setShowOnboarding(true);
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('festlearn_user');
  };

  const updateUser = (updatedFields) => {
    const newUser = { ...user, ...updatedFields };
    setUser(newUser);
    localStorage.setItem('festlearn_user', JSON.stringify(newUser));
  };

  // Şifre sıfırlama sayfasını login kontrolünden muaf tut
  if (location.pathname === '/reset-password') {
    return <ResetPassword />;
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="app-layout">
      <Sidebar user={user} onLogout={handleLogout} quizActive={quizActive} onStartTour={() => {
        localStorage.removeItem('festlearn_onboarding_done');
        setShowOnboarding(true);
      }} />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard user={user} />} />
          <Route path="/upload" element={<Upload user={user} />} />
          <Route path="/quiz" element={<Quiz user={user} updateUser={updateUser} setQuizActive={setQuizActive} />} />
          <Route path="/analytics" element={<Analytics user={user} />} />
          <Route path="/leaderboard" element={<Leaderboard user={user} />} />
          <Route path="/badges" element={<Badges user={user} />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="*" element={<Navigate to="/" />} />

        </Routes>
      </main>
      {/* Onboarding turu — sadece yeni kullanıcılara gösterilir */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
