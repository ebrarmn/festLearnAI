import { useState, useEffect } from 'react';
import { getUserBadges } from '../api';

export default function Badges({ user }) {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBadges();
  }, [user.user_id]);

  const loadBadges = async () => {
    try {
      const res = await getUserBadges(user.user_id);
      setBadges(res.data);
    } catch (err) {
      console.error('Badges load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Rozetler yükleniyor...</span>
      </div>
    );
  }

  const earned = badges.filter((b) => b.earned);
  const categories = ['all', ...new Set(badges.map((b) => b.category))];
  const filtered = filter === 'all' ? badges : badges.filter((b) => b.category === filter);

  const categoryLabels = {
    all: 'Tümü',
    quiz: 'Quiz',
    points: 'Puan',
    level: 'Seviye',
    streak: 'Seri',
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🏅 Rozetler</h2>
        <p>Başarılarını topla ve koleksiyonunu tamamla!</p>
      </div>

      {/* İlerleme */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Rozet İlerlemesi</div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
              {earned.length} / {badges.length} rozet kazanıldı
            </div>
          </div>
          <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--accent-primary-light)' }}>
            {badges.length > 0 ? Math.round((earned.length / badges.length) * 100) : 0}%
          </div>
        </div>
        <div className="progress-bar" style={{ height: '10px' }}>
          <div className="progress-fill" style={{ 
            width: `${badges.length > 0 ? (earned.length / badges.length) * 100 : 0}%` 
          }} />
        </div>
      </div>

      {/* Filtre */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`btn ${filter === cat ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setFilter(cat)}
          >
            {categoryLabels[cat] || cat}
          </button>
        ))}
      </div>

      {/* Kazanılan Rozetler */}
      {earned.length > 0 && filter === 'all' && (
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: '#fbbf24' }}>
            ✨ Kazanılan Rozetler ({earned.length})
          </h3>
          <div className="badges-grid">
            {earned.map((b) => (
              <div key={b.id} className="badge-card earned">
                <div className="badge-icon">{b.icon}</div>
                <div className="badge-name">{b.name}</div>
                <div className="badge-desc">{b.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tüm Rozetler */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
          {filter === 'all' ? '🎖️ Tüm Rozetler' : `🎖️ ${categoryLabels[filter] || filter} Rozetleri`}
        </h3>
        <div className="badges-grid">
          {filtered.map((b) => (
            <div key={b.id} className={`badge-card ${b.earned ? 'earned' : 'locked'}`}>
              <div className="badge-icon">{b.icon}</div>
              <div className="badge-name">{b.name}</div>
              <div className="badge-desc">{b.description}</div>
              {b.earned ? (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#34d399', fontWeight: 600 }}>✅ Kazanıldı</div>
              ) : (
                <div style={{ marginTop: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>🔒 Kilitli</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
