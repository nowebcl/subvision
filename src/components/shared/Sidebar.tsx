import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  LayoutDashboard, 
  Anchor, 
  LogOut,
  Smartphone,
  MessageSquareCode,
  Shield,
  AlertTriangle,
  Building2
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { 
    currentView, 
    setCurrentView, 
    logout, 
    activeAlerts,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    currentUser,
    activeTab,
    setActiveTab
  } = useApp();

  const isClient = currentUser?.role === 'Cliente' || currentUser?.email === 'cliente@servirov.cl';
  const isAdmin = currentUser && (currentUser.role === 'admin' || currentUser.email === 'admin@servirov.cl');

  const menuItems = [
    { id: 'dashboard', name: isClient ? 'Monitoreo Informes' : 'Informes ROV', icon: LayoutDashboard, badge: activeAlerts.filter(a => !a.acknowledged).length },
  ];

  if (isClient || isAdmin) {
    menuItems.push({ id: 'client-portal', name: 'Pilotos y Centros', icon: Building2, badge: 0 });
  }

  menuItems.push({ id: 'installations', name: 'Módulos', icon: Anchor, badge: 0 });

  menuItems.push(
    { id: 'findings', name: 'Hallazgos', icon: AlertTriangle, badge: 0 },
    { id: 'multimodal', name: 'Agente IA Servirov', icon: MessageSquareCode, badge: 0 },
    { id: 'whatsapp-sim', name: 'Simulador WhatsApp Live', icon: Smartphone, badge: 0 }
  );

  if (isAdmin) {
    menuItems.push({ id: 'admin', name: 'Administración', icon: Shield, badge: 0 });
  }

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="sm:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 transition-all duration-300"
        />
      )}
      
      {/* Sidebar Drawer Container */}
      <aside className={`
        fixed sm:relative top-[73px] sm:top-0 bottom-0 left-0 w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 shadow-[2px_0_10px_rgba(241,245,249,0.4)] z-40 transition-transform duration-300
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full sm:translate-x-0'}
        min-h-[calc(100vh-73px)]
      `}>
        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.id === 'admin'
              ? (currentView === 'dashboard' && activeTab === 'admin')
              : item.id === 'client-portal'
                ? (currentView === 'dashboard' && activeTab === 'cliente')
                : item.id === 'dashboard'
                  ? (currentView === 'dashboard' && activeTab !== 'admin' && activeTab !== 'cliente')
                  : currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'admin') {
                    setCurrentView('dashboard');
                    setActiveTab('admin');
                  } else if (item.id === 'client-portal') {
                    setCurrentView('dashboard');
                    setActiveTab('cliente');
                  } else if (item.id === 'dashboard') {
                    setCurrentView('dashboard');
                    setActiveTab('rov');
                  } else {
                    setCurrentView(item.id);
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive 
                    ? 'bg-slate-50 text-cyan-600 font-semibold shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-50/60 hover:text-slate-900'
                }`}
              >
                {/* Active Left Indicator Pill */}
                {isActive && (
                  <span className="absolute left-0 top-3 bottom-3 w-1 bg-cyan-500 rounded-r-md" />
                )}
                
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-500' : 'text-slate-400 group-hover:text-slate-600'
                  }`} />
                  <span>{item.name}</span>
                </div>
                
                {/* Badge indicator */}
                {item.badge > 0 && (
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                    isActive 
                      ? 'bg-cyan-100 text-cyan-700' 
                      : 'bg-slate-100 text-slate-600 group-hover:bg-cyan-50 group-hover:text-cyan-600'
                  } transition-colors`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout Action Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={() => {
              logout();
              setIsMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-red-500 transition-colors" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};
