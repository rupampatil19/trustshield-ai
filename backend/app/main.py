"""
TrustShield AI - Unified Backend Entry Point

Merged from three repositories. Original code is UNCHANGED:
  - VeriSafe          -> app/database.py + app/legacy_verisafe/original_main.py
  - Cyber-Resilience  -> app/api/* + app/services/* + app/schemas/* + app/core/*
  - TrushsheildAI     -> app/services/deepfake/src/*

This file is the only new "app": it mounts routers and sets sys.path
so the deepfake pipeline's "from src.X" imports resolve. No business
logic lives here.
"""
import sys
from pathlib import Path

# ---- Make TrushsheildAI's "from src.X import ..." work ----
BASE = Path(__file__).resolve().parent
_DEEPFAKE_ROOT = BASE / "services" / "deepfake"
if str(_DEEPFAKE_ROOT) not in sys.path:
    sys.path.insert(0, str(_DEEPFAKE_ROOT))

# ---- Imports (importing VeriSafe's app triggers initialize_database()) ----
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.legacy_verisafe.original_main import app as verisafe_app
from app.api.router import api_router
from app.routes_deepfake import router as deepfake_router

# ---- Main app ----
app = FastAPI(
    title="TrustShield AI - Merged Backend",
    version="1.0.0-merged",
    description="Unified Digital Trust and Cyber-Resilience platform",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "message": "TrustShield AI - merged backend",
        "status": "running",
        "version": "1.0.0-merged",
        "endpoints": {
            "health": "/api/v1/health",
            "cyber_url": "POST /api/v1/cyber/url-scans",
            "cyber_message": "POST /api/v1/cyber/message-scans",
            "deepfake": "POST /api/v1/media/deepfake-scan",
            "verisafe_legacy": "/api/legacy/*",
            "docs": "/docs",
        },
    }


@app.get("/api/v1/health")
def health():
    return {
        "status": "healthy",
        "project": "TrustShield AI",
        "version": "1.0.0-merged",
        "components": ["verisafe_db", "cyber_resilience", "deepfake_pipeline"],
    }


# ---- Mount all three modules ----
# Cyber-Resilience: /api/v1/cyber/url-scans, /message-scans, etc.
app.include_router(api_router, prefix="/api/v1")

# Deepfake: /api/v1/media/deepfake-scan
app.include_router(deepfake_router, prefix="/api/v1/media", tags=["Deepfake"])

# VeriSafe: mounted as sub-app under /api/legacy/*
app.mount("/api/legacy", verisafe_app)
