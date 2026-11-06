import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import {
  OBSERVED_DEBRIS_FLOW_GEOJSON,
  MODELLED_SUSCEPTIBILITY_GEOJSON,
  RIVER_CORRIDOR_GEOJSON,
  CRITICAL_INFRASTRUCTURE_GEOJSON,
} from '../../data/wayanadGeoJson';
import { Layers } from 'lucide-react';

interface MapViewProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation | null;
  onSelectHabitation: (habitation: Habitation) => void;
}

export function MapView({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Layer visibility toggles
  const [showObservedDebris, setShowObservedDebris] = useState(true);
  const [showModelledSusc, setShowModelledSusc] = useState(true);
  const [showRiverAxis, setShowRiverAxis] = useState(true);
  const [showInfraPoints, setShowInfraPoints] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);

  // References to layer groups for toggling
  const debrisLayerRef = useRef<L.GeoJSON | null>(null);
  const suscLayerRef = useRef<L.GeoJSON | null>(null);
  const riverLayerRef = useRef<L.GeoJSON | null>(null);
  const infraLayerRef = useRef<L.GeoJSON | null>(null);
  const habitationMarkersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Wayanad Meppadi disaster zone: lat 11.538, lng 76.150, zoom 13
    const map = L.map(mapContainerRef.current, {
      center: [11.538, 76.150],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

    // Dark Matter tile layer for serious geospatial intelligence appearance
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map);

    // 1. Modelled Susceptibility Layer (Illustrative Approximation)
    const suscLayer = L.geoJSON(MODELLED_SUSCEPTIBILITY_GEOJSON as any, {
      style: {
        color: '#f59e0b',
        weight: 1.5,
        dashArray: '5, 5',
        fillColor: '#d97706',
        fillOpacity: 0.15,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.name}</strong><br/>Category: <span style="color:#f59e0b">ILLUSTRATIVE APPROXIMATION</span><br/>Source: ${feature.properties.sourceOrg}`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );
      },
    }).addTo(map);
    suscLayerRef.current = suscLayer;

    // 2. River Corridor Layer (OSM/Copernicus)
    const riverLayer = L.geoJSON(RIVER_CORRIDOR_GEOJSON as any, {
      style: {
        color: '#06b6d4',
        weight: 3,
        dashArray: '3, 4',
        opacity: 0.8,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.name}</strong><br/>Category: <span style="color:#06b6d4">DERIVED</span>`,
          { sticky: true }
        );
      },
    }).addTo(map);
    riverLayerRef.current = riverLayer;

    // 3. Observed Debris Flow Impact Footprint (Illustrative Approximation)
    const debrisLayer = L.geoJSON(OBSERVED_DEBRIS_FLOW_GEOJSON as any, {
      style: {
        color: '#e11d48',
        weight: 2.5,
        fillColor: '#f43f5e',
        fillOpacity: 0.35,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<div style="font-size:12px; font-weight:600; color:#fda4af;">${feature.properties.name}</div>
           <div style="font-size:11px; margin-top:2px;">Category: <span style="color:#fdba74; font-weight:bold;">ILLUSTRATIVE APPROXIMATION</span></div>
           <div style="font-size:10px; color:#cbd5e1; margin-top:2px;">${feature.properties.description}</div>`,
          { sticky: true }
        );
      },
    }).addTo(map);
    debrisLayerRef.current = debrisLayer;

    // 4. Critical Infrastructure Point (Severed Bridge)
    const infraLayer = L.geoJSON(CRITICAL_INFRASTRUCTURE_GEOJSON as any, {
      pointToLayer: (feature, latlng) => {
        const iconHtml = `
          <div class="flex items-center justify-center w-8 h-8 rounded-full bg-rose-600/90 text-white shadow-lg border-2 border-amber-300 animate-pulse cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-infra-icon',
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });
        return L.marker(latlng, { icon }).bindPopup(
          `<div style="font-size:12px; font-weight:bold; color:#fda4af;">${feature.properties.name}</div>
           <p style="font-size:11px; margin-top:4px; color:#e2e8f0;">${feature.properties.description}</p>
           <div style="font-size:10px; color:#94a3b8; margin-top:4px;">Date: ${feature.properties.date} | Category: ${feature.properties.category}</div>`
        );
      },
    }).addTo(map);
    infraLayerRef.current = infraLayer;

    // 5. Habitation Layer Group
    const markerGroup = L.layerGroup().addTo(map);
    habitationMarkersRef.current = markerGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Habitation Markers whenever habitations, results, or selectedHabitation changes
  useEffect(() => {
    if (!mapInstanceRef.current || !habitationMarkersRef.current) return;

    const markerGroup = habitationMarkersRef.current;
    markerGroup.clearLayers();

    if (!showHabitations) return;

    habitations.forEach(hab => {
      const result = resultsMap.get(hab.id);
      if (!result) return;

      const isSelected = selectedHabitation?.id === hab.id;

      // Color based on Hazard Urgency
      let pinColor = '#10b981'; // emerald
      let pulseRing = '';

      switch (result.hazardUrgency) {
        case 'URGENT':
          pinColor = '#f43f5e'; // rose
          pulseRing = 'ring-4 ring-rose-500/40 animate-pulse';
          break;
        case 'ELEVATED':
          pinColor = '#f59e0b'; // amber
          pulseRing = 'ring-2 ring-amber-500/40';
          break;
        case 'ROUTINE':
          pinColor = '#10b981'; // emerald
          break;
        case 'UNDETERMINED':
          pinColor = '#64748b'; // slate
          break;
      }

      // Epistemic quality accent border
      const qualityBorder = 
        result.evidenceQuality === 'CONFLICTING' ? 'border-purple-400' :
        result.evidenceQuality === 'INSUFFICIENT' ? 'border-zinc-400 border-dashed' :
        isSelected ? 'border-white scale-125 z-50 ring-4 ring-rose-400' : 'border-slate-900';

      const markerHtml = `
        <div class="relative group cursor-pointer">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-mono font-bold shadow-xl border-2 ${qualityBorder} ${pulseRing}" style="background-color: ${pinColor}">
            ${hab.name.charAt(0)}
          </div>
          ${
            isSelected
              ? `<div class="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full border border-slate-900"></div>`
              : ''
          }
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-habitation-marker',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });

      const marker = L.marker(hab.centroid, { icon: customIcon });

      // Click handler
      marker.on('click', () => {
        onSelectHabitation(hab);
      });

      // Tooltip displaying both Hazard Urgency and Evidence Quality
      marker.bindTooltip(
        `<div style="font-family:monospace; font-size:12px; font-weight:bold; color:#f8fafc;">${hab.name}</div>
         <div style="font-size:11px; color:${pinColor}; margin-top:2px; font-weight:600;">Hazard: ${result.hazardUrgency}</div>
         <div style="font-size:10px; color:#cbd5e1; margin-top:1px;">Quality: ${result.evidenceQuality}</div>
         <div style="font-size:10px; color:#94a3b8; margin-top:2px;">Buildings: ${hab.buildingCount} | Pop: ~${hab.estimatedPopulation}</div>
         <div style="font-size:10px; color:#cbd5e1; margin-top:3px; max-width:200px; line-height:1.2;">${result.primaryReason}</div>`,
        { direction: 'top', offset: [0, -14], opacity: 0.95 }
      );

      marker.addTo(markerGroup);
    });
  }, [habitations, resultsMap, selectedHabitation, showHabitations, onSelectHabitation]);

  // Pan to selected habitation when changed
  useEffect(() => {
    if (mapInstanceRef.current && selectedHabitation) {
      mapInstanceRef.current.panTo(selectedHabitation.centroid, {
        animate: true,
        duration: 0.8,
      });
    }
  }, [selectedHabitation]);

  // Layer toggle effects
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (debrisLayerRef.current) {
      if (showObservedDebris) {
        if (!mapInstanceRef.current.hasLayer(debrisLayerRef.current)) {
          debrisLayerRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(debrisLayerRef.current)) {
          mapInstanceRef.current.removeLayer(debrisLayerRef.current);
        }
      }
    }
  }, [showObservedDebris]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (suscLayerRef.current) {
      if (showModelledSusc) {
        if (!mapInstanceRef.current.hasLayer(suscLayerRef.current)) {
          suscLayerRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(suscLayerRef.current)) {
          mapInstanceRef.current.removeLayer(suscLayerRef.current);
        }
      }
    }
  }, [showModelledSusc]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (riverLayerRef.current) {
      if (showRiverAxis) {
        if (!mapInstanceRef.current.hasLayer(riverLayerRef.current)) {
          riverLayerRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(riverLayerRef.current)) {
          riverLayerRef.current.removeLayer(riverLayerRef.current);
        }
      }
    }
  }, [showRiverAxis]);

  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (infraLayerRef.current) {
      if (showInfraPoints) {
        if (!mapInstanceRef.current.hasLayer(infraLayerRef.current)) {
          infraLayerRef.current.addTo(mapInstanceRef.current);
        }
      } else {
        if (mapInstanceRef.current.hasLayer(infraLayerRef.current)) {
          mapInstanceRef.current.removeLayer(infraLayerRef.current);
        }
      }
    }
  }, [showInfraPoints]);

  return (
    <div className="relative w-full h-full rounded-lg border border-slate-800 overflow-hidden bg-slate-950">
      {/* Map DOM target */}
      <div ref={mapContainerRef} className="w-full h-full min-h-[480px]" />

      {/* Layer Control Panel (Top-Right) */}
      <div className="absolute top-3 right-3 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-2.5 shadow-xl text-xs max-w-[240px]">
        <div className="flex items-center gap-1.5 text-slate-300 font-mono font-semibold pb-1.5 mb-1.5 border-b border-slate-800">
          <Layers className="w-3.5 h-3.5 text-rose-400" />
          <span>Geospatial Layers</span>
        </div>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-slate-100">
            <input
              type="checkbox"
              checked={showObservedDebris}
              onChange={e => setShowObservedDebris(e.target.checked)}
              className="accent-rose-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-rose-500/80 border border-rose-400"></span>
              <span className="truncate">Approx. Debris Flow Track</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-slate-100">
            <input
              type="checkbox"
              checked={showModelledSusc}
              onChange={e => setShowModelledSusc(e.target.checked)}
              className="accent-amber-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/30 border border-amber-500 border-dashed"></span>
              <span className="truncate">Approx. Susceptibility Flank</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-slate-100">
            <input
              type="checkbox"
              checked={showRiverAxis}
              onChange={e => setShowRiverAxis(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-cyan-400"></span>
              <span className="truncate">River Axis (OSM)</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-slate-100">
            <input
              type="checkbox"
              checked={showInfraPoints}
              onChange={e => setShowInfraPoints(e.target.checked)}
              className="accent-rose-600 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600"></span>
              <span className="truncate">Severed Bridge Point</span>
            </span>
          </label>

          <label className="flex items-center gap-2 text-slate-300 cursor-pointer hover:text-slate-100">
            <input
              type="checkbox"
              checked={showHabitations}
              onChange={e => setShowHabitations(e.target.checked)}
              className="accent-sky-500 rounded"
            />
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-400"></span>
              <span className="truncate">Habitation Centroids</span>
            </span>
          </label>
        </div>
      </div>

      {/* Map Legend Overlay (Bottom-Left) */}
      <div className="absolute bottom-4 left-4 z-[1000] bg-slate-900/90 backdrop-blur border border-slate-800 rounded-lg p-3 shadow-2xl text-[11px] max-w-[320px]">
        <div className="font-mono font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center justify-between border-b border-slate-800 pb-1">
          <span>Map Evidence Legend</span>
          <span className="text-[10px] text-amber-400 font-mono">Illustrative Geometry</span>
        </div>

        <div className="space-y-1.5 text-slate-300">
          <div className="flex items-start gap-2">
            <div className="w-3.5 h-3.5 rounded bg-rose-500/80 border border-rose-300 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-rose-300">Debris Flow Corridor (Approx. 25 Vertices)</div>
              <div className="text-[10px] text-slate-400">Digitized from published NRSC Cartosat-3 event figures; not raw GIS shapefile</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3.5 h-3.5 rounded bg-amber-500/20 border border-amber-400 border-dashed shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-300">Susceptibility Zone (Approx. 8 Vertices)</div>
              <div className="text-[10px] text-slate-400">Approximates GSI NLSM High Susceptibility mountain flank</div>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-3.5 h-1 bg-cyan-400 shrink-0 mt-1.5" />
            <div>
              <div className="font-semibold text-cyan-300">River Corridor (OSM Centerline)</div>
              <div className="text-[10px] text-slate-400">Iruvaipuzha river drainage path</div>
            </div>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80">
          <div className="text-[10px] font-mono text-slate-400 uppercase mb-1">Pin Color: Hazard Urgency</div>
          <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-500"></span> Urgent Hazard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> Elevated Hazard
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-slate-500"></span> Undetermined
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Routine Baseline
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
