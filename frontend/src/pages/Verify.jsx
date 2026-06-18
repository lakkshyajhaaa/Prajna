import React, { useState } from 'react';
import { Upload, Activity, ShieldCheck, ShieldAlert, FileSearch, ThumbsUp, ThumbsDown, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Verify = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [explanationMode, setExplanationMode] = useState('layman');

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setFeedbackSent(false);
    }
  };

  const handleVerify = async () => {
    if (!selectedFile) return;

    const storedIdentity = localStorage.getItem('prajna_identity');
    if (!storedIdentity) {
      alert("No biometric token found on this device. Please go to the Wallet page and generate one first.");
      return;
    }
    
    setIsVerifying(true);
    setFeedbackSent(false);
    
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('client_db', storedIdentity);
    
    try {
      const res = await fetch('/api/verify', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error('Verification failed', error);
      alert('Verification request failed. Ensure backend is running.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFeedback = async (isCorrect) => {
    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_correct: isCorrect,
          decision: result.decision,
          identity: result.identity
        }),
      });
      setFeedbackSent(true);
    } catch (error) {
      console.error('Failed to send feedback', error);
    }
  };

  const renderResult = () => {
    if (!result) return null;
    
    const isAccept = result.decision === 'ACCEPT';
    const isReview = result.decision === 'REVIEW';
    
    let icon, colorClass;
    if (isAccept) {
      icon = <ShieldCheck size={48} />;
      colorClass = 'var(--success)';
    } else if (isReview) {
      icon = <FileSearch size={48} />;
      colorClass = 'var(--warning)';
    } else {
      icon = <ShieldAlert size={48} />;
      colorClass = 'var(--danger)';
    }

    return (
      <motion.div 
        className="panel" 
        style={{ marginTop: '2rem', borderTop: `4px solid ${colorClass}`, background: 'rgba(20, 20, 20, 0.8)', padding: '3rem' }}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ color: colorClass, background: `rgba(${isAccept ? '0,255,0' : isReview ? '255,170,0' : '255,0,0'}, 0.1)`, padding: '1rem', borderRadius: '50%' }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize: '2.5rem', margin: 0, color: colorClass, letterSpacing: '2px', textShadow: `0 0 20px ${colorClass}` }}>{result.decision}</h2>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.4)', padding: '0.5rem 1rem', borderRadius: '4px', border: '1px solid rgba(255,255,255,0.1)' }}>
              <span className="mono-label" style={{ color: 'var(--text-secondary)' }}>MATCHED IDENTITY:</span>
              <span style={{ color: 'white', fontWeight: 700, fontFamily: 'var(--font-mono)', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                {result.identity}
              </span>
            </div>
          </div>
        </div>

        {/* AI Reasoning Section */}
        <div style={{ padding: '1.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', marginBottom: '2rem', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h4 style={{ margin: 0, color: 'var(--accent-3)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Activity size={18} /> AI Reasoning
            </h4>
            <div style={{ display: 'flex', background: 'rgba(0,0,0,0.4)', borderRadius: '8px', padding: '0.25rem' }}>
              <button 
                onClick={() => setExplanationMode('layman')}
                style={{ 
                  padding: '0.4rem 1rem', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: explanationMode === 'layman' ? 'var(--accent-1)' : 'transparent',
                  color: explanationMode === 'layman' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}>
                Layman
              </button>
              <button 
                onClick={() => setExplanationMode('technical')}
                style={{ 
                  padding: '0.4rem 1rem', 
                  borderRadius: '6px', 
                  border: 'none', 
                  background: explanationMode === 'technical' ? 'var(--accent-1)' : 'transparent',
                  color: explanationMode === 'technical' ? 'white' : 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  transition: 'all 0.2s'
                }}>
                Technical
              </button>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {explanationMode === 'technical' ? (
              <>
                {result.final_explanation && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <strong style={{ color: 'white' }}>Final Decision:</strong> {result.final_explanation}
                  </p>
                )}
                
                {result.routing_explanation_s1 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <strong style={{ color: 'white' }}>Stage 1 Routing:</strong> {result.routing_explanation_s1}
                  </p>
                )}

                {result.routing_explanation_s2 && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                    <strong style={{ color: 'white' }}>Stage 2 Routing:</strong> {result.routing_explanation_s2}
                  </p>
                )}

                {result.review_reasons && result.review_reasons.length > 0 && (
                  <div style={{ color: 'var(--warning)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    <strong style={{ color: 'white' }}>Review Flags:</strong>
                    <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                      {result.review_reasons.map((reason, idx) => (
                        <li key={idx}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {result.hard_rejected_at_gate && (
                  <p style={{ color: 'var(--danger)', fontSize: '0.95rem', marginTop: '0.5rem' }}>
                    <strong style={{ color: 'white' }}>Quality Gate:</strong> Image was too poor to process (rejected before inference).
                  </p>
                )}
              </>
            ) : (
              // Layman Explanation
              <div style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6' }}>
                {result.hard_rejected_at_gate ? (
                  <p>The image quality was too low to even begin scanning. Please upload a clearer, brighter photo where the face is fully visible.</p>
                ) : (
                  <>
                    <p style={{ marginBottom: '0.75rem' }}>
                      {result.decision === 'ACCEPT' && `The system confidently recognized this person as ${result.identity}. The facial features matched our database securely.`}
                      {result.decision === 'REVIEW' && `The system isn't entirely sure. While it looks somewhat like ${result.identity}, there is some doubt. A human needs to double-check this to be safe.`}
                      {result.decision === 'REJECT' && `The system determined this person is a stranger. Their face does not closely match anyone enrolled in our database.`}
                    </p>
                    <p>
                      {result.terminal_stage === 1 
                        ? "We were able to verify this instantly using our fast, lightweight scanner because the image was clear and the match was obvious."
                        : "We had to activate our heavy-duty, deep-scan neural network because the initial quick scan wasn't confident enough. This took slightly longer but ensured maximum accuracy."}
                    </p>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
        
        <div className="grid grid-2" style={{ gap: '1.5rem' }}>
          <motion.div 
            className="info-card" 
            style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18}/> Verification Steps</h4>
            <ul className="feature-list" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><strong style={{ color: 'var(--text-primary)' }}>Checks Performed:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{result.stages_run?.map(s => s === 1 ? 'Quick Scan' : 'Deep Scan').join(' -> ')}</span></li>
              <li style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><strong style={{ color: 'var(--text-primary)' }}>Final Check Used:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)' }}>{result.terminal_stage === 1 ? 'Quick Scan' : 'Deep Scan'}</span></li>
              <li style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><strong style={{ color: 'var(--text-primary)' }}>Quick Scan Result:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)' }}>{result.routing_action_s1 || 'N/A'}</span></li>
              <li style={{ padding: '0.75rem 0' }}><strong style={{ color: 'var(--text-primary)' }}>Initial Confidence:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)' }}>{result.routing_score_s1?.toFixed(4) || 'N/A'}</span></li>
            </ul>
          </motion.div>
          <motion.div 
            className="info-card" 
            style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h4 style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Activity size={18}/> System Speed</h4>
            <ul className="feature-list" style={{ listStyle: 'none', padding: 0 }}>
              <li style={{ padding: '0.75rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}><strong style={{ color: 'var(--text-primary)' }}>Processing Power Used:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)' }}>{result.compute_units?.toFixed(2)}</span></li>
              <li style={{ padding: '0.75rem 0' }}><strong style={{ color: 'var(--text-primary)' }}>Time Taken:</strong> <span style={{ float: 'right', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{result.total_latency_ms?.toFixed(1)} ms</span></li>
            </ul>
          </motion.div>
        </div>

        {/* Feedback Section */}
        {!feedbackSent ? (
          <motion.div 
            style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <span style={{ color: 'var(--text-secondary)' }}>Is this verification accurate?</span>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => handleFeedback(true)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}><ThumbsUp size={16}/> Correct</button>
              <button onClick={() => handleFeedback(false)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}><ThumbsDown size={16}/> Incorrect</button>
            </div>
          </motion.div>
        ) : (
          <div style={{ marginTop: '2.5rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)', color: 'var(--success)' }}>
            ✓ Feedback submitted for calibration.
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Verify Identity</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Run hierarchical inference on a single face image.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem', background: 'rgba(20, 20, 20, 0.6)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ flex: 1 }}>
          <div className="panel" style={{ height: '100%', background: 'transparent', padding: 0 }}>
            <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>Subject Photo</h4>
            
            <label 
              className="upload-area" 
              style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '1rem',
                border: preview ? '2px solid var(--accent)' : '2px dashed rgba(255,255,255,0.15)',
                background: preview ? 'rgba(255, 69, 0, 0.05)' : 'rgba(0,0,0,0.2)'
              }}
            >
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileSelect} 
                style={{ display: 'none' }}
              />
              
              {preview ? (
                <div style={{ position: 'relative', width: '100%', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                  <img src={preview} alt="Preview" style={{ width: '100%', height: 'auto', display: 'block' }} />
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, transparent 50%, rgba(0,0,0,0.8))' }} pointerEvents="none" />
                </div>
              ) : (
                <>
                  <Upload size={48} color="var(--text-secondary)" />
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>Click to upload or drag and drop</h3>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>JPEG, PNG, WEBP (Max 5MB)</p>
                  </div>
                </>
              )}
            </label>
          </div>
        </div>

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            className={`btn btn-primary ${!selectedFile || isVerifying ? 'btn-disabled' : ''}`}
            onClick={handleVerify}
            disabled={!selectedFile || isVerifying}
          >
            {isVerifying ? (
              <><Activity size={18} className="animate-pulse" /> Processing...</>
            ) : (
              <><ShieldCheck size={18} /> Verify Identity</>
            )}
          </button>
        </div>
      </div>

      {renderResult()}
    </div>
  );
};

export default Verify;
