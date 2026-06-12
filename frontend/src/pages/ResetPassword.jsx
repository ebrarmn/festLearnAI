import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';

// --- SVG İkonlar ---
const EyeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const PasswordInput = ({ value, onChange, placeholder, show, onToggle }) => (
  <div className="password-input-wrapper">
    <input
      type={show ? 'text' : 'password'}
      className="form-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      minLength={6}
      required
    />
    <button
      type="button"
      className="password-toggle-btn"
      onClick={onToggle}
      tabIndex={-1}
      title={show ? 'Şifreyi gizle' : 'Şifreyi göster'}
    >
      {show ? <EyeOffIcon /> : <EyeIcon />}
    </button>
  </div>
);

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);

    try {
      const res = await resetPassword(token, newPassword);
      setSuccess(res.data.message);
    } catch (err) {
      setError(err.response?.data?.detail || 'Şifre sıfırlama başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Token yoksa hata göster
  if (!token) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ maxWidth: '460px', width: '100%' }}>
          <div className="login-logo">🧠</div>
          <h1>festLearnAI</h1>
          <div className="auth-message auth-error" style={{ marginTop: '20px' }}>
            <span className="auth-message-icon">⚠️</span>
            Geçersiz şifre sıfırlama linki. Lütfen e-postanızdaki linke tıklayın.
          </div>
          <a href="/" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', textDecoration: 'none' }}>
            Giriş Ekranına Dön
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '460px', width: '100%' }}>
        <div className="login-logo">🔑</div>
        <h1>Yeni Şifre Belirle</h1>
        <p>Yeni şifrenizi girin ve onaylayın.</p>

        {error && (
          <div className="auth-message auth-error">
            <span className="auth-message-icon">⚠️</span>
            {error}
          </div>
        )}

        {success ? (
          <div>
            <div className="auth-message auth-success">
              <span className="auth-message-icon">✅</span>
              {success}
            </div>
            <a href="/" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '16px', textDecoration: 'none' }}>
              Giriş Yap 🚀
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <PasswordInput
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Yeni Şifre (min 6 karakter)"
              show={showPassword}
              onToggle={() => setShowPassword(!showPassword)}
            />
            <PasswordInput
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Yeni Şifre Tekrar"
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
            />
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Güncelleniyor...' : 'Şifremi Güncelle 🔑'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
