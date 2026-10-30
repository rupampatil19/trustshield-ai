"""
TrustShield AI - Deepfake scan endpoint.

Thin HTTP wrapper around TrushsheildAI's member3_video_pipeline.
The pipeline code is UNTOUCHED - this file only does:
    upload -> temp file -> analyze -> cleanup.

The mock detector used by the pipeline is honestly labeled in the
response as "is_mock": true. This route does NOT fabricate a verdict.
"""
import os
import tempfile

from fastapi import APIRouter, UploadFile, File, HTTPException

# sys.path was prepared in app/main.py so this resolves
from src.pipeline import analyze_video

router = APIRouter()

ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
MAX_BYTES = 100 * 1024 * 1024  # 100 MB


@router.post("/deepfake-scan")
async def deepfake_scan(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")

    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_VIDEO_EXT:
        raise HTTPException(
            status_code=400,
            detail="Unsupported video format '" + ext + "'. Allowed: " + str(sorted(ALLOWED_VIDEO_EXT)),
        )

    content = await file.read()
    if not content:
        raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > MAX_BYTES:
        raise HTTPException(status_code=413, detail="File exceeds 100 MB limit")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        result = analyze_video(tmp_path)
        result["_input_filename"] = file.filename
        result["_input_size_bytes"] = len(content)
        return result
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail="Pipeline error: " + type(exc).__name__ + ": " + str(exc),
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
