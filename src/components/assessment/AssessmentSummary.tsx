import { Grid, ChevronDown, ChevronUp, BarChart3 } from 'lucide-react';
import type { PrioritisationResult, HazardUrgency, EvidenceQuality } from '../../types/habitation';

export type SummaryFilter = 'ALL' | HazardUrgency | EvidenceQuality;

interface AssessmentSummaryProps {
  results: PrioritisationResult[];
  activeFilter: SummaryFilter;
  onFilterChange: (filter: SummaryFilter) => void;
  isMatrixOpen?: boolean;
  onToggleMatrix?: () => void;
  isCompareOpen?: boolean;
  onToggleCompare?: () => void;
}

export function AssessmentSummary({
  results,
  activeFilter,
  onFilterChange,
  isMatrixOpen,
  onToggleMatrix,
  isCompareOpen,
  onToggleCompare,
}: AssessmentSummaryProps) {
  const total = results.length;

  // Hazard Urgency Counts
  const urgentCount = results.filter(r => r.hazardUrgency === 'URGENT').length;
  const elevatedCount = results.filter(r => r.hazardUrgency === 'ELEVATED').length;
  const undeterminedCount = results.filter(r => r.hazardUrgency === 'UNDETERMINED').length;
  const routineCount = results.filter(r => r.hazardUrgency === 'ROUTINE').length;

  // Evidence Quality Counts
  const completeCount = results.filter(r => r.evidenceQuality === 'COMPLETE').length;
  const partialCount = results.filter(r => r.evidenceQuality === 'PARTIAL').length;
  const insufficientCount = results.filter(r => r.evidenceQuality === 'INSUFFICIENT').length;
  const conflictingCount = results.filter(r => r.evidenceQuality === 'CONFLICTING').length;

  return (
    <div className="bg-white border border-stone-200 rounded-lg p-3 sm:px-4 shadow-xs space-y-2.5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Left: Primary Physical Hazard Filter Segments */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-stone-500 font-medium mr-1">Filter by Hazard:</span>

          {/* All */}
          <button
            onClick={() => onFilterChange('ALL')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
            }`}
          >
            All ({total})
          </button>

          {/* Urgent */}
          <button
            onClick={() => onFilterChange('URGENT')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'URGENT'
                ? 'bg-red-800 text-white shadow-xs'
                : 'bg-red-50 text-red-800 hover:bg-red-100 border border-red-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'URGENT' ? 'bg-white' : 'bg-red-600'}`} />
            <span>Urgent ({urgentCount})</span>
          </button>

          {/* Elevated */}
          <button
            onClick={() => onFilterChange('ELEVATED')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'ELEVATED'
                ? 'bg-amber-800 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'ELEVATED' ? 'bg-white' : 'bg-amber-600'}`} />
            <span>Elevated ({elevatedCount})</span>
          </button>

          {/* Undetermined */}
          <button
            onClick={() => onFilterChange('UNDETERMINED')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'UNDETERMINED'
                ? 'bg-stone-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'UNDETERMINED' ? 'bg-white' : 'bg-stone-500'}`} />
            <span>Undetermined ({undeterminedCount})</span>
          </button>

          {/* Routine */}
          <button
            onClick={() => onFilterChange('ROUTINE')}
            className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeFilter === 'ROUTINE'
                ? 'bg-emerald-800 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeFilter === 'ROUTINE' ? 'bg-white' : 'bg-emerald-600'}`} />
            <span>Routine ({routineCount})</span>
          </button>
        </div>

        {/* Right: Matrix & Parameter Comparison View Toggle Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onToggleCompare && (
            <button
              onClick={onToggleCompare}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                isCompareOpen
                  ? 'bg-[#233f33] text-white border-[#233f33]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Parameter Comparison</span>
              {isCompareOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}

          {onToggleMatrix && (
            <button
              onClick={onToggleMatrix}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium border transition-colors cursor-pointer shrink-0 ${
                isMatrixOpen
                  ? 'bg-[#233f33] text-white border-[#233f33]'
                  : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-300'
              }`}
            >
              <Grid className="w-3.5 h-3.5" />
              <span>Analytical 2D Matrix</span>
              {isMatrixOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Epistemic Evidence Quality Sub-Bar (Subtle, non-competing) */}
      <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between text-[11px] text-stone-500 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-stone-600">Epistemic Evidence Quality:</span>
          <button
            onClick={() => onFilterChange(activeFilter === 'COMPLETE' ? 'ALL' : 'COMPLETE')}
            className={`hover:underline cursor-pointer ${activeFilter === 'COMPLETE' ? 'font-bold text-stone-900 underline' : ''}`}
          >
            Complete: {completeCount}
          </button>
          <span>•</span>
          <button
            onClick={() => onFilterChange(activeFilter === 'PARTIAL' ? 'ALL' : 'PARTIAL')}
            className={`hover:underline cursor-pointer ${activeFilter === 'PARTIAL' ? 'font-bold text-stone-900 underline' : ''}`}
          >
            Partial: {partialCount}
          </button>
          <span>•</span>
          <button
            onClick={() => onFilterChange(activeFilter === 'INSUFFICIENT' ? 'ALL' : 'INSUFFICIENT')}
            className={`hover:underline cursor-pointer ${activeFilter === 'INSUFFICIENT' ? 'font-bold text-stone-900 underline' : ''}`}
          >
            Insufficient: {insufficientCount}
          </button>
          <span>•</span>
          <button
            onClick={() => onFilterChange(activeFilter === 'CONFLICTING' ? 'ALL' : 'CONFLICTING')}
            className={`hover:underline cursor-pointer ${activeFilter === 'CONFLICTING' ? 'font-bold text-stone-900 underline' : ''}`}
          >
            Conflicting: {conflictingCount}
          </button>
        </div>

        {activeFilter !== 'ALL' && (
          <button
            onClick={() => onFilterChange('ALL')}
            className="text-[11px] text-stone-600 hover:text-stone-900 underline cursor-pointer"
          >
            Clear filter (show all {total})
          </button>
        )}
      </div>
    </div>
  );
}
