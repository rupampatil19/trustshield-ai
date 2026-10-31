from __future__ import annotations

import dataclasses
from dataclasses import dataclass, field
from typing import Any, Optional

@dataclass
class VideoMetadata:
    width: int
    height: int
    fps: float
    frame_count: int
    duration_seconds: float
    codec: str
    container: str
    def to_dict(self) -> dict:
        d = dataclasses.asdict(self)
        return d

@dataclass
class SampledFrame:
    frame_index: int
    timestamp_seconds: float
    image: Any
    def to_dict(self) -> dict:
        return {"frame_index": self.frame_index, "timestamp_seconds": round(self.timestamp_seconds, 3)}

@dataclass
class DetectorOutput:
    model_score: float
    model_name: str
    model_version: str
    score_type: str
    is_mock: bool = True
    heatmap_b64: Optional[str] = None
    forensic_findings: list[str] = field(default_factory=list)
    def to_dict(self) -> dict:
        d = dataclasses.asdict(self)
        return d

FRAME_STATUS_SCORED = "scored"
FRAME_STATUS_UNSCORABLE = "unscorable"
FRAME_STATUS_FAILED = "failed"

@dataclass
class FrameResult:
    frame_index: int
    timestamp_seconds: float
    status: str
    model_score: Optional[float] = None
    score_type: Optional[str] = None
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    is_mock: bool = True
    unscorable_reason: Optional[str] = None
    error: Optional[str] = None
    heatmap_b64: Optional[str] = None
    forensic_findings: list[str] = field(default_factory=list)
    def to_dict(self) -> dict:
        return {
            "frame_index": self.frame_index,
            "timestamp_seconds": round(self.timestamp_seconds, 3),
            "status": self.status,
            "model_score": round(self.model_score, 4) if self.model_score is not None else None,
            "score_type": self.score_type,
            "model_name": self.model_name,
            "model_version": self.model_version,
            "is_mock": self.is_mock,
            "unscorable_reason": self.unscorable_reason,
            "error": self.error,
            "heatmap_b64": self.heatmap_b64,
        }

@dataclass
class AggregationResult:
    mean_score: Optional[float]
    max_score: Optional[float]
    scored_frames: int
    unscorable_frames: int
    failed_frames: int
    frames_above_threshold: int
    high_score_ratio: Optional[float]
    highest_score_timestamp: Optional[float]
    top_frames: list[FrameResult] = field(default_factory=list)
    def to_dict(self) -> dict:
        return {
            "mean_score": round(self.mean_score, 4) if self.mean_score is not None else None,
            "max_score": round(self.max_score, 4) if self.max_score is not None else None,
            "scored_frames": self.scored_frames,
            "unscorable_frames": self.unscorable_frames,
            "failed_frames": self.failed_frames,
            "frames_above_threshold": self.frames_above_threshold,
            "high_score_ratio": round(self.high_score_ratio, 4) if self.high_score_ratio is not None else None,
            "highest_score_timestamp": self.highest_score_timestamp,
            "top_frames": [f.to_dict() for f in self.top_frames],
        }

@dataclass
class EvidenceResult:
    primary_evidence: Optional[FrameResult]
    top_frames: list[FrameResult]
    frames_above_threshold: int
    high_score_ratio: Optional[float]
    unscorable_frames: int
    def to_dict(self) -> dict:
        return {
            "primary_evidence": self.primary_evidence.to_dict() if self.primary_evidence else None,
            "top_frames": [f.to_dict() for f in self.top_frames],
            "frames_above_threshold": self.frames_above_threshold,
            "high_score_ratio": round(self.high_score_ratio, 4) if self.high_score_ratio is not None else None,
            "unscorable_frames": self.unscorable_frames,
        }

LABEL_FLAGGED = "flagged_for_review"
LABEL_SUSPICIOUS = "suspicious"
LABEL_INCONCLUSIVE = "inconclusive"
LABEL_ERROR = "error"

LIMITATIONS = [
    "Results are indicative only - not a forensic determination.",
    "Frame sampling may miss brief manipulations between sampled frames.",
    "Face-based detection depends on face visibility and quality.",
    "Highly compressed or low-resolution video reduces reliability.",
    "Score is not a calibrated probability.",
]

@dataclass
class VideoAnalysisResult:
    status: str
    module: str = "member3_video_pipeline"
    label: Optional[str] = None
    score: Optional[float] = None
    score_type: Optional[str] = None
    video: Optional[VideoMetadata] = None
    frames_analyzed: int = 0
    frames_unscorable: int = 0
    frames_failed: int = 0
    aggregation: Optional[AggregationResult] = None
    evidence: Optional[EvidenceResult] = None
    model_name: Optional[str] = None
    model_version: Optional[str] = None
    is_mock: bool = True
    limitations: list[str] = field(default_factory=list)
    error: Optional[str] = None
    runtime_seconds: Optional[float] = None
    def to_dict(self) -> dict:
        return {
            "status": self.status,
            "module": self.module,
            "label": self.label,
            "score": round(self.score, 4) if self.score is not None else None,
            "score_type": self.score_type,
            "video": self.video.to_dict() if self.video else None,
            "frames_analyzed": self.frames_analyzed,
            "frames_unscorable": self.frames_unscorable,
            "frames_failed": self.frames_failed,
            "aggregation": self.aggregation.to_dict() if self.aggregation else None,
            "evidence": self.evidence.to_dict() if self.evidence else None,
            "model": {"name": self.model_name, "version": self.model_version, "is_mock": self.is_mock},
            "limitations": self.limitations,
            "error": self.error,
            "runtime_seconds": round(self.runtime_seconds, 3) if self.runtime_seconds is not None else None,
        }