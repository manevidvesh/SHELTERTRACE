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
      bg = 'bg-red-50';
      text = 'text-red-800';
      border = 'border-red-200';
      dotColor = 'bg-red-600';
      label = 'Urgent Hazard';
      break;
    case 'ELEVATED':
      bg = 'bg-amber-50';
      text = 'text-amber-800';
      border = 'border-amber-200';
      dotColor = 'bg-amber-600';
      label = 'Elevated Hazard';
      break;
    case 'ROUTINE':
      bg = 'bg-emerald-50';
      text = 'text-emerald-800';
      border = 'border-emerald-200';
      dotColor = 'bg-emerald-600';
      label = 'Routine Baseline';
      break;
    case 'UNDETERMINED':
      bg = 'bg-stone-100';
      text = 'text-stone-700';
      border = 'border-stone-300';
      dotColor = 'bg-stone-500';
      label = 'Undetermined Hazard';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded border ${bg} ${text} ${border} ${sizeClasses}`}
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
      bg = 'bg-emerald-50';
      text = 'text-emerald-800';
      border = 'border-emerald-200';
      label = 'Complete Evidence';
      break;
    case 'PARTIAL':
      bg = 'bg-amber-50';
      text = 'text-amber-800';
      border = 'border-amber-200';
      label = 'Partial Evidence';
      break;
    case 'INSUFFICIENT':
      bg = 'bg-stone-100';
      text = 'text-stone-700';
      border = 'border-stone-300 border-dashed';
      label = 'Insufficient Data';
      break;
    case 'CONFLICTING':
      bg = 'bg-rose-50';
      text = 'text-rose-900';
      border = 'border-rose-200';
      label = 'Conflicting Data';
      break;
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-0.5',
    lg: 'text-sm px-3 py-1 font-medium',
  }[size];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded border font-medium ${bg} ${text} ${border} ${sizeClasses}`}
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
      style = 'bg-sky-50 text-sky-800 border-sky-200';
      break;
    case 'MODELLED':
      style = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'DERIVED':
      style = 'bg-stone-100 text-stone-700 border-stone-200';
      break;
    case 'ILLUSTRATIVE':
      style = 'bg-orange-50 text-orange-800 border-orange-200 font-medium';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans border ${style}`}>
      {category.charAt(0) + category.slice(1).toLowerCase()}
    </span>
  );
}

export function QualityBadge({ status }: { status: QualityStatus }) {
  let style = '';
  switch (status) {
    case 'COMPLETE':
      style = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      break;
    case 'PARTIAL':
      style = 'bg-amber-50 text-amber-800 border-amber-200';
      break;
    case 'INSUFFICIENT':
      style = 'bg-stone-100 text-stone-700 border-stone-300 border-dashed';
      break;
    case 'CONFLICTING':
      style = 'bg-rose-50 text-rose-800 border-rose-200';
      break;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-sans border ${style}`}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
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
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 text-[10px]">
          Source-backed
        </span>
      );
    case 'DERIVED':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200 text-[10px]">
          Derived
        </span>
      );
    case 'ILLUSTRATIVE_GEOMETRY':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px]">
          Approx. geometry
        </span>
      );
    case 'SYNTHETIC_RECORD':
      return (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-medium">
          Demo fixture
        </span>
      );
  }
}
