import React, { useState } from 'react';
import { Upload, Activity, ShieldCheck, ShieldAlert, FileSearch, ThumbsUp, ThumbsDown } from 'lucide-react';

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
      <div className="panel" style={{ marginTop: '2rem', borderTop: `4px solid ${colorClass}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ color: colorClass }}>
            {icon}
          </div>
          <div>
            <h2 style={{ fontSize: '2rem', margin: 0, color: colorClass, letterSpacing: '1px' }}>{result.decision}</h2>
            <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="mono-label" style={{ color: 'var(--text-secondary)' }}>MATCHED IDENTITY:</span>
              <span style={{ color: 'white', fontWeight: 600, fontFamily: 'var(--font-mono)', fontSize: '1.1rem', textTransform: 'uppercase' }}>
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
        
        <div className="grid grid-2">
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Routing Details</h4>
            <ul className="feature-list">
              <li><strong>Stages Run:</strong> {result.stages_run?.join(' -> ')}</li>
              <li><strong>Terminal Stage:</strong> {result.terminal_stage}</li>
              <li><strong>S1 Action:</strong> {result.routing_action_s1 || 'N/A'}</li>
              <li><strong>S1 Routing Score:</strong> {result.routing_score_s1?.toFixed(4) || 'N/A'}</li>
            </ul>
          </div>
          <div>
            <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Performance</h4>
            <ul className="feature-list">
              <li><strong>Compute Units:</strong> {result.compute_units?.toFixed(2)}</li>
              <li><strong>Latency:</strong> {result.total_latency_ms?.toFixed(1)} ms</li>
            </ul>
          </div>
        </div>

        {/* Feedback Section */}
        <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--glass-border)', textAlign: 'center' }}>
          {feedbackSent ? (
            <p style={{ color: 'var(--success)', fontWeight: 500 }}>Thank you for your feedback!</p>
          ) : (
            <>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>Was this verification result accurate?</p>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                <button className="btn btn-secondary" onClick={() => handleFeedback(true)} style={{ color: 'var(--success)' }}>
                  <ThumbsUp size={18} /> Correct
                </button>
                <button className="btn btn-secondary" onClick={() => handleFeedback(false)} style={{ color: 'var(--danger)' }}>
                  <ThumbsDown size={18} /> Incorrect
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Verify Identity</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Run hierarchical inference on a single face image.</p>
      </div>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h4 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Upload image to verify against local wallet:</h4>
        </div>

        <input 
          type="file" 
          id="file-upload" 
          style={{ display: 'none' }} 
          accept="image/*"
          onChange={handleFileSelect}
        />
        <label htmlFor="file-upload">
          <div className="upload-area">
            {preview ? (
              <img src={preview} alt="Preview" style={{ maxHeight: '300px', borderRadius: '8px', maxWidth: '100%' }} />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Upload size={48} color="var(--accent-1)" />
                <div>
                  <h3 style={{ marginBottom: '0.5rem' }}>Upload Face Image</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Click or drag and drop to upload</p>
                </div>
              </div>
            )}
          </div>
        </label>

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
