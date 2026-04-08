import { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { FiTarget, FiTrendingUp, FiClock, FiAward } from 'react-icons/fi';

const COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];

export default function Analytics({ user }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user.user_id]);

  const loadAnalytics = async () => {
    try {
      const res = await getAnalytics(user.user_id);
      setData(res.data);
    } catch (err) {
      console.error('Analytics load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Analitik verileri yükleniyor...</span>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="empty-state" style={{ marginTop: '60px' }}>
        <div className="empty-state-icon">📊</div>
        <h3>Veri yüklenemedi</h3>
        <p>Lütfen tekrar deneyin.</p>
      </div>
    );
  }

  const { overview, topic_performance, difficulty_performance, progress_over_time } = data;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Öğrenme Analitiği</h2>
        <p>Performansını analiz et ve gelişim alanlarını keşfet.</p>
      </div>

      {/* Genel İstatistikler */}
      <div className="card-grid card-grid-4" style={{ marginBottom: '24px' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiTarget /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.total_quizzes}</div>
            <div className="stat-label">Toplam Quiz</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiTrendingUp /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.average_score}%</div>
            <div className="stat-label">Ortalama Skor</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><FiAward /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.best_score}%</div>
            <div className="stat-label">En İyi Skor</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><FiClock /></div>
          <div className="stat-content">
            <div className="stat-value">{overview.total_time_minutes} dk</div>
            <div className="stat-label">Toplam Süre</div>
          </div>
        </div>
      </div>

      <div className="card-grid card-grid-2" style={{ marginBottom: '24px' }}>
        {/* Zaman Bazında İlerleme */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📈 Skor İlerlemesi</h3>
          </div>
          {progress_over_time.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={progress_over_time}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickFormatter={(v) => v?.slice(5)} />
                <YAxis stroke="#64748b" fontSize={11} domain={[0, 100]} />
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Area type="monotone" dataKey="avg_score" stroke="#6366f1" fill="url(#areaGradient)" strokeWidth={2} name="Ortalama Skor" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>Henüz yeterli veri yok</p>
            </div>
          )}
        </div>

        {/* Konu Bazında Performans */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📚 Konu Performansı</h3>
          </div>
          {topic_performance.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topic_performance} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" domain={[0, 100]} stroke="#64748b" fontSize={11} />
                <YAxis dataKey="topic" type="category" width={100} stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Bar dataKey="avg_score" name="Ort. Skor" radius={[0, 4, 4, 0]}>
                  {topic_performance.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>Henüz konu verisi yok</p>
            </div>
          )}
        </div>
      </div>

      <div className="card-grid card-grid-2">
        {/* Zorluk Dağılımı */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">🎚️ Zorluk Dağılımı</h3>
          </div>
          {difficulty_performance.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={difficulty_performance}
                  dataKey="quiz_count"
                  nameKey="difficulty"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  innerRadius={50}
                  paddingAngle={5}
                  label={({ difficulty, quiz_count }) => `${difficulty}: ${quiz_count}`}
                >
                  {difficulty_performance.map((entry, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1f35', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '8px', fontSize: '12px' }} />
                <Legend
                  formatter={(value) => <span style={{ color: '#94a3b8', fontSize: '12px' }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>Henüz veri yok</p>
            </div>
          )}
        </div>

        {/* Detaylı Konu Tablosu */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">📋 Detaylı Konu Analizi</h3>
          </div>
          {topic_performance.length > 0 ? (
            <div>
              {topic_performance.map((t, i) => (
                <div key={i} style={{ padding: '12px 0', borderBottom: i < topic_performance.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{t.topic}</span>
                    <span style={{
                      fontSize: '14px', fontWeight: 700,
                      color: t.avg_score >= 80 ? '#34d399' : t.avg_score >= 50 ? '#fbbf24' : '#f87171'
                    }}>
                      {t.avg_score}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{
                      width: `${t.avg_score}%`,
                      background: t.avg_score >= 80 ? 'var(--gradient-success)' : t.avg_score >= 50 ? 'linear-gradient(135deg, #f59e0b, #fbbf24)' : 'linear-gradient(135deg, #ef4444, #f87171)'
                    }} />
                  </div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '6px', fontSize: '11px', color: 'var(--text-muted)' }}>
                    <span>{t.quiz_count} quiz</span>
                    <span>En iyi: {t.best_score}%</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state" style={{ padding: '40px' }}>
              <p>Quiz çözerek konu analizlerini görün</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
