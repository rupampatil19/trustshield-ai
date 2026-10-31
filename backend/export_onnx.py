import torch
import torch.nn as nn
from torchvision import models
import os

# Define a wrapper to output both the logits and the final convolutional features
class ModelWithFeatures(nn.Module):
    def __init__(self, original_model):
        super(ModelWithFeatures, self).__init__()
        self.features = original_model.features
        self.avgpool = original_model.avgpool
        self.classifier = original_model.classifier

    def forward(self, x):
        f = self.features(x)
        x = self.avgpool(f)
        x = torch.flatten(x, 1)
        x = self.classifier(x)
        return x, f  # Return logits and raw feature maps

def export_to_onnx():
    model_path = "app/services/deepfake/src/detector/best.pth"
    onnx_path = "app/services/deepfake/src/detector/best.onnx"
    
    print("Loading PyTorch model...")
    model = models.mobilenet_v3_large(weights=None)
    model.classifier[3] = nn.Linear(model.classifier[3].in_features, 2)
    state = torch.load(model_path, map_location="cpu", weights_only=True)
    model.load_state_dict(state, strict=True)
    model.eval()

    wrapped_model = ModelWithFeatures(model)
    wrapped_model.eval()

    dummy_input = torch.randn(1, 3, 224, 224)
    
    print("Exporting to ONNX format...")
    torch.onnx.export(
        wrapped_model,
        dummy_input,
        onnx_path,
        export_params=True,
        opset_version=14,
        do_constant_folding=True,
        input_names=['input'],
        output_names=['logits', 'features'],
        dynamic_axes={
            'input': {0: 'batch_size'},
            'logits': {0: 'batch_size'},
            'features': {0: 'batch_size'}
        }
    )
    print(f"✅ Successfully exported to {onnx_path}")

if __name__ == "__main__":
    export_to_onnx()