import logging, uuid
from fastapi import APIRouter, Depends
from app.database import save_scan
from app.auth import get_current_user
from ...schemas.cyber_schemas import URLScanRequest, URLScanResponse, ScoreType
from ...services.url_analyzer import URLAnalyzer
from ...services.risk_assessment import RiskAssessor, LIMITATIONS_TEXT
from ...services.threat_intelligence import ThreatIntelligenceService

logger = logging.getLogger(__name__)
router = APIRouter()
_url_analyzer = URLAnalyzer()
_risk_assessor = RiskAssessor()
_threat_intel = ThreatIntelligenceService()

@router.post("/url-scans", response_model=URLScanResponse)
async def create_url_scan(request: URLScanRequest, user: dict = Depends(get_current_user)):
    url = request.url
    indicators, parsed_components = _url_analyzer.analyse(url)
    ti_results = await _threat_intel.check_url(url)
    ti_confirmed = ThreatIntelligenceService.is_confirmed_malicious(ti_results)
    label, score = _risk_assessor.assess_url(indicators, ti_confirmed)
    recommendations = RiskAssessor.get_url_recommendations(label, indicators)
    
    res = URLScanResponse(
        status="success", module="cyber_resilience", label=label, score=score,
        score_type=ScoreType.THREAT_INTEL_CONFIRMED if ti_confirmed else ScoreType.RULE_BASED,
        evidence=indicators, model_or_feed_version="rule_engine_v1", limitations=LIMITATIONS_TEXT,
        url_analysed=url, parsed_components=parsed_components, threat_intelligence=ti_results,
        recommendations=recommendations,
    )
    
    record = res.model_dump()
    record["scan_id"] = str(uuid.uuid4())
    record["module"] = "Cyber URL"
    record["status"] = "completed"
    save_scan(record, int(user["sub"]))
    
    return res