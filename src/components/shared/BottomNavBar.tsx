import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Anchor, 
  MessageSquareCode,
  AlertTriangle
} from 'lucide-react';

export const BottomNavBar: React.FC = () => {
  const { currentView, setCurrentView, activeTab, setActiveTab, activeAlerts } = useApp();

  const navItems = [
    { id: 'dashboard', name: 'Informes', icon: LayoutDashboard, badge: activeAlerts.filter(a => !a.acknowledged).length },
    { id: 'installations', name: 'Módulos', icon: Anchor, badge: 0 },
    { id: 'findings', name: 'Hallazgos', icon: AlertTriangle, badge: 0 },
    { id: 'multimodal', name: 'Agente IA', icon: MessageSquareCode, badge: 0 }
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 pb-2 z-50 shadow-[0_-4px_20px_rgba(241,245,249,0.8)]">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === 'dashboard' 
            ? (currentView === 'dashboard' && activeTab === 'rov')
            : currentView === item.id;

          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'dashboard') {
                  setCurrentView('dashboard');
                  setActiveTab('rov');
                } else {
                  setCurrentView(item.id);
                }
              }}
              className={`flex flex-col items-center justify-center w-16 p-1 relative rounded-xl transition-colors ${
                isActive ? 'text-cyan-600' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <div className={`p-1.5 rounded-full mb-1 transition-all ${isActive ? 'bg-cyan-50' : 'bg-transparent'}`}>
                <Icon className={`w-[22px] h-[22px] ${isActive ? 'text-cyan-600' : 'text-slate-400'}`} />
              </div>
              <span className={`text-[10px] tracking-tight leading-none ${isActive ? 'font-bold' : 'font-medium'}`}>
                {item.name}
              </span>
              
              {item.badge > 0 && (
                <span className="absolute top-1 right-2 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
