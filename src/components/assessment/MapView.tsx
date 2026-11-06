import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import type { Habitation, PrioritisationResult } from '../../types/habitation';
import {
  OBSERVED_DEBRIS_FLOW_GEOJSON,
  MODELLED_SUSCEPTIBILITY_GEOJSON,
  RIVER_CORRIDOR_GEOJSON,
  CRITICAL_INFRASTRUCTURE_GEOJSON,
} from '../../data/wayanadGeoJson';
import { Layers, ChevronDown } from 'lucide-react';

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

  // Basemap selection (verified legitimate keyless providers)
  const [activeBasemap, setActiveBasemap] = useState<'topo' | 'osm'>('topo');

  // Layer visibility toggles
  const [showObservedDebris, setShowObservedDebris] = useState(true);
  const [showModelledSusc, setShowModelledSusc] = useState(true);
  const [showRiverAxis, setShowRiverAxis] = useState(true);
  const [showInfraPoints, setShowInfraPoints] = useState(true);
  const [showHabitations, setShowHabitations] = useState(true);
  const [isLayersOpen, setIsLayersOpen] = useState(false);

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

    // Center on Wayanad Meppadi disaster zone: lat 11.538, lng 76.150, zoom 13
    const map = L.map(mapContainerRef.current, {
      center: [11.538, 76.150],
      zoom: 13,
      zoomControl: true,
      attributionControl: true,
    });

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
        dashArray: '4, 4',
        fillColor: '#d97706',
        fillOpacity: 0.12,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.name}</strong><br/>Category: <span style="color:#b45309">ILLUSTRATIVE APPROXIMATION</span><br/>Source: ${feature.properties.sourceOrg}`,
          { sticky: true }
        );
      },
    }).addTo(map);
    suscLayerRef.current = suscLayer;

    // 2. River Corridor Layer (OSM/Copernicus)
    const riverLayer = L.geoJSON(RIVER_CORRIDOR_GEOJSON as any, {
      style: {
        color: '#0284c7',
        weight: 2.5,
        dashArray: '3, 4',
        opacity: 0.7,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.name}</strong><br/>Category: DERIVED (River drainage corridor)`,
          { sticky: true }
        );
      },
    }).addTo(map);
    riverLayerRef.current = riverLayer;

    // 3. Observed Debris Flow Impact Footprint (Illustrative Approximation)
    const debrisLayer = L.geoJSON(OBSERVED_DEBRIS_FLOW_GEOJSON as any, {
      style: {
        color: '#b91c1c',
        weight: 1.5,
        fillColor: '#dc2626',
        fillOpacity: 0.20,
      },
      onEachFeature: (feature, layer) => {
        layer.bindTooltip(
          `<strong>${feature.properties.name}</strong><br/>Category: <span style="color:#b91c1c">ILLUSTRATIVE DEBRIS FOOTPRINT</span><br/>${feature.properties.description}`,
          { sticky: true }
        );
      },
    }).addTo(map);
    debrisLayerRef.current = debrisLayer;

    // 4. Critical Infrastructure Point (Severed Bridge)
    const infraLayer = L.geoJSON(CRITICAL_INFRASTRUCTURE_GEOJSON as any, {
      pointToLayer: (feature, latlng) => {
        const iconHtml = `
          <div class="flex items-center justify-center w-7 h-7 rounded-full bg-red-700 text-white shadow-md border-2 border-white cursor-pointer" title="${feature.properties.name}">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
          </div>
        `;
        const icon = L.divIcon({
          html: iconHtml,
          className: 'custom-infra-icon',
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        return L.marker(latlng, { icon }).bindPopup(
          `<div style="font-size:12px; font-weight:bold; color:#1c1917;">${feature.properties.name}</div>
           <p style="font-size:11px; margin-top:4px; color:#44403c;">${feature.properties.description}</p>
           <div style="font-size:10px; color:#78716c; margin-top:4px;">Date: ${feature.properties.date} | Category: ${feature.properties.category}</div>`
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

      // Color based on Hazard Urgency
      let pinColor = '#2d6a4f'; // forest green
      switch (result.hazardUrgency) {
        case 'URGENT':
          pinColor = '#b91c1c'; // crimson
          break;
        case 'ELEVATED':
          pinColor = '#d97706'; // ochre
          break;
        case 'ROUTINE':
          pinColor = '#2d6a4f'; // forest green
          break;
        case 'UNDETERMINED':
          pinColor = '#57534e'; // stone grey
          break;
      }

      const qualityBorderStyle =
        result.evidenceQuality === 'CONFLICTING'
          ? 'border-dashed border-rose-500'
          : result.evidenceQuality === 'INSUFFICIENT'
          ? 'border-dashed border-stone-400'
          : 'border-white';

      const selectedStyles = isSelected
        ? 'ring-3 ring-stone-900 scale-110 z-[1000] shadow-md'
        : 'shadow-xs hover:scale-105';

      const markerHtml = `
        <div class="relative group cursor-pointer transition-transform">
          <div class="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-sans font-semibold border-2 ${qualityBorderStyle} ${selectedStyles}" style="background-color: ${pinColor}">
            ${hab.name.charAt(0)}
          </div>
          ${
            isSelected
              ? `<div class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-stone-900 rounded-full border border-white"></div>`
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

      marker.on('click', () => {
        onSelectHabitation(hab);
      });

      marker.bindTooltip(
        `<strong>${hab.name}</strong><br/>
         <span style="font-size:10px; color:#57534e;">Urgency: ${result.hazardUrgency} • Quality: ${result.evidenceQuality}</span>`,
        { sticky: true, offset: [15, 0] }
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

  return (
    <div className="relative w-full h-full min-h-[500px]">
      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Layer Visibility Control Dropdown */}
      <div className="absolute top-3 right-3 z-[1000]">
        <div className="relative">
          <button
            onClick={() => setIsLayersOpen(!isLayersOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-stone-200 text-stone-800 rounded-md shadow-xs text-xs font-medium hover:bg-stone-50 cursor-pointer"
          >
            <Layers className="w-3.5 h-3.5 text-stone-600" />
            <span>Map Layers</span>
            <ChevronDown className="w-3.5 h-3.5 text-stone-500" />
          </button>

          {isLayersOpen && (
            <div className="absolute right-0 mt-1 w-64 bg-white border border-stone-200 rounded-md shadow-lg p-3 text-xs space-y-3 text-stone-700 animate-in fade-in">
              {/* Basemap Selection */}
              <div className="space-y-1.5">
                <div className="font-semibold text-stone-900 text-[11px]">
                  Basemap Cartography
                </div>
                <div className="grid grid-cols-2 gap-1 p-0.5 bg-stone-100 rounded border border-stone-200">
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
                <div className="font-semibold text-stone-900 text-[11px]">
                  Disaster Overlays
                </div>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showHabitations}
                    onChange={e => setShowHabitations(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                  <span>Habitation Sites (9)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showObservedDebris}
                    onChange={e => setShowObservedDebris(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-red-200 border border-red-700" />
                  <span>Debris Corridor (Approx Vector)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showModelledSusc}
                    onChange={e => setShowModelledSusc(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-600 border-dashed" />
                  <span>Susceptibility Zone (GSI NLSM)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showRiverAxis}
                    onChange={e => setShowRiverAxis(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-600" />
                  <span>Iruvaipuzha River Axis</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer hover:text-stone-900">
                  <input
                    type="checkbox"
                    checked={showInfraPoints}
                    onChange={e => setShowInfraPoints(e.target.checked)}
                    className="rounded text-stone-900 focus:ring-0"
                  />
                  <span className="w-2.5 h-2.5 rounded-full bg-red-700" />
                  <span>Critical Infrastructure Points</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
