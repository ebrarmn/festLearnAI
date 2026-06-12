import { useState } from 'react';
import { registerUser, loginUser, forgotPassword } from '../api';

// --- SVG İkonlar (component dışında tanımlanmalı) ---
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

// --- Password Input Bileşeni (component dışında tanımlanmalı) ---
const PasswordInput = ({ value, onChange, placeholder, show, onToggle, name }) => (
  <div className="password-input-wrapper">
    <input
      type={show ? 'text' : 'password'}
      className="form-input"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      name={name}
      minLength={6}
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

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login', 'register', 'forgot'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Giriş State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Kayıt State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    passwordConfirm: '',
    birthDate: '',
    gender: '',
    termsAccepted: false,
    kvkkAccepted: false,
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegPasswordConfirm, setShowRegPasswordConfirm] = useState(false);

  // Şifremi Unuttum State
  const [forgotEmail, setForgotEmail] = useState('');

  // --- Validasyon Yardımcıları ---
  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const validateUsername = (username) => {
    const re = /^[a-zA-Z0-9_]{3,20}$/;
    return re.test(username);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  // --- Handlers ---
  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!loginIdentifier || !loginPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);

    try {
      const res = await loginUser(loginIdentifier, loginPassword);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Giriş başarısız. Bilgilerinizi kontrol edin.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Ad ve Soyad alanları boş bırakılamaz.');
      return;
    }

    if (!validateUsername(formData.username)) {
      setError('Kullanıcı adı 3-20 karakter uzunluğunda olmalı ve sadece harf, rakam veya alt çizgi (_) içermelidir.');
      return;
    }

    if (!validateEmail(formData.email)) {
      setError('Geçerli bir e-posta adresi girin. (örn: ad@ornek.com)');
      return;
    }

    if (!validatePassword(formData.password)) {
      setError('Şifre en az 6 karakter olmalıdır.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }

    if (!formData.birthDate) {
      setError('Lütfen doğum tarihinizi girin.');
      return;
    }

    if (!formData.termsAccepted || !formData.kvkkAccepted) {
      setError('Lütfen Kullanıcı Sözleşmesi ve KVKK metinlerini onaylayın.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        birth_date: formData.birthDate,
        gender: formData.gender,
        terms_accepted: formData.termsAccepted,
        kvkk_accepted: formData.kvkkAccepted,
      };
      const res = await registerUser(payload);
      onLogin(res.data, true); // isNewUser=true → onboarding göster
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt olurken bir sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!forgotEmail.trim()) {
      setError('Lütfen e-posta adresinizi girin.');
      return;
    }

    if (!validateEmail(forgotEmail)) {
      setError('Geçerli bir e-posta adresi girin. (örn: ad@ornek.com)');
      return;
    }

    setLoading(true);

    try {
      const res = await forgotPassword(forgotEmail.trim());
      setSuccess(res.data.message);
      setForgotEmail('');
    } catch (err) {
      setError(err.response?.data?.detail || 'İşlem başarısız oldu.');
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError('');
    setSuccess('');
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: activeTab === 'forgot' ? '480px' : '500px', width: '100%' }}>
        <div className="login-logo">🧠</div>
        <h1>festLearnAI</h1>
        <p>AI destekli kişiselleştirilmiş öğrenme platformu</p>

        {/* Tab Buttons */}
        <div className="tab-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => switchTab('login')}
          >
            Giriş Yap
          </button>
          <button
            className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => switchTab('register')}
          >
            Kayıt Ol
          </button>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="auth-message auth-error">
            <span className="auth-message-icon">⚠️</span>
            {error}
          </div>
        )}

        {/* Başarı Mesajı */}
        {success && (
          <div className="auth-message auth-success">
            <span className="auth-message-icon">✅</span>
            {success}
          </div>
        )}

        {/* ===== GİRİŞ FORMU ===== */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <input
                type="text"
                className="form-input"
                placeholder="E-posta veya Kullanıcı Adı"
                value={loginIdentifier}
                onChange={(e) => setLoginIdentifier(e.target.value)}
              />
            </div>
            <div className="form-group">
              <PasswordInput
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="Şifre"
                show={showLoginPassword}
                onToggle={() => setShowLoginPassword(!showLoginPassword)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap 🚀'}
            </button>
            <button
              type="button"
              className="forgot-password-link"
              onClick={() => switchTab('forgot')}
            >
              🔑 Şifremi Unuttum
            </button>
          </form>
        )}

        {/* ===== KAYIT FORMU ===== */}
        {activeTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" className="form-input" name="firstName" placeholder="Ad" value={formData.firstName} onChange={handleRegisterChange} required />
              <input type="text" className="form-input" name="lastName" placeholder="Soyad" value={formData.lastName} onChange={handleRegisterChange} required />
            </div>
            <input
              type="text"
              className="form-input"
              name="username"
              placeholder="Kullanıcı Adı (3-20 karakter, harf/rakam/_)"
              value={formData.username}
              onChange={handleRegisterChange}
              required
            />
            <input
              type="email"
              className="form-input"
              name="email"
              placeholder="E-posta (örn: ad@ornek.com)"
              value={formData.email}
              onChange={handleRegisterChange}
              required
            />

            <div style={{ display: 'flex', gap: '10px' }}>
              <PasswordInput
                name="password"
                value={formData.password}
                onChange={handleRegisterChange}
                placeholder="Şifre (min 6 karakter)"
                show={showRegPassword}
                onToggle={() => setShowRegPassword(!showRegPassword)}
              />
              <PasswordInput
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleRegisterChange}
                placeholder="Şifre Tekrar"
                show={showRegPasswordConfirm}
                onToggle={() => setShowRegPasswordConfirm(!showRegPasswordConfirm)}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="date" className="form-input" name="birthDate" value={formData.birthDate} onChange={handleRegisterChange} required title="Doğum Tarihi" />
              <select className="form-input" name="gender" value={formData.gender} onChange={handleRegisterChange}>
                <option value="">Cinsiyet Seçin (Opsiyonel)</option>
                <option value="erkek">Erkek</option>
                <option value="kadin">Kadın</option>
                <option value="diger">Diğer</option>
                <option value="belirtmek_istemiyorum">Belirtmek İstemiyorum</option>
              </select>
            </div>

            <div style={{ fontSize: '13px', textAlign: 'left', marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" name="termsAccepted" checked={formData.termsAccepted} onChange={handleRegisterChange} required />
                Kullanıcı Sözleşmesini okudum ve kabul ediyorum.
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" name="kvkkAccepted" checked={formData.kvkkAccepted} onChange={handleRegisterChange} required />
                KVKK Aydınlatma Metni'ni onaylıyorum.
              </label>
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ marginTop: '10px' }} disabled={loading}>
              {loading ? 'Kayıt olunuyor...' : 'Kayıt Ol'}
            </button>
          </form>
        )}

        {/* ===== ŞİFREMİ UNUTTUM FORMU ===== */}
        {activeTab === 'forgot' && (
          <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div className="forgot-info-banner">
              <span>📧</span>
              <span>Kayıtlı e-posta adresinizi girin, şifre sıfırlama linki gönderilecektir.</span>
            </div>

            <input
              type="email"
              className="form-input"
              placeholder="Kayıtlı E-posta Adresiniz"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
            />

            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Gönderiliyor...' : 'Sıfırlama Linki Gönder 📧'}
            </button>

            <button
              type="button"
              className="forgot-password-link"
              onClick={() => switchTab('login')}
            >
              ← Giriş Ekranına Dön
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
