# TrustShield AI - Integration Notes

## Source repositories

| Repo | Contributed | Files |
|---|---|---|
| VeriSafe | DB layer, media-scan scaffolding, /api/legacy/* | app/database.py, app/legacy_verisafe/original_main.py |
| TrustShield-AI-Cyber-Resilience-Project | URL/message/report analysis + schemas + config | app/api/*, app/services/*, app/schemas/*, app/core/* |
| TrushsheildAI | Video deepfake pipeline (with mock detector) | app/services/deepfake/src/* |

## New files (glue only, no business logic)

- app/main.py - mounts all three modules, sets sys.path for pipeline imports
- app/routes_deepfake.py - HTTP wrapper around the pipeline
- requirements.txt - union of both source requirements files

## Edits to original source code

None. All source files are unchanged. Original relative-import structure
was preserved by keeping Cyber services at app/services/* (not nested).

## Known limitations

- Deepfake pipeline uses mock_detector. Results are NOT real deepfake
  verdicts. The response honestly reports "is_mock": true.
- No C2PA / Content Credentials support yet.
- No unified investigation DB across all modules yet (VeriSafe DB and
  Cyber routes use independent storage).
- No authentication yet.

## Run

    cd backend
    pip install -r requirements.txt
    uvicorn app.main:app --reload

Open http://localhost:8000/docs
