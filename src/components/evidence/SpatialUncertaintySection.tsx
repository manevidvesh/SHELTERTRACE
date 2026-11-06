import { MapPin, Compass, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { Habitation } from '../../types/habitation';

interface SpatialUncertaintySectionProps {
  habitation: Habitation;
}

export function SpatialUncertaintySection({ habitation }: SpatialUncertaintySectionProps) {
  return (
    <div className="bg-white rounded-lg border border-stone-200 overflow-hidden shadow-xs text-xs p-4 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Compass className="w-4 h-4 text-[#233f33]" />
          <h3 className="font-semibold text-stone-900 text-xs tracking-tight">
            Spatial Uncertainty & Geometry Quality Inspector
          </h3>
        </div>
        <span className="text-[11px] text-stone-500">
          Coordinate Systems • Positional Tolerances • Intersection Lineage
        </span>
      </div>

      {/* Scientific Guardrail Callout */}
      <div className="p-3 rounded bg-amber-50/70 border border-amber-200/80 flex items-start gap-2.5 text-xs text-amber-900">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-semibold text-amber-950">
            Spatial Uncertainty Guardrail:
          </span>
          <p className="text-[11px] text-amber-800 leading-relaxed">
            Official mapping does NOT imply zero positional error. Regional landslide maps (e.g. 1:50,000 GSI NLSM) are designed for macro-scale catchment planning (±25m tolerance) and must not be treated as property boundary cadastre. Hand-drawn GeoJSON sketches in this MVP are strictly illustrative.
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
            item.name.includes('Cartosat') ? '±0.5m Ground Resolution' :
            item.name.includes('Copernicus') ? '±15m Grid Resolution' :
            item.name.includes('GSI') ? '±25m Regional Zonation' :
            item.category === 'ILLUSTRATIVE' ? 'Uncalibrated (Demonstration Sketch)' :
            'Accuracy Unknown / Not Documented'
          );

          return (
            <div
              key={item.id}
              className="p-3.5 rounded-md bg-stone-50 border border-stone-200 space-y-2 hover:bg-[#fbfaf8] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-stone-900 text-xs">{item.name}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-white text-stone-600 border border-stone-200">
                    {item.domain}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap text-[11px]">
                  <span className="px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200">
                    Origin: {origin}
                  </span>
                  <span className={`px-2 py-0.5 rounded border ${
                    quality === 'ACCURACY_DOCUMENTED' || quality === 'FIELD_VERIFIED'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : quality === 'KNOWN_LIMITATION'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}>
                    Quality: {quality}
                  </span>
                </div>
              </div>

              {/* Spatial Attributes Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
                <div className="p-2 rounded bg-white border border-stone-200">
                  <span className="text-stone-400 text-[10px] block">CRS</span>
                  <span className="text-stone-800 font-mono text-[10px]">{crs}</span>
                </div>
                <div className="p-2 rounded bg-white border border-stone-200">
                  <span className="text-stone-400 text-[10px] block">Positional Accuracy / Scale</span>
                  <span className="text-stone-800">{accuracy}</span>
                </div>
                <div className="p-2 rounded bg-white border border-stone-200">
                  <span className="text-stone-400 text-[10px] block">Intersection Relationship</span>
                  <span className={`font-medium ${
                    intersection === 'CONFIRMED_INTERSECTION' ? 'text-red-700' :
                    intersection === 'APPROXIMATE_INTERSECTION' ? 'text-amber-700' :
                    'text-stone-700'
                  }`}>
                    {intersection}
                  </span>
                </div>
              </div>

              {/* Documented Spatial Limitations */}
              {item.knownLimitations.length > 0 && (
                <div className="p-2 rounded bg-white border border-stone-200 text-[11px] text-stone-600 space-y-1">
                  <span className="text-amber-800 font-medium block flex items-center gap-1 text-[10px]">
                    <AlertTriangle className="w-3 h-3 text-amber-600" /> Documented Spatial Limitations:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 pl-1 text-[10px] text-stone-500">
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
      <div className="p-2.5 rounded bg-stone-50 border border-stone-200 text-[11px] text-stone-500 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
        <span className="flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-stone-400" />
          <span className="font-mono text-[10px]">Centroid: {habitation.centroid[0].toFixed(4)}°N, {habitation.centroid[1].toFixed(4)}°E (Elevation {habitation.elevationMeters}m MSL)</span>
        </span>
        <span>Datum: WGS84 Geodetic Reference</span>
      </div>
    </div>
  );
}
