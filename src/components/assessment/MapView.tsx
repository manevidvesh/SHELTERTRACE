import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import {
  OBSERVED_DEBRIS_FLOW_GEOJSON,
  MODELLED_SUSCEPTIBILITY_GEOJSON,
  RIVER_CORRIDOR_GEOJSON,
  CRITICAL_INFRASTRUCTURE_GEOJSON,
} from '../../data/wayanadGeoJson';
import { Layers, ChevronDown, ChevronUp, RotateCcw, Info } from 'lucide-react';

interface MapViewProps {
  habitations: Habitation[];
  resultsMap: Map<string, PrioritisationResult>;
  selectedHabitation: Habitation | null;
  onSelectHabitation: (habitation: Habitation) => void;
}

// Center and bounds encompassing all Wayanad settlements and disaster vectors
const WAYANAD_CENTER: [number, number] = [11.538, 76.148];
const WAYANAD_DEFAULT_ZOOM = 13;

export function MapView({
  habitations,
  resultsMap,
  selectedHabitation,
  onSelectHabitation,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  // Basemap selection (verified legitimate keyless providers with zero watermarks)
  const [activeBasemap, setActiveBasemap] = useState<'topo' | 'osm'>('topo');

  // Layer visibility toggles
  const [showObservedDebris, setShowObservedDebris] = useState(true);
  const [showModelledSusc, setShowModelledSusc] = useState(true);
  const [showRiverAxis, setShowRiverAxis] = useState(true);
  const [showInfraPoints, setShowInfraPoints] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);

  // UI state for dropdown and legend
  const [isLayersOpen, setIsLayersOpen] = useState(false);
  const [isLegendOpen, setIsLegendOpen] = useState(true);

  // References to layer groups for toggling
  const topoLayerRef = useRef<L.TileLayer | null>(null);
  const osmLayerRef = useRef<L.TileLayer | null>(null);
  const debrisLayerRef = useRef<L.GeoJSON | null>(null);
  const suscLayerRef = useRef<L.GeoJSON | null>(null);
  const riverLayerRef = useRef<L.GeoJSON | null>(null);
  const infraLayerRef = useRef<L.GeoJSON | null>(null);
  const habitationMarkersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center on Wayanad Meppadi disaster zone: lat 11.538, lng 76.148, zoom 13
    const map = L.map(mapContainerRef.current, {
      center: WAYANAD_CENTER,
      zoom: WAYANAD_DEFAULT_ZOOM,
      zoomControl: false, // Repositioned to bottomright to avoid drawer collision
      attributionControl: true,
    });

    // Add zoom control at bottomright
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 1. Esri World Topographic Map (Default: legitimate keyless public topographic service showing relief & contours)
    const topoLayer = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      {
        attribution:
          'Tiles &copy; Esri &mdash; Sources: Esri, USGS, NOAA, DeLorme, &copy; OpenStreetMap contributors',
        maxZoom: 19,
      }
    );
    topoLayerRef.current = topoLayer;

    // 2. OpenStreetMap Standard (Alternative: keyless global open community cartography)
    const osmLayer = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }
    );
    osmLayerRef.current = osmLayer;

    // Add default basemap
    topoLayer.addTo(map);

    // 1. Modelled Susceptibility Layer (Illustrative Approximation)
    const suscLayer = L.geoJSON(MODELLED_SUSCEPTIBILITY_GEOJSON as any, {
      style: {
        color: '#b45309',
        weight: 1.5,
        dashArray: '6, 4',
        fillColor: '#f59e0b',
        fillOpacity: 0.10,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size:11px; line-height: 1.4;">
            <div style="font-weight:700; color:#b45309;">${feature.properties.name}</div>
            <div style="font-size:10px; font-weight:600; color:#d97706; margin-top:2px;">
              [ILLUSTRATIVE APPROXIMATION] 8 vertices
            </div>
            <div style="color:#44403c; margin-top:3px; max-width:220px;">
              ${feature.properties.description}
            </div>
            <div style="font-size:9px; color:#78716c; margin-top:4px;">
              Source: ${feature.properties.sourceOrg} (${feature.properties.sourceRef})
            </div>
          </div>`,
          { sticky: true }
        );
      },
    }).addTo(map);
    suscLayerRef.current = suscLayer;

    // 2. River Corridor Layer (OSM/Copernicus Hydrology - Iruvaipuzha Axis)
    const riverLayer = L.geoJSON(RIVER_CORRIDOR_GEOJSON as any, {
      style: {
        color: '#0284c7',
        weight: 2.5,
        dashArray: '6, 4',
        opacity: 0.85,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size:11px; line-height: 1.4;">
            <div style="font-weight:700; color:#0284c7;">${feature.properties.name}</div>
            <div style="font-size:10px; font-weight:600; color:#0369a1; margin-top:2px;">
              [DERIVED] Hydrological Centerline
            </div>
            <div style="color:#44403c; margin-top:3px; max-width:220px;">
              ${feature.properties.description}
            </div>
            <div style="font-size:9px; color:#78716c; margin-top:4px;">
              Lineage: OpenStreetMap Hydrology &amp; SRTM Terrain
            </div>
          </div>`,
          { sticky: true }
        );
      },
    }).addTo(map);
    riverLayerRef.current = riverLayer;

    // 3. Observed Debris Flow Impact Footprint (Illustrative Approximation)
    const debrisLayer = L.geoJSON(OBSERVED_DEBRIS_FLOW_GEOJSON as any, {
      style: {
        color: '#991b1b',
        weight: 1.5,
        dashArray: '4, 3',
        fillColor: '#ef4444',
        fillOpacity: 0.16,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<div style="font-family: sans-serif; font-size:11px; line-height: 1.4;">
            <div style="font-weight:700; color:#991b1b;">${feature.properties.name}</div>
            <div style="font-size:10px; font-weight:600; color:#b91c1c; margin-top:2px;">
              [ILLUSTRATIVE APPROXIMATION] 25 vertices
            </div>
            <div style="color:#44403c; margin-top:3px; max-width:220px;">
              ${feature.properties.description}
            </div>
            <div style="font-size:9px; color:#78716c; margin-top:4px;">
              Event: 30 July 2024 &bull; Approx. Runout Envelope
            </div>
          </div>`,
          { sticky: true }
        );
      },
    }).addTo(map);
    debrisLayerRef.current = debrisLayer;

    // 4. Critical Infrastructure Point (Severed Bridge)
    const infraLayer = L.geoJSON(CRITICAL_INFRASTRUCTURE_GEOJSON as any, {
      pointToLayer: (feature, latlng) => {
        const iconHtml = `
          <div style="position: absolute; left: 0; top: 0; transform: translate(-50%, -50%);" class="group cursor-pointer">
            <div class="flex items-center justify-center w-7 h-7 rounded-full bg-red-700 text-white shadow-md border-2 border-white ring-2 ring-red-300">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded bg-red-900/90 text-white text-[9px] font-bold tracking-tight shadow-xs whitespace-nowrap text-center">
              Severed Bridge
            </div>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-infra-icon',
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });
        return L.marker(latlng, { icon }).bindPopup(
          `<div style="font-family: sans-serif; font-size:12px; line-height: 1.4;">
            <div style="font-weight:700; color:#1c1917;">${feature.properties.name}</div>
            <div style="font-size:10px; font-weight:600; color:#b91c1c; margin-top:2px;">[OBSERVED GROUND IMPACT] Critical Bottleneck</div>
            <p style="font-size:11px; margin-top:4px; color:#44403c;">${feature.properties.description}</p>
            <div style="font-size:10px; color:#78716c; margin-top:4px;">Date: ${feature.properties.date} | Category: ${feature.properties.category}</div>
          </div>`
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

  // Basemap switching effect
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !topoLayerRef.current || !osmLayerRef.current) return;

    if (activeBasemap === 'topo') {
      if (map.hasLayer(osmLayerRef.current)) {
        map.removeLayer(osmLayerRef.current);
      }
      if (!map.hasLayer(topoLayerRef.current)) {
        map.addLayer(topoLayerRef.current);
      }
    } else {
      if (map.hasLayer(topoLayerRef.current)) {
        map.removeLayer(topoLayerRef.current);
      }
      if (!map.hasLayer(osmLayerRef.current)) {
        map.addLayer(osmLayerRef.current);
      }
    }
  }, [activeBasemap]);

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

      // Color and symbol based on Physical Hazard Urgency
      let pinColor = '#2d6a4f'; // forest green
      let urgencyGlyph = '✓';
      switch (result.hazardUrgency) {
        case 'URGENT':
          pinColor = '#b91c1c'; // crimson
          urgencyGlyph = '!';
          break;
        case 'ELEVATED':
          pinColor = '#d97706'; // ochre
          urgencyGlyph = '▲';
          break;
        case 'ROUTINE':
          pinColor = '#2d6a4f'; // forest green
          urgencyGlyph = '✓';
          break;
        case 'UNDETERMINED':
          pinColor = '#57534e'; // stone grey
          urgencyGlyph = '?';
          break;
      }

      // Border style based on Epistemic Evidence Quality
      let qualityBorderStyle = 'border-2 border-white shadow-xs';
      if (result.evidenceQuality === 'CONFLICTING') {
        qualityBorderStyle = 'border-2 border-rose-500 ring-2 ring-rose-200';
      } else if (result.evidenceQuality === 'INSUFFICIENT') {
        qualityBorderStyle = 'border-2 border-dashed border-stone-400';
      } else if (result.evidenceQuality === 'PARTIAL') {
        qualityBorderStyle = 'border-2 border-stone-200';
      }

      // Distinct styling for synthetic demonstration fixtures vs authentic records
      const isSynthetic = hab.isIllustrativeRecord;
      const syntheticPinClass = isSynthetic ? 'border-dashed' : '';

      // Prominent selected state
      const selectedPinStyles = isSelected
        ? 'ring-4 ring-stone-900/60 ring-offset-2 scale-110 shadow-xl'
        : 'hover:scale-105';

      const labelStyles = isSelected
        ? 'bg-stone-900 text-white font-bold border-stone-900 shadow-md scale-105'
        : 'bg-white/95 text-stone-800 font-semibold border-stone-200/90 shadow-xs hover:border-stone-400';

      const markerHtml = `
        <div style="position: absolute; left: 0; top: 0; transform: translate(-50%, -13px); pointer-events: auto;" class="flex flex-col items-center group cursor-pointer transition-transform ${isSelected ? 'z-[1000]' : 'z-[500]'}">
          <div class="relative w-[26px] h-[26px] rounded-full flex items-center justify-center text-white text-[11px] font-sans font-bold ${qualityBorderStyle} ${syntheticPinClass} ${selectedPinStyles} transition-all duration-150" style="background-color: ${pinColor};">
            <span style="line-height: 1;">${urgencyGlyph}</span>
            ${
              isSelected
                ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-stone-900 rounded-full border-2 border-white"></div>`
                : ''
            }
          </div>
          <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] tracking-tight border flex items-center gap-1 transition-colors whitespace-nowrap pointer-events-none ${labelStyles}">
            <span>${hab.name}</span>
            ${
              isSynthetic
                ? `<span class="text-[8px] font-bold px-1 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-300">DEMO</span>`
                : ''
            }
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: markerHtml,
        className: 'custom-habitation-marker',
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker(hab.centroid, { icon: customIcon });

      if (isSelected) {
        marker.setZIndexOffset(1000);
      } else {
        marker.setZIndexOffset(100);
      }

      marker.on('click', () => {
        onSelectHabitation(hab);
      });

      marker.bindTooltip(
        `<div style="font-family: sans-serif; font-size:11px; line-height: 1.4;">
          <div style="display:flex; align-items:center; justify-content:space-between; gap:8px;">
            <strong style="font-size:12px; color:#1c1917;">${hab.name}</strong>
            ${isSynthetic ? '<span style="font-size:9px; background:#fef3c7; color:#92400e; padding:1px 4px; border-radius:3px; border:1px solid #fde68a; font-weight:700;">DEMO RECORD</span>' : ''}
          </div>
          <div style="font-size:10px; color:#78716c; margin-top:2px;">${hab.localAdministrativeUnit} &bull; ${hab.elevationMeters}m MSL</div>
          <div style="margin-top:4px; padding:3px 6px; background:#f5f5f4; border-radius:4px; font-size:10px; border:1px solid #e7e5e4;">
            <span style="font-weight:600; color:#44403c;">Urgency:</span> <strong style="color:${pinColor}">${result.hazardUrgency}</strong> &bull; 
            <span style="font-weight:600; color:#44403c;">Evidence:</span> <strong>${result.evidenceQuality}</strong>
          </div>
          <div style="font-size:10px; color:#57534e; margin-top:4px; max-width:240px;">
            ${result.primaryReason}
          </div>
        </div>`,
        { sticky: true, offset: [0, -10] }
      );

      markerGroup.addLayer(marker);
    });
  }, [habitations, resultsMap, selectedHabitation, showHabitations, onSelectHabitation]);

  // Center on selected habitation if changed
  useEffect(() => {
    if (!mapInstanceRef.current || !selectedHabitation) return;
    mapInstanceRef.current.panTo(selectedHabitation.centroid, { animate: true });
  }, [selectedHabitation]);

  // Toggle layer handlers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (debrisLayerRef.current) {
      if (showObservedDebris) map.addLayer(debrisLayerRef.current);
      else map.removeLayer(debrisLayerRef.current);
    }
    if (suscLayerRef.current) {
      if (showModelledSusc) map.addLayer(suscLayerRef.current);
      else map.removeLayer(suscLayerRef.current);
    }
    if (riverLayerRef.current) {
      if (showRiverAxis) map.addLayer(riverLayerRef.current);
      else map.removeLayer(riverLayerRef.current);
    }
    if (infraLayerRef.current) {
      if (showInfraPoints) map.addLayer(infraLayerRef.current);
      else map.removeLayer(infraLayerRef.current);
    }
  }, [showObservedDebris, showModelledSusc, showRiverAxis, showInfraPoints]);

  // Reset view to disaster extent
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView(WAYANAD_CENTER, WAYANAD_DEFAULT_ZOOM, { animate: true });
  };

  // Count active vector layers for the badge
  const activeOverlayCount = [
    showHabitations,
    showObservedDebris,
    showModelledSusc,
    showRiverAxis,
    showInfraPoints,
  ].filter(Boolean).length;

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Canvas */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Top Right: Layer Controls & Extent Reset */}
      <div className="absolute top-3 right-3 z-[1000] flex items-center gap-2">
        {/* Reset Extent Button */}
        <button
          onClick={handleResetView}
          className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs border border-stone-300 text-stone-700 hover:text-stone-900 rounded-md shadow-xs text-xs font-medium hover:bg-stone-50 cursor-pointer transition-colors"
          title="Reset map view to complete Wayanad disaster zone"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset View</span>
        </button>

        {/* Layer Visibility Control Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/95 backdrop-blur-xs border border-stone-300 text-stone-800 rounded-md shadow-xs text-xs font-medium hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Map Layers</span>
            <span className="px-1.5 py-0.2 rounded-full bg-stone-100 text-stone-700 text-[10px] font-semibold border border-stone-200">
              {activeOverlayCount}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {isLayersOpen && (
            <div className="absolute right-0 mt-1 w-68 bg-white border border-stone-200 rounded-lg shadow-xl p-3 text-xs space-y-3 text-stone-700 z-[1010]">
              {/* Basemap Selection */}
              <div className="space-y-1.5">
                <div className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider">
                  Basemap Cartography
                </div>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-100 rounded-md border border-stone-200">
                  <button
                    onClick={() => setActiveBasemap('topo')}
                    className={`py-1 px-2 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      activeBasemap === 'topo'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Topo Relief (Esri)
                  </button>
                  <button
                    onClick={() => setActiveBasemap('osm')}
                    className={`py-1 px-2 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                      activeBasemap === 'osm'
                        ? 'bg-white text-stone-900 shadow-xs'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    Standard (OSM)
                  </button>
                </div>
              </div>

              {/* Overlays */}
              <div className="space-y-2 pt-2 border-t border-stone-100">
                <div className="font-semibold text-stone-900 text-[11px] uppercase tracking-wider">
                  Geospatial Overlays
                </div>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showHabitations}
                    onChange={e => setShowHabitations(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#233f33]" />
                  <span>Habitation Sites (9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showObservedDebris}
                    onChange={e => setShowObservedDebris(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-red-200 border border-red-700" />
                  <span className="truncate">Debris Corridor (Approx 25-pt)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showModelledSusc}
                    onChange={e => setShowModelledSusc(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-600 border-dashed" />
                  <span className="truncate">Susceptibility Zone (GSI NLSM)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showRiverAxis}
                    onChange={e => setShowRiverAxis(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-600" />
                  <span className="truncate">Iruvaipuzha River Axis (Derived)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showInfraPoints}
                    onChange={e => setShowInfraPoints(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0 cursor-pointer"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                  <span className="truncate">Severed Chooralmala Bridge</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Left: Dynamic Collapsible Cartographic Legend */}
      <div className="absolute bottom-3 left-3 z-[990] max-w-[280px]">
        {isLegendOpen ? (
          <div className="bg-white/95 backdrop-blur-xs border border-stone-300 rounded-lg shadow-lg p-3 text-xs space-y-2.5 max-h-[360px] overflow-y-auto">
            <div className="flex items-center justify-between pb-1.5 border-b border-stone-200">
              <div className="flex items-center gap-1.5 font-semibold text-stone-900 text-[11px] uppercase tracking-wider">
                <Info className="w-3.5 h-3.5 text-stone-600" />
                <span>Map Symbology</span>
              </div>
              <button
                onClick={() => setIsLegendOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-0.5 rounded cursor-pointer"
                title="Collapse Legend"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Settlements Legend */}
            {showHabitations && (
              <div className="space-y-1.5">
                <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                  Hazard Urgency (Fill &amp; Glyph)
                </div>
                <div className="grid grid-cols-2 gap-1 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#b91c1c] text-white text-[9px] font-bold flex items-center justify-center">
                      !
                    </span>
                    <span className="text-stone-700">Urgent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#d97706] text-white text-[9px] font-bold flex items-center justify-center">
                      ▲
                    </span>
                    <span className="text-stone-700">Elevated</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#2d6a4f] text-white text-[9px] font-bold flex items-center justify-center">
                      ✓
                    </span>
                    <span className="text-stone-700">Routine</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3.5 h-3.5 rounded-full bg-[#57534e] text-white text-[9px] font-bold flex items-center justify-center">
                      ?
                    </span>
                    <span className="text-stone-700">Undetermined</span>
                  </div>
                </div>

                <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider pt-1 border-t border-stone-100">
                  Evidence Quality (Border)
                </div>
                <div className="space-y-0.5 text-[10px] text-stone-600">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400 border border-white" />
                    <span>Complete / Verified</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400 border border-stone-500 border-dashed" />
                    <span>Insufficient Baseline Layer</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-stone-400 border border-rose-500" />
                    <span>Conflicting Field Reports</span>
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[8px] font-bold px-1 rounded bg-amber-100 text-amber-800 border border-amber-300">
                      DEMO
                    </span>
                    <span>Synthetic Demonstration Record</span>
                  </div>
                </div>
              </div>
            )}

            {/* Active Overlays Legend */}
            <div className="space-y-1 pt-1.5 border-t border-stone-200">
              <div className="text-[10px] font-semibold text-stone-500 uppercase tracking-wider">
                Active Features &amp; Lineage
              </div>

              {showObservedDebris && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-700">
                  <span className="w-3 h-2 rounded bg-red-200 border border-red-700 border-dashed shrink-0" />
                  <span className="truncate">
                    <strong>Debris Corridor</strong> &bull; <span className="text-red-700 font-semibold">[ILLUSTRATIVE]</span>
                  </span>
                </div>
              )}

              {showModelledSusc && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-700">
                  <span className="w-3 h-2 rounded bg-amber-100 border border-amber-600 border-dashed shrink-0" />
                  <span className="truncate">
                    <strong>Susceptibility</strong> &bull; <span className="text-amber-700 font-semibold">[ILLUSTRATIVE]</span>
                  </span>
                </div>
              )}

              {showRiverAxis && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-700">
                  <span className="w-3 h-0.5 bg-sky-600 border-t border-dashed border-sky-400 shrink-0" />
                  <span className="truncate">
                    <strong>Iruvaipuzha Axis</strong> &bull; <span className="text-sky-700 font-semibold">[DERIVED]</span>
                  </span>
                </div>
              )}

              {showInfraPoints && (
                <div className="flex items-center gap-1.5 text-[10px] text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700 shrink-0" />
                  <span className="truncate">
                    <strong>Severed Bridge</strong> &bull; <span className="text-stone-900 font-semibold">[OBSERVED]</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsLegendOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/95 backdrop-blur-xs border border-stone-300 text-stone-800 rounded-md shadow-xs text-xs font-medium hover:bg-stone-50 cursor-pointer transition-colors"
          >
            <Info className="w-3.5 h-3.5 text-stone-600" />
            <span>Map Legend</span>
            <ChevronUp className="w-3.5 h-3.5 text-stone-500" />
          </button>
        )}
      </div>
    </div>
  );
}
