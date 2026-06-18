import React from 'react';
import { GitCommit, Activity, Cpu, Sun, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const Timeline = () => {
  const versions = [
    {
      version: 'v0.0',
      title: 'DAY / NIGHT CLASSIFICATION',
      icon: <Sun size={20} />,
      status: 'DEPRECATED',
      desc: 'The foundational prototype. A basic computer vision model focused purely on environmental state classification (Day vs. Night). Set the groundwork for our visual processing pipelines.',
      features: ['Basic CNN', 'Environmental Analysis', 'Prototype Build']
    },
    {
      version: 'v0.1',
      title: 'FACIAL RECOGNITION & EXPLANATIONS',
      icon: <ShieldCheck size={20} />,
      status: 'LEGACY',
      desc: 'Pivoted to biometric security. Introduced robust facial recognition with mathematical responsibility scoring and an LLM-based explanation layer to make AI decisions transparent to humans.',
      features: ['Face Embeddings', 'Mathematical Responsibility', 'LLM Explanations']
    },
    {
      version: 'v0.2',
      title: 'HIERARCHICAL INFERENCE',
      icon: <Cpu size={20} />,
      status: 'ACTIVE // CURRENT',
      desc: 'Complete architectural overhaul. Deployed a dual-stage pipeline (MobileFaceNet + InceptionResnetV1). Real-time dynamic compute allocation routes inference traffic based on mathematical certainty, achieving unprecedented latency-to-accuracy ratios.',
      features: ['Dual-Model Pipeline', 'Compute Scaling', 'Responsibility Routing']
    }
  ];

  return (
    <motion.div 
      style={{ maxWidth: '900px', margin: '0 auto', paddingTop: '2rem' }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '3.5rem', marginBottom: '1rem', color: 'var(--text-primary)', letterSpacing: '2px', textShadow: '0 0 20px rgba(255,255,255,0.1)' }}>SYSTEM EVOLUTION</h2>
        <p style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: '1rem' }}>
          Chronological record of Prajna framework architecture.
        </p>
      </div>

      <div style={{ position: 'relative' }}>
        {/* Vertical Line */}
        <div style={{ 
          position: 'absolute', 
          left: '24px', 
          top: '0', 
          bottom: '0', 
          width: '2px', 
          background: 'var(--border-color)',
          zIndex: 0
        }}></div>

        {versions.map((item, index) => {
          const isActive = item.version === 'v0.2';
          
          return (
            <motion.div 
              key={item.version} 
              style={{ 
                display: 'flex', 
                gap: '2rem', 
                marginBottom: index === versions.length - 1 ? '0' : '4rem',
                position: 'relative',
                zIndex: 1
              }}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, type: 'spring', stiffness: 200 }}
            >
              {/* Timeline Node */}
              <div style={{ 
                width: '50px', 
                height: '50px', 
                borderRadius: '0', 
                background: isActive ? 'var(--accent)' : 'var(--panel-bg)',
                border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border-highlight)'}`,
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: isActive ? 'var(--bg-color)' : 'var(--text-primary)',
                flexShrink: 0
              }}>
                {item.icon}
              </div>

              {/* Content Panel */}
              <div className="panel" style={{ 
                flex: 1, 
                borderColor: isActive ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                borderLeftWidth: isActive ? '4px' : '1px',
                background: isActive ? 'rgba(20,20,20,0.8)' : 'rgba(10,10,10,0.5)',
                backdropFilter: 'blur(10px)',
                boxShadow: isActive ? '0 10px 40px rgba(0,0,0,0.5)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <span className="mono-label" style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}>
                      RELEASE {item.version}
                    </span>
                    <h3 style={{ fontSize: '1.5rem', marginTop: '0.5rem', color: isActive ? 'var(--text-primary)' : '#aaa' }}>
                      {item.title}
                    </h3>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.75rem', 
                    background: isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.05)',
                    color: isActive ? 'var(--accent)' : 'var(--text-mono)',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.75rem',
                    border: `1px solid ${isActive ? 'var(--accent)' : 'transparent'}`
                  }}>
                    {item.status}
                  </span>
                </div>
                
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
                  {item.desc}
                </p>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {item.features.map(f => (
                    <span key={f} style={{
                      padding: '0.2rem 0.5rem',
                      background: 'var(--bg-color)',
                      border: '1px solid var(--border-highlight)',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.75rem',
                      color: 'var(--text-primary)'
                    }}>
                      <GitCommit size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom', color: 'var(--accent)' }}/>
                      {f}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default Timeline;
