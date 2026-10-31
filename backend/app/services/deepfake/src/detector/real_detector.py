import cv2
import torch
import torch.nn as nn
import numpy as np
from torchvision import models, transforms
from PIL import Image
from pathlib import Path

from src.detector.detector_adapter import BaseDetector, DetectorError
from src.schemas.result_schema import DetectorOutput

class RealDetector(BaseDetector):
    MODEL_NAME = "MobileNetV3-Large"
    MODEL_VERSION = "seed_42"
    THRESHOLD = 0.2525

    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = self._load_model()
        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])

    def _load_model(self):
        model_path = Path(__file__).resolve().parent / "best.pth"
        if not model_path.is_file():
            raise FileNotFoundError(f"Model checkpoint not found at {model_path}")

        model = models.mobilenet_v3_large(weights=None)
        model.classifier[3] = nn.Linear(model.classifier[3].in_features, 2)
        
        state = torch.load(model_path, map_location=self.device, weights_only=True)
        model.load_state_dict(state, strict=True)
        model.to(self.device)
        model.eval()
        return model

    def analyze(self, image: np.ndarray) -> DetectorOutput:
        try:
            # Convert OpenCV BGR to RGB for PIL
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(image_rgb)
            
            tensor = self.preprocess(pil_image).unsqueeze(0).to(self.device)
            
            with torch.inference_mode():
                logits = self.model(tensor)
                scores = torch.softmax(logits, dim=1)[0]
            
            # Class index 1 represents manipulated/fake
            model_score = float(scores[1].item())

            return DetectorOutput(
                model_score=model_score,
                model_name=self.MODEL_NAME,
                model_version=self.MODEL_VERSION,
                score_type="model_probability",
                is_mock=False
            )
        except Exception as exc:
            raise DetectorError(f"Real Detector Error: {str(exc)}")

    @property
    def model_name(self) -> str:
        return self.MODEL_NAME

    @property
    def model_version(self) -> str:
        return self.MODEL_VERSION

    @property
    def is_mock(self) -> bool:
        return False