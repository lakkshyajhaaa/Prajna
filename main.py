import os
import io
import json
import numpy as np
from PIL import Image
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
import uvicorn

# imports from core
from model_utils import load_models, extract_face_full
from core.stage1_model import load_stage1_model, extract_stage1_embedding
from core.quality import compute_composite_quality, is_enrollable
from core.hierarchy import hierarchical_inference
from core.routing import RHO_ACCEPT_DEFAULT, RHO_REJECT_DEFAULT, KAPPA_DEFAULT, LAMBDA_DEFAULT
from core.decision import STRANGER_FLOOR_DEFAULT

app = FastAPI(title="Prajna API - Decentralized")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global states
models_loaded = False
mtcnn = None
resnet = None
stage1_state = None

@app.on_event("startup")
async def startup_event():
    global models_loaded, mtcnn, resnet, stage1_state
    mtcnn, resnet = load_models()
    stage1_state = load_stage1_model()
    # Server-side databases are NO LONGER LOADED
    models_loaded = True

@app.get("/api/status")
async def get_status():
    return {
        "status": "ok",
        "models_loaded": models_loaded,
        "mode": "decentralized_wallet",
        "stage1_db_size": 0,
        "stage2_db_size": 0
    }

@app.get("/api/identities")
async def get_identities():
    # We no longer store identities on the server
    return {"identities": []}

@app.post("/api/verify")
async def verify(file: UploadFile = File(...), client_db: str = Form(None)):
    contents = await file.read()
    try:
        image = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        return {"decision": "ERROR", "identity": "Unknown", "is_stranger": True, "hard_rejected_at_gate": True, "review_reasons": [f"Image load error: {str(e)}"]}
    
    
    db_s1 = {}
    db_s2 = {}
    
    if client_db:
        try:
            data = json.loads(client_db)
            name = data.get("name", "Local User")
            s1 = data.get("stage1")
            s2 = data.get("stage2")
            if s1:
                db_s1[name] = np.array(s1).reshape(1, -1)
            if s2:
                db_s2[name] = np.array(s2).reshape(1, -1)
        except Exception as e:
            print("Failed to parse client_db:", e)
    
    pr = hierarchical_inference(
        image=image,
        mtcnn_model=mtcnn,
        resnet_model=resnet,
        db_stage1=db_s1,
        db_stage2=db_s2,
        stage1_model_state=stage1_state,
        stranger_floor_s1=0.50,
        stranger_floor_s2=STRANGER_FLOOR_DEFAULT,
        rho_accept=RHO_ACCEPT_DEFAULT,
        rho_reject=RHO_REJECT_DEFAULT,
        kappa=KAPPA_DEFAULT,
        lambda_=LAMBDA_DEFAULT,
    )
    
    dr = pr.final_decision
    
    return {
        "decision": dr.decision,
        "identity": dr.predicted_identity,
        "is_stranger": dr.is_stranger,
        "hard_rejected_at_gate": pr.hard_rejected_at_gate,
        "review_reasons": dr.review_reasons,
        "stages_run": pr.stages_run,
        "terminal_stage": pr.terminal_stage,
        "compute_units": pr.compute_units,
        "total_latency_ms": pr.total_latency_ms,
        "routing_score_s1": pr.stage1.routing.routing_score if pr.stage1 and pr.stage1.routing else None,
        "routing_action_s1": pr.stage1.routing.action if pr.stage1 and pr.stage1.routing else None,
        "routing_explanation_s1": pr.routing_explanation_s1,
        "routing_explanation_s2": pr.routing_explanation_s2,
        "final_explanation": dr.threshold_explanation,
    }

from pydantic import BaseModel
class Feedback(BaseModel):
    is_correct: bool
    decision: str
    identity: str

@app.post("/api/feedback")
async def feedback(data: Feedback):
    print(f"Feedback received: Correct={data.is_correct}, Decision={data.decision}, Identity={data.identity}")
    return {"status": "recorded"}

@app.post("/api/enroll")
async def enroll(name: str = Form(...), files: list[UploadFile] = File(...)):
    contents = await files[0].read()
    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception as e:
        return {"success": False, "message": f"Invalid image format. Please upload a standard image file (JPEG, PNG). Error: {str(e)}"}
    
    try:
        result = extract_face_full(img, mtcnn, resnet)
    except Exception as e:
        return {"success": False, "message": f"Server processing error: {str(e)}"}
    if result is None:
        return {"success": False, "message": "No face detected in the image."}
        
    qc = compute_composite_quality(result["face_crop"], np.array(img), result["prob"], result["landmarks"])
    valid, reason = is_enrollable(qc)
    if not valid:
        return {"success": False, "message": f"Quality check failed: {', '.join(reason)}"}
        
    s1_emb = extract_stage1_embedding(result["face_crop"], stage1_state)
    s2_emb = result["embedding"]
    
    return {
        "success": True,
        "name": name,
        "stage1": s1_emb.flatten().tolist(),
        "stage2": s2_emb.flatten().tolist(),
        "message": "Enrolled successfully. Save these vectors securely."
    }

# Ensure the dist folder exists, otherwise StaticFiles will crash on startup
os.makedirs("frontend/dist", exist_ok=True)
os.makedirs("frontend/dist/assets", exist_ok=True)

app.mount("/assets", StaticFiles(directory="frontend/dist/assets"), name="assets")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    dist_dir = "frontend/dist"
    requested_path = os.path.join(dist_dir, full_path)
    if os.path.isfile(requested_path):
        return FileResponse(requested_path)
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"error": "Frontend not built yet. Run npm run build in the frontend directory."}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
