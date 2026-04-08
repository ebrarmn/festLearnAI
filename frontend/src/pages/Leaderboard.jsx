import { useState, useEffect } from 'react';
import { getLeaderboard } from '../api';
import { FiTrendingUp, FiAward, FiTarget } from 'react-icons/fi';

export default function Leaderboard({ user }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const res = await getLeaderboard(50);
      setData(res.data);
    } catch (err) {
      console.error('Leaderboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner" />
        <span className="loading-text">Liderlik tablosu yükleniyor...</span>
      </div>
    );
  }

  const top3 = data.slice(0, 3);
  const rest = data.slice(3);
  const myRank = data.find((d) => d.user_id === user.user_id);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>🏆 Liderlik Tablosu</h2>
        <p>Tüm öğrenciler arasındaki sıralamayı gör ve zirveye çık!</p>
      </div>

      {/* Top 3 Podium */}
      {top3.length >= 3 && (
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '16px', marginBottom: '32px' }}>
          {/* 2. Sıra */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ 
              width: '56px', height: '56px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #c0c0c0, #a0a0a0)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '22px', fontWeight: 800, margin: '0 auto 8px',
              color: '#1a1a1a'
            }}>2</div>
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '2px' }}>{top3[1].username}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#a0a0a0' }}>{top3[1].total_points}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>puan</div>
            <div style={{ 
              height: '100px', background: 'linear-gradient(180deg, rgba(192,192,192,0.15), transparent)', 
              borderRadius: '8px 8px 0 0', marginTop: '8px'
            }} />
          </div>

          {/* 1. Sıra */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ fontSize: '28px', marginBottom: '4px' }}>👑</div>
            <div style={{ 
              width: '68px', height: '68px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #ffd700, #ffaa00)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '26px', fontWeight: 900, margin: '0 auto 8px',
              color: '#1a1a1a', boxShadow: '0 0 30px rgba(255,215,0,0.3)'
            }}>1</div>
            <div style={{ fontWeight: 700, fontSize: '17px', marginBottom: '2px' }}>{top3[0].username}</div>
            <div style={{ fontSize: '24px', fontWeight: 900, color: '#ffd700' }}>{top3[0].total_points}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>puan</div>
            <div style={{ 
              height: '140px', background: 'linear-gradient(180deg, rgba(255,215,0,0.12), transparent)', 
              borderRadius: '8px 8px 0 0', marginTop: '8px'
            }} />
          </div>

          {/* 3. Sıra */}
          <div style={{ textAlign: 'center', flex: 1, maxWidth: '200px' }}>
            <div style={{ 
              width: '52px', height: '52px', borderRadius: '50%', 
              background: 'linear-gradient(135deg, #cd7f32, #b87333)', 
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '20px', fontWeight: 800, margin: '0 auto 8px',
              color: '#1a1a1a'
            }}>3</div>
            <div style={{ fontWeight: 700, fontSize: '14px', marginBottom: '2px' }}>{top3[2].username}</div>
            <div style={{ fontSize: '18px', fontWeight: 800, color: '#cd7f32' }}>{top3[2].total_points}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>puan</div>
            <div style={{ 
              height: '70px', background: 'linear-gradient(180deg, rgba(205,127,50,0.12), transparent)', 
              borderRadius: '8px 8px 0 0', marginTop: '8px'
            }} />
          </div>
        </div>
      )}

      {/* Kendi Sıran */}
      {myRank && (
        <div className="card" style={{ marginBottom: '24px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className={`leaderboard-rank ${myRank.rank <= 3 ? `rank-${myRank.rank}` : 'rank-default'}`}>
              {myRank.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '15px' }}>👤 {myRank.username} (Sen)</div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {myRank.quiz_count} quiz • Ort: {myRank.average_score}% • {myRank.current_level}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '22px', fontWeight: 800, color: 'var(--accent-primary-light)' }}>{myRank.total_points}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>puan</div>
            </div>
          </div>
        </div>
      )}

      {/* Full Tablo */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📋 Tam Sıralama</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{data.length} öğrenci</span>
        </div>

        {data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h3>Henüz sıralama yok</h3>
            <p>İlk quizini çözerek liderlik tablosuna gir!</p>
          </div>
        ) : (
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Sıra</th>
                <th>Öğrenci</th>
                <th>Seviye</th>
                <th>Quiz</th>
                <th>Ort. Skor</th>
                <th>Seri</th>
                <th>Puan</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item) => (
                <tr key={item.user_id} style={item.user_id === user.user_id ? { outline: '1px solid rgba(99,102,241,0.3)' } : {}}>
                  <td>
                    <div className={`leaderboard-rank ${item.rank <= 3 ? `rank-${item.rank}` : 'rank-default'}`}>
                      {item.rank}
                    </div>
                  </td>
                  <td>
                    <div className="leaderboard-user">
                      <div className="user-avatar" style={{ width: '32px', height: '32px', fontSize: '12px' }}>
                        {item.username?.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600 }}>
                        {item.username} {item.user_id === user.user_id && '(Sen)'}
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className={`badge ${item.current_level === 'Advanced' ? 'badge-advanced' : item.current_level === 'Intermediate' ? 'badge-intermediate' : 'badge-beginner'}`}>
                      {item.current_level}
                    </span>
                  </td>
                  <td>{item.quiz_count}</td>
                  <td>{item.average_score}%</td>
                  <td>{item.streak_days} 🔥</td>
                  <td style={{ fontWeight: 800, color: 'var(--accent-primary-light)' }}>{item.total_points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
