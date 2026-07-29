import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { LoginView } from './views/LoginView';
import { Header } from './components/shared/Header';
import { Sidebar } from './components/shared/Sidebar';
import { BottomNavBar } from './components/shared/BottomNavBar';
import { DashboardView } from './views/DashboardView';
import { InstallationsView } from './views/InstallationsView';
import { FindingsView } from './views/FindingsView';
import { MultimodalAIView } from './views/MultimodalAIView';
import { WhatsAppAutomationsView } from './views/WhatsAppAutomationsView';
import { AIChatbotWidget } from './components/shared/AIChatbotWidget';
import { PhoneAlertModal } from './components/shared/PhoneAlertModal';
import { EmailPreviewModal } from './components/shared/EmailPreviewModal';

const AppContent: React.FC = () => {
  const { currentUser, currentView } = useApp();

  // If user is not logged in, render the pitch-black / dark login view
  if (!currentUser) {
    return <LoginView />;
  }

  // Router for interior light-mode views
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'installations':
        return <InstallationsView />;
      case 'findings':
        return <FindingsView />;
      case 'multimodal':
        return <MultimodalAIView />;
      case 'whatsapp-rules':
        return <WhatsAppAutomationsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans transition-all duration-300 relative">
      <Header />
      <div className="flex flex-1 flex-col sm:flex-row pb-16 sm:pb-0">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0">
          {renderView()}
        </main>
      </div>
      <BottomNavBar />
      <AIChatbotWidget />
      <PhoneAlertModal />
      <EmailPreviewModal />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
