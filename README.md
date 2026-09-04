## GeoCoderZ (formerly PS-09 — Place-Name Extraction & Canonical Mapping)

Resolves location ambiguity in free-text Indian incident reports — distinguishing between multiple same-named towns, misspellings, and aliases — and returns a canonical location with coordinates, a confidence score, and a human-readable reason for the decision.

Built for Smart India Hackathon 2026 (Internal Round). Architecture, schema, pipeline design, and task breakdown by [Hrithik Vishwakarma](https://github.com/Hrithik-Vish); implemented with a 6-person team against detailed task specs.

**Live Demo:** [place-name-queries.vercel.app](https://place-name-queries.vercel.app/)

**API:** [geospatialqueries-backend.onrender.com](https://geospatialqueries-backend.onrender.com)

> Note: the backend is hosted on Render's free tier and spins down after inactivity — the first request may take 30-60 seconds to wake up.

### Problem

Free-text disaster/incident reports in India frequently reference place names that are ambiguous (multiple towns with the same name), misspelled, or use local aliases — making naive geocoding unreliable. GeoCoderZ resolves these mentions to a single, explainable canonical location instead of a silent best-guess.

### Pipeline

1. **Extraction** — spaCy-based place-name extraction from raw text
2. **Normalization** — fuzzy cleanup for spelling variants and aliases (rapidfuzz)
3. **Candidate Lookup** — local GeoNames-based gazetteer lookup (780K+ rows, 121K+ alternate names)
4. **Disambiguation** — evidence-weighted scoring using population, spatial proximity, and regional context, with an India-scoped Nominatim fallback for out-of-scope names

Every resolution returns a confidence score and a stated reason — no silent wrong coordinates.

### Tech Stack

FastAPI · spaCy · PostgreSQL/PostGIS · Supabase · React-Leaflet

### Running Locally

**Backend**

bash

```bash
cd backend
pip install -r requirements.txt
python -m spacy download en_core_web_sm
uvicorn main:app --reload
```

Runs on `http://localhost:8000`.

**Frontend**

bash

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

### Documentation

Full API contract, schema, and pipeline specs are in `docs/` — see `contract.md` for the request/response shape and `schema.sql` for the database design.
