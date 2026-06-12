import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FiHome, FiUpload, FiPlay, FiBarChart2, FiAward, FiTrendingUp, FiLogOut, FiAlertTriangle, FiBookOpen } from 'react-icons/fi';
import { getUserProfile } from '../api';

const navItems = [
  { to: '/', icon: <FiHome />, label: 'Dashboard' },
  { to: '/upload', icon: <FiUpload />, label: 'Döküman Yükle' },
  { to: '/quiz', icon: <FiPlay />, label: 'Quiz' },
  { to: '/analytics', icon: <FiBarChart2 />, label: 'Analitik' },
  { to: '/leaderboard', icon: <FiTrendingUp />, label: 'Liderlik' },
  { to: '/badges', icon: <FiAward />, label: 'Rozetler' },
  { to: '/rules', icon: <FiBookOpen />, label: 'Kurallar' },
];

export default function Sidebar({ user, onLogout, quizActive, onStartTour }) {

  const [showExitModal, setShowExitModal] = useState(false);
  const [pendingPath, setPendingPath] = useState(null);
  const [progressPercent, setProgressPercent] = useState(null);
  const navigate = useNavigate();

  // Quiz bittiğinde veya sayfa yüklendiğinde ilerleme yüzdesini çek
  useEffect(() => {
    if (!quizActive) {
      const fetchProgress = async () => {
        try {
          const res = await getUserProfile(user.user_id);
          setProgressPercent(res.data.global_progress_percent);
        } catch (err) {
          console.error("Progress fetch error:", err);
        }
      };
      fetchProgress();
    }
  }, [user.user_id, quizActive]);

  const handleNavClick = (e, to) => {
    if (quizActive && to !== '/quiz') {
      e.preventDefault();
      setPendingPath(to);
      setShowExitModal(true);
    }
  };

  const confirmExit = () => {
    setShowExitModal(false);
    if (pendingPath) {
      navigate(pendingPath);
    }
  };

  return (
    <>
      <aside className="sidebar">
        <div className="sidebar-logo" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '4px', padding: '10px' }}>
          <img src="/logo.png" alt="Fest-Learn AI" style={{ width: '45px', height: 'auto', flexShrink: 0 }} />
          <h1 style={{ fontSize: '18px', margin: 0, whiteSpace: 'nowrap', flex: 1 }}>Fest-Learn AI</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={(e) => handleNavClick(e, item.to)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-details" style={{ width: '100%' }}>
              <div className="name">{user.username}</div>
              <div className="level">{user.level || 'Başlangıç'}</div>
              {progressPercent !== null && (
                <div className="progress-bar" style={{ height: '4px', marginTop: '6px', marginBottom: 0, background: 'rgba(255,255,255,0.1)' }}>
                  <div className="progress-fill" style={{ width: `${progressPercent}%`, background: 'linear-gradient(90deg, #6366f1, #8b5cf6)' }} />
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                if (quizActive) {
                  e.preventDefault();
                  setPendingPath('logout');
                  setShowExitModal(true);
                } else {
                  onLogout();
                }
              }}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
              title="Çıkış Yap"
            >
              <FiLogOut size={16} />
            </button>
          </div>
        </div>

        {/* Turu yeniden başlat */}
        <button
          onClick={onStartTour}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            width: '100%', padding: '7px 12px', marginTop: '8px',
            background: 'none', border: '1px dashed rgba(99,102,241,0.2)',
            borderRadius: 'var(--radius-sm)',
            color: 'var(--text-muted)', fontSize: '11px', fontWeight: 500,
            cursor: 'pointer', transition: 'all 0.2s',
            fontFamily: 'var(--font-family)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
            e.currentTarget.style.color = 'var(--accent-primary-light)';
            e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'none';
          }}
        >
          🎓 Turu Tekrar Gör
        </button>
      </aside>

      {/* Quiz Exit Warning Modal */}
      {showExitModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '420px', maxWidth: '90%', animation: 'fadeIn 0.2s ease-out', margin: 0 }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <FiAlertTriangle size={24} /> Sınavdan Çıkış
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              Sınav devam ediyor. Şu ana kadar ki ilerlemeniz <strong>kaydedilmeyecektir</strong>. Çıkmak istediğinize emin misiniz?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setShowExitModal(false)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>Sınava Dön</button>
              <button className="btn" onClick={confirmExit} style={{ background: '#ef4444', color: '#fff' }}>Evet, Çık</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
