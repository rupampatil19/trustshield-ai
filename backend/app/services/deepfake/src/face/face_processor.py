from __future__ import annotations
import abc
from typing import Optional, Tuple
import cv2
import numpy as np
from pathlib import Path
from src.config import PipelineConfig, DEFAULT_CONFIG

class BaseFaceProcessor(abc.ABC):
    @abc.abstractmethod
    def extract_face(self, image: np.ndarray) -> Optional[np.ndarray]:
        raise NotImplementedError
    @property
    @abc.abstractmethod
    def processor_name(self) -> str:
        raise NotImplementedError

class YuNetFaceProcessor(BaseFaceProcessor):
    PROCESSOR_NAME = "YuNetFaceProcessor_v1"

    def __init__(self, config: PipelineConfig = DEFAULT_CONFIG):
        self.config = config
        model_path = str(Path(__file__).resolve().parent / "yunet.onnx")
        # Initialize YuNet
        self.detector = cv2.FaceDetectorYN.create(
            model_path, "", (320, 320), 0.8, 0.3, 5000
        )

    def extract_face_and_bbox(self, image: np.ndarray):
        if image is None:
            return None, None
            
        h, w = image.shape[:2]
        self.detector.setInputSize((w, h))
        
        # Detect faces
        _, faces = self.detector.detect(image)
        
        if faces is None or len(faces) == 0:
            return None, None
            
        # Find the largest face in the image
        face = max(faces, key=lambda f: f[2] * f[3])
        x, y, w_box, h_box = map(int, face[:4])
        
        x1, y1 = max(0, x), max(0, y)
        x2, y2 = min(w, x + w_box), min(h, y + h_box)
        
        crop = image[y1:y2, x1:x2]
        if crop.size == 0:
            return None, None
            
        return crop, (x1, y1, x2-x1, y2-y1)

    def extract_face(self, image: np.ndarray) -> Optional[np.ndarray]:
        crop, _ = self.extract_face_and_bbox(image)
        return crop

    @property
    def processor_name(self) -> str:
        return self.PROCESSOR_NAME

class FullFrameProcessor(BaseFaceProcessor):
    PROCESSOR_NAME = "FullFrameProcessor_v1"
    def extract_face(self, image: np.ndarray) -> Optional[np.ndarray]:
        return image if image is not None and image.size > 0 else None
    def extract_face_and_bbox(self, image: np.ndarray):
        return self.extract_face(image), None
    @property
    def processor_name(self) -> str:
        return self.PROCESSOR_NAME

def get_default_face_processor(config: PipelineConfig = DEFAULT_CONFIG) -> BaseFaceProcessor:
    return YuNetFaceProcessor(config)