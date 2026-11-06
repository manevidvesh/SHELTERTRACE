import { MapPin, Compass, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { Habitation } from '../../types/habitation';

interface SpatialUncertaintySectionProps {
  habitation: Habitation;
}

export function SpatialUncertaintySection({ habitation }: SpatialUncertaintySectionProps) {
  return (
    <div className="bg-slate-900/90 rounded-lg border border-slate-800 overflow-hidden shadow-xl text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <h3 className="font-mono font-bold uppercase tracking-wider text-slate-100 text-xs">
            Spatial Uncertainty & Geometry Quality Inspector
          </h3>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          CRS • Positional Accuracy • Origin & Intersection Lineage
        </span>
      </div>

      {/* Mandatory Scientific Guardrail */}
      <div className="p-3 rounded-lg bg-rose-950/30 border border-rose-900/50 flex items-start gap-2.5 text-[11px] text-rose-200">
        <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-mono font-bold text-rose-300">
            Spatial Uncertainty Guardrail:
          </span>
          <p className="leading-relaxed">
            Government or official mapping does NOT equate to zero positional error. Regional landslide maps (1:50,000 GSI NLSM) are designed for macro-scale catchment planning (±25m tolerance) and must not be treated as property boundary cadastre. Hand-drawn GeoJSON sketches in this MVP are strictly illustrative.
          </p>
        </div>
      </div>

      {/* Spatial Feature Breakdown */}
      <div className="space-y-3">
        {habitation.evidence.map((item) => {
          const origin = item.geometryOrigin || (
            item.category === 'OBSERVED' ? 'IMAGERY_DERIVED' :
            item.category === 'MODELLED' ? 'OFFICIALLY_MAPPED' :
            item.category === 'ILLUSTRATIVE' ? 'APPROXIMATE_ILLUSTRATIVE' : 'FIELD_SURVEYED'
          );

          const quality = item.geometryQuality || (
            item.status === 'COMPLETE' ? 'ACCURACY_DOCUMENTED' :
            item.category === 'ILLUSTRATIVE' ? 'KNOWN_LIMITATION' : 'ACCURACY_UNKNOWN'
          );

          const intersection = item.spatialIntersectionType || (
            item.finding.toLowerCase().includes('direct intersection') ? 'CONFIRMED_INTERSECTION' :
            item.finding.toLowerCase().includes('outside') ? 'PROXIMITY_BASED' :
            item.category === 'ILLUSTRATIVE' ? 'APPROXIMATE_INTERSECTION' : 'PROXIMITY_BASED'
          );

          const crs = item.coordinateReferenceSystem || 'EPSG:4326 (WGS84 Spherical Geographic)';
          const accuracy = item.positionalAccuracy || (
            item.name.includes('Cartosat') ? '±0.5m Panchromatic Ground Resolution' :
            item.name.includes('Copernicus') ? '±15m Horizontal Grid Resolution' :
            item.name.includes('GSI') ? '±25m Regional Macro-Zonation Scale' :
            item.category === 'ILLUSTRATIVE' ? 'Uncalibrated (Demonstration Sketch Geometry)' :
            'Accuracy Unknown / Not Documented'
          );

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-bold text-slate-100 text-xs">{item.name}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    {item.domain}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Origin Badge */}
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-950/70 text-sky-300 border border-sky-800">
                    Origin: {origin}
                  </span>
                  {/* Quality Badge */}
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                    quality === 'ACCURACY_DOCUMENTED' || quality === 'FIELD_VERIFIED'
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-800'
                      : quality === 'KNOWN_LIMITATION'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                      : 'bg-zinc-900 text-zinc-400 border-zinc-700'
                  }`}>
                    Quality: {quality}
                  </span>
                </div>
              </div>

              {/* Spatial Attributes Table */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] font-mono pt-1">
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Coordinate Reference System</span>
                  <span className="text-slate-200">{crs}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Positional Accuracy / Scale</span>
                  <span className="text-slate-200">{accuracy}</span>
                </div>
                <div className="p-2 rounded bg-slate-900/60 border border-slate-800/80">
                  <span className="text-slate-500 text-[10px] block">Spatial Intersection Type</span>
                  <span className={`font-bold ${
                    intersection === 'CONFIRMED_INTERSECTION' ? 'text-rose-400' :
                    intersection === 'APPROXIMATE_INTERSECTION' ? 'text-amber-400' :
                    'text-slate-300'
                  }`}>
                    {intersection}
                  </span>
                </div>
              </div>

              {/* Documented Spatial Limitations */}
              {item.knownLimitations.length > 0 && (
                <div className="p-2 rounded bg-slate-900/40 border border-slate-800/60 text-[10px] text-slate-400 space-y-1">
                  <span className="font-mono text-amber-400 font-bold block flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Documented Spatial Limitations:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 pl-1">
                    {item.knownLimitations.map((lim, idx) => (
                      <li key={idx} className="leading-snug">{lim}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Geometry Origin Footnote */}
      <div className="p-2.5 rounded bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-400 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-sky-400" />
          <span>Centroid: {habitation.centroid[0].toFixed(4)}°N, {habitation.centroid[1].toFixed(4)}°E (Elevation {habitation.elevationMeters}m MSL)</span>
        </span>
        <span className="text-slate-500">Vector Lineage: WGS84 Geodetic Datum</span>
      </div>
    </div>
  );
}
