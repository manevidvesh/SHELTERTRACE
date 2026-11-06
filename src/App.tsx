import { useState, useMemo, useEffect } from 'react';
import type { Habitation, PrioritisationResult } from './types/habitation';
import type { SummaryFilter } from './components/assessment/AssessmentSummary';
import { WAYANAD_HABITATIONS } from './data/wayanadHabitations';
import { assessHabitation } from './engine/assessmentEngine';
import { LandingPage } from './components/landing/LandingPage';
import { Header } from './components/common/Header';
import { AssessmentSummary } from './components/assessment/AssessmentSummary';
import { EvidenceSeverityMatrix } from './components/assessment/EvidenceSeverityMatrix';
import { HabitationList } from './components/assessment/HabitationList';
import { MapView } from './components/assessment/MapView';
import { HabitationDetailDrawer } from './components/assessment/HabitationDetailDrawer';
import { ParameterComparisonView } from './components/analytics/ParameterComparisonView';
import { EvidenceView } from './components/evidence/EvidenceView';
import { MethodologyView } from './components/methodology/MethodologyView';
import { SpatialIntelligenceView } from './components/spatial/SpatialIntelligenceView';

function getInitialRoute(): { view: 'landing' | 'app'; tab: 'assessment' | 'evidence' | 'methodology' | 'spatial' } {
  if (typeof window === 'undefined') return { view: 'landing', tab: 'assessment' };

  const path = window.location.pathname.toLowerCase();
  const hash = window.location.hash.toLowerCase();

  // If URL explicitly requests dashboard/app/assessment
  if (
    path.includes('/dashboard') ||
    path.includes('/app') ||
    path.includes('/assessment') ||
    hash.includes('app') ||
    hash.includes('dashboard')
  ) {
    if (hash.includes('spatial') || path.includes('spatial')) {
      return { view: 'app', tab: 'spatial' };
    }
    if (hash.includes('methodology') || path.includes('methodology')) {
      return { view: 'app', tab: 'methodology' };
    }
    if (hash.includes('evidence') || path.includes('evidence')) {
      return { view: 'app', tab: 'evidence' };
    }
    return { view: 'app', tab: 'assessment' };
  }

  return { view: 'landing', tab: 'assessment' };
}

export function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>(() => getInitialRoute().view);
  const [activeTab, setActiveTab] = useState<'assessment' | 'evidence' | 'methodology' | 'spatial'>(() => getInitialRoute().tab);
  const [selectedHabitationId, setSelectedHabitationId] = useState<string>('hab-mundakkai');
  const [activeFilter, setActiveFilter] = useState<SummaryFilter>('ALL');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(true);
  const [isMatrixOpen, setIsMatrixOpen] = useState<boolean>(false);
  const [isCompareOpen, setIsCompareOpen] = useState<boolean>(false);
  const [isSettlementListOpen, setIsSettlementListOpen] = useState<boolean>(true);
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState<'split' | 'map' | 'list'>('split');

  // Synchronize browser history and popstate events
  useEffect(() => {
    const handlePopState = () => {
      const route = getInitialRoute();
      setCurrentView(route.view);
      setActiveTab(route.tab);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleOpenApp = (tab: 'assessment' | 'evidence' | 'methodology' | 'spatial' = 'assessment') => {
    setActiveTab(tab);
    setCurrentView('app');
    window.history.pushState({ view: 'app', tab }, '', `/dashboard#${tab}`);
  };

  const handleReturnToLanding = () => {
    setCurrentView('landing');
    window.history.pushState({ view: 'landing' }, '', '/');
  };

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

  // View 1: Demonstration Landing Page
  if (currentView === 'landing') {
    return <LandingPage onOpenApp={handleOpenApp} />;
  }

  // View 2: Operational Investigation Workspace
  return (
    <div className="min-h-screen bg-[#f8f7f4] text-stone-900 flex flex-col font-sans">
      {/* Universal Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedHabitation={selectedHabitation}
        onReturnToLanding={handleReturnToLanding}
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
              isCompareOpen={isCompareOpen}
              onToggleCompare={() => setIsCompareOpen(!isCompareOpen)}
            />

            {/* Collapsible Parameter Comparison Visualisation */}
            {isCompareOpen && (
              <ParameterComparisonView
                habitations={WAYANAD_HABITATIONS}
                resultsMap={resultsMap}
                selectedHabitation={selectedHabitation}
                onSelectHabitation={handleSelectHabitation}
                onClose={() => setIsCompareOpen(false)}
              />
            )}

            {/* Collapsible 2D Contingency Matrix */}
            {isMatrixOpen && (
              <EvidenceSeverityMatrix
                habitations={WAYANAD_HABITATIONS}
                resultsMap={resultsMap}
                selectedHabitation={selectedHabitation}
                onSelectHabitation={handleSelectHabitation}
              />
            )}

            {/* Mobile Workspace Mode Switcher (visible on <lg screens) */}
            <div className="flex lg:hidden items-center justify-between p-1 bg-stone-200/70 rounded-lg text-xs font-medium gap-1">
              <button
                onClick={() => setMobileWorkspaceTab('split')}
                className={`flex-1 py-1 px-2 rounded text-center transition-colors cursor-pointer ${
                  mobileWorkspaceTab === 'split' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setMobileWorkspaceTab('map')}
                className={`flex-1 py-1 px-2 rounded text-center transition-colors cursor-pointer ${
                  mobileWorkspaceTab === 'map' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Interactive Map
              </button>
              <button
                onClick={() => setMobileWorkspaceTab('list')}
                className={`flex-1 py-1 px-2 rounded text-center transition-colors cursor-pointer ${
                  mobileWorkspaceTab === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Settlements ({WAYANAD_HABITATIONS.length})
              </button>
            </div>

            {/* Map-First Workspace Layout (Map 75-80% / Settlement List Collapsible ~20-25%) */}
            <div className="flex flex-col lg:flex-row gap-4 flex-1 min-h-[620px] relative items-stretch">
              {/* Left Column: Settlement List (Collapsible, ~22-25% width on desktop) */}
              {isSettlementListOpen && (
                <div
                  className={`w-full lg:w-80 lg:shrink-0 h-[520px] lg:h-[620px] flex flex-col ${
                    mobileWorkspaceTab === 'map' ? 'hidden lg:flex' : 'flex'
                  }`}
                >
                  <HabitationList
                    habitations={WAYANAD_HABITATIONS}
                    resultsMap={resultsMap}
                    selectedHabitation={selectedHabitation}
                    onSelectHabitation={handleSelectHabitation}
                    activeFilter={activeFilter}
                    onToggleCollapse={() => setIsSettlementListOpen(false)}
                  />
                </div>
              )}

              {/* Right Column: Interactive Leaflet Map (Occupies 75-80% when list open, 100% when collapsed) */}
              <div
                className={`flex-1 h-[520px] lg:h-[620px] relative rounded-lg overflow-hidden border border-stone-200 shadow-xs bg-stone-100 ${
                  mobileWorkspaceTab === 'list' ? 'hidden lg:block' : 'block'
                }`}
              >
                <MapView
                  habitations={WAYANAD_HABITATIONS}
                  resultsMap={resultsMap}
                  selectedHabitation={selectedHabitation}
                  onSelectHabitation={handleSelectHabitation}
                  isSidebarCollapsed={!isSettlementListOpen}
                  onToggleSidebar={() => setIsSettlementListOpen(true)}
                />

                {/* Selected Habitation Inspection Drawer Overlay */}
                {isDrawerOpen && selectedHabitation && (
                  <div
                    className={`absolute ${
                      !isSettlementListOpen ? 'top-12' : 'top-3'
                    } left-3 z-[1000] w-80 max-w-[calc(100%-24px)] pointer-events-auto`}
                  >
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
            resultsMap={resultsMap}
            onSelectHabitation={handleSelectHabitation}
            onReturnToMap={() => setActiveTab('assessment')}
          />
        )}

        {/* Screen 3: Methodology View */}
        {activeTab === 'methodology' && <MethodologyView />}

        {/* Screen 4: Spatial Intelligence View */}
        {activeTab === 'spatial' && <SpatialIntelligenceView />}
      </main>

      {/* Global Minimalist Footer */}
      <footer className="border-t border-stone-200 bg-white py-3 px-4 text-center text-xs text-stone-500">
        <span>SHELTERTRACE Decision Support Engine • Evidence-Driven Geospatial Reconnaissance Prioritisation</span>
      </footer>
    </div>
  );
}

export default App;
