import { useState } from 'react';
import {
  Compass,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Clock,
  AlertTriangle,
  GitCommit,
  Sliders,
  Menu,
  X,
} from 'lucide-react';

interface LandingPageProps {
  onOpenApp: (initialTab?: 'assessment' | 'evidence' | 'methodology') => void;
}

export function LandingPage({ onOpenApp }: LandingPageProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 font-sans selection:bg-[#233f33] selection:text-white flex flex-col">
      {/* 1. Navigation */}
      <header className="border-b border-stone-200 bg-white/90 backdrop-blur-xs sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded bg-[#233f33] text-white flex items-center justify-center font-bold text-sm tracking-wide shadow-xs">
              ST
            </div>
            <div>
              <span className="text-base font-semibold text-stone-900 tracking-tight">SHELTERTRACE</span>
              <span className="ml-2 text-[11px] px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded border border-stone-200 hidden sm:inline">
                Decision Support
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-stone-600">
            <a href="#about" className="hover:text-stone-900 transition-colors">
              About
            </a>
            <a href="#workflow" className="hover:text-stone-900 transition-colors">
              Workflow
            </a>
            <a href="#dimensions" className="hover:text-stone-900 transition-colors">
              Two Dimensions
            </a>
            <a href="#governance" className="hover:text-stone-900 transition-colors">
              Governance
            </a>
          </nav>

          {/* CTA & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onOpenApp('assessment')}
              className="px-4 py-2 rounded bg-[#233f33] hover:bg-[#1a3027] text-white text-xs font-medium flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow"
            >
              <span>Open Assessment</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 rounded text-stone-600 hover:text-stone-900"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-2 text-xs font-medium">
            <a
              href="#about"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-stone-600 hover:text-stone-900"
            >
              About
            </a>
            <a
              href="#workflow"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-stone-600 hover:text-stone-900"
            >
              Workflow
            </a>
            <a
              href="#dimensions"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-stone-600 hover:text-stone-900"
            >
              Two Dimensions
            </a>
            <a
              href="#governance"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-stone-600 hover:text-stone-900"
            >
              Governance
            </a>
          </div>
        )}
      </header>

      {/* 2. Hero Section: Editorial with HUGE seamlessly blended terrain visual */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 border-b border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Content (7 Cols on desktop) */}
            <div className="lg:col-span-7 space-y-6 z-10">
              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#233f33]/10 text-[#233f33] text-[11px] font-semibold tracking-wider uppercase border border-[#233f33]/20">
                <Compass className="w-3.5 h-3.5" />
                <span>Evidence-Driven Geospatial Decision Support</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-stone-900 tracking-tight leading-[1.15]">
                Understand the evidence. <br className="hidden sm:inline" />
                Prioritise the investigation.
              </h1>

              {/* Supporting Text */}
              <p className="text-base sm:text-lg text-stone-600 leading-relaxed max-w-xl font-normal">
                SHELTERTRACE brings hazard observations, habitation exposure and evidence uncertainty into one traceable assessment workflow.
              </p>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onOpenApp('assessment')}
                  className="px-5 py-3 rounded bg-[#233f33] hover:bg-[#1a3027] text-white text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
                >
                  <span>Explore the Assessment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenApp('methodology')}
                  className="px-5 py-3 rounded bg-white hover:bg-stone-100 text-stone-700 text-sm font-medium border border-stone-300 transition-colors flex items-center justify-center cursor-pointer shadow-2xs"
                >
                  Understand the Methodology
                </button>
              </div>

              {/* Quiet Core Tenet */}
              <div className="pt-4 flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-[#233f33] shrink-0" />
                <span>Deterministic rule execution • No opaque composite risk scores • No black-box AI</span>
              </div>
            </div>

            {/* Right Side: Unboxed Geospatial Remote Sensing & Terrain Investigation Visual */}
            <div className="lg:col-span-5 relative flex items-center justify-center lg:justify-end">
              {/* Natural blended image container with zero rectangular border */}
              <div className="relative w-full max-w-lg lg:max-w-none">
                <div
                  className="relative w-full aspect-[4/3] lg:aspect-[16/11] rounded-2xl overflow-hidden shadow-2xs"
                  style={{
                    maskImage: 'radial-gradient(ellipse 96% 92% at 52% 48%, black 55%, transparent 98%)',
                    WebkitMaskImage: 'radial-gradient(ellipse 96% 92% at 52% 48%, black 55%, transparent 98%)',
                  }}
                >
                  <img
                    src="/geospatial-hero.jpg"
                    alt="Geospatial remote sensing and terrain investigation visual"
                    className="w-full h-full object-cover object-center transform scale-102 filter contrast-[1.02] saturate-[0.98]"
                  />

                  {/* Gradient overlays to melt edges smoothly into warm off-white background */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#f8f7f4] via-transparent to-transparent opacity-75" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#f8f7f4] via-transparent to-transparent opacity-65" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#f8f7f4]/40 via-transparent to-transparent" />

                  {/* Subtle Cartographic Telemetry Overlays */}
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-white text-[10px] font-mono tracking-tight border border-white/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>11°32'N, 76°09'E &bull; 750-1240m MSL</span>
                  </div>

                  <div className="absolute bottom-3 right-3 hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-stone-900/80 backdrop-blur-xs text-white text-[9px] font-mono tracking-tight border border-white/20">
                    <span>DEMO COMPOSITION &bull; MULTI-LAYER RECONNAISSANCE</span>
                  </div>
                </div>

                {/* Explicit Data Integrity Caption */}
                <p className="text-[10px] text-stone-500 text-right mt-2 mr-2 font-sans italic">
                  Conceptual Geospatial Investigation Model &bull; Illustrative composition depicting terrain contours, runout corridor, and multi-source evidence nodes. Not official survey boundaries.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. The Problem Section */}
      <section id="about" className="py-14 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              The Fundamental Challenge
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              A hazard map alone does not tell the whole story.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-semibold text-xs">
                01
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Susceptibility is not observed damage
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Regional susceptibility zones map macro-scale slope probability. They cannot tell decision-makers whether dwellings on the ground were actually struck or remain structurally safe.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-semibold text-xs">
                02
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Uncertainty changes what we know
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Missing satellite passes, cloud cover, and conflicting ground memos can mislead algorithms. In disaster response, absence of evidence must never be mistaken for proof of safety.
              </p>
            </div>

            <div className="space-y-2">
              <div className="w-8 h-8 rounded bg-stone-100 border border-stone-200 text-stone-800 flex items-center justify-center font-semibold text-xs">
                03
              </div>
              <h3 className="font-semibold text-stone-900 text-sm">
                Reconnaissance needs traceable reasoning
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Field rescue teams and resettlement boards cannot defend high-consequence relocation choices based on opaque numerical scores. Reasoning must be fully inspectable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How SHELTERTRACE Works: The 4-Stage Sequential Investigation Workflow */}
      <section id="workflow" className="py-14 sm:py-20 border-b border-stone-200/80">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="space-y-2 text-center max-w-2xl mx-auto">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              System Architecture
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              A Four-Stage Evidence-to-Decision Pipeline
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed">
              Every assessed human settlement is evaluated through an inspectable, sequential pipeline that preserves complete causal provenance from source to field action.
            </p>
          </div>

          {/* Clean horizontal workflow on desktop, vertical on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {/* Step 1 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Stage 01</span>
                <span className="w-2 h-2 rounded-full bg-[#233f33]" />
              </div>
              <h3 className="font-semibold text-stone-900 text-xs">Evidence Acquisition</h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Historical records, satellite imagery observations, elevation models, lifeline checks, and source metadata.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Stage 02</span>
                <span className="w-2 h-2 rounded-full bg-[#233f33]" />
              </div>
              <h3 className="font-semibold text-stone-900 text-xs">Spatial Findings</h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Settlement exposure boundaries, geometric intersection tests, slope calculations (&gt;25°), and spatial limits.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Stage 03</span>
                <span className="w-2 h-2 rounded-full bg-[#233f33]" />
              </div>
              <h3 className="font-semibold text-stone-900 text-xs">Assessment Rules</h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Deterministic rule evaluation separating physical hazard urgency from epistemic evidence quality.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold text-stone-400 uppercase">Stage 04</span>
                <span className="w-2 h-2 rounded-full bg-[#233f33]" />
              </div>
              <h3 className="font-semibold text-stone-900 text-xs">Field Investigation</h3>
              <p className="text-[11px] text-stone-600 leading-relaxed">
                Prioritised field-investigation directives identifying exactly what on-ground checks are needed and why.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Two Independent Assessment Dimensions */}
      <section id="dimensions" className="py-14 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              Core Methodological Tenet
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              Two Independent Evaluative Dimensions
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-2xl">
              Generic dashboards blend physical hazard and data completeness into an opaque risk score. SHELTERTRACE decouples them orthogonally.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Dimension 1: Physical Hazard Urgency */}
            <div className="p-5 rounded-lg bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Dimension 1: Physical Hazard Urgency
                </h3>
                <span className="w-2 h-2 rounded-full bg-red-600" />
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                What does the available evidence indicate about physical hazard conditions on site?
              </p>
              <div className="space-y-1.5 text-xs text-stone-700 pt-1">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-red-800 shrink-0">Urgent:</span>
                  <span>Direct observed debris flow inundation or severed lifeline access in steep terrain.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-amber-800 shrink-0">Elevated:</span>
                  <span>High modelled susceptibility and steep slopes (&gt;25°) outside the active debris channel.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-stone-700 shrink-0">Undetermined:</span>
                  <span>Critical baseline hazard or terrain evidence is missing or contradicted. Cannot imply safety.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-emerald-800 shrink-0">Routine:</span>
                  <span>Outside runout corridor on gentle slopes (&lt;20°) with intact verified access.</span>
                </div>
              </div>
            </div>

            {/* Dimension 2: Epistemic Evidence Quality */}
            <div className="p-5 rounded-lg bg-stone-50 border border-stone-200 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <h3 className="font-semibold text-stone-900 text-sm">
                  Dimension 2: Epistemic Evidence Quality
                </h3>
                <span className="w-2 h-2 rounded-full bg-sky-600" />
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                How complete, reliable, and consistent is the evidence underlying the assessment?
              </p>
              <div className="space-y-1.5 text-xs text-stone-700 pt-1">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-emerald-800 shrink-0">Complete:</span>
                  <span>All four critical baseline domains verified with documented metadata.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-amber-800 shrink-0">Partial:</span>
                  <span>Critical baseline verified; secondary localized geotechnical surveys pending.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-stone-700 shrink-0">Insufficient:</span>
                  <span>A critical baseline data layer (e.g. cloud-obscured satellite imagery) is absent.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-rose-800 shrink-0">Conflicting:</span>
                  <span>Contradictory observations detected between independent data providers.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded bg-[#f4f2ee] border border-stone-200 text-xs text-stone-700 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#233f33] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>The Decoupling Guarantee:</strong> A settlement with confirmed debris flow impact whose secondary geotechnical survey is missing is evaluated as <strong>URGENT</strong> hazard urgency and <strong>INSUFFICIENT</strong> evidence quality. Missing secondary data never erases physical destruction.
            </p>
          </div>
        </div>
      </section>

      {/* 6. Evidence Intelligence Capabilities */}
      <section className="py-14 sm:py-20 border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              Transparency Capabilities
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              Evidence Intelligence
            </h2>
            <p className="text-xs text-stone-600 leading-relaxed max-w-xl">
              Inspectable tools within the evidence dossier that make every observation, uncertainty, and disagreement explicit.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <GitCommit className="w-4 h-4 text-[#233f33]" />
                <span>Evidence Provenance Graph</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Interactive Directed Acyclic Graph tracing each assessment finding back to its primary source dataset, observation date, and decision rule.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <Clock className="w-4 h-4 text-[#233f33]" />
                <span>Temporal Evidence Timeline</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Distinguishes persistent geological structures (where older baselines remain scientifically sound) from perishable event observations (which decay in relevance).
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <Layers className="w-4 h-4 text-[#233f33]" />
                <span>Spatial Uncertainty Inspector</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Exposes positional accuracy, coordinate reference systems (WGS84), and geometry origins without confusing regional 1:50k zonation with site-level cadastral truth.
              </p>
            </div>

            <div className="p-4 rounded-lg bg-white border border-stone-200 space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-700" />
                <span>Explicit Conflict Register</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Preserves contradictory observations between independent sources (e.g. satellite mud signatures vs local revenue field checks) rather than silently averaging them out.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Investigation Priority & Stability */}
      <section className="py-14 sm:py-20 bg-white border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              Sensitivity & Stability
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              Investigation Priority & Stability
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-stone-700 leading-relaxed max-w-2xl">
            Understand why a habitation needs investigation, and whether its priority changes when documented assumptions change.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="p-4 rounded bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <Sliders className="w-4 h-4 text-[#233f33]" />
                <span>Deterministic Scenario Analysis</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Tests decision stability across reproducible operational hypotheses (e.g. Indian Army Bailey bridge restoration). Explicitly disclaims stochastic probabilities or simulated risk forecasts.
              </p>
            </div>

            <div className="p-4 rounded bg-stone-50 border border-stone-200 space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-stone-900 text-xs">
                <CheckCircle2 className="w-4 h-4 text-[#233f33]" />
                <span>Decision-Impact Directives</span>
              </div>
              <p className="text-xs text-stone-600 leading-relaxed">
                Identifies which specific field observation will resolve evidence gaps or shift an urgent triage tier, directing field reconnaissance where it matters most.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Governance & Limitations */}
      <section id="governance" className="py-14 sm:py-20 border-b border-stone-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
              Ethical Governance
            </span>
            <h2 className="text-2xl sm:text-3xl font-semibold text-stone-900 tracking-tight">
              Decision support, not autonomous authority.
            </h2>
          </div>

          <div className="p-4 rounded-lg bg-stone-50 border border-stone-200 space-y-3 text-xs text-stone-700 leading-relaxed">
            <p>
              SHELTERTRACE is designed as an operational reconnaissance prioritisation tool. It does <strong>not</strong> autonomously certify habitation safety, issue evacuation orders, or mandate statutory resettlement.
            </p>
            <p>
              High-consequence constitutional decisions remain strictly with designated human statutory authorities (such as the District Disaster Management Authority).
            </p>
            <p className="text-stone-500 text-[11px]">
              Note: Polygon overlays on the interactive map (debris flow corridor and susceptibility zone) are illustrative vector approximations digitized from public situational reports for interface demonstration.
            </p>
          </div>
        </div>
      </section>

      {/* 9. Final CTA */}
      <section className="py-16 sm:py-24 bg-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-2xl sm:text-4xl font-semibold text-stone-900 tracking-tight">
            Explore the evidence behind the assessment.
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Inspect the live map, 9 Wayanad settlement dossiers, provenance graphs, conflict registers, and sensitivity scenarios in the full application workspace.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onOpenApp('assessment')}
              className="px-6 py-3 rounded bg-[#233f33] hover:bg-[#1a3027] text-white text-sm font-medium inline-flex items-center gap-2 transition-all shadow-xs cursor-pointer hover:shadow-md"
            >
              <span>Open SHELTERTRACE Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 bg-stone-50 py-6 px-4 text-center text-xs text-stone-500 space-y-2">
        <div className="flex items-center justify-center gap-2 text-stone-700 font-medium">
          <div className="h-4 w-4 rounded bg-[#233f33] text-white flex items-center justify-center text-[9px] font-bold">
            ST
          </div>
          <span>SHELTERTRACE Decision Support Engine</span>
        </div>
        <p className="text-[11px] text-stone-400">
          Geospatial Habitation Safety Assessment & Field Reconnaissance Prioritisation
        </p>
      </footer>
    </div>
  );
}
