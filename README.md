# SchemaSense AI

![Continuous Integration](https://github.com/srthck/schemasense-ai/actions/workflows/test.yml/badge.svg)

SchemaSense AI is a production-grade hybrid machine learning system designed to perform intelligent semantic analysis and type inference on complex JSON data structures. It bridges the gap between raw data and developer-friendly TypeScript interfaces by combining deterministic rule-based heuristics with a lightweight Logistic Regression classifier for high-precision field annotation.

## Project Overview

Modern developer tooling requires more than just structural type generation. SchemaSense AI analyzes the semantic intent of data fields—identifying emails, UUIDs, ISO dates, and specialized IDs—to provide context-aware metadata. The system uses a recursive traversal engine to inspect deeply nested objects and arrays, ensuring 100% coverage of the input payload.

## Features

- Hybrid Inference Pipeline: Seamless integration of regex patterns, deterministic heuristics, and Scikit-learn ML models.
- Recursive Analysis: Deep inspection of nested JSON structures with path-aware metadata.
- Robust JSON Repair: Automatic correction of trailing commas, unquoted keys, single quotes, and broken array formatting.
- Explainable AI (XAI): Transparent reasoning for every prediction, exposing the deterministic or statistical evidence used.
- Real-time Instrumentation: Latency tracking for traversal, ML inference, and total pipeline duration.
- Production-Ready Resilience: Strict 200ms timeout for ML microservices with graceful deterministic fallback.

## System Architecture

The platform is built as a modular monorepo:

- Frontend: React 18 + Vite + TypeScript + Monaco Editor for professional-grade code editing.
- Backend: Node.js + Express + TypeScript serving as the orchestration layer for traversal and quicktype generation.
- ML Microservice: Python + FastAPI + Scikit-learn providing high-performance inference via a serialized Logistic Regression model.

## Hybrid Inference Flow

The system prioritizes speed and precision using a multi-tiered execution strategy:

1. Deterministic Layer (RULE): High-confidence regex matches for standard formats (e.g., Email, UUID, ISO Date).
2. Heuristic Layer (RULE): Key-suffix and value-pattern analysis (e.g., fields ending in _at or _url).
3. Machine Learning Layer (ML): Fallback to a trained classifier for ambiguous fields that do not meet strict deterministic criteria.
4. Hybrid Synthesis (HYBRID): Merging rule hints with statistical probabilities for refined explainability.

## ML Pipeline

The machine learning component is designed for low-latency production environments:

- Model: Logistic Regression with StandardScaler.
- Feature Engineering: 20-dimensional numeric vectorization of keys and values (length, entropy, pattern flags).
- Dataset: Synthetic dataset of 6,900+ records with noise, casing variations, and class balancing.
- Artifacts: Serialized via joblib for rapid loading in the FastAPI microservice.

## Explainability System

Every semantic prediction includes a collection of "Evidence" markers:
- regex_email_match: Validated via strict RFC 5322 regex.
- date_keyword_suffix_match: Heuristic hit on field naming conventions.
- statistical_pattern_match: ML classifier hit based on feature vector distributions.

## Tech Stack

- Languages: TypeScript, JavaScript, Python
- Frontend: React, Tailwind CSS, Monaco Editor, Lucide Icons
- Backend: Express.js, Axios, Quicktype-core
- ML/AI: FastAPI, Scikit-learn, Pandas, Numpy, Joblib

## Testing

The system includes a professional automated validation suite powered by Vitest to ensure the integrity of the parsing and inference engine.

### Core Test Suites

- **Malformed JSON Validation**: Verifies the repair engine's ability to normalize unquoted keys, missing commas, and trailing commas into valid JSON.
- **Semantic Inference Testing**: Asserts the precision of regex and heuristic rules for emails, UUIDs, dates, and URLs.
- **Recursive Traversal Testing**: Validates deep extraction of metadata and correct dot-notation path generation for nested structures.
- **Array Handling Testing**: Ensures stable recursive typing for arrays of objects and nested primitive collections.

### Local Validation

To validate the codebase locally before pushing changes:

**Backend (Server)**
```bash
cd server
npm install
npm run build
npm test
```

**Frontend (Client)**
```bash
cd client
npm install
npm run build
```

### Test Output Summary

```text
 ✓ tests/repair.test.ts (4 tests)
 ✓ tests/semantic.test.ts (4 tests)
 ✓ tests/arrays.test.ts (3 tests)
 ✓ tests/traversal.test.ts (2 tests)

 Test Files  4 passed (4)
      Tests  13 passed (13)
```

## Continuous Integration

The project utilizes GitHub Actions for automated quality assurance. Every push and pull request triggers a CI pipeline that validates:

1.  **Backend Integrity**: Verifies dependency installation, TypeScript compilation, and executes the Vitest suite.
2.  **Frontend Stability**: Ensures clean dependency installation and a successful production build.

The pipeline is configured to fail immediately on any TypeScript errors, failing tests, or build breakages to maintain repository health.

## Local Development Setup

### Backend (Node.js)
```bash
cd server
npm install
npm run dev
```

### Frontend (React)
```bash
cd client
npm install
npm run dev
```

### ML Service (Python)
```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

## API Endpoints

- POST /api/generate-types: Primary endpoint for JSON analysis and TS generation.
- POST /api/repair: Standalone JSON correction utility.
- GET /health: Backend health status.
- GET /health (ML): Microservice status and artifact validation.

## Deployment Architecture

- Frontend: Vercel (Production)
- Backend: Render (Web Service)
- ML Service: Render (Web Service)

## Performance Notes

The inference pipeline is optimized for developer workflows:
- Traversal & Heuristics: < 10ms for standard payloads.
- ML Inference: < 50ms average latency.
- Fault Tolerance: Hard 200ms timeout ensures backend response stability.

## Example Input/Output

### Input
```json
{
  "user_email": "dev@schemasense.ai",
  "account_id": 1024
}
```

### Output (Semantics)
- user_email | EMAIL | 99% | RULE (regex_email_match)
- account_id | NUMERIC_ID | 90% | RULE (numeric_id_suffix_match)

## Future Improvements

- Support for more target languages beyond TypeScript (Go, Rust, Python Pydantic).
- Real-time model retraining via user feedback loop.
- Batch processing for multi-file JSON schemas.
- Advanced statistical profiling for unknown numeric distributions.
