import React, { useState, useRef, useEffect } from 'react';
import { Database as DbIcon, UserPlus, UploadCloud, RefreshCw, Trash2, Key, Shield, Fingerprint } from 'lucide-react';
import { motion } from 'framer-motion';

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
    <motion.div 
      style={{ maxWidth: '1000px', margin: '0 auto' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem', color: 'var(--text-primary)', letterSpacing: '1px' }}>MANAGE PROFILES</h2>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)' }}>
          Generate your biometric identity vectors and store them securely on your local device. The server holds zero data.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: '2rem', background: 'transparent', border: 'none' }}>
        {/* Enroll Section */}
        <motion.div 
          className="panel"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1, type: 'spring' }}
          style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '12px' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <Key size={24} color="var(--accent)" />
            <h3 style={{ margin: 0, letterSpacing: '1px' }}>Generate Token</h3>
          </div>

          <form onSubmit={handleEnroll}>
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', marginBottom: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
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
                  padding: '1rem',
                  background: 'rgba(0,0,0,0.4)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  borderRadius: '8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
              />
            </div>

            <div 
              className="upload-area"
              onClick={() => fileInputRef.current?.click()}
              style={{
                borderRadius: '8px',
                border: preview ? '2px solid var(--accent)' : '2px dashed rgba(255,255,255,0.15)',
                background: preview ? 'rgba(255,69,0,0.05)' : 'rgba(0,0,0,0.3)',
                transition: 'all 0.3s ease'
              }}
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
        </motion.div>

        {/* Local Wallet Section */}
        <motion.div 
          className="panel" 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, type: 'spring' }}
          style={{ background: 'rgba(15, 15, 15, 0.6)', backdropFilter: 'blur(20px)', borderRadius: '12px', borderLeft: '4px solid var(--success)' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
            <Shield size={24} color="var(--success)" />
            <h3 style={{ margin: 0, letterSpacing: '1px' }}>Device Wallet</h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.9rem', lineHeight: '1.6' }}>
            Your biometric token acts as your physical key. It is stored securely inside this browser's local storage. If you delete it, the server cannot verify you.
          </p>

          {localIdentity ? (
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              style={{ 
                background: 'linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.01))', 
                border: '1px solid rgba(255,255,255,0.1)', 
                padding: '2rem', 
                borderRadius: '16px',
                boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* ID Card styling effects */}
              <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '150px', height: '150px', background: 'var(--success)', opacity: 0.1, filter: 'blur(50px)', borderRadius: '50%' }}></div>
              <Fingerprint size={120} color="var(--success)" style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.05 }} />

              <h4 style={{ color: 'var(--text-primary)', marginBottom: '1.5rem', fontSize: '1.8rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></span>
                {localIdentity.name}
              </h4>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{color: 'var(--text-secondary)'}}>QUICK SCAN VECTOR</span> 
                  <span style={{ color: localIdentity.stage1 ? 'var(--success)' : 'var(--danger)' }}>{localIdentity.stage1 ? 'READY' : 'MISSING'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                  <span style={{color: 'var(--text-secondary)'}}>DEEP SCAN VECTOR</span> 
                  <span style={{ color: localIdentity.stage2 ? 'var(--success)' : 'var(--danger)' }}>{localIdentity.stage2 ? 'READY' : 'MISSING'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{color: 'var(--text-secondary)'}}>ENROLLED</span> 
                  <span style={{ color: 'white' }}>{new Date(localIdentity.enrolledAt).toLocaleDateString()}</span>
                </div>
              </div>

              <button 
                onClick={handleDeleteLocal}
                className="btn"
                style={{ width: '100%', justifyContent: 'center', color: '#ff4444', border: '1px solid rgba(255,0,0,0.3)', background: 'rgba(255,0,0,0.05)' }}
                onMouseEnter={(e) => { e.target.style.background = 'rgba(255,0,0,0.15)'; e.target.style.borderColor = 'rgba(255,0,0,0.5)'; }}
                onMouseLeave={(e) => { e.target.style.background = 'rgba(255,0,0,0.05)'; e.target.style.borderColor = 'rgba(255,0,0,0.3)'; }}
              >
                <Trash2 size={18} /> DELETE TOKEN
              </button>
            </motion.div>
          ) : (
            <div style={{ padding: '4rem 2rem', textAlign: 'center', border: '2px dashed rgba(255,255,255,0.1)', borderRadius: '12px', color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.2)' }}>
              NO TOKENS FOUND<br/>
              <span style={{ fontSize: '0.8rem', marginTop: '0.5rem', display: 'block', opacity: 0.5 }}>Generate one using the form</span>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Database;
