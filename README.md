---
title: Prajna
emoji: 🦀
colorFrom: indigo
colorTo: blue
sdk: docker
pinned: false
---

# Prajna Framework (प्रज्ञा) 0.2
## Zero-Knowledge, Hierarchical Biometric Inference

> *"AI should not only make predictions. It should decide whether its predictions deserve to be trusted — and how much intelligence to spend before deciding, all while rigorously protecting user privacy."*

---

## 🚀 The Zero-Knowledge Evolution

Prajna 0.2 has been completely re-architected into a **Stateless, Zero-Knowledge System** backed by a modern, ultra-premium React frontend. 

The server **no longer stores your face, your identity, or your biometric vectors.** Instead, we have introduced the **Biometric Device Wallet**. When you enroll, your facial vectors are extracted mathematically, returned to your browser, and securely stored in your local `localStorage`. 

Every time you verify your identity, your browser temporarily transmits your biometric token alongside your photo. The server calculates the similarities, makes a routing decision, and immediately destroys all data from its memory.

### Key Upgrades
- **React + FastAPI Stack**: A blistering fast, glassmorphic UI built on Vite and React.
- **Biometric Device Wallet**: Complete data sovereignty. You own your tokens.
- **Dynamic Routing Explanations**: Beautiful, real-time AI reasoning logs that tell you exactly *why* a decision was made, with explicit matched identity tracking.
- **Legal Safeguards**: Integrated experimental disclaimers, terms of service, and privacy policies.

---

## 🧠 Two-Stage Hierarchical Inference

Prajna 0.2 extends the adaptive uncertainty-awareness of previous versions with a **two-stage hierarchical inference pipeline** driven by a routing score. 

The key question the system answers at every query:
> *"Is Stage-1's confidence sufficient to decide, or should I spend Stage-2 compute?"*

### Architecture Flow

1. **The Quality Gate**: The system first evaluates the composite quality (Q) of the image. If `Q < 0.20`, it executes a hard reject before wasting compute.
2. **Stage 1 (MobileFaceNet)**: An ultra-lightweight, blazing-fast neural network generates an initial embedding and calculates a **Routing Score (ρ)**.
3. **The Routing Engine**:
   - If `ρ ≥ ρ_accept`, the system terminates immediately with an **ACCEPT**.
   - If `ρ ≤ ρ_reject`, the system terminates immediately with a **REJECT**.
   - If `ρ` falls in the *escalation band*, the system forwards the task to Stage 2.
4. **Stage 2 (InceptionResnetV1)**: A heavy-duty, deep-scan neural network computes a highly detailed 512-dimensional embedding to resolve ambiguity, resulting in a final **ACCEPT, REVIEW, or REJECT**.

### The Routing Formula

```
ρ = R · φ(Q) · ψ(A)

where:
  R      = responsibility score (cosine similarity weighted by margin + certainty)
  φ(Q)   = Q^κ    (quality attenuation, default κ=0.50)
  ψ(A)   = 1−λ·A  (ambiguity attenuation, default λ=0.30)
  Q      = composite image quality score ∈ [0,1]
  A      = top-2/top-1 similarity ratio (identity ambiguity) ∈ [0,1]
```

---

## 🛠 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.9+)

### Installation & Running

The easiest way to boot the entire stack (both the React frontend and the FastAPI backend) is to run the automated startup script:

**Windows:**
```bat
./build_and_run.bat
```

This will automatically:
1. Install Python dependencies (`pip install -r requirements.txt`)
2. Install Node dependencies (`cd frontend && npm install`)
3. Build the Vite production bundle (`npm run build`)
4. Launch the FastAPI Uvicorn server (`uvicorn main:app --host 0.0.0.0 --port 8000`)

Once the server boots, simply open your browser and navigate to:
**`http://localhost:8000/`**

---

## 🛡 Security & Privacy Notice

This software is an experimental release. While the zero-knowledge architecture ensures that the server does not persist biometric templates to disk, data is still transmitted over HTTP/HTTPS during the active verification session. Do not use this framework in production without proper security audits, TLS encryption, and legal compliance reviews.
