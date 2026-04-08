import { NavLink } from 'react-router-dom';
import { FiHome, FiUpload, FiPlay, FiBarChart2, FiAward, FiTrendingUp, FiLogOut } from 'react-icons/fi';

const navItems = [
  { to: '/', icon: <FiHome />, label: 'Dashboard' },
  { to: '/upload', icon: <FiUpload />, label: 'Döküman Yükle' },
  { to: '/quiz', icon: <FiPlay />, label: 'Quiz' },
  { to: '/analytics', icon: <FiBarChart2 />, label: 'Analitik' },
  { to: '/leaderboard', icon: <FiTrendingUp />, label: 'Liderlik' },
  { to: '/badges', icon: <FiAward />, label: 'Rozetler' },
];

export default function Sidebar({ user, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">🧠</div>
        <h1>Fest-Learn AI</h1>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
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
          <div className="user-details">
            <div className="name">{user.username}</div>
            <div className="level">{user.level || 'Başlangıç'}</div>
          </div>
          <button
            onClick={onLogout}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px' }}
            title="Çıkış Yap"
          >
            <FiLogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
