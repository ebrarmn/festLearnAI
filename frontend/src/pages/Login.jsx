import { useState } from 'react';
import { registerUser, loginUser } from '../api';

export default function Login({ onLogin }) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' veya 'register'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Giriş State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

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

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginIdentifier || !loginPassword) {
      setError('Lütfen tüm alanları doldurun.');
      return;
    }

    setLoading(true);
    setError('');

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

    if (formData.password !== formData.passwordConfirm) {
      setError('Şifreler eşleşmiyor.');
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
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Kayıt olurken bir sunucu hatası oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: '500px', width: '100%' }}>
        <div className="login-logo">🧠</div>
        <h1>festLearnAI</h1>
        <p>AI destekli kişiselleştirilmiş öğrenme platformu</p>

        <div className="tab-buttons" style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <button
            className={`btn ${activeTab === 'login' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setActiveTab('login'); setError(''); }}
          >
            Giriş Yap
          </button>
          <button
            className={`btn ${activeTab === 'register' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ flex: 1 }}
            onClick={() => { setActiveTab('register'); setError(''); }}
          >
            Kayıt Ol
          </button>
        </div>

        {error && (
          <p style={{ color: 'var(--accent-danger)', fontSize: '14px', marginBottom: '15px', padding: '10px', backgroundColor: 'rgba(255, 71, 87, 0.1)', borderRadius: '8px' }}>
            {error}
          </p>
        )}

        {activeTab === 'login' ? (
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
              <input
                type="password"
                className="form-input"
                placeholder="Şifre"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? 'Giriş yapılıyor...' : 'Giriş Yap 🚀'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" className="form-input" name="firstName" placeholder="Ad" value={formData.firstName} onChange={handleRegisterChange} required />
              <input type="text" className="form-input" name="lastName" placeholder="Soyad" value={formData.lastName} onChange={handleRegisterChange} required />
            </div>
            <input type="text" className="form-input" name="username" placeholder="Kullanıcı Adı" value={formData.username} onChange={handleRegisterChange} required />
            <input type="email" className="form-input" name="email" placeholder="E-posta" value={formData.email} onChange={handleRegisterChange} required />

            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="password" className="form-input" name="password" placeholder="Şifre" value={formData.password} onChange={handleRegisterChange} required minLength={6} />
              <input type="password" className="form-input" name="passwordConfirm" placeholder="Şifre Tekrar" value={formData.passwordConfirm} onChange={handleRegisterChange} required minLength={6} />
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
      </div>
    </div>
  );
}
