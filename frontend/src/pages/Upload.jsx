import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadDocument, getDocuments, deleteDocument } from '../api';
import { FiUploadCloud, FiFile, FiCheck, FiAlertCircle, FiTrash2 } from 'react-icons/fi';

export default function Upload({ user }) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [duplicateFile, setDuplicateFile] = useState(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      const res = await getDocuments(user.user_id);
      setDocuments(res.data);
    } catch (err) {
      console.error('Documents load error:', err);
    } finally {
      setLoading(false);
    }
  };

  const processUpload = async (file) => {
    setUploading(true);
    setUploadResult(null);

    try {
      const res = await uploadDocument(file, user.user_id);
      setUploadResult({ type: 'success', message: res.data.message, pages: res.data.pages, chunks: res.data.chunks });
      loadDocuments();
    } catch (err) {
      setUploadResult({ type: 'error', message: 'Yükleme başarısız: ' + (err.response?.data?.detail || err.message) });
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback(async (acceptedFiles) => {
    if (acceptedFiles.length === 0) return;

    const file = acceptedFiles[0];
    
    const isDuplicate = documents.some(doc => doc.filename === file.name);
    if (isDuplicate) {
      setDuplicateFile(file);
      return;
    }

    processUpload(file);
  }, [documents, user.user_id]);

  const handleConfirmDuplicate = () => {
    if (duplicateFile) {
      processUpload(duplicateFile);
      setDuplicateFile(null);
    }
  };

  const handleDeleteDocument = async (docId, docName) => {
    if (window.confirm(`"${docName}" dosyasını silmek istediğinize emin misiniz?`)) {
      try {
        await deleteDocument(docId, user.user_id);
        loadDocuments();
      } catch (err) {
        alert('Dosya silinirken bir hata oluştu.');
        console.error(err);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1,
    disabled: uploading,
  });

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>📄 Döküman Yükle</h2>
        <p>PDF dosyalarını yükleyerek AI quiz sistemi hazır hale gelsin.</p>
      </div>

      {/* Dropzone */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
          <input {...getInputProps()} />
          <div className="dropzone-icon">
            {uploading ? <div className="spinner" /> : <FiUploadCloud />}
          </div>
          <h3>{uploading ? 'Yükleniyor...' : isDragActive ? 'Dosyayı bırakın!' : 'PDF Dosyasını Sürükle & Bırak'}</h3>
          <p>veya dosya seçmek için tıklayın • Maksimum dosya boyutu: 50MB</p>
        </div>

        {uploadResult && (
          <div className={`toast ${uploadResult.type}`} style={{ position: 'relative', marginTop: '16px', bottom: 'auto', right: 'auto', animation: 'none' }}>
            {uploadResult.type === 'success' ? <FiCheck size={20} /> : <FiAlertCircle size={20} />}
            <div>
              <div style={{ fontWeight: 600, fontSize: '14px' }}>{uploadResult.message}</div>
              {uploadResult.pages && (
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {uploadResult.pages} sayfa • {uploadResult.chunks} parça oluşturuldu
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Yüklenen Dokümanlar */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Yüklenen Dokümanlar</h3>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{documents.length} dosya</span>
        </div>

        {loading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : documents.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📂</div>
            <h3>Henüz döküman yüklenmemiş</h3>
            <p>İlk PDF dosyanızı yükleyerek quiz oluşturmaya başlayın.</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div key={doc.id} className="document-item">
              <div className="doc-icon">
                <FiFile />
              </div>
              <div className="doc-info" style={{ flex: 1 }}>
                <div className="doc-name">{doc.filename}</div>
                <div className="doc-meta">
                  {formatFileSize(doc.file_size)} • {doc.page_count || '?'} sayfa
                  {doc.uploaded_at && ` • ${new Date(doc.uploaded_at).toLocaleDateString('tr-TR')}`}
                </div>
              </div>
              <span className={`doc-status ${doc.status}`} style={{ marginRight: '12px' }}>
                {doc.status === 'ready' ? '✅ Hazır' : doc.status === 'processing' ? '⏳ İşleniyor' : '❌ Hata'}
              </span>
              <button 
                className="btn btn-icon" 
                style={{ color: '#ef4444', padding: '8px', background: 'transparent', border: '1px solid #ef4444' }}
                onClick={() => handleDeleteDocument(doc.id, doc.filename)}
                title="Dokümanı Sil"
              >
                <FiTrash2 size={16} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Duplicate File Modal */}
      {duplicateFile && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 9999
        }}>
          <div className="card" style={{ width: '400px', maxWidth: '90%', animation: 'fadeIn 0.2s ease-out', margin: 0 }}>
            <h3 style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
              <FiAlertCircle size={24} /> Uyarı
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
              <strong>{duplicateFile.name}</strong> adlı PDF daha önce yüklenmiş. Üzerine yazarak yenisiyle değiştirmek ister misiniz?
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button className="btn" onClick={() => setDuplicateFile(null)} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>İptal</button>
              <button className="btn btn-primary" onClick={handleConfirmDuplicate}>Evet, Değiştir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
