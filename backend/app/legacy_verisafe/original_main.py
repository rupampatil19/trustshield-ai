from app.database import initialize_database, save_scan, get_scan, get_all_scans
from uuid import uuid4
from urllib.parse import urlparse

from fastapi import FastAPI, File, HTTPException, UploadFile
from pydantic import BaseModel, Field

app = FastAPI(
    title="TrustShield AI",
    description="Responsible media analysis, cyber safety, and digital trust.",
    version="0.2.0",
)
initialize_database()
MAX_FILE_SIZE = 50 * 1024 * 1024

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".avif",
    ".mp4", ".mov", ".avi", ".webm",
}

scans = {}


class URLScanRequest(BaseModel):
    url: str = Field(min_length=1, max_length=2048)


class MessageScanRequest(BaseModel):
    message: str = Field(min_length=1, max_length=10000)


@app.get("/")
def home():
    return {
        "message": "Welcome to TrustShield AI!",
        "status": "running",
    }


@app.get("/api/v1/health")
def health_check():
    return {
        "status": "healthy",
        "project": "TrustShield AI",
    }


@app.post("/api/v1/media/scans")
async def create_media_scan(file: UploadFile = File(...)):
    filename = (file.filename or "").strip()
    extension = (
        "." + filename.rsplit(".", 1)[-1].lower()
        if "." in filename else ""
    )

    if not filename or extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file extension.",
        )

    content = await file.read(MAX_FILE_SIZE + 1)

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty.",
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File exceeds the 50 MB upload limit.",
        )

    scan_id = str(uuid4())

    record = {
        "scan_id": scan_id,
        "module": "media",
        "filename": filename,
        "file_size_bytes": len(content),
        "status": "not_connected",
        "label": None,
        "message": "Upload received. Deepfake detection is not connected yet.",
        "limitations": [
            "No authenticity verdict has been produced.",
            "Extension validation does not verify file contents.",
        ],
    }

    scans[scan_id] = record
    save_scan(record)
    await file.close()
    return record


@app.get("/api/v1/media/scans/{scan_id}")
def get_media_scan(scan_id: str):
    record = get_scan(scan_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Scan record not found.",
        )

    return record


@app.post("/api/v1/cyber/url-scans")
def scan_url(request: URLScanRequest):
    submitted_url = request.url.strip()
    parsed = urlparse(submitted_url)

    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or any(char.isspace() for char in submitted_url)
        or parsed.username is not None
        or parsed.password is not None
    ):
        raise HTTPException(
            status_code=400,
            detail="Enter a valid HTTP or HTTPS URL without embedded credentials.",
        )

    indicators = []

    hostname = parsed.hostname.lower()

    if hostname.startswith("xn--") or ".xn--" in hostname:
        indicators.append("Internationalized domain name; inspect carefully.")

    if "@" in submitted_url:
        indicators.append("The URL contains an @ character.")

    if submitted_url.lower().startswith("http://"):
        indicators.append("The connection does not use HTTPS.")

    if len(submitted_url) > 150:
        indicators.append("The URL is unusually long.")

    if not indicators:
        indicators.append(
            "No basic URL indicators were found; this does not establish safety."
        )

    scan_id = str(uuid4())

    record = {
        "scan_id": scan_id,
        "module": "cyber_url",
        "submitted_url": submitted_url,
        "status": "heuristic_review",
        "label": "needs_review",
        "indicators": indicators,
        "message": (
            "Basic URL checks completed. No website was opened and "
            "no reputation database was queried."
        ),
        "limitations": [
            "These checks cannot confirm whether a URL is malicious or safe.",
            "A URL without obvious indicators may still be dangerous.",
        ],
    }

    scans[scan_id] = record
    return record


@app.post("/api/v1/cyber/message-scans")
def scan_message(request: MessageScanRequest):
    message = request.message.strip()

    if not message:
        raise HTTPException(
            status_code=400,
            detail="Enter a message to review.",
        )

    lower_message = message.lower()
    indicators = []

    urgency_phrases = [
        "act now",
        "urgent",
        "account suspended",
        "immediately",
        "within 24 hours",
    ]

    credential_phrases = [
        "share your otp",
        "send your otp",
        "password",
        "verify your bank account",
        "enter your pin",
    ]

    money_phrases = [
        "you have won",
        "claim your prize",
        "send money",
        "processing fee",
    ]

    if any(phrase in lower_message for phrase in urgency_phrases):
        indicators.append("Urgency or pressure language detected.")

    if any(phrase in lower_message for phrase in credential_phrases):
        indicators.append("Possible request for sensitive credentials.")

    if any(phrase in lower_message for phrase in money_phrases):
        indicators.append("Possible prize or payment lure.")

    if not indicators:
        indicators.append(
            "No configured warning phrases were found; this does not prove safety."
        )

    scan_id = str(uuid4())

    record = {
        "scan_id": scan_id,
        "module": "cyber_message",
        "status": "heuristic_review",
        "label": (
            "needs_review"
            if any("detected" in item or "Possible" in item for item in indicators)
            else "no_configured_indicators"
        ),
        "indicators": indicators,
        "message": (
            "Basic text checks completed. This is not a verified threat verdict."
        ),
        "limitations": [
            "Checks use a small list of warning phrases.",
            "Scams may use different wording or languages.",
            "A message without warning phrases may still be fraudulent.",
        ],
    }

    scans[scan_id] = record
    save_scan(record)
    return record


@app.get("/api/v1/scans/{scan_id}")
def get_any_scan(scan_id: str):
    record = get_scan(scan_id)

    if record is None:
        raise HTTPException(
            status_code=404,
            detail="Scan record not found.",
        )

    return record
@app.get("/api/v1/scans")
def list_scans():
    return get_all_scans()