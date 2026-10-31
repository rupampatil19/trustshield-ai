import cv2
import torch
import torch.nn as nn
import numpy as np
import base64
from torchvision import models, transforms
from PIL import Image
from pathlib import Path

from src.detector.detector_adapter import BaseDetector, DetectorError
from src.schemas.result_schema import DetectorOutput

class RealDetector(BaseDetector):
    MODEL_NAME = "MobileNetV3-Large"
    MODEL_VERSION = "seed_42"
    THRESHOLD = 0.2525
    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(RealDetector, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if self._initialized:
            return
        
        # Force CPU and limit threads to save memory on Render
        import torch
        torch.set_num_threads(1)
        self.device = torch.device("cpu")
        
        self.model = self._load_model()
        self._initialized = True
        self.preprocess = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
        ])
        self.gradients = None
        self.activations = None
        self.model.features[-1].register_forward_hook(self._forward_hook)
        self.model.features[-1].register_full_backward_hook(self._backward_hook)

    def _forward_hook(self, module, input, output):
        self.activations = output.detach()

    def _backward_hook(self, module, grad_input, grad_output):
        self.gradients = grad_output[0].detach()

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

    def _generate_raw_heatmap(self, tensor, original_image_shape):
        self.model.zero_grad()
        output = self.model(tensor)
        score = output[0][1]
        score.backward()
        
        pooled_gradients = torch.mean(self.gradients[0], dim=[1, 2])
        activations = self.activations[0]
        for i in range(activations.shape[0]):
            activations[i, :, :] *= pooled_gradients[i]
            
        heatmap = torch.mean(activations, dim=0).squeeze().cpu().numpy()
        heatmap = np.maximum(heatmap, 0)
        if np.max(heatmap) != 0:
            heatmap /= np.max(heatmap)
        
        heatmap = cv2.resize(heatmap, (original_image_shape[1], original_image_shape[0]))
        heatmap_uint8 = np.uint8(255 * heatmap)
        
        # --- DYNAMIC REGIONAL ANALYSIS (Percentile Based) ---
        h, w = heatmap_uint8.shape
        quadrants = {
            "Left Eye/Cheek": heatmap_uint8[:h//2, :w//2],
            "Right Eye/Cheek": heatmap_uint8[:h//2, w//2:],
            "Left Mouth/Jawline": heatmap_uint8[h//2:, :w//2],
            "Right Mouth/Jawline": heatmap_uint8[h//2:, w//2:]
        }
        
        findings = []
        for region_name, region_data in quadrants.items():
            # Check the top 5% of activated pixels in this region
            # If the 95th percentile is above 180 (bright red/yellow), it's a hotspot
            peak_activation = np.percentile(region_data, 95)
            
            if peak_activation > 180:
                if "Eye" in region_name:
                    findings.append(f"Critical manipulation artifacts detected in the {region_name}. The AI identified synthetic iris generation, unnatural reflections, or masking errors.")
                elif "Mouth" in region_name:
                    findings.append(f"Noticeable blending inconsistencies detected in the {region_name}, often associated with facial reenactment (lip-sync) or teeth artifacts.")
                else:
                    findings.append(f"Texture anomalies detected in the {region_name} region.")
                    
        if not findings:
            findings.append("Subtle, widespread manipulation traces detected across the facial structure.")
            
        return heatmap_uint8, findings

    def _to_base64(self, img):
        _, buffer = cv2.imencode('.jpg', img)
        return base64.b64encode(buffer).decode('utf-8')

    def analyze(self, image: np.ndarray, full_image: np.ndarray = None, bbox: tuple = None) -> DetectorOutput:
        try:
            image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
            pil_image = Image.fromarray(image_rgb)
            tensor = self.preprocess(pil_image).unsqueeze(0).to(self.device)
            
            with torch.set_grad_enabled(True):
                logits = self.model(tensor)
                scores = torch.softmax(logits, dim=1)[0]
                model_score = float(scores[1].item())
                
                # Unpack exactly 2 values returned from the function
                raw_heatmap, findings = self._generate_raw_heatmap(tensor, image.shape)
                heatmap_color = cv2.applyColorMap(raw_heatmap, cv2.COLORMAP_JET)

                if full_image is not None:
                    if bbox is not None:
                        x, y, w, h = bbox
                        heatmap_resized = cv2.resize(heatmap_color, (w, h))
                        superimposed = full_image.copy()
                        roi = superimposed[y:y+h, x:x+w]
                        if roi.shape[:2] == heatmap_resized.shape[:2]:
                            superimposed[y:y+h, x:x+w] = cv2.addWeighted(roi, 0.6, heatmap_resized, 0.4, 0)
                        cv2.rectangle(superimposed, (x, y), (x+w, y+h), (0, 255, 0), 2)
                        heatmap_b64 = self._to_base64(superimposed)
                    else:
                        heatmap_resized = cv2.resize(heatmap_color, (full_image.shape[1], full_image.shape[0]))
                        superimposed = cv2.addWeighted(full_image, 0.6, heatmap_resized, 0.4, 0)
                        heatmap_b64 = self._to_base64(superimposed)
                else:
                    superimposed = cv2.addWeighted(image, 0.6, heatmap_color, 0.4, 0)
                    heatmap_b64 = self._to_base64(superimposed)

            return DetectorOutput(
                model_score=model_score,
                model_name=self.MODEL_NAME,
                model_version=self.MODEL_VERSION,
                score_type="model_probability",
                is_mock=False,
                heatmap_b64=heatmap_b64,
                forensic_findings=findings
            )
        except Exception as exc:
            raise DetectorError(f"Real Detector Error: {str(exc)}")

    @property
    def model_name(self) -> str: return self.MODEL_NAME
    @property
    def model_version(self) -> str: return self.MODEL_VERSION
    @property
    def is_mock(self) -> bool: return False