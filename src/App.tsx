import { useState, useMemo } from 'react';
import type { Habitation, PrioritisationResult } from './types/habitation';
import type { SummaryFilter } from './components/assessment/AssessmentSummary';
import { WAYANAD_HABITATIONS } from './data/wayanadHabitations';
import { assessHabitation } from './engine/assessmentEngine';
import { Header } from './components/common/Header';
import { AssessmentSummary } from './components/assessment/AssessmentSummary';
import { EvidenceSeverityMatrix } from './components/assessment/EvidenceSeverityMatrix';
import { HabitationList } from './components/assessment/HabitationList';
import { MapView } from './components/assessment/MapView';
import { HabitationDetailDrawer } from './components/assessment/HabitationDetailDrawer';
import { EvidenceView } from './components/evidence/EvidenceView';
import { MethodologyView } from './components/methodology/MethodologyView';

export function App() {
  const [activeTab, setActiveTab] = useState<'assessment' | 'evidence' | 'methodology'>('assessment');
  const [selectedHabitationId, setSelectedHabitationId] = useState<string>('hab-mundakkai');
  const [activeFilter, setActiveFilter] = useState<SummaryFilter>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);

  // Evaluate all habitations through deterministic assessment engine
  const resultsMap = useMemo(() => {
    const map = new Map<string, PrioritisationResult>();
    WAYANAD_HABITATIONS.forEach(hab => {
      map.set(hab.id, assessHabitation(hab));
    });
    return map;
  }, []);

  const resultsList = useMemo(() => {
    return Array.from(resultsMap.values());
  }, [resultsMap]);

  const selectedHabitation = useMemo(() => {
    return WAYANAD_HABITATIONS.find(h => h.id === selectedHabitationId) || WAYANAD_HABITATIONS[0];
  }, [selectedHabitationId]);

  const selectedResult = useMemo(() => {
    return resultsMap.get(selectedHabitation.id) || assessHabitation(selectedHabitation);
  }, [resultsMap, selectedHabitation]);

  const handleSelectHabitation = (hab: Habitation) => {
    setSelectedHabitationId(hab.id);
    setIsDrawerOpen(true);
  };

  const handleOpenEvidenceDossier = () => {
    setActiveTab('evidence');
  };

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 flex flex-col font-sans">
      {/* Universal Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedHabitation={selectedHabitation}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        {/* Screen 1: Assessment View */}
        {activeTab === 'assessment' && (
          <div className="flex flex-col flex-1 space-y-4">
            {/* Compact Investigation Summary Toolbar */}
            <AssessmentSummary
              results={resultsList}
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              isMatrixOpen={isMatrixOpen}
              onToggleMatrix={() => setIsMatrixOpen(!isMatrixOpen)}
            />

            {/* Collapsible 2D Contingency Matrix */}
            {isMatrixOpen && (
              <EvidenceSeverityMatrix
                habitations={WAYANAD_HABITATIONS}
                resultsMap={resultsMap}
                selectedHabitation={selectedHabitation}
                onSelectHabitation={handleSelectHabitation}
              />
            )}

            {/* Split Map-First Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-[600px]">
              {/* Left Column: Settlement List (5 Cols) */}
              <div className="lg:col-span-5 h-[600px] flex flex-col">
                <HabitationList
                  habitations={WAYANAD_HABITATIONS}
                  resultsMap={resultsMap}
                  selectedHabitation={selectedHabitation}
                  onSelectHabitation={handleSelectHabitation}
                  activeFilter={activeFilter}
                />
              </div>

              {/* Right Column: Interactive Leaflet Map (7 Cols) with Drawer Overlay */}
              <div className="lg:col-span-7 h-[600px] relative rounded-lg overflow-hidden border border-stone-200 shadow-xs bg-stone-100">
                <MapView
                  habitations={WAYANAD_HABITATIONS}
                  resultsMap={resultsMap}
                  selectedHabitation={selectedHabitation}
                  onSelectHabitation={handleSelectHabitation}
                />

                {/* Selected Habitation Inspection Drawer Overlay */}
                {isDrawerOpen && selectedHabitation && (
                  <div className="absolute top-3 left-3 z-[1000] w-80 max-w-[calc(100%-24px)] pointer-events-auto">
                    <HabitationDetailDrawer
                      habitation={selectedHabitation}
                      result={selectedResult}
                      onClose={() => setIsDrawerOpen(false)}
                      onOpenEvidenceDossier={handleOpenEvidenceDossier}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Screen 2: Evidence Dossier View */}
        {activeTab === 'evidence' && (
          <EvidenceView
            habitations={WAYANAD_HABITATIONS}
            selectedHabitation={selectedHabitation}
            result={selectedResult}
            onSelectHabitation={handleSelectHabitation}
            onReturnToMap={() => setActiveTab('assessment')}
          />
        )}

        {/* Screen 3: Methodology View */}
        {activeTab === 'methodology' && <MethodologyView />}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-3 px-4 text-center text-xs text-stone-500">
        <span>SHELTERTRACE Decision Support Engine • Evidence-Driven Geospatial Reconnaissance Prioritisation</span>
      </footer>
    </div>
  );
}

export default App;
