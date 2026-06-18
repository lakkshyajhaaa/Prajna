import React, { useState, useRef, useEffect } from 'react';
import { Database as DbIcon, UserPlus, UploadCloud, RefreshCw, Trash2, Key, Shield } from 'lucide-react';

const Database = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [name, setName] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollResult, setEnrollResult] = useState(null);
  
  const [localIdentity, setLocalIdentity] = useState(null);

  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load local identity on mount
    const stored = localStorage.getItem('prajna_identity');
    if (stored) {
      try {
        setLocalIdentity(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse local identity");
      }
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setEnrollResult(null);
    }
  };

  const handleEnroll = async (e) => {
    e.preventDefault();
    if (!selectedFile || !name.trim()) return;

    setIsEnrolling(true);
    setEnrollResult(null);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('files', selectedFile);

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const data = await res.json();
      
      if (data.success) {
        const newIdentity = {
          name: data.name,
          stage1: data.stage1,
          stage2: data.stage2,
          enrolledAt: new Date().toISOString()
        };
        localStorage.setItem('prajna_identity', JSON.stringify(newIdentity));
        setLocalIdentity(newIdentity);
        
        setEnrollResult({
          type: 'success',
          message: `Biometric token for ${data.name} generated and saved securely to your browser.`
        });
        setName('');
        setSelectedFile(null);
        setPreview(null);
      } else {
        setEnrollResult({
          type: 'error',
          message: data.message || 'Enrollment failed.'
        });
      }
    } catch (err) {
      setEnrollResult({
        type: 'error',
        message: `Network/Server Error: ${err.message}`
      });
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleDeleteLocal = () => {
    localStorage.removeItem('prajna_identity');
    setLocalIdentity(null);
    setEnrollResult({
      type: 'success',
      message: 'Local biometric token completely deleted.'
    });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>LOCAL BIOMETRIC WALLET</h2>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Generate your biometric identity vectors and store them securely on your local device. The server holds zero data.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Enroll Section */}
        <div className="panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Key size={24} color="var(--accent)" />
            <h3 style={{ margin: 0 }}>Generate Token</h3>
          </div>

          <form onSubmit={handleEnroll}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                IDENTITY NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                required
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: 'rgba(0,0,0,0.5)',
                  border: '1px solid var(--border-color)',
                  color: 'white',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)'
                }}
              />
            </div>

            <div 
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                accept="image/*" 
                style={{ display: 'none' }} 
              />
              {preview ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                  <img src={preview} alt="Preview" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--accent)' }} />
                  <span style={{ color: 'var(--accent)', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>Replace Image</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-secondary)' }}>
                  <UploadCloud size={48} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.9rem' }}>Upload High Quality Face Photo</span>
                </div>
              )}
            </div>

            {enrollResult && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '4px', 
                background: enrollResult.type === 'success' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)',
                border: `1px solid ${enrollResult.type === 'success' ? 'var(--success)' : 'var(--danger)'}`,
                color: enrollResult.type === 'success' ? 'var(--success)' : 'var(--danger)',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.85rem'
              }}>
                {enrollResult.message}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isEnrolling || !selectedFile || !name.trim()}
              style={{ width: '100%', marginTop: '1.5rem', justifyContent: 'center', background: 'var(--accent)' }}
            >
              {isEnrolling ? <RefreshCw className="spin" size={18} /> : <UserPlus size={18} />}
              {isEnrolling ? 'GENERATING VECTORS...' : 'EXTRACT & STORE LOCALLY'}
            </button>
          </form>
        </div>

        {/* Local Wallet Section */}
        <div className="panel" style={{ borderLeftColor: 'var(--success)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Shield size={24} color="var(--success)" />
            <h3 style={{ margin: 0 }}>Device Wallet</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Your biometric token acts as your physical key. It is stored inside this browser. If you delete it, the server cannot verify you.
          </p>

          {localIdentity ? (
            <div style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--border-color)', padding: '1.5rem', borderRadius: '4px' }}>
              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1rem', fontSize: '1.5rem', borderBottom: '1px solid var(--border-highlight)', paddingBottom: '0.5rem' }}>
                {localIdentity.name}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-mono)' }}>
                <div><strong style={{color: 'var(--text-secondary)'}}>STAGE 1 VECTOR:</strong> {localIdentity.stage1 ? 'PRESENT (512d)' : 'MISSING'}</div>
                <div><strong style={{color: 'var(--text-secondary)'}}>STAGE 2 VECTOR:</strong> {localIdentity.stage2 ? 'PRESENT (512d)' : 'MISSING'}</div>
                <div><strong style={{color: 'var(--text-secondary)'}}>ENROLLED:</strong> {new Date(localIdentity.enrolledAt).toLocaleString()}</div>
              </div>

              <button 
                onClick={handleDeleteLocal}
                className="btn btn-secondary"
                style={{ width: '100%', justifyContent: 'center', color: 'var(--danger)', borderColor: 'var(--danger)' }}
              >
                <Trash2 size={18} /> DELETE TOKEN
              </button>
            </div>
          ) : (
            <div style={{ padding: '3rem 2rem', textAlign: 'center', border: '1px dashed var(--border-highlight)', color: 'var(--text-mono)', fontFamily: 'var(--font-mono)' }}>
              NO TOKEN STORED ON THIS DEVICE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Database;
