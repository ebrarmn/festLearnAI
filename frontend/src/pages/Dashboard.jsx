import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserProfile, getAnalytics } from '../api';
import { FiTarget, FiAward, FiTrendingUp, FiClock, FiPlay, FiUpload } from 'react-icons/fi';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard({ user }) {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [user.user_id]);

  const loadData = async () => {
    try {
      const [profileRes, analyticsRes] = await Promise.all([
        getUserProfile(user.user_id),
        getAnalytics(user.user_id)
      ]);
      setProfile(profileRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      console.error('Dashboard data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Dashboard yükleniyor...</span>
      </div>
    );
  }

  const overview = analytics?.overview || {};
  const progress = analytics?.progress_over_time || [];
  const topics = analytics?.topic_performance || [];
  const recentQuizzes = profile?.recent_quizzes || [];

  const levelColors = {
    'Başlangıç': 'badge-beginner',
    'Orta Seviye': 'badge-intermediate',
    'İleri Seviye': 'badge-advanced'
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Hoş geldin, {user.username}!</h2>
        <p>Öğrenme yolculuğun burada başlıyor. Güncel durumunu gözden geçir.</p>
      </div>

      {/* İstatistik Kartları */}
      <div className="card-grid card-grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiTarget /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.total_quizzes || 0}</div>
            <div className="stat-label">Toplam Quiz</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.average_score || 0}%</div>
            <div className="stat-label">Ort. Başarı</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiAward /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.total_points || 0}</div>
            <div className="stat-label">Toplam Puan</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><FiClock /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.streak_days || 0} 🔥</div>
            <div className="stat-label">Gün Serisi</div>
          </div>
        </div>
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: '24px' }}>
        {/* İlerleme Grafiği */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 İlerleme Grafiği</h3>
            <span className={`badge ${levelColors[overview.current_level] || 'badge-beginner'}`}>
              {overview.current_level || 'Başlangıç'}
            </span>
          </div>
          {progress.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={progress}>
                <defs>
                  <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: '#1a1f35', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Area type="monotone" dataKey="avg_score" stroke="#6366f1" fill="url(#colorScore)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '30px' }}>
              <p>Henüz veri yok. İlk quizini çöz!</p>
            </div>
          )}
        </div>

        {/* Hızlı Aksiyonlar */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">⚡ Hızlı İşlemler</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/quiz')}>
              <FiPlay /> Quiz Başlat
            </button>
            <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/upload')}>
              <FiUpload /> Döküman Yükle
            </button>
            <button className="btn btn-secondary btn-lg" style={{ width: '100%' }} onClick={() => navigate('/leaderboard')}>
              <FiTrendingUp /> Liderlik Tablosu
            </button>
          </div>

          {/* Konu Performansı */}
          {topics.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Konu Performansı
              </h4>
              {topics.slice(0, 3).map((t, i) => (
                <div key={i} style={{ marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ fontWeight: 500 }}>{t.topic}</span>
                    <span style={{ color: 'var(--accent-primary-light)', fontWeight: 600 }}>{t.avg_score}%</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${t.avg_score}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Son Quizler */}
      {recentQuizzes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Son Quizler</h3>
          </div>
          <div>
            {recentQuizzes.slice(0, 5).map((q, i) => (
              <div key={i} className="document-item">
                <div className="doc-icon" style={{
                  background: q.score >= 80 ? 'rgba(16,185,129,0.12)' : q.score >= 50 ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                  color: q.score >= 80 ? '#34d399' : q.score >= 50 ? '#fbbf24' : '#f87171'
                }}>
                  {q.score >= 80 ? '✅' : q.score >= 50 ? '📝' : '❌'}
                </div>
                <div className="doc-info">
                  <div className="doc-name">{q.topic}</div>
                  <div className="doc-meta">
                    {q.correct_answers}/{q.total_questions} doğru • {q.difficulty}
                    {q.timestamp && ` • ${new Date(q.timestamp).toLocaleDateString('tr-TR')}`}
                  </div>
                </div>
                <div style={{
                  fontSize: '18px', fontWeight: 800,
                  color: q.score >= 80 ? '#34d399' : q.score >= 50 ? '#fbbf24' : '#f87171'
                }}>
                  {q.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
