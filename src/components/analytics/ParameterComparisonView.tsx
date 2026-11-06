import { useState, useMemo } from 'react';
import {
  Mountain,
  TrendingUp,
  Users,
  Home,
  Info,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRightLeft,
} from 'lucide-react';
import type { Habitation, PrioritisationResult, HazardUrgency } from '../../types/habitation';
import { HazardUrgencyBadge, ProvenanceTypeBadge } from '../common/Badge';

interface ParameterComparisonViewProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation;
  onSelectHabitation: (habitation: Habitation) => void;
  onClose?: () => void;
}

export interface ParameterDatum {
  id: string;
  name: string;
  isIllustrativeRecord: boolean;
  hazardUrgency: HazardUrgency;
  elevationMeters: number | null;
  slopeDegrees: number | null;
  estimatedPopulation: number | null;
  buildingCount: number | null;
}

export function ParameterComparisonView({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
  onClose,
}: ParameterComparisonViewProps) {
  // View mode: 'all' (compare all settlements on small-multiple bars) vs 'pairwise' (direct benchmark diff)
  const [comparisonMode, setComparisonMode] = useState<'all' | 'pairwise'>('all');
  const [benchmarkHabitationId, setBenchmarkHabitationId] = useState<string>(() => {
    // Default benchmark to Meppadi Town (stable lower valley benchmark) if selected is not Meppadi, else Chooralmala
    return selectedHabitation.id === 'hab-meppadi-town' ? 'hab-chooralmala' : 'hab-meppadi-town';
  });
  const [excludeDemonstrationRecords, setExcludeDemonstrationRecords] = useState(false);
  const [showMetadataInspector, setShowMetadataInspector] = useState(false);

  // Extract structured parameters with strict data integrity (no zeros for missing data)
  const parameterData: ParameterDatum[] = useMemo(() => {
    return habitations
      .filter(hab => (excludeDemonstrationRecords ? !hab.isIllustrativeRecord : true))
      .map(hab => {
        const result = resultsMap.get(hab.id);
        const slopeEv = hab.evidence.find(
          e => e.domain === 'TERRAIN_GEOLOGY' && e.valueUnit === 'degrees' && typeof e.valueNumeric === 'number'
        );

        return {
          id: hab.id,
          name: hab.name,
          isIllustrativeRecord: !!hab.isIllustrativeRecord,
          hazardUrgency: result?.hazardUrgency || 'UNDETERMINED',
          elevationMeters: typeof hab.elevationMeters === 'number' ? hab.elevationMeters : null,
          slopeDegrees: slopeEv?.valueNumeric ?? null,
          estimatedPopulation: typeof hab.estimatedPopulation === 'number' ? hab.estimatedPopulation : null,
          buildingCount: typeof hab.buildingCount === 'number' ? hab.buildingCount : null,
        };
      });
  }, [habitations, resultsMap, excludeDemonstrationRecords]);

  // Compute maximums for relative bar rendering
  const maxValues = useMemo(() => {
    let maxElev = 0;
    let maxSlope = 0;
    let maxPop = 0;
    let maxBldg = 0;

    parameterData.forEach(d => {
      if (d.elevationMeters && d.elevationMeters > maxElev) maxElev = d.elevationMeters;
      if (d.slopeDegrees && d.slopeDegrees > maxSlope) maxSlope = d.slopeDegrees;
      if (d.estimatedPopulation && d.estimatedPopulation > maxPop) maxPop = d.estimatedPopulation;
      if (d.buildingCount && d.buildingCount > maxBldg) maxBldg = d.buildingCount;
    });

    return {
      elevation: maxElev || 1400,
      slope: maxSlope || 45,
      population: maxPop || 3500,
      buildings: maxBldg || 700,
    };
  }, [parameterData]);

  // Active benchmark habitation for pairwise comparison
  const benchmarkHabitation = useMemo(() => {
    return habitations.find(h => h.id === benchmarkHabitationId) || habitations[0];
  }, [habitations, benchmarkHabitationId]);

  const selectedDatum = useMemo(() => {
    return parameterData.find(d => d.id === selectedHabitation.id) || parameterData[0];
  }, [parameterData, selectedHabitation.id]);

  const benchmarkDatum = useMemo(() => {
    return parameterData.find(d => d.id === benchmarkHabitation.id) || parameterData[0];
  }, [parameterData, benchmarkHabitation.id]);

  // Helper for urgency bar color
  const getUrgencyColor = (urgency: HazardUrgency) => {
    switch (urgency) {
      case 'URGENT':
        return '#b91c1c'; // crimson
      case 'ELEVATED':
        return '#d97706'; // ochre
      case 'ROUTINE':
        return '#2d6a4f'; // forest green
      case 'UNDETERMINED':
      default:
        return '#57534e'; // stone grey
    }
  };

  return (
    <div className="bg-white border border-stone-200 rounded-lg shadow-sm p-4 text-xs space-y-4 font-sans">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-[#233f33] uppercase tracking-wider">
              Comparative Analysis
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-stone-500 font-mono text-[11px]">4 Measurable Parameters</span>
          </div>
          <h2 className="text-sm font-semibold text-stone-900 tracking-tight mt-0.5">
            Physical Terrain &amp; Exposure Parameter Comparison
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode Switcher */}
          <div className="flex items-center p-0.5 bg-stone-100 rounded-md border border-stone-200">
            <button
              onClick={() => setComparisonMode('all')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                comparisonMode === 'all'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              All Settlements ({parameterData.length})
            </button>
            <button
              onClick={() => setComparisonMode('pairwise')}
              className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                comparisonMode === 'pairwise'
                  ? 'bg-white text-stone-900 shadow-xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ArrowRightLeft className="w-3 h-3" />
              <span>Pairwise Diff</span>
            </button>
          </div>

          {/* Toggle Demonstration Filter */}
          <label className="flex items-center gap-1.5 text-[11px] text-stone-600 hover:text-stone-900 cursor-pointer pl-1">
            <input
              type="checkbox"
              checked={excludeDemonstrationRecords}
              onChange={e => setExcludeDemonstrationRecords(e.target.checked)}
              className="rounded text-stone-800 focus:ring-0 cursor-pointer"
            />
            <span>Exclude Demo Sites</span>
          </label>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              title="Close parameter comparison"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Selected Habitation Callout Banner */}
      <div className="p-2.5 rounded-lg bg-stone-50 border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] uppercase font-semibold text-stone-500">Selected Site:</span>
          <span className="font-semibold text-stone-900 text-xs">{selectedHabitation.name}</span>
          <HazardUrgencyBadge urgency={selectedDatum.hazardUrgency} size="sm" />
          {selectedHabitation.isIllustrativeRecord && (
            <ProvenanceTypeBadge type="SYNTHETIC_RECORD" />
          )}
        </div>

        {comparisonMode === 'pairwise' && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-semibold text-stone-500">Benchmark Against:</span>
            <select
              value={benchmarkHabitationId}
              onChange={e => setBenchmarkHabitationId(e.target.value)}
              className="bg-white border border-stone-300 rounded px-2 py-0.5 text-xs text-stone-800 focus:outline-none focus:border-stone-500 cursor-pointer font-medium"
            >
              {habitations
                .filter(h => h.id !== selectedHabitation.id)
                .map(h => (
                  <option key={h.id} value={h.id}>
                    {h.name} {h.isIllustrativeRecord ? '(Demo)' : ''}
                  </option>
                ))}
            </select>
          </div>
        )}
      </div>

      {/* Visualisation Mode 1: Small Multiples for All 4 Parameters */}
      {comparisonMode === 'all' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Chart 1: Elevation (m MSL) */}
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <Mountain className="w-3.5 h-3.5 text-stone-600" />
                <span>Terrain Elevation</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                Unit: metres (m MSL)
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {parameterData.map(d => {
                const isSelected = d.id === selectedHabitation.id;
                const value = d.elevationMeters;
                const percent = value ? Math.round((value / maxValues.elevation) * 100) : 0;
                const barColor = isSelected ? getUrgencyColor(d.hazardUrgency) : '#a8a29e';

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      const found = habitations.find(h => h.id === d.id);
                      if (found) onSelectHabitation(found);
                    }}
                    className={`p-1.5 rounded transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-white shadow-xs border border-stone-300 ring-1 ring-stone-900'
                        : 'hover:bg-white hover:border-stone-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate font-medium ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                          {d.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1 rounded bg-stone-900 text-white">
                            SELECTED
                          </span>
                        )}
                        {d.isIllustrativeRecord && (
                          <span className="text-[8px] font-bold px-1 rounded bg-amber-100 text-amber-800 border border-amber-200">
                            DEMO
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-stone-800 text-[11px] shrink-0 ml-2">
                        {value !== null ? `${value}m` : 'N/A'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: barColor,
                          opacity: isSelected ? 1 : 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 2: Slope Gradient (degrees) */}
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <TrendingUp className="w-3.5 h-3.5 text-stone-600" />
                <span>Slope Gradient (Copernicus DEM)</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                Unit: degrees (°)
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {parameterData.map(d => {
                const isSelected = d.id === selectedHabitation.id;
                const value = d.slopeDegrees;
                const percent = value ? Math.round((value / maxValues.slope) * 100) : 0;
                const barColor = isSelected ? getUrgencyColor(d.hazardUrgency) : '#a8a29e';
                const isAboveCriticalSlope = value !== null && value >= 25;

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      const found = habitations.find(h => h.id === d.id);
                      if (found) onSelectHabitation(found);
                    }}
                    className={`p-1.5 rounded transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-white shadow-xs border border-stone-300 ring-1 ring-stone-900'
                        : 'hover:bg-white hover:border-stone-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate font-medium ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                          {d.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1 rounded bg-stone-900 text-white">
                            SELECTED
                          </span>
                        )}
                        {isAboveCriticalSlope && (
                          <span className="text-[8px] font-semibold text-amber-800 bg-amber-50 px-1 rounded border border-amber-200">
                            &gt;25° Steep
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-stone-800 text-[11px] shrink-0 ml-2">
                        {value !== null ? `${value.toFixed(1)}°` : 'N/A'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: barColor,
                          opacity: isSelected ? 1 : 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 3: Population Exposure (residents) */}
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <Users className="w-3.5 h-3.5 text-stone-600" />
                <span>Estimated Population Exposure</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                Unit: residents (persons)
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {parameterData.map(d => {
                const isSelected = d.id === selectedHabitation.id;
                const value = d.estimatedPopulation;
                const percent = value ? Math.round((value / maxValues.population) * 100) : 0;
                const barColor = isSelected ? getUrgencyColor(d.hazardUrgency) : '#a8a29e';

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      const found = habitations.find(h => h.id === d.id);
                      if (found) onSelectHabitation(found);
                    }}
                    className={`p-1.5 rounded transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-white shadow-xs border border-stone-300 ring-1 ring-stone-900'
                        : 'hover:bg-white hover:border-stone-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate font-medium ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                          {d.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1 rounded bg-stone-900 text-white">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-stone-800 text-[11px] shrink-0 ml-2">
                        {value !== null ? `${value.toLocaleString()} ppl` : 'N/A'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: barColor,
                          opacity: isSelected ? 1 : 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Chart 4: Building Structures Count */}
          <div className="p-3 rounded-lg border border-stone-200 bg-stone-50/50 space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900">
                <Home className="w-3.5 h-3.5 text-stone-600" />
                <span>Building Footprints Count</span>
              </div>
              <span className="text-[10px] font-mono text-stone-500 bg-white px-1.5 py-0.5 rounded border border-stone-200">
                Unit: structures (units)
              </span>
            </div>

            <div className="space-y-1.5 pt-1">
              {parameterData.map(d => {
                const isSelected = d.id === selectedHabitation.id;
                const value = d.buildingCount;
                const percent = value ? Math.round((value / maxValues.buildings) * 100) : 0;
                const barColor = isSelected ? getUrgencyColor(d.hazardUrgency) : '#a8a29e';

                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      const found = habitations.find(h => h.id === d.id);
                      if (found) onSelectHabitation(found);
                    }}
                    className={`p-1.5 rounded transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-white shadow-xs border border-stone-300 ring-1 ring-stone-900'
                        : 'hover:bg-white hover:border-stone-200 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className={`truncate font-medium ${isSelected ? 'text-stone-900 font-bold' : 'text-stone-700'}`}>
                          {d.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-bold px-1 rounded bg-stone-900 text-white">
                            SELECTED
                          </span>
                        )}
                      </div>
                      <span className="font-mono font-semibold text-stone-800 text-[11px] shrink-0 ml-2">
                        {value !== null ? `${value} bldgs` : 'N/A'}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: barColor,
                          opacity: isSelected ? 1 : 0.65,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Visualisation Mode 2: Pairwise Benchmark Comparison */}
      {comparisonMode === 'pairwise' && (
        <div className="p-4 rounded-lg border border-stone-200 bg-stone-50 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Selected Habitation Card */}
            <div className="p-3.5 rounded-lg bg-white border-2 border-stone-800 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                    Primary Subject
                  </span>
                  <h3 className="font-bold text-sm text-stone-900">{selectedHabitation.name}</h3>
                </div>
                <HazardUrgencyBadge urgency={selectedDatum.hazardUrgency} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Elevation</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {selectedDatum.elevationMeters !== null ? `${selectedDatum.elevationMeters}m MSL` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Slope Gradient</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {selectedDatum.slopeDegrees !== null ? `${selectedDatum.slopeDegrees.toFixed(1)}°` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Population</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {selectedDatum.estimatedPopulation !== null ? `${selectedDatum.estimatedPopulation.toLocaleString()} ppl` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Buildings</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {selectedDatum.buildingCount !== null ? `${selectedDatum.buildingCount} bldgs` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Benchmark Habitation Card */}
            <div className="p-3.5 rounded-lg bg-white border border-stone-300 space-y-2.5 shadow-xs">
              <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-stone-500">
                    Benchmark Reference
                  </span>
                  <h3 className="font-bold text-sm text-stone-900">{benchmarkHabitation.name}</h3>
                </div>
                <HazardUrgencyBadge urgency={benchmarkDatum.hazardUrgency} size="sm" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Elevation</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {benchmarkDatum.elevationMeters !== null ? `${benchmarkDatum.elevationMeters}m MSL` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Slope Gradient</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {benchmarkDatum.slopeDegrees !== null ? `${benchmarkDatum.slopeDegrees.toFixed(1)}°` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Population</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {benchmarkDatum.estimatedPopulation !== null ? `${benchmarkDatum.estimatedPopulation.toLocaleString()} ppl` : 'N/A'}
                  </span>
                </div>
                <div className="p-2 rounded bg-stone-50 border border-stone-200">
                  <span className="text-[10px] text-stone-500 block">Buildings</span>
                  <span className="font-mono font-bold text-stone-900 text-xs">
                    {benchmarkDatum.buildingCount !== null ? `${benchmarkDatum.buildingCount} bldgs` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Variance & Deltas Table */}
          <div className="p-3 rounded-lg bg-white border border-stone-200 space-y-2">
            <span className="font-semibold text-stone-900 text-xs block">
              Parameter Deltas ({selectedHabitation.name} relative to {benchmarkHabitation.name})
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              {/* Elevation Delta */}
              <div className="p-2 rounded bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Elevation Diff</span>
                {selectedDatum.elevationMeters !== null && benchmarkDatum.elevationMeters !== null ? (
                  <span
                    className={`font-mono font-bold ${
                      selectedDatum.elevationMeters >= benchmarkDatum.elevationMeters
                        ? 'text-amber-800'
                        : 'text-stone-700'
                    }`}
                  >
                    {selectedDatum.elevationMeters >= benchmarkDatum.elevationMeters ? '+' : ''}
                    {selectedDatum.elevationMeters - benchmarkDatum.elevationMeters}m
                  </span>
                ) : (
                  <span className="text-stone-400">N/A</span>
                )}
              </div>

              {/* Slope Delta */}
              <div className="p-2 rounded bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Slope Diff</span>
                {selectedDatum.slopeDegrees !== null && benchmarkDatum.slopeDegrees !== null ? (
                  <span
                    className={`font-mono font-bold ${
                      selectedDatum.slopeDegrees >= benchmarkDatum.slopeDegrees
                        ? 'text-rose-800'
                        : 'text-emerald-800'
                    }`}
                  >
                    {selectedDatum.slopeDegrees >= benchmarkDatum.slopeDegrees ? '+' : ''}
                    {(selectedDatum.slopeDegrees - benchmarkDatum.slopeDegrees).toFixed(1)}°
                  </span>
                ) : (
                  <span className="text-stone-400">N/A</span>
                )}
              </div>

              {/* Population Delta */}
              <div className="p-2 rounded bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Population Diff</span>
                {selectedDatum.estimatedPopulation !== null && benchmarkDatum.estimatedPopulation !== null ? (
                  <span className="font-mono font-bold text-stone-800">
                    {selectedDatum.estimatedPopulation >= benchmarkDatum.estimatedPopulation ? '+' : ''}
                    {selectedDatum.estimatedPopulation - benchmarkDatum.estimatedPopulation}
                  </span>
                ) : (
                  <span className="text-stone-400">N/A</span>
                )}
              </div>

              {/* Buildings Delta */}
              <div className="p-2 rounded bg-stone-50 border border-stone-200">
                <span className="text-[10px] text-stone-500 block">Building Diff</span>
                {selectedDatum.buildingCount !== null && benchmarkDatum.buildingCount !== null ? (
                  <span className="font-mono font-bold text-stone-800">
                    {selectedDatum.buildingCount >= benchmarkDatum.buildingCount ? '+' : ''}
                    {selectedDatum.buildingCount - benchmarkDatum.buildingCount}
                  </span>
                ) : (
                  <span className="text-stone-400">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Methodological Integrity Note & Data Sources Accordion */}
      <div className="space-y-2 pt-2 border-t border-stone-200">
        <button
          onClick={() => setShowMetadataInspector(!showMetadataInspector)}
          className="flex items-center justify-between w-full p-2 rounded bg-stone-50 hover:bg-stone-100 text-stone-700 text-[11px] font-medium transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-stone-500" />
            <span>Parameter Lineage, Coordinate Systems &amp; Sensor Sources</span>
          </div>
          {showMetadataInspector ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {showMetadataInspector && (
          <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-2 text-[11px] text-stone-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <strong className="text-stone-900 block">1. Terrain Elevation (m MSL)</strong>
                <span>Source: Shuttle Radar Topography Mission (SRTM) 30m Global DEM &amp; Survey of India Topographic Contours. Vertical datum: EGM96 Geoid.</span>
              </div>
              <div>
                <strong className="text-stone-900 block">2. Terrain Slope Gradient (degrees)</strong>
                <span>Source: Copernicus GLO-30 Digital Elevation Model, Tile N11_E076. Calculated via 3x3 finite difference gradient window. Slopes &gt;25° represent elevated gravitational hazard terrain.</span>
              </div>
              <div>
                <strong className="text-stone-900 block">3. Estimated Population Exposure</strong>
                <span>Source: Meppadi Grama Panchayat Electoral Rolls &amp; 2011 Census Ward Projections. Represents resident population exposure, not post-disaster headcount.</span>
              </div>
              <div>
                <strong className="text-stone-900 block">4. Building Footprints Count</strong>
                <span>Source: OpenStreetMap Community Cadastre &amp; Local Revenue Records (July 2024). Digitized building footprint polygons intersecting settlement buffer.</span>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-start gap-1.5 text-stone-500 text-[10px]">
              <Info className="w-3.5 h-3.5 shrink-0 text-[#233f33] mt-0.5" />
              <span>
                <strong>Methodological Disassociation:</strong> In SHELTERTRACE, measured parameters provide exposure context but do not replace direct physical observations. High population or high elevation alone does not artificially inflate Physical Hazard Urgency unless direct physical impact or severed access is verified.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
