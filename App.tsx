

import React, { useState } from 'react';
import { Header } from './components/layout/Header';
import { Tabs, Tab } from './components/ui/Tabs';
import { NvdView } from './components/nvd/NvdView';
import { MitreView } from './components/mitre/MitreView';
import { CisaAlertView } from './components/cisa/CisaAlertView';
import { MsrcBulletinView } from './components/msrc/MsrcBulletinView';
import { ChainView } from './components/chains/ChainView'; // Added
import { SourceType } from './types';
import { SearchInput } from './components/ui/SearchInput';
import { Toaster } from 'sonner';
import { useAlerts } from './hooks/useAlerts';
import { SummaryDrawer } from './components/common/SummaryDrawer'; 

// import { summarizeText } from './services/geminiService'; // Example Gemini usage

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SourceType>(SourceType.NVD);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSummaryDrawerOpen, setIsSummaryDrawerOpen] = useState(false);

  useAlerts(); // Initialize WebSocket alerts

  // Example of using Gemini (placeholder)
  // const [summary, setSummary] = useState('');
  // useEffect(() => {
  //   summarizeText(`Summarize latest critical CVEs.`) // Example prompt
  //     .then(setSummary)
  //     .catch(console.error);
  // }, []);


  const tabs: Tab[] = [
    { id: SourceType.NVD, label: 'NVD CVEs' },
    { id: SourceType.MSRC, label: 'MSRC Bulletins' },
    { id: SourceType.CHAINS, label: 'Exploit Chains' }, // Added
    { id: SourceType.MITRE_ENTERPRISE, label: 'MITRE ATT&CK (Enterprise)' },
    { id: SourceType.MITRE_ICS, label: 'MITRE ATT&CK (ICS)' },
    { id: SourceType.CISA_ALERTS, label: 'CISA Alerts' },
    { id: SourceType.CISA_CURRENT_ACTIVITY, label: 'CISA Current Activity' },
  ];

  const renderContent = () => {
    // Loading and error states are now handled within each view by React Query
    switch (activeTab) {
      case SourceType.NVD:
        return <NvdView searchTerm={searchTerm} />;
      case SourceType.MITRE_ENTERPRISE:
        return <MitreView searchTerm={searchTerm} frameworkName="Enterprise" />;
      case SourceType.MITRE_ICS:
        return <MitreView searchTerm={searchTerm} frameworkName="ICS" />;
      case SourceType.CISA_ALERTS:
        return <CisaAlertView searchTerm={searchTerm} />;
      case SourceType.CISA_CURRENT_ACTIVITY:
        return <CisaAlertView searchTerm={searchTerm} title="CISA Current Activity" isCurrentActivity={true} />;
      case SourceType.MSRC:
        return <MsrcBulletinView searchTerm={searchTerm} />;
      case SourceType.CHAINS: // Added
        return <ChainView searchTerm={searchTerm} />;
      default:
        return <p className="text-brand-text-secondary">Select a data source.</p>;
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg flex flex-col">
      <Toaster position="top-right" richColors theme="dark" />
      <Header onToggleSummary={() => setIsSummaryDrawerOpen(prev => !prev)} />
      <main className="flex-grow container mx-auto px-4 py-8">
        {/* <p className="text-sm text-brand-text-secondary mb-2">Gemini Summary Example: {summary || "Loading summary..."}</p> */}
        <Tabs tabs={tabs} activeTab={activeTab} onTabClick={(id) => setActiveTab(id as SourceType)} />
        <div className="my-6">
            <SearchInput 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                placeholder={`Search in ${tabs.find(t => t.id === activeTab)?.label}...`}
            />
        </div>
        <div className="bg-brand-surface shadow-2xl rounded-lg p-6">
          {renderContent()}
        </div>
      </main>
      <SummaryDrawer isOpen={isSummaryDrawerOpen} onClose={() => setIsSummaryDrawerOpen(false)} />
      <footer className="bg-brand-primary text-brand-text-secondary text-center p-4 mt-auto">
        <p>&copy; {new Date().getFullYear()} Cybersecurity Intelligence Dashboard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
