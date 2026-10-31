import hashlib
import uuid
import io
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException
from PIL import Image
from PIL.ExifTags import TAGS
from app.auth import get_current_user
from app.database import save_scan

try:
    from c2pa import Reader
    C2PA_AVAILABLE = True
except ImportError:
    C2PA_AVAILABLE = False

router = APIRouter()

def extract_metadata(file_bytes: bytes):
    try:
        image = Image.open(io.BytesIO(file_bytes))
        exif_data = image.getexif()
        metadata = {}
        if exif_data:
            for tag_id, value in exif_data.items():
                tag = TAGS.get(tag_id, tag_id)
                metadata[str(tag)] = str(value)
        return {
            "format": image.format,
            "size": image.size,
            "mode": image.mode,
            "exif": metadata
        }
    except Exception:
        return {"error": "Could not extract metadata. File may not be a valid image."}

def check_c2pa(file_bytes: bytes):
    if not C2PA_AVAILABLE:
        return {"status": "unsupported", "message": "C2PA library not installed."}
    
    try:
        stream = io.BytesIO(file_bytes)
        reader = Reader(stream)
        
        # Use get_active_manifest() to avoid version mismatch errors
        try:
            manifest = reader.get_active_manifest()
        except AttributeError:
            # Fallback for older library versions
            manifest = reader.get_manifest()
            
        if manifest:
            return {"status": "valid_credential", "manifest": str(manifest)}
        else:
            return {"status": "not_found", "message": "No C2PA Content Credentials found."}
            
    except Exception as e:
        err_msg = str(e)
        # Treat manifest-not-found and argument errors as "Not Found"
        if "ManifestNotFound" in err_msg or "no JUMBF data found" in err_msg or "missing 1 required positional argument" in err_msg:
            return {"status": "not_found", "message": "No C2PA Content Credentials found."}
        return {"status": "invalid_credential", "message": f"C2PA validation failed: {err_msg}"}

@router.post("/verify")
async def verify_trust(file: UploadFile = File(...), user: dict = Depends(get_current_user)):
    content = await file.read()
    
    # 1. Compute SHA-256
    sha256_hash = hashlib.sha256(content).hexdigest()
    
    # 2. Extract Metadata
    metadata = extract_metadata(content)
    
    # 3. Check C2PA (Provenance)
    c2pa_status = check_c2pa(content)
    
    result = {
        "scan_id": str(uuid.uuid4()),
        "module": "Trust Check",
        "status": "completed",
        "filename": file.filename,
        "sha256": sha256_hash,
        "metadata": metadata,
        "c2pa": c2pa_status,
        "limitations": [
            "A hash confirms integrity, not authenticity.",
            "Missing C2PA credentials do not mean the file is fake.",
            "Metadata can be altered or stripped."
        ]
    }
    
    # 4. Save to Database
    save_scan(result, int(user["sub"]))
    
    return result