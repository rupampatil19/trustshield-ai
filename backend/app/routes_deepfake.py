import os
import uuid
import tempfile
import cv2
import numpy as np
from PIL import Image

from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.database import save_scan
from app.auth import get_current_user

from src.pipeline import analyze_video, _determine_label
from src.detector.real_detector import RealDetector
from src.face.face_processor import get_default_face_processor
from src.config import DEFAULT_CONFIG
from src.analysis.aggregator import aggregate_frame_results
from src.analysis.evidence import generate_evidence
from src.schemas.result_schema import (
    VideoAnalysisResult, VideoMetadata, FrameResult,
    FRAME_STATUS_SCORED, FRAME_STATUS_UNSCORABLE, LIMITATIONS, LABEL_INCONCLUSIVE
)

router = APIRouter()
ALLOWED_VIDEO_EXT = {".mp4", ".mov", ".avi", ".mkv", ".webm"}
ALLOWED_IMAGE_EXT = {".jpg", ".jpeg", ".png", ".webp", ".bmp"}
MAX_BYTES = 100 * 1024 * 1024

@router.post("/deepfake-scan")
async def deepfake_scan(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    if not file.filename: raise HTTPException(status_code=400, detail="No file uploaded")
    ext = os.path.splitext(file.filename)[1].lower()
    is_video = ext in ALLOWED_VIDEO_EXT
    is_image = ext in ALLOWED_IMAGE_EXT
    
    if not (is_video or is_image): 
        raise HTTPException(status_code=400, detail="Unsupported format")

    content = await file.read()
    if not content: raise HTTPException(status_code=400, detail="Empty file")
    if len(content) > MAX_BYTES: raise HTTPException(status_code=413, detail="File exceeds 100 MB")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(suffix=ext, delete=False) as tmp:
            tmp.write(content)
            tmp_path = tmp.name

        if is_video:
            result = analyze_video(tmp_path)
        else:
            # Use Pillow to safely open and convert the image to a standard RGB array
            try:
                pil_img = Image.open(tmp_path).convert('RGB')
                img = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Could not read image: {str(e)}")
                
            height, width = img.shape[:2]
            detector = RealDetector()
            face_processor = get_default_face_processor(DEFAULT_CONFIG)
            
            if hasattr(face_processor, 'extract_face_and_bbox'):
                face, bbox = face_processor.extract_face_and_bbox(img)
            else:
                face = face_processor.extract_face(img)
                bbox = None
                
            metadata = VideoMetadata(width=width, height=height, fps=0, frame_count=1, duration_seconds=0, codec="IMAGE", container=ext.lstrip(".").upper())

            if face is None:
                frame_res = FrameResult(
                    frame_index=0, timestamp_seconds=0, status=FRAME_STATUS_UNSCORABLE, 
                    unscorable_reason="no_face_detected", model_name=detector.model_name, 
                    model_version=detector.model_version, is_mock=detector.is_mock
                )
                agg = aggregate_frame_results([frame_res], DEFAULT_CONFIG)
                evidence = generate_evidence(agg, DEFAULT_CONFIG)
                res_obj = VideoAnalysisResult(
                    status="completed", label=LABEL_INCONCLUSIVE, score=None, video=metadata, 
                    frames_analyzed=0, frames_unscorable=1, aggregation=agg, evidence=evidence, 
                    model_name=detector.model_name, model_version=detector.model_version, 
                    is_mock=detector.is_mock, limitations=["No face detected in image."] + LIMITATIONS
                )
            else:
                det_out = detector.analyze(face, full_image=img, bbox=bbox)
                frame_res = FrameResult(
                    frame_index=0, timestamp_seconds=0, status=FRAME_STATUS_SCORED, 
                    model_score=det_out.model_score, score_type=det_out.score_type, 
                    model_name=detector.model_name, model_version=detector.model_version, 
                    is_mock=detector.is_mock, heatmap_b64=det_out.heatmap_b64,
                    forensic_findings=det_out.forensic_findings
                )
                agg = aggregate_frame_results([frame_res], DEFAULT_CONFIG)
                evidence = generate_evidence(agg, DEFAULT_CONFIG)
                label = _determine_label(agg.mean_score, agg.high_score_ratio, DEFAULT_CONFIG)
                res_obj = VideoAnalysisResult(
                    status="completed", label=label, score=agg.mean_score, video=metadata, 
                    frames_analyzed=1, frames_unscorable=0, aggregation=agg, evidence=evidence, 
                    model_name=detector.model_name, model_version=detector.model_version, 
                    is_mock=detector.is_mock, limitations=LIMITATIONS
                )
            result = res_obj.to_dict()

        result["_input_filename"] = file.filename
        result["_input_size_bytes"] = len(content)
        
        # SAFE DB SAVE
        result["scan_id"] = str(uuid.uuid4())
        result["module"] = "Deepfake Media"
        try:
            save_scan(result, int(user["sub"]))
        except Exception as db_err:
            print(f"Database save failed: {db_err}")

        return result
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Pipeline error: " + str(exc))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try: os.unlink(tmp_path)
            except OSError: pass