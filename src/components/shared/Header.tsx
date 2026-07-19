import React from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Building2, 
  Activity, 
  Radio, 
  BrainCircuit, 
  ChevronDown, 
  Menu, 
  X, 
  LogOut 
} from 'lucide-react';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    centers, 
    selectedCenter, 
    setSelectedCenterById, 
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    logout
  } = useApp();

  return (
    <header className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-[0_2px_15px_rgba(241,245,249,0.4)]">
      
      {/* Branding Section */}
      <div className="flex items-center gap-2.5">
        
        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="sm:hidden p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
          title="Menú Navegación"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>

        {/* Branding Logo Image */}
        <div className="relative w-10 h-10 shrink-0 select-none">
          <img src="/LOGO_CIRCULAR.png" alt="SubVision Logo" className="w-full h-full object-contain" />
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
        </div>
        
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-900 font-extrabold tracking-wide text-sm sm:text-lg">SUBVISION</span>
            <span className="text-[9px] font-mono font-bold bg-cyan-100 text-cyan-700 px-1.5 py-0.5 rounded-full hidden sm:inline">OS v1.4</span>
          </div>
          <p className="text-[9px] sm:text-[10px] text-slate-400 font-mono tracking-widest uppercase">
            SERVIROV
          </p>
        </div>
      </div>

      {/* Control Center & Select Dropdown */}
      <div className="flex items-center gap-6">
        
        {/* Aquaculture Center Dropdown Selector */}
        <div className="relative flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-1.5 hover:bg-slate-100/50 transition-colors">
          <Building2 className="w-4 h-4 text-cyan-600" />
          <div className="text-left">
            <div className="text-[9px] text-slate-400 font-medium leading-none uppercase">Centro Operativo</div>
            <select
              value={selectedCenter.id}
              onChange={(e) => setSelectedCenterById(e.target.value)}
              className="bg-transparent border-none text-slate-800 text-xs font-semibold focus:outline-none pr-6 cursor-pointer appearance-none"
            >
              {centers.map(center => (
                <option key={center.id} value={center.id}>
                  {center.name} ({center.location})
                </option>
              ))}
            </select>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 pointer-events-none" />
        </div>

        {/* Telemetry Status Grid */}
        <div className="hidden lg:flex items-center gap-4 border-l border-slate-100 pl-6">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Radio className="w-3 h-3 text-slate-400" /> Telemetría Online
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <Activity className="w-3 h-3 text-slate-400" /> CCTV Activo
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-slate-400" /> AI Activa
            </span>
          </div>
        </div>
      </div>

      {/* Profile Detail */}
      {currentUser && (
        <div className="flex items-center gap-3 border-l border-slate-100 pl-6">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">{currentUser.name}</div>
            <div className="text-[10px] text-slate-400 font-medium">{currentUser.role}</div>
          </div>
          
          {/* Avatar Icon */}
          <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-200 flex items-center justify-center text-white text-xs font-bold shadow-inner">
            {currentUser.avatar}
          </div>

          {/* Botón de Cerrar Sesión en Header */}
          <button
            onClick={() => logout()}
            title="Cerrar Sesión"
            className="p-2 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-600 transition-all cursor-pointer flex items-center justify-center border border-transparent hover:border-red-100 shadow-sm hover:shadow"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

    </header>
  );
};
