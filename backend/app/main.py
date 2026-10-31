import sys
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

BASE = Path(__file__).resolve().parent
_DEEPFAKE_ROOT = BASE / "services" / "deepfake"
if str(_DEEPFAKE_ROOT) not in sys.path:
    sys.path.insert(0, str(_DEEPFAKE_ROOT))

from app.legacy_verisafe.original_main import app as verisafe_app
from app.api.router import api_router
from app.routes_deepfake import router as deepfake_router
from app.routes_auth import router as auth_router

app = FastAPI(title="TrustShield AI", version="1.0.0-merged")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/v1/health")
def health():
    return {"status": "healthy"}

app.include_router(auth_router, prefix="/api/v1/auth", tags=["Auth"])
app.include_router(api_router, prefix="/api/v1")
app.include_router(deepfake_router, prefix="/api/v1/media", tags=["Deepfake"])
app.mount("/api/legacy", verisafe_app)