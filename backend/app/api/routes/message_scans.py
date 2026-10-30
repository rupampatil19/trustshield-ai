import logging
import uuid
from fastapi import APIRouter, HTTPException
from app.database import save_scan

from ...schemas.cyber_schemas import MessageScanRequest, MessageScanResponse, ExtractedURL, RiskLevel, ScoreType
from ...services.message_analyzer import MessageAnalyzer
from ...services.url_analyzer import URLAnalyzer
from ...services.risk_assessment import RiskAssessor, LIMITATIONS_TEXT
from ...services.threat_intelligence import ThreatIntelligenceService
from .url_scans import _url_analyzer, _risk_assessor, _threat_intel

logger = logging.getLogger(__name__)
router = APIRouter()
_message_analyzer = MessageAnalyzer()

@router.post("/message-scans", response_model=MessageScanResponse)
async def create_message_scan(request: MessageScanRequest) -> MessageScanResponse:
    message = request.message
    try:
        msg_indicators, extracted_url_strings = _message_analyzer.analyse(message)
        extracted_urls: list[ExtractedURL] = []
        url_labels: list[RiskLevel] = []

        for url_str in extracted_url_strings[:10]:
            try:
                url_indicators, parsed_components = _url_analyzer.analyse(url_str)
                ti_results = await _threat_intel.check_url(url_str)
                ti_confirmed = ThreatIntelligenceService.is_confirmed_malicious(ti_results)
                url_label, url_score = _risk_assessor.assess_url(url_indicators, ti_confirmed)
                url_labels.append(url_label)
                url_score_type = ScoreType.THREAT_INTEL_CONFIRMED if ti_confirmed else ScoreType.RULE_BASED

                from ...schemas.cyber_schemas import URLScanResponse
                url_scan_result = URLScanResponse(
                    status="success", module="cyber_resilience", label=url_label, score=url_score,
                    score_type=url_score_type, evidence=url_indicators, model_or_feed_version="rule_engine_v1",
                    limitations=LIMITATIONS_TEXT, url_analysed=url_str, parsed_components=parsed_components,
                    threat_intelligence=ti_results, recommendations=RiskAssessor.get_url_recommendations(url_label, url_indicators),
                )
                extracted_urls.append(ExtractedURL(url=url_str, scan_result=url_scan_result))
            except Exception as e:
                logger.warning("URL sub-analysis failed: %s", e)
                extracted_urls.append(ExtractedURL(url=url_str, scan_result=None))

        label, score = _risk_assessor.assess_message(msg_indicators, url_labels)
        recommendations = RiskAssessor.get_message_recommendations(label, msg_indicators)

        res = MessageScanResponse(
            status="success", module="cyber_resilience", label=label, score=score, score_type=ScoreType.RULE_BASED,
            evidence=msg_indicators, model_or_feed_version="rule_engine_v1", limitations=LIMITATIONS_TEXT,
            message_preview=message[:200], extracted_urls=extracted_urls, recommendations=recommendations,
        )
        
        # SAVE TO DB
        record = res.model_dump()
        record["scan_id"] = str(uuid.uuid4())
        record["module"] = "Cyber Message"
        record["status"] = "completed"
        save_scan(record)
        
        return res
    except Exception as e:
        logger.exception("Error during message scan")
        raise HTTPException(status_code=500, detail=str(e))