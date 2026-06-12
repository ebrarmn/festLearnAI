import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiUpload, FiPlay, FiBarChart2, FiAward, FiTrendingUp,
  FiX, FiArrowRight, FiArrowLeft, FiCheck, FiBookOpen,
  FiZap, FiStar, FiShield
} from 'react-icons/fi';

/* ── Adım tanımları ───────────────────────────────────── */
const STEPS = [
  {
    id: 'welcome',
    title: 'Fest-Learn AI\'ya Hoş Geldin! 🎉',
    subtitle: 'Kısa bir tura hazır mısın?',
    description:
      'Fest-Learn AI, yüklediğin PDF belgelerinden kişiselleştirilmiş quizler oluşturan yapay zeka destekli bir öğrenme platformudur. Bu tur sana uygulamayı nasıl kullanacağını ve seviye sistemini anlatacak.',
    emoji: '🧠',
    color: '#6366f1',
    highlight: null,
    tip: null,
  },
  {
    id: 'upload',
    title: 'Adım 1 — PDF Yükle',
    subtitle: 'Çalışmak istediğin belgeyi ekle',
    description:
      'Sol menüden "Döküman Yükle" sekmesine git. PDF dosyaları sürükle-bırak yapabilir ya da klasöründen seçebilirsin. Yükleme tamamlandığında AI belgeyi işlemeye başlar.',
    emoji: '📄',
    color: '#10b981',
    highlight: '/upload',
    tip: '💡 Her PDF kendi bağımsız seviye sistemine sahip — yeni bir PDF yükleyince sıfırdan başlarsın.',
  },
  {
    id: 'quiz',
    title: 'Adım 2 — Quiz Başlat',
    subtitle: 'Bilgini sınayacak zamanı geldi!',
    description:
      'Sol menüden "Quiz" sekmesine geç. Sağdaki listeden bir PDF seç, soru sayısını belirle ve "Quiz Başlat" butonuna bas. AI, seçtiğin PDF\'deki konulardan seviyene uygun sorular üretir.',
    emoji: '🎯',
    color: '#6366f1',
    highlight: '/quiz',
    tip: '⏱ Her quiz için süre sayacı çalışır. Cevabını verdikten sonra "Kontrol Et" ile anında geri bildirim alırsın.',
  },
  {
    id: 'levels',
    title: 'Adım 3 — Seviye Sistemi',
    subtitle: 'Her PDF için ayrı seviye izleme',
    description:
      'Her PDF/konu için seviyeni bağımsız olarak takip ediyoruz. Başlangıç\'tan Uzman\'a kadar 5 seviye var. Bir sonraki seviyeye geçmek için aşağıdaki şartları sağlaman gerekiyor:',
    emoji: '🏆',
    color: '#f59e0b',
    highlight: '/rules',
    tip: null,
    levelRules: [
      { from: 'Başlangıç', to: 'Temel', minQ: 2, minSoru: 10, minPuan: 70, color: '#34d399' },
      { from: 'Temel', to: 'Orta', minQ: 4, minSoru: 20, minPuan: 75, color: '#60a5fa' },
      { from: 'Orta', to: 'İleri', minQ: 6, minSoru: 30, minPuan: 80, color: '#a78bfa' },
      { from: 'İleri', to: 'Uzman', minQ: 8, minSoru: 40, minPuan: 85, color: '#fbbf24' },
    ],
  },
  {
    id: 'analytics',
    title: 'Adım 4 — İlerleni Takip Et',
    subtitle: 'Analitik & Rozet sistemi',
    description:
      '"Analitik" sekmesinde konu bazında performansını, zaman içindeki gelişimini ve ortalama puanlarını görselleştirilmiş grafiklerle görebilirsin. "Rozetler" sekmesinde kazandığın ve henüz almadığın tüm ödüllere ulaşabilirsin.',
    emoji: '📊',
    color: '#06b6d4',
    highlight: '/analytics',
    tip: '🏅 Quiz başarılarına, gün serilerine ve puan eşiklerine göre özel rozetler kazanabilirsin.',
    features: [
      { icon: <FiBarChart2 />, label: 'Konu bazında performans grafikleri' },
      { icon: <FiTrendingUp />, label: 'Zaman içindeki ilerleme çizelgesi' },
      { icon: <FiAward />, label: '15+ kazanılabilir rozet' },
      { icon: <FiStar />, label: 'Global sıralama tablosu' },
    ],
  },
  {
    id: 'done',
    title: 'Hazırsın! 🚀',
    subtitle: 'Öğrenmeye başlamanın tam zamanı',
    description:
      'Artık Fest-Learn AI\'yı kullanmaya hazırsın. İstediğin zaman sol menüdeki "Kurallar" sekmesinden bu bilgilere tekrar ulaşabilirsin. Şimdi ilk PDF\'ini yükle ve öğrenme yolculuğuna başla!',
    emoji: '🎓',
    color: '#8b5cf6',
    highlight: null,
    tip: null,
    checklist: [
      'PDF yükle',
      'Quiz oluştur ve çöz',
      'Seviye atla',
      'Rozet kazan',
    ],
  },
];

/* ── Ana bileşen ──────────────────────────────────────── */
export default function OnboardingTour({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(true);
  const [animDir, setAnimDir] = useState('forward'); // 'forward' | 'back'
  const navigate = useNavigate();

  const step = STEPS[currentStep];
  const isLast = currentStep === STEPS.length - 1;
  const isFirst = currentStep === 0;

  const handleNext = useCallback(() => {
    if (isLast) {
      finish();
      return;
    }
    setAnimDir('forward');
    setCurrentStep((p) => p + 1);
    if (STEPS[currentStep + 1]?.highlight) {
      navigate(STEPS[currentStep + 1].highlight);
    }
  }, [currentStep, isLast, navigate]);

  const handleBack = useCallback(() => {
    if (isFirst) return;
    setAnimDir('back');
    setCurrentStep((p) => p - 1);
    if (STEPS[currentStep - 1]?.highlight) {
      navigate(STEPS[currentStep - 1].highlight);
    }
  }, [currentStep, isFirst, navigate]);

  const finish = () => {
    setVisible(false);
    localStorage.setItem('festlearn_onboarding_done', '1');
    navigate('/upload');
    setTimeout(() => onComplete(), 300);
  };

  // Klavye kısayolları
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleNext();
      if (e.key === 'ArrowLeft') handleBack();
      if (e.key === 'Escape') finish();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNext, handleBack]);

  if (!visible) return null;

  return (
    <>
      {/* ── Overlay ── */}
      <div
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(5, 7, 20, 0.85)',
          backdropFilter: 'blur(8px)',
          zIndex: 9000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal ── */}
        <div
          key={currentStep}
          style={{
            width: '540px',
            maxWidth: '92vw',
            maxHeight: '90vh',
            overflowY: 'auto',
            background: 'var(--bg-card)',
            border: `1px solid ${step.color}40`,
            borderRadius: '24px',
            boxShadow: `0 0 60px ${step.color}25, 0 32px 80px rgba(0,0,0,0.6)`,
            animation: `onboardSlideIn 0.35s cubic-bezier(.34,1.56,.64,1)`,
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Üst renkli bant */}
          <div style={{
            height: '4px',
            background: `linear-gradient(90deg, ${step.color}, ${step.color}80)`,
            width: `${((currentStep + 1) / STEPS.length) * 100}%`,
            transition: 'width 0.4s ease',
            borderRadius: '4px 4px 0 0',
          }} />

          {/* Arka plan dekoratif daire */}
          <div style={{
            position: 'absolute', top: '-60px', right: '-60px',
            width: '220px', height: '220px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${step.color}15, transparent 70%)`,
            pointerEvents: 'none',
          }} />

          <div style={{ padding: '32px' }}>
            {/* Kapat butonu */}
            <button
              onClick={finish}
              title="Turu atla (Esc)"
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'rgba(255,255,255,0.06)', border: 'none',
                borderRadius: '8px', color: 'var(--text-muted)',
                cursor: 'pointer', padding: '6px', display: 'flex',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
                e.currentTarget.style.color = '#ef4444';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }}
            >
              <FiX size={16} />
            </button>

            {/* Adım göstergesi */}
            <div style={{ display: 'flex', gap: '6px', marginBottom: '28px' }}>
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: '4px',
                    flex: i === currentStep ? 2 : 1,
                    borderRadius: '2px',
                    background: i <= currentStep ? step.color : 'rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Emoji + Başlık */}
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{
                width: '64px', height: '64px', flexShrink: 0,
                borderRadius: '18px',
                background: `${step.color}18`,
                border: `1px solid ${step.color}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '30px',
                boxShadow: `0 0 20px ${step.color}20`,
              }}>
                {step.emoji}
              </div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: step.color, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px' }}>
                  {step.subtitle}
                </div>
                <h2 style={{ fontSize: '22px', fontWeight: 800, lineHeight: 1.3, color: 'var(--text-primary)' }}>
                  {step.title}
                </h2>
              </div>
            </div>

            {/* Açıklama */}
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: '1.75', marginBottom: '20px' }}>
              {step.description}
            </p>

            {/* Seviye Kuralları (adım 3) */}
            {step.levelRules && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {step.levelRules.map((rule, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '10px 14px',
                    background: `${rule.color}0d`,
                    border: `1px solid ${rule.color}25`,
                    borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: rule.color, minWidth: '60px' }}>{rule.from}</span>
                    <FiArrowRight size={12} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                    <span style={{ fontSize: '12px', fontWeight: 700, color: rule.color, minWidth: '55px' }}>{rule.to}</span>
                    <div style={{ display: 'flex', gap: '8px', marginLeft: 'auto', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      {[
                        `${rule.minQ} quiz`,
                        `${rule.minSoru} soru`,
                        `%${rule.minPuan}+ puan`,
                      ].map((tag, j) => (
                        <span key={j} style={{
                          fontSize: '11px', padding: '2px 8px',
                          background: `${rule.color}15`, color: rule.color,
                          borderRadius: '20px', fontWeight: 600,
                          border: `1px solid ${rule.color}30`,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Özellik listesi (adım 4) */}
            {step.features && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
                {step.features.map((f, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '10px',
                    padding: '12px 14px',
                    background: 'var(--bg-secondary)',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    fontSize: '13px', color: 'var(--text-secondary)',
                  }}>
                    <span style={{ color: step.color, fontSize: '16px' }}>{f.icon}</span>
                    {f.label}
                  </div>
                ))}
              </div>
            )}

            {/* Checklist (son adım) */}
            {step.checklist && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {step.checklist.map((item, i) => (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px',
                    background: 'rgba(139,92,246,0.07)',
                    border: '1px solid rgba(139,92,246,0.2)',
                    borderRadius: '10px',
                    fontSize: '14px', color: 'var(--text-secondary)',
                  }}>
                    <div style={{
                      width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(139,92,246,0.15)',
                      border: '1px solid rgba(139,92,246,0.3)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: '#a78bfa' }}>{i + 1}</span>
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            )}

            {/* İpucu kutusu */}
            {step.tip && (
              <div style={{
                display: 'flex', gap: '10px', alignItems: 'flex-start',
                padding: '12px 16px',
                background: `${step.color}0d`,
                border: `1px solid ${step.color}25`,
                borderRadius: '10px',
                marginBottom: '20px',
                fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6',
              }}>
                <FiZap size={16} style={{ color: step.color, flexShrink: 0, marginTop: '2px' }} />
                {step.tip}
              </div>
            )}

            {/* Navigasyon butonları */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              {/* Geri */}
              <button
                onClick={handleBack}
                disabled={isFirst}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '10px 18px', borderRadius: '10px',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-color)',
                  color: isFirst ? 'var(--text-muted)' : 'var(--text-secondary)',
                  fontSize: '13px', fontWeight: 600,
                  cursor: isFirst ? 'default' : 'pointer',
                  opacity: isFirst ? 0.4 : 1,
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-family)',
                }}
              >
                <FiArrowLeft size={14} /> Geri
              </button>

              {/* Adım sayacı */}
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 500 }}>
                {currentStep + 1} / {STEPS.length}
              </span>

              {/* İleri / Başla */}
              <button
                onClick={handleNext}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '10px 22px', borderRadius: '10px',
                  background: isLast
                    ? 'linear-gradient(135deg, #10b981, #34d399)'
                    : `linear-gradient(135deg, ${step.color}, ${step.color}cc)`,
                  border: 'none',
                  color: 'white', fontSize: '14px', fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: `0 4px 15px ${step.color}40`,
                  transition: 'all 0.2s',
                  fontFamily: 'var(--font-family)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = `0 6px 20px ${step.color}55`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = `0 4px 15px ${step.color}40`;
                }}
              >
                {isLast
                  ? <><FiCheck size={16} /> Hadi Başlayalım!</>
                  : <>Devam Et <FiArrowRight size={14} /></>}
              </button>
            </div>

            {/* Klavye kısayolu ipucu */}
            <div style={{ textAlign: 'center', marginTop: '14px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                ← → ok tuşlarıyla gezin &nbsp;·&nbsp; Esc ile atla
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Keyframe animasyonu */}
      <style>{`
        @keyframes onboardSlideIn {
          from { opacity: 0; transform: scale(0.88) translateY(20px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
      `}</style>
    </>
  );
}
