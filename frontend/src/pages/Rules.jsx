import { FiBookOpen, FiTrendingUp, FiAlertCircle, FiCheckCircle, FiStar, FiAward, FiGlobe, FiZap } from 'react-icons/fi';

const TOPIC_LEVELS = [
  {
    from: 'Başlangıç',
    to: 'Temel Seviye',
    fromColor: '#94a3b8',
    toColor: '#34d399',
    emoji: '🌱',
    minQuizzes: 2,
    minQuestions: 10,
    recentCount: 2,
    minScore: 70,
  },
  {
    from: 'Temel Seviye',
    to: 'Orta Seviye',
    fromColor: '#34d399',
    toColor: '#60a5fa',
    emoji: '📘',
    minQuizzes: 4,
    minQuestions: 20,
    recentCount: 2,
    minScore: 75,
  },
  {
    from: 'Orta Seviye',
    to: 'İleri Seviye',
    fromColor: '#60a5fa',
    toColor: '#a78bfa',
    emoji: '🚀',
    minQuizzes: 6,
    minQuestions: 30,
    recentCount: 3,
    minScore: 80,
  },
  {
    from: 'İleri Seviye',
    to: 'Uzman',
    fromColor: '#a78bfa',
    toColor: '#fbbf24',
    emoji: '🏆',
    minQuizzes: 8,
    minQuestions: 40,
    recentCount: 3,
    minScore: 85,
  },
];

const GLOBAL_LEVELS = [
  { from: 'Başlangıç', to: 'Temel Seviye', emoji: '🌱', color: '#34d399', minQuizzes: 20,  minQuestions: 100  },
  { from: 'Temel Seviye', to: 'Orta Seviye',  emoji: '📘', color: '#60a5fa', minQuizzes: 50,  minQuestions: 250  },
  { from: 'Orta Seviye',  to: 'İleri Seviye', emoji: '🚀', color: '#a78bfa', minQuizzes: 100, minQuestions: 500  },
  { from: 'İleri Seviye', to: 'Uzman',        emoji: '🏆', color: '#fbbf24', minQuizzes: 200, minQuestions: 1000 },
];


export default function Rules() {
  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Kurallar &amp; Sistem Bilgisi</h2>
        <p>festLearnAI'ın adaptif öğrenme sistemi hakkında her şeyi öğren.</p>
      </div>

      {/* Ana Açıklama Kartı */}
      <div className="card" style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))', border: '1px solid rgba(99,102,241,0.3)' }}>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '40px', flexShrink: 0 }}>🧠</div>
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '8px', color: '#818cf8' }}>Adaptif Öğrenme Sistemi Nedir?</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.7', fontSize: '14px' }}>
              festLearnAI'da <strong style={{ color: 'var(--text-primary)' }}>iki ayrı seviye sistemi</strong> çalışır:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '12px' }}>
              <div style={{ padding: '12px', background: 'rgba(99,102,241,0.08)', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#818cf8', marginBottom: '4px' }}>📚 PDF Seviyesi</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Her PDF için bağımsız. Puan şartı var. Yeni PDF'de sıfırdan başlarsın.
                </div>
              </div>
              <div style={{ padding: '12px', background: 'rgba(16,185,129,0.08)', borderRadius: '10px', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ fontWeight: 700, fontSize: '13px', color: '#34d399', marginBottom: '4px' }}>🌐 Genel Seviye</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: '1.5' }}>
                  Tüm konuların toplamı. Puan şartı yok. Saf deneyimle yükseliş.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── GENEL SEVİYE SİSTEMİ ── */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FiGlobe style={{ color: '#34d399' }} />
        Genel Deneyim Seviyesi Kuralları
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '4px' }}>(puan bağımsız — tüm konular toplamı)</span>
      </h3>

      <div className="card" style={{ marginBottom: '32px', padding: '8px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['', 'Geçiş', 'Min. Quiz', 'Min. Soru', 'Puan Şartı'].map((h) => (
                <th key={h} style={{ padding: '10px 14px', fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'left', borderBottom: '1px solid var(--border-color)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {GLOBAL_LEVELS.map((g, i) => (
              <tr key={i} style={{ borderBottom: i < GLOBAL_LEVELS.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <td style={{ padding: '12px 14px', fontSize: '18px' }}>{g.emoji}</td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)' }}>{g.from}</span>
                  <span style={{ margin: '0 6px', color: 'var(--text-muted)' }}>→</span>
                  <span style={{ fontSize: '12px', fontWeight: 700, color: g.color }}>{g.to}</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: g.color }}>{g.minQuizzes}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>quiz</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: g.color }}>{g.minQuestions}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', marginLeft: '4px' }}>soru</span>
                </td>
                <td style={{ padding: '12px 14px' }}>
                  <span style={{
                    fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                    background: 'rgba(52,211,153,0.1)', color: '#34d399',
                    border: '1px solid rgba(52,211,153,0.3)', fontWeight: 600
                  }}>Yok ✔</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── PDF SEVİYE SİSTEMİ ── */}
      <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px', color: 'var(--text-primary)' }}>
        <FiTrendingUp style={{ marginRight: '8px', verticalAlign: 'middle', color: '#818cf8' }} />
        PDF Başına Seviye Atlama Kuralları
        <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-muted)', marginLeft: '6px' }}>(her PDF için bağımsız — puan şartı var)</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px' }}>
        {TOPIC_LEVELS.map((lvl, i) => (
          <div key={i} className="card" style={{
            border: `1px solid ${lvl.toColor}30`,
            background: `linear-gradient(135deg, ${lvl.toColor}08, transparent)`,
            padding: '20px 24px',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Sayı göstergesi */}
            <div style={{
              position: 'absolute', top: '16px', right: '20px',
              fontSize: '48px', opacity: 0.08, fontWeight: 900,
              lineHeight: 1, userSelect: 'none'
            }}>{i + 1}</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '28px' }}>{lvl.emoji}</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  background: `${lvl.fromColor}20`, color: lvl.fromColor, border: `1px solid ${lvl.fromColor}40`
                }}>{lvl.from}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '16px' }}>→</span>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  background: `${lvl.toColor}20`, color: lvl.toColor, border: `1px solid ${lvl.toColor}40`
                }}>{lvl.to}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{
                flex: '1 1 130px', padding: '12px 16px',
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: lvl.toColor }}>≥{lvl.minQuizzes}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Quiz Sayısı</div>
              </div>
              <div style={{
                flex: '1 1 130px', padding: '12px 16px',
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: lvl.toColor }}>≥{lvl.minQuestions}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Toplam Soru</div>
              </div>
              <div style={{
                flex: '1 1 130px', padding: '12px 16px',
                background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '22px', fontWeight: 800, color: lvl.toColor }}>%{lvl.minScore}+</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>Son {lvl.recentCount} Quiz Ortalaması</div>
              </div>
            </div>

            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '14px', lineHeight: '1.6', margin: '14px 0 0 0' }}>
              Bu PDF'de <strong style={{ color: 'var(--text-secondary)' }}>en az {lvl.minQuizzes} quiz</strong> ve toplam{' '}
              <strong style={{ color: 'var(--text-secondary)' }}>{lvl.minQuestions} soru</strong> çözmelisin.
              Ayrıca son <strong style={{ color: 'var(--text-secondary)' }}>{lvl.recentCount} quizin</strong> her birinden{' '}
              <strong style={{ color: lvl.toColor }}>%{lvl.minScore} ve üzeri</strong> puan alman gerekiyor.
            </p>
          </div>
        ))}
      </div>

      {/* Önemli Notlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div className="card" style={{ border: '1px solid rgba(52, 211, 153, 0.3)', background: 'rgba(52,211,153,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FiCheckCircle size={20} style={{ color: '#34d399', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Her PDF Bağımsız</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                Farklı bir PDF/konu seçtiğinde o konu için sıfırdan başlarsın. Diğer konulardaki seviyen etkilenmez.
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ border: '1px solid rgba(248, 113, 113, 0.3)', background: 'rgba(248,113,113,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FiAlertCircle size={20} style={{ color: '#f87171', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Seviye Düşmez</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                Kötü bir quiz çözsen de PDF bazlı seviyeni <strong>kaybetmezsin</strong>. Ama tekrar atlamak için şartları yeniden sağlaman gerekebilir.
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ border: '1px solid rgba(251, 191, 36, 0.3)', background: 'rgba(251,191,36,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FiStar size={20} style={{ color: '#fbbf24', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Genel Seviye</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                Profil ve liderlik tablosunda görünen seviye,{' '}
                <strong>tüm konulardaki toplam quiz ve soru sayısına</strong> göre hesaplanır.
                Puan şartı yoktur — saf deneyimle yükseliş!
              </p>
            </div>
          </div>
        </div>

        <div className="card" style={{ border: '1px solid rgba(129, 140, 248, 0.3)', background: 'rgba(129,140,248,0.05)' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <FiAward size={20} style={{ color: '#818cf8', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontWeight: 600, marginBottom: '6px', fontSize: '14px' }}>Rozet Sistemi</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
                Rozetler toplam quiz sayısı, puan, seri gün ve seviyeye göre kazanılır. Rozetler sayfasında detayları görebilirsin.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Soru Tipi Açıklaması */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiBookOpen style={{ color: '#818cf8' }} /> Quiz Soru Tipi
        </h3>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
          <span style={{ fontSize: '32px' }}>📝</span>
          <div>
            <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>Çoktan Seçmeli (A/B/C/D)</div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', lineHeight: '1.6' }}>
              Tüm quizler çoktan seçmeli formattadır. Her sorunun doğru cevabını işaretledikten sonra "Kontrol Et" butonuna basarak anında geri bildirim alırsın.
              Yanlış cevapların altında açıklama gösterilir.
            </p>
          </div>
        </div>
      </div>

      {/* Puan Sistemi */}
      <div className="card">
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '16px' }}>💎 Puan Sistemi</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { label: 'Quiz Puanı', desc: 'Her quizden aldığın yüzde puan (0-100) direkt toplam puanına eklenir.', color: '#818cf8' },
            { label: 'Seri Bonus', desc: 'Her gün quiz çözersen "seri günlerin" artar. Rozetlerde seri günü ödüllendirilir.', color: '#f59e0b' },
            { label: 'Rozet Puanı', desc: 'Kazandığın her rozet profil sayfanda görünür, sıralamanda fark yaratır.', color: '#34d399' },
          ].map((item, i) => (
            <div key={i} style={{
              display: 'flex', gap: '12px', alignItems: 'flex-start',
              padding: '12px 16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)',
              borderLeft: `3px solid ${item.color}`
            }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: item.color, marginBottom: '3px' }}>{item.label}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
