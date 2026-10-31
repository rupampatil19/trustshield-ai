"""
TrustShield AI â€” Member 3 â€” Deepfake Video Pipeline
src/config.py

Central configuration for the entire pipeline.
All limits are defined here â€” never hardcoded in individual modules.
"""

from dataclasses import dataclass, field


@dataclass
class PipelineConfig:
    """
    Central configuration for the deepfake video pipeline.

    All values are configurable. The defaults are reasonable hackathon-ready values.
    Do NOT scatter these values throughout the codebase â€” import this config instead.
    """

    # â”€â”€â”€ File limits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MAX_FILE_SIZE_MB: float = 500.0
    """Maximum allowed video file size in megabytes."""

    # â”€â”€â”€ Duration & frame limits â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MAX_DURATION_SECONDS: float = 300.0
    """Maximum allowed video duration in seconds (5 minutes)."""

    MAX_FRAMES: int = 300
    """Hard cap on the number of frames the pipeline will sample and analyze."""

    SAMPLING_INTERVAL_SECONDS: float = 1.0
    """Sample approximately one frame every N seconds."""

    # â”€â”€â”€ Detection threshold â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    DETECTION_THRESHOLD: float = 0.25
    """
    Score threshold above which a frame is considered high-scoring.
    This does NOT automatically mean the video is fake â€” see responsible AI notes.
    """

    # â”€â”€â”€ Evidence â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    TOP_K_EVIDENCE: int = 5
    """Number of top high-scoring frames to include in evidence output."""

    # â”€â”€â”€ Face processing â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    MIN_FACE_SIZE: int = 30
    """Minimum face dimension (pixels). Smaller faces are rejected as unscorable."""

    FACE_SCALE_FACTOR: float = 1.1
    """Haar cascade scale factor for face detection."""

    FACE_MIN_NEIGHBORS: int = 5
    """Haar cascade min-neighbors parameter for face detection."""

    # â”€â”€â”€ Supported video formats (magic-byte validated) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    SUPPORTED_EXTENSIONS: tuple = (".mp4", ".avi", ".mov", ".mkv", ".webm")
    """
    Allowed file extensions. Used as a first-pass filter only.
    Actual format is verified by attempting to open with OpenCV.
    """

    # â”€â”€â”€ Score semantics label â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    SCORE_TYPE: str = "model_score"
    """
    Label used to describe the individual frame score.
    Use 'model_score' â€” NOT 'probability'. A raw model output is not a calibrated probability.
    """

    AGGREGATE_SCORE_TYPE: str = "aggregate_model_score"
    """Label for the video-level aggregated score."""


# Default configuration instance â€” import this in all modules
DEFAULT_CONFIG = PipelineConfig()
