import { useState, useEffect, useRef } from 'react';
import { getQuiz, saveScore, getDocuments } from '../api';
import { FiClock, FiCheck, FiX, FiRefreshCw, FiArrowRight, FiFileText } from 'react-icons/fi';

export default function Quiz({ user, updateUser }) {
  const [step, setStep] = useState('setup'); // setup, loading, quiz, result
  const [topic, setTopic] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [result, setResult] = useState(null);
  const [timer, setTimer] = useState(0);
  const [newBadges, setNewBadges] = useState([]);
  const [difficulty, setDifficulty] = useState('');
  const [documents, setDocuments] = useState([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Component yüklendiğinde dokümanları getir
    const fetchDocs = async () => {
      try {
        const res = await getDocuments();
        setDocuments(res.data);
      } catch (err) {
        console.error("Dokümanlar alınamadı", err);
      }
    };
    fetchDocs();

    return () => clearInterval(timerRef.current);
  }, []);

  const startQuiz = async () => {
    if (!topic.trim()) return;
    setStep('loading');

    try {
      const res = await getQuiz(user.user_id, topic, numQuestions, 'multiple_choice');
      const quiz = res.data.quiz;
      setQuestions(quiz.questions || []);
      setDifficulty(res.data.difficulty_level);
      setCurrentQ(0);
      setAnswers({});
      setShowExplanation(false);
      setTimer(0);
      setStep('quiz');

      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Quiz oluşturulamadı: ' + (err.response?.data?.detail || err.message));
      setStep('setup');
    }
  };

  const selectOption = (qIdx, optIdx) => {
    if (showExplanation) return;
    setAnswers((prev) => ({ ...prev, [qIdx]: optIdx }));
  };


  const submitAnswer = () => {
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    setShowExplanation(false);
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_answer) correctCount++;
    });

    const score = Math.round((correctCount / questions.length) * 100);

    try {
      const res = await saveScore(user.user_id, topic, score, questions.length, Math.round(correctCount), timer);
      setResult({
        score,
        correctCount: Math.round(correctCount),
        totalQuestions: questions.length,
        timeSpent: timer,
        message: res.data.message,
        newLevel: res.data.current_level,
        newPoints: res.data.new_total_points,
      });
      setNewBadges(res.data.new_badges || []);

      updateUser({
        level: res.data.current_level,
        total_points: res.data.new_total_points,
      });
    } catch (err) {
      console.error('Save score error:', err);
      setResult({
        score,
        correctCount: Math.round(correctCount),
        totalQuestions: questions.length,
        timeSpent: timer,
        message: 'Skor kaydedilemedi.',
        newLevel: user.level,
        newPoints: user.total_points,
      });
    }

    setStep('result');
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const resetQuiz = () => {
    setStep('setup');
    setQuestions([]);
    setResult(null);
    setNewBadges([]);
  };

  // === SETUP SCREEN ===
  if (step === 'setup') {
    return (
      <div className="fade-in">
        <div className="page-header">
          <h2>Quiz Başlat</h2>
          <p>Yüklediğin dökümanlardan quiz oluştur ve bilgini test et.</p>
        </div>

        <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
          {/* Sol panel - Quiz ayarları */}
          <div className="quiz-container" style={{ flex: '1 1 500px', margin: 0, maxWidth: 'none' }}>
            <div className="card">
              <div className="form-group">
                <label className="form-label">Konu veya Kaynak Dosya</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Yanda seçtiğin PDF adı buraya gelir veya kendin konu yazabilirsin..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="card-grid card-grid-2">
                <div className="form-group">
                  <label className="form-label">Soru Sayısı</label>
                  <select className="form-select" value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))}>
                    <option value={3}>3 Soru</option>
                    <option value={5}>5 Soru</option>
                    <option value={10}>10 Soru</option>
                    <option value={15}>15 Soru</option>
                    <option value={20}>20 Soru</option>
                  </select>
                </div>
              </div>

              <div style={{ marginTop: '8px', padding: '16px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Mevcut Seviye</div>
                <div style={{ fontSize: '16px', fontWeight: 700 }}>
                  <span className={`badge ${user.level === 'İleri Seviye' ? 'badge-advanced' : user.level === 'Orta Seviye' ? 'badge-intermediate' : 'badge-beginner'}`}>
                    {user.level || 'Başlangıç'}
                  </span>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '8px' }}>
                    Sorular seviyenize göre otomatik ayarlanır
                  </span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '24px' }}
                onClick={startQuiz}
                disabled={!topic.trim()}
              >
                Quiz Başlat
              </button>
            </div>
          </div>

          {/* Sağ panel - PDF Seçimi */}
          <div className="documents-panel" style={{ flex: '1 1 300px' }}>
            <div className="card">
              <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>PDF Seç <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>({documents.length})</span></h3>
              {documents.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Daha önce yüklenmiş PDF bulunamadı.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setTopic(doc.filename)}
                      style={{
                        padding: '12px',
                        background: topic === doc.filename ? 'var(--bg-elevated)' : 'var(--bg-secondary)',
                        border: topic === doc.filename ? '1px solid var(--accent-primary)' : '1px solid transparent',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <FiFileText />
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {doc.filename}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                          {doc.page_count} Sayfa • {(doc.file_size / 1024).toFixed(1)} KB
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === LOADING SCREEN ===
  if (step === 'loading') {
    return (
      <div className="loading" style={{ minHeight: '60vh' }}>
        <div className="spinner" />
        <span className="loading-text">AI sorularını hazırlıyor...</span>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Bu birkaç saniye sürebilir</span>
      </div>
    );
  }

  // === QUIZ SCREEN ===
  if (step === 'quiz' && questions.length > 0) {
    const q = questions[currentQ];
    const isAnswered = answers[currentQ] !== undefined;

    return (
      <div className="fade-in">
        <div className="quiz-container">
          {/* Progress & Timer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div className="quiz-progress" style={{ flex: 1, marginBottom: 0 }}>
              <span className="quiz-progress-text">Soru {currentQ + 1}/{questions.length}</span>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }} />
              </div>
            </div>
            <div className="quiz-timer" style={{ marginLeft: '16px' }}>
              <FiClock /> {formatTime(timer)}
            </div>
          </div>

          {/* Zorluk seviyesi */}
          <div style={{ marginBottom: '16px' }}>
            <span className={`badge ${difficulty === 'İleri Seviye' ? 'badge-advanced' : difficulty === 'Orta Seviye' ? 'badge-intermediate' : 'badge-beginner'}`}>
              {difficulty || 'Başlangıç'}
            </span>
          </div>

          {/* Soru Kartı */}
          <div className="quiz-question-card" key={currentQ}>
            <div className="quiz-question-number">Soru {q.id || currentQ + 1}</div>
            <div className="quiz-question-text">{q.question}</div>

            <div className="quiz-options">
              {(q.options || []).map((opt, idx) => {
                const letters = ['A', 'B', 'C', 'D', 'E'];
                let optClass = 'quiz-option';
                if (answers[currentQ] === idx) optClass += ' selected';
                if (showExplanation) {
                  if (idx === q.correct_answer) optClass += ' correct';
                  else if (answers[currentQ] === idx && idx !== q.correct_answer) optClass += ' wrong';
                }

                return (
                  <div key={idx} className={optClass} onClick={() => selectOption(currentQ, idx)}>
                    <div className="quiz-option-letter">{letters[idx] || (idx+1)}</div>
                    <span>{opt}</span>
                    {showExplanation && idx === q.correct_answer && <FiCheck style={{ marginLeft: 'auto', color: '#34d399' }} />}
                    {showExplanation && answers[currentQ] === idx && idx !== q.correct_answer && <FiX style={{ marginLeft: 'auto', color: '#f87171' }} />}
                  </div>
                );
              })}
            </div>

            {showExplanation && q.explanation && (
              <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(99,102,241,0.08)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: '#818cf8', marginBottom: '4px' }}>💡 Açıklama:</div>
                <div style={{ fontSize: '14px' }}>{q.explanation}</div>
              </div>
            )}
          </div>

          {/* Aksiyonlar */}
          <div className="quiz-actions">
            <div />
            {!showExplanation ? (
              <button className="btn btn-primary" onClick={submitAnswer} disabled={!isAnswered}>
                Kontrol Et <FiCheck />
              </button>
            ) : (
              <button className="btn btn-primary" onClick={nextQuestion}>
                {currentQ < questions.length - 1 ? <>Sonraki <FiArrowRight /></> : <>Bitir <FiCheck /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // === RESULT SCREEN ===
  if (step === 'result' && result) {
    return (
      <div className="fade-in">
        <div className="quiz-container">
          <div className="card">
            <div className="quiz-result">
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>
                {result.score >= 80 ? '🎉' : result.score >= 50 ? '👍' : '💪'}
              </div>
              <div className="result-score">{result.score}%</div>
              <div className="result-label">{result.message}</div>

              <div className="result-stats">
                <div className="result-stat">
                  <div className="value" style={{ color: '#34d399' }}>{result.correctCount}</div>
                  <div className="label">Doğru</div>
                </div>
                <div className="result-stat">
                  <div className="value" style={{ color: '#f87171' }}>{result.totalQuestions - result.correctCount}</div>
                  <div className="label">Yanlış</div>
                </div>
                <div className="result-stat">
                  <div className="value" style={{ color: '#818cf8' }}>{formatTime(result.timeSpent)}</div>
                  <div className="label">Süre</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '16px' }}>
                <div style={{ padding: '12px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Seviye</div>
                  <div style={{ fontWeight: 700 }}>{result.newLevel}</div>
                </div>
                <div style={{ padding: '12px 20px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Toplam Puan</div>
                  <div style={{ fontWeight: 700 }}>{result.newPoints}</div>
                </div>
              </div>

              {/* Yeni Rozetler */}
              {newBadges.length > 0 && (
                <div style={{ marginBottom: '24px' }}>
                  <h4 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#fbbf24' }}>🏆 Yeni Rozet Kazandın!</h4>
                  <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {newBadges.map((b, i) => (
                      <div key={i} style={{ padding: '12px 20px', background: 'rgba(99,102,241,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(99,102,241,0.3)' }}>
                        <span style={{ fontSize: '24px' }}>{b.icon}</span>
                        <div style={{ fontSize: '13px', fontWeight: 600, marginTop: '4px' }}>{b.name}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                <button className="btn btn-primary" onClick={resetQuiz}>
                  <FiRefreshCw /> Yeni Quiz
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
