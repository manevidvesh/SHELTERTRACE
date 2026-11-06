import type { EvidenceCategory, QualityStatus } from '../../types/evidence';
import type { HazardUrgency, EvidenceQuality } from '../../types/habitation';

export function HazardUrgencyBadge({
  urgency,
  size = 'md',
}: {
  urgency: HazardUrgency;
  size?: 'sm' | 'md' | 'lg';
}) {
  let bg = '';
  let text = '';
  let label = '';
  let border = '';
  let dotColor = '';

  switch (urgency) {
    case 'URGENT':
      bg = 'bg-rose-950/80';
      text = 'text-rose-300';
      border = 'border-rose-500/60';
      dotColor = 'bg-rose-400 animate-pulse';
      label = 'Urgent Hazard';
      break;
    case 'ELEVATED':
      bg = 'bg-amber-950/80';
      text = 'text-amber-300';
      border = 'border-amber-500/60';
      dotColor = 'bg-amber-400';
      label = 'Elevated Hazard';
      break;
    case 'ROUTINE':
      bg = 'bg-emerald-950/80';
      text = 'text-emerald-300';
      border = 'border-emerald-500/60';
      dotColor = 'bg-emerald-400';
      label = 'Routine Baseline';
      break;
    case 'UNDETERMINED':
      bg = 'bg-slate-900';
      text = 'text-slate-300';
      border = 'border-slate-600/70';
      dotColor = 'bg-slate-400';
      label = 'Undetermined Hazard';
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono font-semibold rounded border uppercase tracking-wider ${bg} ${text} ${border} ${sizeClasses}`}
      title={`Physical Hazard Urgency: ${label}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
      <span>{label}</span>
    </span>
  );
}

export function EvidenceQualityBadge({
  quality,
  size = 'md',
}: {
  quality: EvidenceQuality;
  size?: 'sm' | 'md' | 'lg';
}) {
  let bg = '';
  let text = '';
  let label = '';
  let border = '';

  switch (quality) {
    case 'COMPLETE':
      bg = 'bg-emerald-950/70';
      text = 'text-emerald-300';
      border = 'border-emerald-600/50';
      label = 'Complete Quality';
      break;
    case 'PARTIAL':
      bg = 'bg-amber-950/70';
      text = 'text-amber-300';
      border = 'border-amber-600/50';
      label = 'Partial Quality';
      break;
    case 'INSUFFICIENT':
      bg = 'bg-zinc-900';
      text = 'text-zinc-300';
      border = 'border-zinc-600/60';
      label = 'Insufficient Data';
      break;
    case 'CONFLICTING':
      bg = 'bg-purple-950/80';
      text = 'text-purple-300';
      border = 'border-purple-500/60';
      label = 'Conflicting Data';
      break;
  }

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 font-mono rounded border uppercase tracking-wider ${bg} ${text} ${border} ${sizeClasses}`}
      title={`Epistemic Evidence Quality: ${label}`}
    >
      <span>{label}</span>
    </span>
  );
}

export function CategoryBadge({ category }: { category: EvidenceCategory }) {
  let style = '';
  switch (category) {
    case 'OBSERVED':
      style = 'bg-blue-950/70 text-blue-300 border-blue-500/40';
      break;
    case 'MODELLED':
      style = 'bg-amber-950/70 text-amber-300 border-amber-500/40';
      break;
    case 'DERIVED':
      style = 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40';
      break;
    case 'ILLUSTRATIVE':
      style = 'bg-orange-950/80 text-orange-300 border-orange-500/60 font-bold';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono uppercase tracking-wider border ${style}`}>
      {category}
    </span>
  );
}

export function QualityBadge({ status }: { status: QualityStatus }) {
  let style = '';
  switch (status) {
    case 'COMPLETE':
      style = 'bg-emerald-900/40 text-emerald-300 border-emerald-600/40';
      break;
    case 'PARTIAL':
      style = 'bg-amber-900/40 text-amber-300 border-amber-600/40';
      break;
    case 'INSUFFICIENT':
      style = 'bg-zinc-800 text-zinc-300 border-zinc-600/40';
      break;
    case 'CONFLICTING':
      style = 'bg-rose-900/50 text-rose-300 border-rose-600/50';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono border ${style}`}>
      {status}
    </span>
  );
}

export function ProvenanceTypeBadge({
  type,
}: {
  type: 'SOURCE_BACKED' | 'DERIVED' | 'ILLUSTRATIVE_GEOMETRY' | 'SYNTHETIC_RECORD';
}) {
  switch (type) {
    case 'SOURCE_BACKED':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-mono">
          SOURCE-BACKED
        </span>
      );
    case 'DERIVED':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
          DERIVED
        </span>
      );
    case 'ILLUSTRATIVE_GEOMETRY':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono">
          APPROX. GEOMETRY
        </span>
      );
    case 'SYNTHETIC_RECORD':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-800 text-[10px] font-mono">
          DEMO FIXTURE
        </span>
      );
  }
}
