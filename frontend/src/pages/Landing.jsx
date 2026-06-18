import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Fingerprint, Terminal, Crosshair, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';
import Timeline from './Timeline';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const Landing = () => {
  return (
    <motion.div 
      className="hero-container"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div className="hero-pill" variants={itemVariants}>
        <span className="status-indicator status-green"></span> SYSTEM ONLINE // PRAJNA v0.2
      </motion.div>
      
      <motion.h1 className="hero-title" variants={itemVariants}>
        IDENTITY<br/>
        VERIFICATION<br/>
        FRAMEWORK
      </motion.h1>
      
      <motion.p className="hero-subtitle" variants={itemVariants}>
        A responsibility-guided hierarchical inference engine. We allocate compute dynamically based on image ambiguity, ensuring zero compromise on latency and maximum security against unauthorized access.
      </motion.p>
      
      <motion.div className="btn-group" variants={itemVariants}>
        <Link to="/verify" className="btn btn-primary">
          INITIATE VERIFY <ArrowRight size={18} />
        </Link>
        <Link to="/database" className="btn btn-secondary">
          ACCESS VAULT <Fingerprint size={18} />
        </Link>
      </motion.div>
      
      <motion.div className="grid-3" style={{ width: '100%', marginTop: '2rem' }} variants={itemVariants}>
        <div>
          <Crosshair size={24} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>ADAPTIVE ROUTING</h3>
          <p className="mono-label" style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
            Bypasses heavy neural networks when confidence is absolute. Analyzes ambiguity and margin in real-time.
          </p>
        </div>
        
        <div>
          <Terminal size={24} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>RESPONSIBILITY SCORES</h3>
          <p className="mono-label" style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
            Mathematical certainty. Every decision is scored, audited, and mathematically bound before authorization.
          </p>
        </div>
        
        <div>
          <Cpu size={24} color="var(--accent)" style={{ marginBottom: '1.5rem' }} />
          <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>DUAL ARCHITECTURE</h3>
          <p className="mono-label" style={{ color: 'var(--text-secondary)', textTransform: 'none' }}>
            MobileFaceNet for extreme speed. InceptionResnetV1 for complex escalations. The perfect synergy.
          </p>
        </div>
      </motion.div>
      
      <div style={{ marginTop: '6rem', width: '100%', borderTop: '1px solid var(--border-color)', paddingTop: '2rem' }}>
        <Timeline />
      </div>
    </motion.div>
  );
};

export default Landing;
