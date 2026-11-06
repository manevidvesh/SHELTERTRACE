# SHELTERTRACE — Evidence-Driven Habitation Safety & Resettlement Prioritisation

[![Tests](https://img.shields.io/badge/Vitest-48%2F48%20Passing-emerald?style=flat-square&logo=vitest)](https://github.com/manevidvesh/SHELTERTRACE)
[![Architecture](https://img.shields.io/badge/Architecture-Orthogonal%20Two--Dimension%20Deterministic%20Engine-blue?style=flat-square)](https://github.com/manevidvesh/SHELTERTRACE)
[![Build](https://img.shields.io/badge/Build-Vite%208%20%2B%20TypeScript%20(0%20errors)-blueviolet?style=flat-square)](https://github.com/manevidvesh/SHELTERTRACE)
[![Spatial Data](https://img.shields.io/badge/Spatial%20Data-Illustrative%20Digitized%20Vectors-amber?style=flat-square)](https://github.com/manevidvesh/SHELTERTRACE)
[![Case Study](https://img.shields.io/badge/Case%20Study-Meppadi%20Panchayat%2C%20Wayanad%20(July%202024)-slate?style=flat-square)](https://github.com/manevidvesh/SHELTERTRACE)

> **"After a landslide or geological disaster, decision-makers need to understand which habitations require urgent field investigation or resettlement assessment. A high-consequence decision about a human settlement should never rely on an unexplained risk score."**

SHELTERTRACE provides an inspectable, transparent, and reproducible assessment system for post-disaster reconnaissance and resettlement planning. For every assessed habitation, it answers:
1. **What evidence do we have?** (Documented across Hazard, Terrain, Exposure, and Access domains)
2. **Where did that evidence come from?** (Explicit agency and instrument provenance)
3. **Is it observed, modelled, derived, or illustrative?** (Strict provenance typing)
4. **How old and spatially reliable is it?** (Temporal freshness and spatial resolution limitations)
5. **What evidence is missing or contradictory?** (Domain validation and conflict register)
6. **How does uncertainty affect the assessment?** (Deterministic sensitivity and priority stability)
7. **Why should this habitation receive field investigation priority?** (Traceable decision rules and field suggestions)

---

## 1. Core Differentiators: Traceability vs Black-Box Scoring

| Typical Disaster Dashboard | SHELTERTRACE |
|---|---|
| Black-box AI or opaque weighted formula outputting arbitrary "78% Risk Score" | **Deterministic rule-based assessment** where every output is backed by an inspectable decision rule and provenance trace. |
| Blends physical hazard urgency and data completeness into one single number | **Two independent, orthogonal dimensions**: Physical Hazard Urgency & Epistemic Evidence Quality. |
| Assumes absence of hazard data implies site safety | **Explicitly refuses to declare safety** when critical evidence is missing (`UNDETERMINED` + `INSUFFICIENT`). |
| Averages or silently discards conflicting ground reports | **Explicit Conflict Register** that preserves contradictions (`CONFLICTING`) without erasing observed physical destruction. |
| Manufactured numeric sensitivity sliders without data pipelines | **Documented operational scenarios** (e.g., temporary Bailey bridge deployment) with disabled non-GIS placeholders clearly marked. |
| Claims automated relocation or evacuation mandates | **Ethical decision support**: Software prioritises reconnaissance missions; human authorities make statutory decisions. |

---

## 2. The Two Independent Evaluative Dimensions

SHELTERTRACE separates physical threat severity from epistemic data confidence into an orthogonal evaluation matrix:

```
                      EVIDENCE QUALITY (Epistemic Confidence)
                   COMPLETE     PARTIAL     INSUFFICIENT   CONFLICTING
               ┌────────────┬─────────────┬──────────────┬─────────────┐
        URGENT │ Highest    │ High Hazard │ High Hazard  │ High Hazard │
               │ Confidence │ Field Check │ Urgent Recon │ Conflicted  │
HAZARD         ├────────────┼─────────────┼──────────────┼─────────────┤
URGENCY       ELEVATED │ High Slope │ Secondary   │ Slope Recon  │ Review Data │
(Physical)     │ Verified   │ Data Pending│ Pending      │ Discrepancy │
               ├────────────┼─────────────┼──────────────┼─────────────┤
       ROUTINE │ Safe Base  │ Baseline OK │ Domain Gap   │ Check Minor │
               │ Verified   │ Non-Critical│ Unverified   │ Anomaly     │
               ├────────────┼─────────────┼──────────────┼─────────────┤
  UNDETERMINED │ Contradict │ Cloud Gap   │ Cannot Clear │ Clouded /   │
               │ Low Threat │ Suspect     │ Safety Blind │ Conflicted  │
               └────────────┴─────────────┴──────────────┴─────────────┘
```

### Dimension 1 — Physical Hazard Urgency
- **`URGENT`**: Direct observed debris flow inundation on site, or severed lifeline access (e.g. washed-out bridge) in steep mountainous terrain.
- **`ELEVATED`**: Steep slope gradient (>25°) and high modelled landslide susceptibility with exposed settlement, verified outside direct debris channels.
- **`ROUTINE`**: Outside runout corridors, gentle slope (<20°), verified intact highway access, with complete baseline data.
- **`UNDETERMINED`**: Critical baseline hazard or slope evidence is missing or contradicted. Cannot be declared safe or routine.

### Dimension 2 — Epistemic Evidence Quality
- **`COMPLETE`**: All four critical evidence domains (`HAZARD_IMPACT`, `TERRAIN_GEOLOGY`, `SETTLEMENT_EXPOSURE`, `INFRASTRUCTURE_ACCESS`) are present with verified metadata.
- **`PARTIAL`**: Critical baseline domains are verified; secondary geotechnical or localized field surveys remain pending.
- **`INSUFFICIENT`**: One or more critical evidence domains are entirely missing (e.g. satellite cloud obscuration or missing slope model).
- **`CONFLICTING`**: Contradictory observations exist between independent sources (e.g., satellite mud anomaly vs local field check).

> **Decoupling Tenet:** A settlement with confirmed debris flow inundation whose secondary geotechnical data is missing is classified as **`URGENT`** hazard urgency and **`INSUFFICIENT`** evidence quality. Missing secondary data never erases physical destruction, nor does high hazard downgrade evidence gaps.

---

## 3. Platform Capabilities

### A. Evidence Provenance Graph
Interactive Directed Acyclic Graph (DAG) visualizing dependencies from source datasets (e.g. Cartosat-3, GSI 1:50k) $\rightarrow$ spatial findings $\rightarrow$ applicable decision rules $\rightarrow$ final assessment outputs. Selecting any node highlights its upstream evidence and downstream impacts.

### B. Evidence vs Severity 2D Matrix
16-cell contingency matrix categorizing all habitations. Provides instant situational awareness of high-hazard settlements with low data quality versus verified low-hazard baseline areas.

### C. Decision-Impact Field Directives
Analyzes specific evidence gaps for each habitation and generates prioritized reconnaissance recommendations. Explains *which* specific field observation (e.g. checking river bank scour, ground-truthing satellite mud signatures) will resolve ambiguity or shift the assessment tier.

### D. Multi-Epoch Temporal Timeline
Tracks observation epochs, event dates, and data freshness. Distinguishes persistent geological structures (where older baselines remain valid) from perishable disaster indicators (e.g., flood crests, temporary road blockages) where outdated evidence degrades confidence.

### E. Spatial Uncertainty Inspector
Exposes spatial resolution limits (e.g., 1:50,000 regional quadrangle mapping vs high-resolution satellite imagery), coordinate reference systems (WGS84 / EPSG:4326), and polygon boundary tolerances.

### F. Explicit Evidence Conflict Register
Maintains an append-only registry of conflicting observations between data providers (e.g., Cartosat-3 spectral mud anomaly vs local revenue field check in Kottappadi). Preserves all contradictory findings rather than averaging or discarding them.

### G. Investigation Priority Stability Analysis
Evaluates the stability of habitation prioritisation across 5 deterministic operational scenarios (e.g. lifeline restoration). Explicitly disclaims probability or statistical confidence, presenting descriptive stability across reproducible rules.

### H. Local Review & Audit History
In-session demonstration audit trail capturing reviewer actions, role simulations (NDRF, GSI, Revenue), timestamped overrides, and mandatory justification logs.

---

## 4. Case Study & Dataset Transparency

### Case Study: 30 July 2024 Wayanad Disaster
Evaluated across 9 settlements in Meppadi Grama Panchayat, Wayanad District, Kerala, India:
- **Punchirimattom**: Crown initiation zone on Vellarimala escarpment (`URGENT` / `COMPLETE`).
- **Mundakkai**: Mid-valley deposition zone; devastating debris inundation (`URGENT` / `COMPLETE`).
- **Chooralmala**: River confluence & commercial center; main concrete bridge swept away (`URGENT` / `COMPLETE`).
- **Attamala**: Isolated valley flank; cut off by bridge destruction (`URGENT` / `PARTIAL`).
- **Vellarmala**: River corridor; GVHSS school campus inundated under 2m sediment (`URGENT` / `COMPLETE`).
- **Kalladi**: Chembra foothill flank; steep slope (29.8°) with intact access (`ELEVATED` / `COMPLETE`).
- **Kottappadi**: Synthetic conflict demonstration fixture (`UNDETERMINED` / `CONFLICTING`, `[DEMO RECORD]`).
- **Nedumpala Sector 4**: Synthetic cloud-obscuration demonstration fixture (`UNDETERMINED` / `INSUFFICIENT`, `[DEMO RECORD]`).
- **Meppadi Town**: Unaffected downstream regional staging hub (`ROUTINE` / `COMPLETE`).

### Spatial Geometry Disclaimer
All polygon layers displayed on the interactive Leaflet map (debris flow envelope and regional susceptibility zone) are **illustrative vector approximations** (25 vertices and 8 vertices respectively) digitized for user interface demonstration. They are NOT raw GIS polygon layers ingested from official Geological Survey of India or ISRO geodatabases.

---

## 5. Sensitivity Scenarios & Stability Analysis

SHELTERTRACE strictly separates executable operational scenarios from disabled placeholders:

1. **Lifeline Restoration (Temporary Bailey Bridge)**:
   - **Status**: `RECALCULATED PIPELINE` (Executable in MVP).
   - **Mechanism**: Modifies `bridgeAccessRestored: true` in the deterministic assessment engine.
   - **Impact**: Shifts Attamala from `URGENT` to `ELEVATED` (resolving lifeline isolation), while Mundakkai remains `URGENT` (governed by direct physical debris hit).
2. **Conservative Runout Buffer Uncertainty (+75m)**:
   - **Status**: `DEMONSTRATION APPROX` (Disabled in interactive workbench).
   - **Reason**: Full vector polygon buffering requires an in-memory geometric topology engine (e.g., Turf.js / GEOS). Disabled to avoid false numerical buffer claims.
3. **Subsurface Geotechnical Core Availability**:
   - **Status**: `DEMONSTRATION APPROX`.
   - **Reason**: Borehole log is a synthetic demonstration fixture. Synthetic data cannot alter statutory hazard urgency.
4. **Strict Temporal Relevance Cutoff**:
   - **Status**: `RECALCULATED PIPELINE` (Executable).
   - **Mechanism**: Evaluates freshness against perishable non-geological cadastre layers.

---

## 6. Automated Testing Suite

The codebase includes 48 automated Vitest unit tests verifying engine logic, enhancements, and credibility guardrails:

```bash
npm test
```

### Test Coverage Areas:
- **`assessmentEngine.test.ts` (24 tests)**:
  - 2D orthogonal separation of `hazardUrgency` and `evidenceQuality`.
  - Confirmed severed access on steep terrain evaluated before missing hazard footprint.
  - Required and critical domain existence checks (`INSUFFICIENT` on missing domains).
  - Preserving conflicting evidence without erasing physical hazard findings.
  - Refusal to declare safety (`ROUTINE`) in the absence of verified data.
- **`enhancements.test.ts` (12 tests)**:
  - DAG node and edge generation for all habitations in the Provenance Graph.
  - Evidence vs Severity 2D Matrix distribution.
  - Actionable Decision-Impact Field Directives.
  - Active Bailey bridge sensitivity recalculation.
- **`refinements.test.ts` (12 tests)**:
  - Temporal metadata, observation epochs, and recency decay checks.
  - Spatial uncertainty attributes (CRS, scale, polygon vertex count).
  - Conflict register preservation of contradictory sources.
  - Priority stability frequency calculation and statistical disclaimer verification.
  - Append-only local review log structure.

---

## 7. Local Installation & Development

### Prerequisites
- Node.js 18+ or 20+
- npm 9+

### Setup Commands
```bash
# Clone the repository
git clone https://github.com/manevidvesh/SHELTERTRACE.git
cd SHELTERTRACE

# Install dependencies
npm install

# Run automated tests
npm test

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 8. Manual Deployment to Vercel

To deploy SHELTERTRACE manually on Vercel:

1. Log into your [Vercel Dashboard](https://vercel.com).
2. Click **Add New** $\rightarrow$ **Project**.
3. Import your GitHub repository: `manevidvesh/SHELTERTRACE`.
4. Configure Project Settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. The repository includes a pre-configured `vercel.json` for client-side single-page application routing rewrites.
6. Click **Deploy**. The build completes in < 15 seconds.

---

## 9. Engineering Limitations & Statutory Governance

- **Decision-Support Scope**: SHELTERTRACE is a decision-support prototype designed for rapid field-investigation prioritisation. It does NOT replace on-ground statutory assessments by disaster management authorities (NDMA, SDMA, District Disaster Management Authorities).
- **No Machine Learning / Statistical Predictions**: The system does NOT employ stochastic machine learning models, neural networks, or black-box predictive scoring. All categorizations are deterministic and rule-based.
- **Vector Geometries**: Satellite runout footprints and landslide susceptibility zones are simplified vector polygons digitized from public emergency situational reports. They must NOT be used for engineering-grade slope design.
- **In-Session Local Review**: The audit log operates in-memory for prototype demonstration; production deployments require authenticated backend persistence.
